import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useAuth } from "../../contexts/AuthContext";

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
      setError("Enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      navigate("/dashboard");

    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-4">

        <div className="relative">
          <Mail className="absolute w-4 h-4 text-neonBlue left-3 top-3" />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Lock className="absolute w-4 h-4 text-neonYellow left-3 top-3" />

          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="pl-10 pr-10"
          />

          {showPassword ? (
            <EyeOff
              onClick={() => setShowPassword(false)}
              className="absolute cursor-pointer right-3 top-3"
            />
          ) : (
            <Eye
              onClick={() => setShowPassword(true)}
              className="absolute cursor-pointer right-3 top-3"
            />
          )}
        </div>

        {error && (
          <p className="text-sm text-center text-neonRed">{error}</p>
        )}
        <Button
          disabled={loading}
          onClick={handleLogin}
          className="w-full py-5"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" />
              Logging in...
            </div>
          ) : (
            "Login"
          )}
        </Button>
        <p className="text-sm text-center">
          <Link to="/forgot" className="text-neonBlue">
            Forgot password?
          </Link>
        </p>

        <p className="text-sm text-center">
          Don’t have an account?
          <Link to="/register" className="ml-1 text-neonBlue">
            Sign up
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
}