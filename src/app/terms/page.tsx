
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';
import { contactEmail } from "@/config/site";

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for ABYLANG.',
};

export default function TermsOfServicePage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </header>
      <Card className="shadow-lg max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Agreement to our Legal Terms</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>We are ABYLANG ("Company," "we," "us," "our"). These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and ABYLANG, concerning your access to and use of the ABYLANG website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").</p>
          <p>You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.</p>

          <h2>1. Our Services</h2>
          <p>ABYLANG provides a platform for users to book and participate in Amharic language lessons with a tutor. We also offer tools like flashcards to supplement learning.</p>
          
          <h2>2. User Accounts</h2>
          <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>

          <h2>3. Bookings and Cancellations</h2>
          <p>Users can book available lesson slots through the Site. Cancellation policies will be clearly stated during the booking process. The tutor reserves the right to cancel or reschedule lessons with appropriate notice.</p>
          
          <h2>4. User Conduct</h2>
          <p>You agree not to use the Service for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the Service in any way that could damage the Site, Services, or general business of ABYLANG.</p>

          <h2>5. Intellectual Property Rights</h2>
          <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.</p>
          
          <h2>6. Testimonials</h2>
          <p>If you submit a testimonial, you grant us a perpetual, worldwide, non-exclusive, royalty-free license to use, reproduce, display, and distribute your testimonial in any media.</p>
          
          <h2>7. Limitation of Liability</h2>
          <p>In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.</p>
          
          <h2>8. Governing Law</h2>
          <p>These Legal Terms shall be governed by and defined following the laws of Ethiopia. ABYLANG and yourself irrevocably consent that the courts of Ethiopia shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.</p>

          <h2>9. Modifications to Terms</h2>
          <p>We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at any time and for any reason.</p>
          
          <h2>10. Contact Us</h2>
          <p>In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: {contactEmail}</p>
          
        </CardContent>
      </Card>
    </div>
  );
}
