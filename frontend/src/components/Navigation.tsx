import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Smile } from "lucide-react";
import { useState, useEffect } from "react";
import { ROUTES } from "../constants/routes";
import logo from "@/assets/cmo-logo.png";
import logobg from "@/assets/logobg.jpg";
import { useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const navigate = useNavigate();

  const goToFeatures = () => {
    if (location.pathname === "/landing") {
      const el = document.getElementById("features");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/landing#features");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("cmo-user");

    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cmo-user");

    setUser(null);

    navigate("/");
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl"
      style={{
        backgroundImage: `url(${logobg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-black/50 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="CMO.AI Logo" className="h-12" />
          </Link>

          <nav className="items-center hidden gap-8 text-sm font-medium text-white md:flex">
            <button onClick={goToFeatures} className="hover:text-neonPurple">
              Features
            </button>

            <Link
              className="transition hover:text-neonPink"
              to={ROUTES.PRICING}
            >
              Pricing
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="transition hover:text-neonBlue"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link className="transition hover:text-neonBlue" to="/login">
                Log in
              </Link>
            )}
          </nav>

          <div className="items-center hidden gap-4 md:flex">
            {user && (
              <span className="font-bold text-white">Welcome {user.name}</span>
            )}

            <Button className="flex items-center px-6 text-white transition shadow-lg bg-gradient-to-r from-electricPurple to-neonPink hover:scale-105">
              Let's Chat
              <Smile size={18} className="ml-2" />
            </Button>
          </div>

          <button
            className="text-white md:hidden"
            onClick={() => setOpen(!open)}
          >
            <Menu size={26} />
          </button>
        </div>

        {open && (
          <div className="px-6 pb-6 space-y-4 text-white border-t md:hidden border-white/10 backdrop-blur-md">
            <button onClick={goToFeatures} className="hover:text-neonPurple">
              Features
            </button>

            <Link
              className="block transition hover:text-neonPink"
              to="/pricing"
              onClick={() => setOpen(false)}
            >
              Pricing
            </Link>

            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="block transition hover:text-neonBlue"
              >
                Logout
              </button>
            ) : (
              <Link
                className="block transition hover:text-neonBlue"
                to="/login"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
            )}

            <Button className="w-full mt-3 transition bg-gradient-to-r from-electricPurple to-neonPink hover:scale-105">
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
