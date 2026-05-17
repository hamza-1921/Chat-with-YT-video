"use client"
import React, { useState } from 'react'
import axios from 'axios'
import { setUrl } from './UrlStore'

const URL = () => {
  const [url, setUrlState] = useState('')

  const sendUrl = async () => {
    try {
      await axios.post('/api/transcribe', { url })
      setUrl(url)
      alert('Video processed successfully!')
    } catch (error) {
      console.error("Error:", error)
      alert('Failed to process video')
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
      <h2 className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-4">Video Source</h2>
      <form onSubmit={(e) => { e.preventDefault(); sendUrl(); }} className="flex flex-col md:flex-row gap-4">
        <input 
          value={url}
          placeholder='Enter YouTube URL...'
          onChange={(e) => setUrlState(e.target.value)}
          className='flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all'
        />
        <button type="submit" className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95'>
          Process Video
        </button>
      </form>
    </div>
  )
}

export default URL