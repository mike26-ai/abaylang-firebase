"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Volume2 } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  amharic?: string
  translation?: string
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
  const [isTyping, setIsTyping] = useState(false)

  const botResponses = [
    { amharic: "ደህና ነኝ፣ አመሰግናለሁ!", translation: "I'm fine, thank you!" },
    { amharic: "ጥሩ ነው! ዛሬ ምን ትማራለህ?", translation: "Great! What are you learning today?" },
    { amharic: "በጣም ጥሩ! ቀጥል!", translation: "Very good! Continue!" },
    { amharic: "እንደገና ሞክር", translation: "Try again" },
    { amharic: "ምርጥ! አሁን ሌላ ሐረግ ንሞክር", translation: "Excellent! Now let's try another phrase" },
  ]

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse.amharic,
        sender: "bot",
        translation: randomResponse.translation,
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const playAudio = (text: string) => {
    // In a real app, this would use text-to-speech
    alert(`Playing audio for: ${text}`)
  }

  return (
    <Card className="h-96 flex flex-col shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Bot className="w-5 h-5 text-primary" />
          Amharic AI Tutor
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
                    {message.translation && <div className={`text-xs mt-1 ${message.sender === 'user' ? 'opacity-80' : 'opacity-70'}`}>{message.translation}</div>}
                    {message.sender === "bot" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(message.text)}
                        className={`mt-1 h-6 px-2 text-xs ${message.sender === 'user' ? 'text-primary-foreground/80 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Volume2 className="w-3 h-3" />
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

        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type in Amharic or English..."
            onKeyPress={(e) => e.key === "Enter" && !isTyping && inputText.trim() && handleSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
