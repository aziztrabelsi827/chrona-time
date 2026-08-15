import { cn } from "@/lib/cn";

interface FAQProps {
  items: { question: string; answer: string }[];
  className?: string;
}

/** Native <details> accordion — accessible & zero JS. */
export function FAQ({ items, className }: FAQProps) {
  return (
    <div className={cn("divide-y divide-line rounded-xl border border-line bg-surface", className)}>
      {items.map((f, i) => (
        <details key={i} className="group px-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
            <span>{f.question}</span>
            <span
              aria-hidden
              className="text-xl leading-none text-faint transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="-mt-1 pb-4 text-sm leading-relaxed text-muted">{f.answer}</div>
        </details>
      ))}
    </div>
  );
}
