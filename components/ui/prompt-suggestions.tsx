import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface PromptSuggestionsProps {
  label: string
  append: (message: { role: "user"; content: string }) => void
  suggestions: string[]
}

export function PromptSuggestions({
  label,
  append,
  suggestions,
}: PromptSuggestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 max-w-4xl mx-auto w-full">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4 mb-12"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {label}
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          I'm here to help you with anything you need. Try one of the suggestions below or ask me anything.
        </p>
      </motion.div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
            onClick={() => append({ role: "user", content: suggestion })}
            className="group relative text-left rounded-xl border bg-card p-4 hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 hover:shadow-md hover:shadow-primary/5"
          >
            <p className="text-sm leading-relaxed text-foreground group-hover:text-foreground">
              {suggestion}
            </p>
            <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-muted-foreground mt-8 text-center"
      >
        Powered by Chronicles AI
      </motion.p>
    </div>
  )
}
