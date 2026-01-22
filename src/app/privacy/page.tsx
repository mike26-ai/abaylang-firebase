

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';
import { contactEmail } from "@/config/site";

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for ABYLANG.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </header>
      <Card className="shadow-lg max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Our Commitment to Your Privacy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>Welcome to ABYLANG. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at {contactEmail}.</p>
          
          <h2>1. What Information Do We Collect?</h2>
          <p>We collect personal information that you voluntarily provide to us when you register on the website, book a lesson, express an interest in obtaining information about us or our products and services, or otherwise contact us.</p>
          <p>The personal information we collect includes your name, email address, password, country of residence, and your self-assessed language level. Payment information is handled by our third-party payment processor (Paddle) and we do not store your credit card details.</p>

          <h2>2. How Do We Use Your Information?</h2>
          <p>We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
          <ul>
            <li>To facilitate account creation and logon process.</li>
            <li>To manage user accounts and bookings.</li>
            <li>To send administrative information, such as updates on bookings or changes to our terms.</li>
            <li>To request feedback on lessons to improve our services.</li>
            <li>To protect our Services from fraud and abuse.</li>
          </ul>

          <h2>3. Will Your Information Be Shared With Anyone?</h2>
          <p>We only share information with your consent, to comply with laws, to provide you with services (such as processing payments with our payment provider), to protect your rights, or to fulfill business obligations. We do not sell your personal data.</p>

          <h2>4. How Long Do We Keep Your Information?</h2>
          <p>We keep your information for as long as your account is active with us to provide you with services. We will also retain information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.</p>
          
          <h2>5. How Do We Keep Your Information Safe?</h2>
          <p>We aim to protect your personal information through a system of organizational and technical security measures. We use secure services for authentication and database management, and all payment processing is handled by a PCI-compliant third-party provider.</p>

          <h2>6. What Are Your Privacy Rights?</h2>
          <p>You have rights regarding your personal information under various data protection laws. These may include the right to access, correct, update, or request deletion of your personal information. We are committed to upholding these rights for all our users, regardless of their location.</p>
          <p>If you wish to exercise any of these rights, you may review or change your information in your user profile at any time, or you can contact us directly with your request. To make a request, please email us at <strong>{contactEmail}</strong>. We will respond to your request in accordance with applicable data protection laws.</p>
          
          <h2>7. Updates To This Policy</h2>
          <p>We may update this privacy policy from time to time. The updated version will be indicated by an updated &quot;Last updated&quot; date and the updated version will be effective as soon as it is accessible.</p>

          <h2>8. How Can You Contact Us About This Policy?</h2>
          <p>If you have questions or comments about this policy, you may email us at {contactEmail}.</p>
          
        </CardContent>
      </Card>
    </div>
  );
}
