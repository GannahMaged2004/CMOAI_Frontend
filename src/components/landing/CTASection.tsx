import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import Section from "../Section";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";




export default function CTASection() {
  const { user } = useAuth();

  const primaryLink = user ? ROUTES.DASHBOARD : ROUTES.LOGIN;
  const primaryText = user ? "Go to Dashboard" : "Start Building Free";

  return (
    <Section className="px-4 py-20 text-center text-white bg-gradient-to-br from-neonPurple to-neonBlue">
      
      <h2 className="text-3xl font-bold">
        Ready to build smarter marketing?
      </h2>

      <div className="flex justify-center gap-4 mt-6">
        <Link to={primaryLink}>
          <Button size="lg" className="text-black bg-white">
            {primaryText}
          </Button>
        </Link>

        <Link to={ROUTES.PRICING}>
          <Button variant="outline" className="text-white border-white">
            View Pricing
          </Button>
        </Link>

      </div>

    </Section>
  );
}