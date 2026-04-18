import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { resetPassword } from "../../services/auth";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token!, password);
      setMessage("Password reset successful");
    } catch {
      setError("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-3" />
          <Input
            type="password"
            className="pl-10"
            placeholder="New Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-center text-neonRed">{error}</p>}
        {message && <p className="text-sm text-center text-green-400">{message}</p>}

        <Button
          disabled={loading}
          onClick={handleReset}
          className="w-full py-5"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Reset Password"}
        </Button>
      </div>
    </AuthLayout>
  );
}
