

import { ContactForm } from "@/components/contact/contact-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import type { Metadata } from 'next';
import { contactEmail } from "@/config/site"; // Import the email

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with ABYLANG for any inquiries or support.',
};

export default function ContactPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Get in Touch
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          We&apos;re here to help! Send us a message or find our contact details below.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Send us a message</CardTitle>
            <CardDescription>Fill out the form and we&apos;ll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-primary" />
                <a href={`mailto:${contactEmail}`} className="text-muted-foreground hover:text-primary">
                  {contactEmail}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-6 w-6 text-primary" />
                <a href="tel:+251991176968" className="text-muted-foreground hover:text-primary">
                  +251 99 117 6968 (WhatsApp)
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-6 w-6 text-primary" />
                <span className="text-muted-foreground">Online Lessons Worldwide</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Check out our <a href="/faq" className="text-primary hover:underline">FAQ page</a> for quick answers to common questions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
