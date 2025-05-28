
import type { Metadata } from 'next';
import { ChatClient } from '@/components/chat/chat-client';
import { MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chat Room',
  description: 'Join the conversation in the Amharic Connect chat room.',
};

export default function ChatPage() {
  return (
    <div className="container py-8 px-4 md:px-6 flex flex-col h-[calc(100vh-var(--header-height,4rem)-var(--footer-height,4rem)-2rem)]"> {/* Adjust height based on your header/footer */}
      <header className="mb-6 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-3">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Community Chat
        </h1>
        <p className="mt-2 text-md text-muted-foreground">
          Connect with other learners. Please be respectful.
        </p>
      </header>
      <div className="flex-grow flex flex-col min-h-0">
        <ChatClient />
      </div>
    </div>
  );
}
