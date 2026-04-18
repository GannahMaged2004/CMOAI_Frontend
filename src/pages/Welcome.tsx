// Welcome page
import heroBg from "@/assets/hero-bg.png";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/cmo-logo.png";

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex items-center min-h-screen px-6 sm:px-12 lg:px-24">
        <div className="max-w-xl space-y-8 text-white">
          <h2 className="text-5xl font-bold leading-tight text-white">
            Welcome to your
            <br />
            A.I-powered marketing platform.
          </h2>
          <img src={logo} alt="CMO.AI Logo" className="mb-6 w-60" />

          <p className="text-lg text-gray-300">
            Transform business goals into strategic, 
            <br/>
            AI-driven campaigns with
            <br/>
            clarity, speed, and creativity.
          </p>

          <button
            onClick={() => navigate("/landing")}
            className="px-8 py-3 font-semibold transition shadow-xl sm:px-10 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
