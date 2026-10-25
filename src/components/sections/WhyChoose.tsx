import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Counter } from "@/components/motion/Reveal";
import { WhyChoosePillars } from "@/components/sections/WhyChoosePillars";
import { getClinicSettings } from "@/data/clinic";

export async function WhyChoose() {
  const { stats: clinicStats } = await getClinicSettings();
  return (
    <Section tone="platinum" id="why-choose">
      <Container>
        <SectionHeading
          eyebrow="Why patients choose the clinic"
          title={
            <>
              Careful medicine,{" "}
              <span className="font-bold text-olive-300">not quick promises</span>
            </>
          }
          // One line from lg up; the centred flex column lets it run past max-w-3xl.
          titleClassName="lg:whitespace-nowrap"
          description="Hair and skin complaints are rarely just skin-deep. The clinic is built around finding out why — and being straight with you about what treatment can and cannot do."
        />

        <WhyChoosePillars />

        {/* ------------------------------ Stats ------------------------------ */}
        <div className="mt-20 overflow-hidden rounded-5xl bg-teal-900 px-8 py-14 sm:px-14">
          <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {clinicStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="font-display text-5xl text-white sm:text-6xl">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="mt-3 block text-sm font-medium uppercase tracking-[0.14em] text-olive-300">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </Section>
  );
}
