import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Lock, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { resetPassword } from "../../services/authService";
import { ROUTES } from "../../constants/routes";

const getPasswordStrength = (value: string) => {
  let score = 0;

  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  if (!value) {
    return {
      label: "Password strength",
      width: "0%",
      color: "bg-white/20",
      textColor: "text-slate-300",
    };
  }

  if (score <= 2) {
    return {
      label: "Weak",
      width: "33%",
      color: "bg-rose-400",
      textColor: "text-rose-200",
    };
  }

  if (score <= 4) {
    return {
      label: "Medium",
      width: "66%",
      color: "bg-amber-300",
      textColor: "text-amber-200",
    };
  }

  return {
    label: "Strong",
    width: "100%",
    color: "bg-emerald-400",
    textColor: "text-emerald-200",
  };
};

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const passwordStrength = getPasswordStrength(password);

  const handleReset = async () => {
    setError("");
    setMessage("");

    const email = sessionStorage.getItem("reset_email");
    const token = sessionStorage.getItem("reset_token");

    if (!email || !token) {
      setError("Reset session expired. Please request a new OTP.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const oldPassword = sessionStorage.getItem("old_password");

    if (oldPassword && password === oldPassword) {
      setError("New password cannot be the same as your previous password.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        email,
        token,
        new_password: password,
      });
      sessionStorage.setItem("old_password", password);
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_token");

      setMessage("Password reset successful. Redirecting to login...");

      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Create new password"
      title="Reset your password"
      subtitle="Choose a strong new password, confirm it carefully, and we will take you back to login once the reset is complete."
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void handleReset();
        }}
      >
        <div className="px-4 py-3 text-sm leading-6 border rounded-2xl border-emerald-300/20 bg-emerald-300/10 text-emerald-50">
          <div className="flex items-center gap-2 font-medium text-white">
            <ShieldCheck className="size-4" />
            Password guidance
          </div>

          <p className="mt-2">
            Use at least 8 characters with uppercase, lowercase, numbers, and
            symbols for a stronger password.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-slate-100"
          >
            New password
          </label>

          <div className="relative">
            <Lock className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-cyan-300" />

            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              className="h-12 pl-10 text-white border-white/20 bg-white/10 pr-11 placeholder:text-slate-300/70"
              placeholder="Enter a new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute transition -translate-y-1/2 right-3 top-1/2 text-slate-200 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300/80">
                Use uppercase, lowercase, numbers, and symbols.
              </span>

              <span className={`font-semibold ${passwordStrength.textColor}`}>
                {passwordStrength.label}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                style={{ width: passwordStrength.width }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-slate-100"
          >
            Confirm new password
          </label>

          <div className="relative">
            <Lock className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-amber-300" />

            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              className="h-12 pl-10 text-white border-white/20 bg-white/10 pr-11 placeholder:text-slate-300/70"
              placeholder="Re-enter the new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="button"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute transition -translate-y-1/2 right-3 top-1/2 text-slate-200 hover:text-white"
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <div className="px-4 py-3 text-sm border rounded-2xl border-rose-400/30 bg-rose-400/10 text-rose-100">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="px-4 py-3 text-sm border rounded-2xl border-emerald-400/30 bg-emerald-400/10 text-emerald-50">
            {message}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-semibold text-white bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-400 hover:to-blue-400"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Resetting password...
            </span>
          ) : (
            "Reset Password"
          )}
        </Button>

        <p className="text-sm text-center text-slate-200">
          Want to start over?
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="ml-1 font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Request a fresh OTP
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
