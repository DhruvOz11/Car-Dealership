import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/auth.context";

const Register = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, loading, error, clearError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    try {
      await register(name, email, password);
      navigate("/");
    } catch {
      /* error set in context */
    }
  };

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) return;
    clearError();
    try {
      await loginWithGoogle(credential);
      navigate("/");
    } catch {
      /* error is set in context */
    }
  };

  const displayError = localError || error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-asphalt-900 bg-grille px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-asphalt-700 bg-asphalt-800 p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-ignition">
              <svg className="h-6 w-6 text-asphalt-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-chrome-100">
              Create account
            </h1>
            <p className="mt-1 text-sm text-chrome-500">Join AutoVault today</p>
          </div>

          {displayError && (
            <div className="mb-4 rounded-md border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {displayError}
            </div>
          )}

          <div className="mb-5 flex justify-center">
            <GoogleLogin
              onSuccess={(res) => void handleGoogleSuccess(res.credential)}
              onError={() => clearError()}
              theme="filled_black"
              shape="pill"
              text="signup_with"
            />
          </div>

          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-asphalt-600" />
            <span className="text-xs uppercase tracking-wide text-chrome-500">or use email</span>
            <div className="h-px flex-1 bg-asphalt-600" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-chrome-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                minLength={2}
                className="focus-ring w-full rounded-md border border-asphalt-600 bg-asphalt-900 px-4 py-3 text-sm text-chrome-100 placeholder-chrome-500/60 transition focus:border-ignition"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-chrome-300">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="focus-ring w-full rounded-md border border-asphalt-600 bg-asphalt-900 px-4 py-3 text-sm text-chrome-100 placeholder-chrome-500/60 transition focus:border-ignition"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-chrome-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="focus-ring w-full rounded-md border border-asphalt-600 bg-asphalt-900 px-4 py-3 text-sm text-chrome-100 placeholder-chrome-500/60 transition focus:border-ignition"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-chrome-300">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                className={`focus-ring w-full rounded-md border bg-asphalt-900 px-4 py-3 text-sm text-chrome-100 placeholder-chrome-500/60 transition ${
                  confirmPassword && password !== confirmPassword ? "border-red-700" : "border-asphalt-600 focus:border-ignition"
                }`}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-400">Passwords don&apos;t match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!!confirmPassword && password !== confirmPassword)}
              className="focus-ring mt-2 w-full rounded-md bg-ignition py-3 text-sm font-bold uppercase tracking-wide text-asphalt-900 transition hover:bg-ignition-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-chrome-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-ignition hover:text-ignition-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
