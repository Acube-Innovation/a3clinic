import { getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AmbientBlobs } from "@/components/ui/CurveDivider";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <section className="relative isolate overflow-hidden bg-white py-40">
      <AmbientBlobs />

      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="font-display text-8xl text-teal-100">404</p>

          <h1 className="mt-6 text-h2 text-teal-800">
            This page could not be found
          </h1>

          <p className="mt-5 text-lead text-muted">
            The link may be out of date, or the page may have moved. The pages
            below are a good place to pick things up again.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/" size="lg">
              {t("home")}
            </Button>
            <Button href="/conditions" size="lg" variant="secondary">
              Conditions treated
            </Button>
            <Button href="/contact" size="lg" variant="secondary">
              Contact the clinic
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
