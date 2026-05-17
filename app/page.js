import Image from "next/image";
import URL from "./_components/URL";
import Message from "./_components/Message";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center bg-[#0a0a0c] font-sans text-zinc-100 selection:bg-purple-500/30">
      {/* Decorative Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-900/20 blur-[100px]" />
      </div>

      <header className="z-10 pt-12 pb-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter bg-gradient-to-b from-white to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          AI Video Copilot
        </h1>
      </header>

      <main className="z-10 flex flex-col w-full max-w-4xl px-6 gap-8 pb-20">
        <section className="w-full">
          <URL />
        </section>
        
        <section className="w-full flex-1">
          <Message />
        </section>
      </main>
    </div>
  );
}