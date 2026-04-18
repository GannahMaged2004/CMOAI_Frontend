import Section from "../Section";

export default function HowItWorks() {
  return (
    <Section className="pb-10 text-center bg-slate-50">
      <div className="max-w-5xl mx-auto mb-16 space-y-4">
        <h2 className="pt-10 text-3xl font-bold sm:text-4xl">
          How CMO.AI works
        </h2>

        <p className="text-slate-600">
          Turn your idea into a full marketing strategy in three simple steps.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        <Step
          number="1"
          title="Describe your idea"
          description="Tell us about your product, audience, and goals in simple terms."
          color="text-neonPurple"
        />

        <Step
          number="2"
          title="AI builds strategy"
          description="Our AI analyzes your input and generates a complete marketing plan."
          color="text-neonBlue"
        />

        <Step
          number="3"
          title="Execute and grow"
          description="Launch campaigns, create content, and track performance instantly."
          color="text-neonPink"
        />
      </div>
    </Section>
  );
}

function Step({
  number,
  title,
  description,
  color,
}: {
  number: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="relative p-8 transition-all duration-300 bg-white border group rounded-2xl hover:-translate-y-2 hover:shadow-xl">
      
  
      <div className="absolute inset-0 transition duration-500 opacity-0 group-hover:opacity-100 blur-2xl bg-gradient-to-br from-neonPurple/10 to-neonBlue/10 rounded-2xl" />

      <div className="relative space-y-4">

        <div className={`text-4xl font-bold ${color}`}>
          {number}
        </div>


        <h3 className="text-lg font-semibold">{title}</h3>

        <p className="text-sm text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}