import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Welcome from "../pages/Welcome";
import Landing from "../pages/Landing";
import Dashboard from "../pages/Dashboard/Dashboard";
import Pricing from "../pages/Pricing";
import FeatureDetails from "../pages/FeatureDetails";
import Payment from "../pages/Payment";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ResetPassword from "../pages/auth/ResetPassword";
import { AuthProvider } from "../contexts/AuthContext";
import { ProtectedRoute } from "../components/protectedRoute";
import { CampaignProvider } from "../hooks/useCampaign";

export default function Router() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features/:id" element={<FeatureDetails />} />
        <Route path="/payment" element={<Payment />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CampaignProvider>
                <Dashboard />
              </CampaignProvider>
            </ProtectedRoute>
          }
        />
        
      </Routes>
    </AuthProvider>
  );
}
