

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
          <p>We are ABYLANG (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;). These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;), and ABYLANG, concerning your access to and use of the ABYLANG website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the &quot;Site&quot;).</p>
          <p>You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.</p>

          <h2>1. Our Services</h2>
          <p>ABYLANG provides a platform for users to book and participate in Amharic language lessons with a tutor. We also offer tools like flashcards to supplement learning.</p>
          
          <h2>2. User Accounts &amp; Obligations</h2>
          <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree to notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

          <h2>3. User Conduct</h2>
          <p>You agree not to use the Service for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the Service in any way that could damage the Site, Services, or general business of ABYLANG. You further agree not to:</p>
          <ul>
              <li>Harass, abuse, or threaten others or otherwise violate any person&apos;s legal rights.</li>
              <li>Violate any intellectual property rights of the Company or any third party.</li>
              <li>Record, reproduce, or distribute any part of a lesson without the prior written consent of the tutor.</li>
              <li>Engage in any form of fraudulent activity.</li>
          </ul>
          
          <h2>4. Bookings, Payments, and Cancellations</h2>
          <p>Users can book available lesson slots through the Site. After checkout, your lesson is held with a status of &quot;Awaiting Payment&quot;. We guarantee to verify your payment and confirm your booking within **3 hours** of your payment being processed by our provider. In the unlikely event we fail to do so, you are entitled to a full and immediate refund or a free lesson credit.</p>
          <p><strong>Cancellation and Refund Policy:</strong> You may cancel or reschedule a lesson and receive a full refund or credit, provided the cancellation is made at least **12 hours before** the scheduled lesson start time. Cancellations made within 12 hours of the lesson start time are not eligible for a refund. To cancel, please use the tools provided in your student dashboard or contact us directly.</p>
          <p>In the rare event that the tutor must cancel a lesson, you will be notified as soon as possible and will be offered the choice of a full credit for a future lesson or a full refund for that session.</p>

          <h2>5. Intellectual Property Rights</h2>
          <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the &quot;Content&quot;) and the trademarks, service marks, and logos contained therein (the &quot;Marks&quot;) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.</p>
          <p>All learning materials provided to you during lessons are for your personal, non-commercial use only. You may not distribute, reproduce, or use the materials for any other purpose without our express written consent.</p>
          
          <h2>6. Testimonials</h2>
          <p>If you submit a testimonial, you grant us a perpetual, worldwide, non-exclusive, royalty-free license to use, reproduce, display, and distribute your testimonial in any media for marketing and promotional purposes.</p>
          
          <h2>7. Limitation of Liability</h2>
          <p>In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages. The service is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis.</p>
          
          <h2>8. Term and Termination</h2>
          <p>These Legal Terms shall remain in full force and effect while you use the Site. We reserve the right to, in our sole discretion and without notice or liability, deny access to and use of the Site (including blocking certain IP addresses), to any person for any reason, including without limitation for breach of any representation, warranty, or covenant contained in these Legal Terms.</p>

          <h2>9. Governing Law &amp; Dispute Resolution</h2>
          <p>Any dispute, controversy, or claim arising out of or in relation to this agreement, including the validity, invalidity, breach, or termination thereof, shall be resolved by arbitration in accordance with the Swiss Rules of International Arbitration of the Swiss Centre for Arbitration in force on the date on which the Notice of Arbitration is submitted in accordance with these Rules. The number of arbitrators shall be one. The seat of the arbitration shall be Geneva, Switzerland. The arbitral proceedings shall be conducted in English.</p>

          <h2>10. Modifications to Terms</h2>
          <p>We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at any time and for any reason. We will alert you about any changes by updating the &quot;Last updated&quot; date of these Legal Terms.</p>
          
          <h2>11. Contact Us</h2>
          <p>In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: {contactEmail}</p>
          
        </CardContent>
      </Card>
    </div>
  );
}
