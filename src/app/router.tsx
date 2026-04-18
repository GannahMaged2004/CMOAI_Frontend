import { Routes, Route } from "react-router-dom";

import Welcome from "../pages/Welcome";
import Landing from "../pages/Landing";
import Dashboard from "../pages/Dashboard";
import Pricing from "../pages/Pricing";
import FeatureDetails from "../pages/FeatureDetails";
import Payment from "../pages/Payment";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
// import ResetPassword from "../pages/auth/ResetPassword";
import { AuthProvider } from "../contexts/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";

export default function Router() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        {/* <Route path="/reset/:token" element={<ResetPassword />} /> */}
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features/:id" element={<FeatureDetails />} />
        <Route path="/payment" element={<Payment />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
      </Routes>
    </AuthProvider>
  );
}
