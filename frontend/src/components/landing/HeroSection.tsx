import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Play } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";

export default function HeroSection() {
  const { user } = useAuth();

  const ctaLink = user ? ROUTES.DASHBOARD : ROUTES.LOGIN;
  const ctaText = user ? "Go to Dashboard" : "Start Building Free";

  return (
    <section className="relative px-6 py-32 text-center bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="relative max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold sm:text-6xl">
          Turn business ideas into{" "}
          <span className="text-transparent bg-gradient-to-r from-neonBlue via-electricPurple to-neonPink bg-clip-text">
            marketing strategies
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-slate-600">
          Generate structured marketing plans instantly with AI.
        </p>

        <div className="flex flex-col justify-center gap-4 pt-6 sm:flex-row">
          <Link to={ctaLink}>
            <Button size="lg" className="px-10 py-6 text-white bg-cosmic">
              {ctaText}
            </Button>
          </Link>

          <Button variant="outline" size="lg" className="flex gap-2">
            <Play size={18} /> Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
