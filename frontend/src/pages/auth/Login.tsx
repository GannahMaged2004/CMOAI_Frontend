import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTES } from "../../constants/routes";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to continue"
      subtitle="Access your campaigns, agents, and brand workspace with a clearer, easier-to-read login flow."
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void handleLogin();
        }}
      >
        <div className="space-y-2">
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-slate-100"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-cyan-300" />
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-12 pl-10 text-white border-white/20 bg-white/10 placeholder:text-slate-300/70"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-slate-100"
            >
              Password
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-sm font-medium transition text-cyan-300 hover:text-cyan-200"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-amber-300" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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
        </div>

        {error ? (
          <div className="px-4 py-3 text-sm border rounded-2xl border-rose-400/30 bg-rose-400/10 text-rose-100">
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>

        <p className="text-sm text-center text-slate-200">
          Do not have an account?
          <Link
            to={ROUTES.SIGNUP}
            className="ml-1 font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
