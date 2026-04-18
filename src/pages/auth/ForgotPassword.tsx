import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import AuthLayout from "./AuthLayout";
import {forgotPassword } from "../../services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Enter a valid email");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      setMessage("Reset link sent to your email");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute size-5 text-neonBlue left-2 top-2 " />
          <Input
            className="pl-10"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-center text-neonRed">{error}</p>}
        {message && <p className="text-sm text-green-400">{message}</p>}

        <Button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full py-5  to-blue-500  from-pink-500 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all duration-300 text-lg text-white bg-gradient-to-r"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
        </Button>
      </div>
    </AuthLayout>
  );
}
