"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { Chat } from "@/components/ui/chat"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Message } from "@/components/ui/chat-message"
import { Sparkles } from "lucide-react"

export default function Assistant() {
  const [input, setInput] = useState("")
  
  const {
    messages,
    sendMessage,
    status,
    stop,
  } = useChat()
 
  const isLoading = status === 'submitted' || status === 'streaming'
  const lastMessage = messages.at(-1)
  const isEmpty = messages.length === 0

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.()
    if (!input.trim()) return
    
    sendMessage({ text: input })
    setInput("")
  }

  const append = (message: { role: "user"; content: string }) => {
    sendMessage({ text: message.content })
    setInput("")
  }

  // Convert UIMessage to Message format
  const convertedMessages: Message[] = messages.map((msg) => {
    // Extract text content from parts
    const textParts = msg.parts?.filter((part): part is { type: 'text'; text: string } => part.type === 'text') || []
    const content = textParts.map(part => part.text).join('') || ''
    
    return {
      id: msg.id,
      role: msg.role,
      content,
      parts: msg.parts as any, // Type assertion needed due to type differences
    }
  })

  return (
    <SidebarInset className="flex flex-col h-screen">
      {/* Minimal Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Chronicles AI</span>
              <span className="text-xs text-muted-foreground">Your intelligent assistant</span>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Chat
          messages={convertedMessages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isGenerating={isLoading}
          stop={stop}
          append={append}
          suggestions={[
            "Who are my contacts that are from Greece?",
            "Are there any friends of mine from South America?",
            "Can you find any friends that have researched in the field of High Energy Particle Physics?",
            "Which friends can I call if I would like to jam to some music?",
          ]}
          className="flex-1 h-full"
        />
      </div>
    </SidebarInset>
  )
}
