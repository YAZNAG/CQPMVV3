import { HelpCircle } from "lucide-react";
import { Container } from "@/components/public/container";
import { cn } from "@/lib/utils";

interface ContactFaqSectionProps {
  title: string;
  items: { question: string; answer: string }[];
}

export function ContactFaqSection({ title, items }: ContactFaqSectionProps) {
  return (
    <section className="bg-white py-16 lg:py-20">
      <Container>
        <h2 className="text-center font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          {title}
        </h2>
        <div className="mt-10 space-y-4">
          {items.map((item, index) => (
            <details
              key={index}
              className="group rounded-2xl border border-slate-200/80 bg-white shadow-sm open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-start gap-3 px-5 py-4 marker:content-none">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean-50 text-ocean-600">
                  <HelpCircle className="h-4 w-4" aria-hidden />
                </span>
                <span className="flex-1 pt-1 text-left text-sm font-bold text-navy-900 sm:text-base">
                  {item.question}
                </span>
              </summary>
              <div className="border-t border-slate-100 px-5 pb-5 pl-16">
                <p className="text-sm leading-relaxed text-slate-600">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
