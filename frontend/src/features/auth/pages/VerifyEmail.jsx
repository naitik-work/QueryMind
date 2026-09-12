import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { verifyEmail } from "../services/auth.api";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const statusParam = searchParams.get("status");

    const [state, setState] = useState(() => {
        if (statusParam === "success") {
            return {
                loading: false,
                success: true,
                message: "Email verified successfully! You can now log in.",
                alreadyVerified: false,
                expired: false
            };
        }
        if (statusParam === "already_verified") {
            return {
                loading: false,
                success: true,
                message: "Email is already verified. You can log in directly.",
                alreadyVerified: true,
                expired: false
            };
        }
        if (!token) {
            return {
                loading: false,
                success: false,
                message: "No verification token found in the link.",
                alreadyVerified: false,
                expired: false
            };
        }
        return {
            loading: true,
            success: false,
            message: "",
            alreadyVerified: false,
            expired: false
        };
    });

    useEffect(() => {
        if (statusParam === "success" || statusParam === "already_verified" || !token) {
            return;
        }

        let isMounted = true;
        verifyEmail(token)
            .then(data => {
                if (!isMounted) return;
                setState({
                    loading: false,
                    success: true,
                    message: data.message || "Email verified successfully!",
                    alreadyVerified: data.alreadyVerified,
                    expired: false
                });
            })
            .catch(err => {
                if (!isMounted) return;
                const msg =
                    err.response?.data?.message ||
                    err.response?.data?.err ||
                    "Email verification failed or token expired.";
                setState({
                    loading: false,
                    success: false,
                    message: msg,
                    alreadyVerified: false,
                    expired: Boolean(err.response?.data?.expired)
                });
            });

        return () => {
            isMounted = false;
        };
    }, [token, statusParam]);

    return (
        <section className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100 transition-colors">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-lg mb-3 shadow-xs">
                        N
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Email Verification
                    </h1>
                </div>

                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-6 sm:p-8 shadow-sm dark:shadow-none text-center">
                    {state.loading ? (
                        <div className="py-8 space-y-4">
                            <div className="w-9 h-9 border-2 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Verifying your email address...
                            </p>
                        </div>
                    ) : state.success ? (
                        <div className="space-y-5">
                            <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    {state.alreadyVerified ? "Already Verified" : "Verification Complete"}
                                </h2>
                                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                                    {state.message}
                                </p>
                            </div>
                            <div className="pt-2">
                                <Link
                                    to="/login"
                                    className="inline-flex cursor-pointer justify-center w-full rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-medium py-2.5 px-4 text-sm transition focus:outline-none"
                                >
                                    Sign In to Your Account
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Verification Failed
                                </h2>
                                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                                    {state.message}
                                </p>
                            </div>
                            <div className="pt-2 flex flex-col gap-2">
                                <Link
                                    to="/register"
                                    className="inline-flex cursor-pointer justify-center w-full rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-medium py-2.5 px-4 text-sm transition focus:outline-none"
                                >
                                    Try Registering Again
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex cursor-pointer justify-center w-full rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium py-2.5 px-4 text-sm transition"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default VerifyEmail;
