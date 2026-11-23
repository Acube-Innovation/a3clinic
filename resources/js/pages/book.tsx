
import { PageHero } from "@/components/layout/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { useClinic } from "@/lib/shared";
import { phoneIntlOf, phoneDisplayOf } from "@/lib/site";

export default function BookPage() {
  const clinic = useClinic();
  const phone = {
    intl: phoneIntlOf(clinic.phone),
    display: phoneDisplayOf(clinic.phone),
  };

  return (
    <>

      <PageHero
        eyebrow="Booking"
        title="Book your consultation"
        description="Six short steps. You will receive a WhatsApp confirmation once the clinic has checked the slot."
        crumbs={[{ name: "Book Appointment", href: "/book" }]}
        align="center"
      />

      <Section>
        <Container>
          <BookingWizard phone={phone} />
        </Container>
      </Section>
    </>
  );
}
