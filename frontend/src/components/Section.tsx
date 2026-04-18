export default function Section({ children, className, ...props }: any) {
  return (
    <section className={className} {...props}>
      {children}
    </section>
  );
}
