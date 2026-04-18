export default function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: string[];
}) {
  return (
    <div>
      <h4 className="mb-4 font-semibold">{title}</h4>
      <ul className="space-y-2 text-sm text-slate-400">
        {links.map((link, i) => (
          <li key={i} className="cursor-pointer hover:text-white">
            {link}
          </li>
        ))}
      </ul>
    </div>
  );
}
