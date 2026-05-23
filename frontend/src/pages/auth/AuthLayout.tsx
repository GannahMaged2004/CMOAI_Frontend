import type { ReactNode } from "react";
import logo from "@/assets/cmo-logo.png";

export default function AuthLayout({
  children,
  eyebrow = "Account access",
  title,
  subtitle,
}: {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cosmic px-4 py-10 text-white">
      <div className="absolute left-10 top-10 h-[600px] w-[600px] rounded-full bg-neonPurple/30 blur-3xl" />
      <div className="absolute bottom-20 right-20 h-[600px] w-[600px] rounded-full bg-neonBlue/30 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] rounded-full bg-neonPink/25 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,20,0.25)_0%,rgba(6,10,20,0.78)_100%)]" />

      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-slate-950/60 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-10">
        <div className="flex justify-center">
          <img
            src={logo}
            alt="CMO.AI Logo"
            className="h-14 w-auto drop-shadow-[0_16px_34px_rgba(94,72,220,0.32)]"
          />
        </div>
        <div className="mt-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/85">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
            {subtitle}
          </p>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
