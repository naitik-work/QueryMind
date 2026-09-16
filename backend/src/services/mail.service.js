import nodemailer from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer/index.js";

// 1. Nodemailer SMTP Transporter with bounded timeouts (avoids hanging for 120s on blocked cloud ports)
const transporter = nodemailer.createTransport({
    service: "gmail",
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
    auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_USER,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        clientId: process.env.GOOGLE_CLIENT_ID,
    },
});

// Non-blocking verification check
transporter.verify()
    .then(() => {
        console.log("Email transporter is ready to send emails (SMTP)");
    })
    .catch((err) => {
        console.warn("[MAIL] SMTP direct verification notice:", err.message);
    });

// Helper: Get fresh OAuth2 access token for HTTPS REST API calls
async function getGoogleAccessToken() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
        return null;
    }
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        grant_type: "refresh_token"
    });
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
    });
    const data = await res.json();
    return data.access_token || null;
}

// Helper: Build RFC 2822 MIME raw message
function buildMimeMessage(mailOptions) {
    return new Promise((resolve, reject) => {
        const composer = new MailComposer(mailOptions);
        composer.compile().build((err, message) => {
            if (err) return reject(err);
            resolve(message.toString("base64url"));
        });
    });
}

// Helper: Send email via Gmail REST API over HTTPS (Port 443 - NEVER blocked by cloud firewalls like Render)
async function sendViaGmailApi(mailOptions) {
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) throw new Error("Could not acquire Google OAuth2 access token");

    const raw = await buildMimeMessage(mailOptions);
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
        const errMsg = data.error?.message || "Gmail REST API error";
        throw new Error(errMsg);
    }
    return { success: true, method: "gmail_api_https", messageId: data.id };
}

// Helper: Optional Resend fallback if RESEND_API_KEY is configured
async function sendViaResend(mailOptions) {
    if (!process.env.RESEND_API_KEY) return null;
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM || "QueryMind Search <onboarding@resend.dev>",
            to: [mailOptions.to],
            subject: mailOptions.subject,
            html: mailOptions.html,
            text: mailOptions.text
        })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
        throw new Error(data.error?.message || "Resend API error");
    }
    return { success: true, method: "resend_api_https", messageId: data.id };
}

export async function sendEmail({ to, subject, html, text }) {
    const mailOptions = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text
    };

    // 1. Try Resend if configured (instant HTTPS port 443)
    if (process.env.RESEND_API_KEY) {
        try {
            const res = await sendViaResend(mailOptions);
            return res;
        } catch (rErr) {
            console.warn("[MAIL] Resend failed, falling back:", rErr.message);
        }
    }

    // 2. Try Gmail REST API over HTTPS (port 443 - works on Render Free Tier where SMTP 465/587 is blocked)
    try {
        const res = await sendViaGmailApi(mailOptions);
        console.log("[MAIL] Email sent successfully via Gmail REST API (HTTPS):", res.messageId);
        return res;
    } catch (apiErr) {
        console.warn("[MAIL] Gmail REST API not available or errored:", apiErr.message);
    }

    // 3. Fallback to Nodemailer SMTP (works on local PC or environments where SMTP port 465 is open)
    try {
        const details = await transporter.sendMail(mailOptions);
        console.log("[MAIL] Email sent successfully via Nodemailer SMTP:", details.messageId);
        return details;
    } catch (smtpErr) {
        console.error("[MAIL] Nodemailer SMTP failed:", smtpErr.message);
        throw new Error(
            `Failed to send email. SMTP error: ${smtpErr.message}. If running on Render, note that Render blocks outbound SMTP ports 25/465/587 on Free instances; please enable the Gmail API in Google Cloud Console or use Resend.`
        );
    }
}