import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useAuth } from "../../contexts/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    console.log("Registering with:", { name, email, password });
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
      setError("Name is required");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Enter a valid email");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      console.log("Registering with:", { name, email, password });

      await register(name, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-4">
        <div className="relative">
          <User className="absolute w-4 h-4 text-[#e1e6a1] left-3 top-3" />
          <Input
            className="pl-10"
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="relative">
          <Mail className="absolute w-4 h-4 text-neonBlue left-3 top-3" />
          <Input
            className="pl-10"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative">
          <Lock className="absolute w-4 h-4 text-neonYellow left-3 top-3" />

          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
          />

          {showPassword ? (
            <EyeOff
              onClick={() => setShowPassword(false)}
              className="absolute w-4 h-4 cursor-pointer text-neonRed right-3 top-3"
            />
          ) : (
            <Eye
              onClick={() => setShowPassword(true)}
              className="absolute w-4 h-4 cursor-pointer text-neonGreen right-3 top-3"
            />
          )}
        </div>

        {error && <p className="text-sm text-center text-neonRed">{error}</p>}

        <Button
          type="button"
          disabled={loading}
          onClick={handleRegister}
          className="w-full py-5 text-lg text-white transition-all duration-300 bg-gradient-to-r to-blue-500  from-pink-500 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
        </Button>

        <p className="text-sm text-center">
          Already have an account?
          <Link to="/login" className="ml-1 font-bold text-neonBlue">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
