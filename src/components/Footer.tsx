import FooterColumn from "./FooterColumn";

export default function Footer() {
  return (
    <footer className="px-6 py-16 text-white bg-cosmic">
      <div className="grid max-w-6xl gap-8 mx-auto sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-4 text-lg font-bold">CMO.AI</h3>
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

      <div className="mt-12 text-xs text-center text-slate-500">
        © {new Date().getFullYear()} CMO.AI. All rights reserved.
      </div>
    </footer>
  );
}
