import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { forgotPassword } from "../../services/authService";
import { ROUTES } from "../../constants/routes";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      sessionStorage.setItem("reset_email", email);
      navigate("/verify-otp");
    } catch {
      setError("We could not send the OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Password recovery"
      title="Request a reset code"
      subtitle="Enter your email and we will send a one-time verification code so you can continue to the next step."
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm leading-6 text-cyan-50">
          Use the same email address tied to your CMO.AI account so the OTP can be verified correctly.
        </div>

        <div className="space-y-2">
          <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-100">
            Account email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cyan-300" />
            <Input
              id="forgot-email"
              type="email"
              className="h-12 border-white/20 bg-white/10 pl-10 text-white placeholder:text-slate-300/70"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              Sending code...
            </span>
          ) : (
            "Send OTP Code"
          )}
        </Button>

        <p className="text-center text-sm text-slate-200">
          Remembered your password?
          <Link to={ROUTES.LOGIN} className="ml-1 font-semibold text-cyan-300 hover:text-cyan-200">
            Back to login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
