import heroBg from "@/assets/hero-bg.png";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/cmo-logo.png";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen overflow-hidden bg-[#050816]">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_32%),linear-gradient(90deg,rgba(5,8,22,0.94)_0%,rgba(5,8,22,0.78)_40%,rgba(5,8,22,0.32)_60%,rgba(5,8,22,0.72)_100%)]" />

      <div className="relative z-10 flex items-center justify-start h-screen px-6 py-6 overflow-hidden sm:px-10 lg:px-12">
        <div className="w-full max-w-xl p-6 text-white border shadow-2xl rounded-2xl border-white/10 bg-black/25 backdrop-blur-md sm:p-8 lg:p-10">
          <img
            src={logo}
            alt="CMO.AI Logo"
            className="mb-6 w-52 drop-shadow-[0_18px_36px_rgba(87,60,212,0.32)] sm:w-60"
          />

          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200/90">
            Marketing command center
          </p>

          <h1 className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Welcome to your AI-powered marketing platform.
          </h1>

          <p className="max-w-lg mt-5 text-base leading-7 text-slate-200 sm:text-lg">
            Turn business goals into strategic campaigns with clearer messaging,
            faster creative production, and a workspace that keeps every agent
            in sync.
          </p>

          <div className="flex flex-col gap-3 mt-8 sm:flex-row">
            <button
              onClick={() => navigate("/landing")}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3 font-semibold text-slate-950 transition hover:scale-[1.02] hover:shadow-xl"
            >
              Explore Platform
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 font-semibold text-white transition border rounded-xl border-white/20 bg-white/10 hover:bg-white/15"
            >
              Sign In
            </button>
          </div>

          <div className="grid gap-3 mt-8 text-sm text-slate-200/90 sm:grid-cols-3">
            <div className="px-4 py-3 border rounded-xl border-white/10 bg-white/5">
              Brand coaching
            </div>

            <div className="px-4 py-3 border rounded-xl border-white/10 bg-white/5">
              Multi-agent workflow
            </div>

            <div className="px-4 py-3 border rounded-xl border-white/10 bg-white/5">
              AI campaign execution
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
