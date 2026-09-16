import { searchInternet } from "../internet.service.js";
import { sendEmail } from "../mail.service.js";

export const TOOL_RISK = {
    READ_ONLY: "READ_ONLY",
    SENSITIVE: "SENSITIVE" // Requires explicit user confirmation
};

export const TOOLS_CONFIG = {
    searchInternet: {
        name: "searchInternet",
        description: "Search the web for real-time, current, or recent information.",
        risk: TOOL_RISK.READ_ONLY,
        parameters: {
            query: { type: "string", description: "Search query" }
        }
    },
    generateEmailDraft: {
        name: "generateEmailDraft",
        description: "Draft an email for the user to review and confirm before sending.",
        risk: TOOL_RISK.READ_ONLY,
        parameters: {
            to: { type: "string", description: "Recipient email address" },
            subject: { type: "string", description: "Email subject line" },
            body: { type: "string", description: "Draft email message body" }
        }
    },
    sendEmail: {
        name: "sendEmail",
        description: "Sends an email to a recipient. ALWAYS requires explicit user confirmation before executing.",
        risk: TOOL_RISK.SENSITIVE,
        parameters: {
            to: { type: "string", description: "Recipient email address" },
            subject: { type: "string", description: "Email subject line" },
            body: { type: "string", description: "Email message content" }
        }
    }
};

export function isSensitiveTool(toolName) {
    return TOOLS_CONFIG[toolName]?.risk === TOOL_RISK.SENSITIVE;
}

/**
 * Execute read-only tool
 */
export async function executeReadOnlyTool(toolName, params) {
    if (toolName === "searchInternet") {
        return await searchInternet({ query: params.query });
    }
    if (toolName === "generateEmailDraft") {
        return {
            status: "draft_created",
            draft: {
                to: params.to || "",
                subject: params.subject || "",
                body: params.body || ""
            }
        };
    }
    throw new Error(`Unsupported or non-read-only tool: ${toolName}`);
}

/**
 * Execute confirmed sensitive tool
 */
export async function executeConfirmedTool(toolName, params) {
    if (toolName === "sendEmail") {
        const { to, subject, body } = params;

        if (!to || !/^\S+@\S+\.\S+$/.test(to.trim())) {
            throw new Error("Invalid recipient email address");
        }
        if (!subject || !subject.trim()) {
            throw new Error("Email subject cannot be empty");
        }
        if (!body || !body.trim()) {
            throw new Error("Email body cannot be empty");
        }

        // Sanitize parameters to avoid CRLF injection in email headers
        const cleanTo = to.trim().replace(/[\r\n]/g, "");
        const cleanSubject = subject.trim().replace(/[\r\n]/g, "");

        await sendEmail({
            to: cleanTo,
            subject: cleanSubject,
            html: `
                <div style="font-family: sans-serif; padding: 16px; border: 1px solid #e4e4e7; border-radius: 8px;">
                    <p style="white-space: pre-wrap; color: #18181b; font-size: 15px; line-height: 1.6;">${body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
                    <p style="color: #71717a; font-size: 12px;">Sent via QueryMind Agent</p>
                </div>
            `,
            text: `${body}\n\n---\nSent via QueryMind Agent`
        });

        return {
            success: true,
            message: `Email successfully sent to ${cleanTo}`,
            details: { to: cleanTo, subject: cleanSubject }
        };
    }

    throw new Error(`Unknown sensitive tool: ${toolName}`);
}
