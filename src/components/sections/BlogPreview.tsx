import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/blog/PostCard";
import { getRecentPosts } from "@/data/posts";

export async function BlogPreview() {
  const posts = await getRecentPosts(3);

  return (
    <Section tone="platinum" id="blog">
      <Container>
        <SectionHeading
          eyebrow="From the clinic journal"
          title="Straightforward answers to the questions we hear most"
          description="Written for patients, not for search engines — the same explanations given in the consultation room."
        />

        <Stagger className="mt-16 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <StaggerItem key={post.slug} className="h-full">
              <PostCard post={post} />
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-14 flex justify-center">
          <Button href="/blog" variant="secondary" size="lg">
            Read all articles
          </Button>
        </div>
      </Container>
    </Section>
  );
}
