
import type { Metadata } from 'next';
import { MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chat Room - LissanHub',
  description: 'Join the conversation in the LissanHub community chat room.',
};

export default function ChatPage() {
  return (
    <div className="container py-8 px-4 md:px-6 flex flex-col items-center justify-center h-[calc(100vh-var(--header-height,4rem)-var(--footer-height,4rem)-2rem)]">
      <header className="mb-6 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-3">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Community Chat
        </h1>
        <p className="mt-2 text-md text-muted-foreground">
          Our community chat feature is coming soon! This is where you'll be able to connect with fellow Amharic learners and practice your skills.
        </p>
      </header>
    </div>
  );
}
