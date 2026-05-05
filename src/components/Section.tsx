import type { ComponentPropsWithoutRef } from "react";

export default function Section({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={className} {...props}>
      {children}
    </section>
  );
}
