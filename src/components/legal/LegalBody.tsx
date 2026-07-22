import { CircleAlert } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
};

/** Shared typographic treatment for the privacy and terms pages. */
export function LegalBody({
  sections,
  notice,
}: {
  sections: LegalSection[];
  notice?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      {notice ? (
        <Reveal>
          <div className="mb-14 flex gap-4 rounded-4xl bg-olive-50 p-6 ring-1 ring-olive-200 sm:p-7">
            <CircleAlert
              className="mt-0.5 size-5 shrink-0 text-olive-700"
              strokeWidth={1.9}
              aria-hidden
            />
            <p className="text-sm leading-relaxed text-olive-800">{notice}</p>
          </div>
        </Reveal>
      ) : null}

      <div className="flex flex-col gap-12">
        {sections.map((section) => (
          <Reveal key={section.title}>
            <section>
              <h2 className="text-h3 text-teal-800">{section.title}</h2>

              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 leading-relaxed text-muted"
                >
                  {paragraph}
                </p>
              ))}

              {section.list ? (
                <ul className="mt-5 flex flex-col gap-3">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3.5">
                      <span
                        aria-hidden
                        className="mt-2.5 size-1.5 shrink-0 rounded-full bg-olive-500"
                      />
                      <span className="leading-relaxed text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
