import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useAuth } from "../../contexts/AuthContext";
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

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = getPasswordStrength(password);

  const handleRegister = async () => {
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Start your workspace"
      subtitle="Set up your account so you can move from brand strategy to campaign execution without losing visibility."
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void handleRegister();
        }}
      >
        <div className="space-y-2">
          <label
            htmlFor="register-name"
            className="block text-sm font-medium text-slate-100"
          >
            Full name
          </label>

          <div className="relative">
            <User className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-amber-200" />

            <Input
              id="register-name"
              value={name}
              placeholder="Your name"
              onChange={(e) => setName(e.target.value)}
              className="h-12 pl-10 text-white border-white/20 bg-white/10 placeholder:text-slate-300/70"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-slate-100"
          >
            Email address
          </label>

          <div className="relative">
            <Mail className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-cyan-300" />

            <Input
              id="register-email"
              type="email"
              value={email}
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 pl-10 text-white border-white/20 bg-white/10 placeholder:text-slate-300/70"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-slate-100"
          >
            Password
          </label>

          <div className="relative">
            <Lock className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-lime-300" />

            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pl-10 text-white border-white/20 bg-white/10 pr-11 placeholder:text-slate-300/70"
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

            <p className="text-xs text-slate-300/80">
              Use at least 8 characters so the account can be created
              successfully.
            </p>
          </div>
        </div>

        {error ? (
          <div className="px-4 py-3 text-sm border rounded-2xl border-rose-400/30 bg-rose-400/10 text-rose-100">
            {error}
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
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-sm text-center text-slate-200">
          Already have an account?
          <Link
            to={ROUTES.LOGIN}
            className="ml-1 font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}