"use client"
import React, { useState } from "react"
import axios from "axios"
import { getUrl } from "./UrlStore"

const Message = () => {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    const userMessage = { role: "user", content: prompt }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setPrompt("")

    try {
      const response = await axios.post("/api/chat", { prompt: userMessage.content, url: getUrl() })
      const aiMessage = { role: "assistant", content: response.data.answer }
      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl flex flex-col h-[600px] shadow-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 bg-white/5">
        <h2 className="text-xs uppercase tracking-widest text-purple-400 font-bold">Chat Interface</h2>
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-purple-500">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user" 
                ? "bg-purple-600/20 border border-purple-500/50 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                : "bg-zinc-900 border border-white/10 text-zinc-300"
            }`}>
               <span className="block text-[10px] uppercase font-bold mb-1 opacity-50">
                {msg.role === "user" ? "You" : "Assistant"}
              </span>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-white/10 px-4 py-3 rounded-2xl animate-pulse text-zinc-500 text-xs">
              AI is analyzing video...
            </div>
          </div>
        )}
      </div>

      {/* INPUT BOX */}
      <form onSubmit={handleSubmit} className="p-4 bg-black/20 border-t border-white/10 flex gap-3">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask about the video content..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default Message