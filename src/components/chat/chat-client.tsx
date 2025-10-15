
"use client";

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  limitToLast,
  Timestamp,
} from 'firebase/firestore';
import type { ChatMessage } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, AlertCircle, LogIn } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import Link from 'next/link';
import { Spinner } from '../ui/spinner';

export function ChatClient() {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user && !authLoading) {
      setIsLoadingMessages(false);
      return;
    }
    if (authLoading) return; // Wait for auth state to resolve

    setIsLoadingMessages(true);
    const q = query(
      collection(db, 'chatMessages'),
      orderBy('timestamp', 'asc'),
      limitToLast(50) // Load last 50 messages
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedMessages: ChatMessage[] = [];
        querySnapshot.forEach((doc) => {
          fetchedMessages.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });
        setMessages(fetchedMessages);
        setIsLoadingMessages(false);
      },
      (error) => {
        console.error('Error fetching chat messages:', error);
        setIsLoadingMessages(false);
        // Optionally show a toast error
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || newMessage.trim() === '') return;

    setIsSending(true);
    try {
      await addDoc(collection(db, 'chatMessages'), {
        text: newMessage.trim(),
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        userAvatar: user.photoURL || null,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally show a toast error
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (authLoading || isLoadingMessages) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-4">
        <Spinner size="lg" />
        <p className="mt-2 text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="flex-grow flex flex-col items-center justify-center p-6 shadow-lg">
        <AlertCircle className="h-12 w-12 text-primary mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6 text-center">
          You need to be logged in to participate in the chat.
        </p>
        <Button asChild>
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" /> Log In
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex-grow flex flex-col shadow-xl overflow-hidden">
      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 my-3 ${
              msg.userId === user.uid ? 'justify-end' : ''
            }`}
          >
            {msg.userId !== user.uid && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={msg.userAvatar || undefined} alt={msg.userName} data-ai-hint="user avatar" />
                <AvatarFallback>{getInitials(msg.userName)}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow ${
                msg.userId === user.uid
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-card text-card-foreground border rounded-bl-none'
              }`}
            >
              <p className="text-sm font-medium mb-0.5">
                {msg.userId === user.uid ? 'You' : msg.userName}
              </p>
              <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
              {msg.timestamp && typeof msg.timestamp === 'object' && 'toDate' in msg.timestamp && (
                <p className={`text-xs mt-1 ${msg.userId === user.uid ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                  {formatDistanceToNowStrict(msg.timestamp.toDate(), { addSuffix: true })}
                </p>
              )}
            </div>
            {msg.userId === user.uid && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={msg.userAvatar || undefined} alt={msg.userName} data-ai-hint="user avatar"/>
                <AvatarFallback>{getInitials(msg.userName)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <CardFooter className="p-4 border-t bg-background">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={isSending || newMessage.trim() === ''}>
            {isSending ? <Spinner size="sm" /> : <Send className="h-5 w-5" />}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
