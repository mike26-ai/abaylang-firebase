
"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Volume2 } from "lucide-react"
import { aiTutorChat, type AiTutorChatInput, type AiTutorChatOutput } from "@/ai/flows/ai-tutor-chat-flow";
import { Spinner } from "../ui/spinner";

interface Message {
  id: string
  text: string // This will be the Amharic response from the bot
  sender: "user" | "bot"
  translation?: string // English translation for the bot's Amharic response
}

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "ሰላም! እንዴት ነህ?",
      sender: "bot",
      translation: "Hello! How are you?",
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false) // For AI response loading

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputText;
    setInputText("")
    setIsTyping(true)

    try {
      const inputForFlow: AiTutorChatInput = { userInput: currentInput };
      const result: AiTutorChatOutput = await aiTutorChat(inputForFlow);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.amharicResponse,
        sender: "bot",
        translation: result.englishTranslation,
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error calling AI Tutor Chat flow:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "ይቅርታ፣ አንድ ችግር ተፈጥሯል። እባክዎ ቆየት ብለው ይሞክሩ።",
        sender: "bot",
        translation: "Sorry, something went wrong. Please try again later.",
      }
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false)
    }
  }

  const playAudio = (text: string) => {
    // In a real app, this would use text-to-speech
    // For now, we can use the browser's built-in speech synthesis if available
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Attempt to find an Amharic voice, though availability is very browser/OS dependent
      const voices = window.speechSynthesis.getVoices();
      const amharicVoice = voices.find(voice => voice.lang.toLowerCase().startsWith('am'));
      if (amharicVoice) {
        utterance.voice = amharicVoice;
      } else {
        // Fallback if no Amharic voice, might not sound right
        utterance.lang = 'am'; 
      }
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Audio playback not supported for: ${text}`)
    }
  }


  return (
    <Card className="h-96 flex flex-col shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Bot className="w-5 h-5 text-primary" />
          Lissan AI Tutor
          <Badge variant="secondary" className="bg-accent text-accent-foreground">Beta</Badge>
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
                        className={`mt-1 h-6 px-2 text-xs ${message.sender === 'user' ? 'text-primary-foreground/80 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
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
            placeholder="Type in Amharic or English..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isTyping ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
