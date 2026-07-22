import {
  ClipboardList,
  FlaskConical,
  HeartHandshake,
  MonitorSmartphone,
  Stethoscope,
  TimerReset,
} from "lucide-react";

import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Card, IconTile } from "@/components/ui/Card";
import { Counter, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getClinicSettings } from "@/data/clinic";

const pillars = [
  {
    Icon: ClipboardList,
    title: "The history comes first",
    detail:
      "A first consultation runs about forty-five minutes. Medical history, family history, diet, sleep and stress are covered before the scalp is examined — because that is usually where the answer is.",
  },
  {
    Icon: FlaskConical,
    title: "Investigate, then prescribe",
    detail:
      "Where your history points to thyroid, iron or hormonal involvement, testing comes before treatment. Treating the scalp alone rarely holds when the cause sits elsewhere.",
  },
  {
    Icon: Stethoscope,
    title: "Individualised prescribing",
    detail:
      "Two patients with the same complaint often receive different prescriptions. Treatment is selected for your constitution and cause, never from a fixed protocol.",
  },
  {
    Icon: MonitorSmartphone,
    title: "Online or in clinic",
    detail:
      "The same consultation, the same follow-up schedule, whether you attend in Kattakkada or join by video from anywhere. Medicines are couriered to your door.",
  },
  {
    Icon: TimerReset,
    title: "Structured follow-up",
    detail:
      "Reviews every four to six weeks with comparison photographs, because gradual change is genuinely hard to judge from memory alone.",
  },
  {
    Icon: HeartHandshake,
    title: "Honest about limits",
    detail:
      "You will be told at the first consultation what is realistically achievable in your case — including when the answer is limited. No guaranteed outcomes, no fixed-result packages.",
  },
];

export async function WhyChoose() {
  const { stats: clinicStats } = await getClinicSettings();
  return (
    <Section tone="platinum" id="why-choose">
      <Container>
        <SectionHeading
          eyebrow="Why patients choose the clinic"
          title="Careful medicine, not quick promises"
          description="Hair and skin complaints are rarely just skin-deep. The clinic is built around finding out why — and being straight with you about what treatment can and cannot do."
        />

        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ Icon, title, detail }) => (
            <StaggerItem key={title}>
              <Card className="h-full">
                <IconTile>
                  <Icon className="size-6" strokeWidth={1.6} aria-hidden />
                </IconTile>
                <h3 className="mt-6 text-h3 text-teal-800">{title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{detail}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>

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
