import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { KeyRound, Loader2, Mail } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { verifyResetOtp } from "../../services/authService";
import { ROUTES } from "../../constants/routes";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const email = sessionStorage.getItem("reset_email") ?? "";

  const maskedEmail = useMemo(() => {
    if (!email.includes("@")) return email;
    const [name, domain] = email.split("@");
    const safeName =
      name.length <= 2 ? `${name[0] ?? ""}*` : `${name.slice(0, 2)}${"*".repeat(Math.max(1, name.length - 2))}`;
    return `${safeName}@${domain}`;
  }, [email]);

  const handleVerify = async () => {
    setError("");

    if (!email) {
      setError("Email not found. Please request a new OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyResetOtp(email, otp);
      sessionStorage.setItem("reset_token", response.reset_token);
      navigate(ROUTES.RESET_PASSWORD);
    } catch {
      setError("Invalid or expired OTP. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Verify code"
      title="Enter your 6-digit OTP"
      subtitle="Use the code sent to your email to confirm your identity before creating a new password."
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void handleVerify();
        }}
      >
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm leading-6 text-cyan-50">
          <div className="flex items-center gap-2 font-medium text-white">
            <Mail className="size-4" />
            Verification email
          </div>
          <p className="mt-2">
            We sent the reset code to <span className="font-semibold text-white">{maskedEmail || "your email"}</span>.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="verify-otp" className="block text-sm font-medium text-slate-100">
            One-time password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cyan-300" />
            <Input
              id="verify-otp"
              inputMode="numeric"
              className="h-12 border-white/20 bg-white/10 pl-10 text-lg tracking-[0.3em] text-white placeholder:text-slate-300/70"
              placeholder="123456"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full bg-gradient-to-r from-pink-500 to-blue-500 text-base font-semibold text-white hover:from-pink-400 hover:to-blue-400"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Verifying code...
            </span>
          ) : (
            "Verify OTP"
          )}
        </Button>

        <p className="text-center text-sm text-slate-200">
          Need a new code?
          <Link to={ROUTES.FORGOT_PASSWORD} className="ml-1 font-semibold text-cyan-300 hover:text-cyan-200">
            Request another OTP
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
