import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../hook/useAuth";
import { useToast } from "../../../app/toast.hook";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const { handleLogin, user, loading, error, clearError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
    clearError();

    const result = await handleLogin({
      email: email.trim().toLowerCase(),
      password
    });

    if (result.success) {
      toast.success("Welcome back to QueryMind!");
      navigate("/");
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-lg mb-3 shadow-xs">
            N
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Welcome back to QueryMind
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Sign in to continue your conversations and searches
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-6 sm:p-8 shadow-sm dark:shadow-none">
          <form onSubmit={handleSubmit} className="space-y-4">
            {(localError || error) && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{localError || error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                required
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-400 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider"
                >
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 cursor-pointer rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-medium py-2.5 px-4 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs focus:outline-none"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="cursor-pointer font-semibold text-neutral-900 dark:text-white hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
