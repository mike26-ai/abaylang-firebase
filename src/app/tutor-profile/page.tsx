
import { TutorProfileCard } from "@/components/tutor/tutor-profile-card";
import { TestimonialSlider } from "@/components/tutor/testimonial-slider";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from 'next';
import { tutorInfo } from "@/config/site";

export const metadata: Metadata = {
  title: `Tutor Profile - ${tutorInfo.name}`,
  description: `Learn more about your Amharic tutor, ${tutorInfo.name}.`,
};

export default function TutorProfilePage() {
  return (
    <div className="container py-8 px-4 md:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Meet Your Tutor
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Get to know {tutorInfo.name} and her approach to teaching Amharic.
        </p>
      </header>
      
      <TutorProfileCard />

      <Separator className="my-12" />

      <section>
        <h2 className="text-3xl font-bold tracking-tight text-center mb-10 text-foreground sm:text-4xl">
          What Our Students Say
        </h2>
        <div className="max-w-2xl mx-auto">
          <TestimonialSlider />
        </div>
      </section>
    </div>
  );
}
