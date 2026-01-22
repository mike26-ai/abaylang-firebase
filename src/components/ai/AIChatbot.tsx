
"use client"

// This component is not used in the MVP as AI features are removed.
// It's kept here for potential future reintegration. User sees "Coming Soon" on the page.

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Volume2 } from "lucide-react"
import { Spinner } from "../ui/spinner";

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  translation?: string
}

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "ሰላም! የ AI Tutor ባህሪ በቅርቡ ይመጣል። (Hello! The AI Tutor feature is coming soon.)",
      sender: "bot",
      translation: "Hello! The AI Tutor feature is coming soon.",
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false) // Kept for UI consistency if re-enabled

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    }
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    
    // Simulate bot response indicating feature is coming soon
    setIsTyping(true);
    setTimeout(() => {
        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "ይቅርታ ይህ የ AI Tutor ባህሪ ገና አልተገኘም። ለጊዜው ጥያቄዎችዎን በቀጥታ ለአስተማሪዎ ማቅረብ ይችላሉ። (Sorry, this AI Tutor feature is not yet available. For now, you can direct your questions to your tutor.)",
            sender: "bot",
            translation: "Sorry, this AI Tutor feature is not yet available. For now, you can direct your questions to your tutor.",
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
    }, 1000);
  }

  const playAudio = (text: string) => {
    // Audio playback functionality would be here.
    // For MVP, it's non-functional.
    alert(`Audio playback for: "${text}" (Feature coming soon)`);
  }


  return (
    <Card className="h-96 flex flex-col shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Bot className="w-5 h-5 text-primary" />
          ABYLANG AI Tutor
          <Badge variant="secondary" className="bg-accent text-accent-foreground">Coming Soon</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                  message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border"
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.sender === "bot" && <Bot className="w-4 h-4 mt-1 text-primary" />}
                  {message.sender === "user" && <User className="w-4 h-4 mt-1" />}
                  <div className="flex-1">
                    <div className="font-medium">{message.text}</div>
                    {message.translation && <div className={`text-xs mt-1 ${message.sender === 'user' ? 'opacity-80' : 'text-muted-foreground'}`}>{message.translation}</div>}
                    {message.sender === "bot" && message.text && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(message.text)}
<<<<<<< HEAD
                        className={`mt-1 h-6 px-2 text-xs ${message.sender === 'user' ? 'text-primary-foreground/80 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
=======
                        className={`mt-1 h-6 px-2 text-xs ${message.sender === 'bot' ? 'text-muted-foreground hover:text-foreground' : 'text-primary-foreground/80 hover:text-primary-foreground'}`}
>>>>>>> before-product-selection-rewrite
                        disabled // Disabled for MVP
                      >
                        <Volume2 className="w-3 h-3 mr-1" /> Listen
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-card p-3 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="AI Chat coming soon..."
            className="flex-1"
            disabled={true} // Disabled for MVP
          />
          <Button
            type="submit"
            disabled={isTyping || !inputText.trim() || true} // Disabled for MVP
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isTyping ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
         <p className="text-xs text-muted-foreground text-center mt-2">AI-powered chat tutor is part of future enhancements.</p>
      </CardContent>
    </Card>
  )
}
