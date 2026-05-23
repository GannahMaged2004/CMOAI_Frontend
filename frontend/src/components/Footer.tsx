import logo from "@/assets/cmo-logo.png";
import FooterColumn from "./FooterColumn";

export default function Footer() {
  return (
    <footer className="bg-cosmic px-6 py-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <img
            src={logo}
            alt="CMO.AI Logo"
            className="mb-4 h-12 w-auto drop-shadow-[0_16px_34px_rgba(94,72,220,0.28)]"
          />
          <p className="text-sm text-white/70">
            Empowering businesses with intelligent marketing strategies.
          </p>
        </div>

        <FooterColumn
          title="Product"
          links={["Features", "Pricing", "Enterprise", "Changelog"]}
        />
        <FooterColumn
          title="Resources"
          links={["Blog", "Community", "Help Center", "API Docs"]}
        />
        <FooterColumn
          title="Company"
          links={["About", "Careers", "Legal", "Contact"]}
        />
      </div>

      <div className="mt-12 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} CMO.AI. All rights reserved.
      </div>
    </footer>
  );
}
