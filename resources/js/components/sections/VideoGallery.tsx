import { Container, Section, Eyebrow } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { VideoEmbed } from "@/components/ui/VideoEmbed";

export type HomeVideo = { title: string; video: string };

/** Home page videos (edited in the admin or through the Claude connector). Hidden when empty. */
export function VideoGallery({ videos }: { videos: HomeVideo[] }) {
  if (videos.length === 0) return null;

  return (
    <Section tone="platinum">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Eyebrow>Watch</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 text-h2 text-teal-800">From the clinic</h2>
          </Reveal>
        </div>

        <Stagger
          className={
            videos.length === 1
              ? "mx-auto mt-12 max-w-4xl"
              : "mt-12 grid gap-8 md:grid-cols-2"
          }
        >
          {videos.map((v) => (
            <StaggerItem key={v.video}>
              <VideoEmbed src={v.video} title={v.title || "Clinic video"} />
              {v.title ? (
                <p className="mt-4 text-center font-medium text-teal-800">
                  {v.title}
                </p>
              ) : null}
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
