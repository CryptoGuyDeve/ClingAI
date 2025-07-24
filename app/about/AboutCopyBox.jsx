'use client'
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

const aboutText = `🧠 About Us – ClingAI.space\n\nWelcome to ClingAI, your modern-day AI assistant designed to help you search smarter, research faster, and get meaningful answers instantly. Built with a clean, minimal UI/UX and powered by advanced AI, ClingAI is more than just a tool — it's a movement to rethink how we interact with information.\n\nClingAI was launched in 2025, created entirely from scratch by a solo founder — FaizuRrehman — a passionate developer and entrepreneur based in Pakistan. The mission? To build an alternative to cluttered search engines by creating an intelligent assistant that delivers fast, relevant, and reliable responses with an interface so intuitive it feels invisible.\n\n✨ Our Origin Story\n\nThe story behind ClingAI is deeply personal.\n\nFaizuRrehman was previously working at a company called Ragon Solution, a startup where he had invested his time and energy, trusting the environment and the people — including the founder, who was a friend. But things didn’t go as expected. Due to internal miscommunication and unprofessional HR handling, he was unexpectedly removed from the team — not because of performance, but due to internal politics and silence.\n\nWhile it was a tough moment, FaizuRrehman decided not to dwell on what happened — instead, he made a promise to himself: "I’ll build something better on my own. I’ll create something so useful, so well-crafted, that the world will see what I’m capable of."\n\nThat energy, ambition, and resilience became the foundation of ClingAI.\n\n🌐 Who We Are Today\n\n• Website: https://clingai.space\n• Built by: A solo developer (currently 1 employee)\n• Backend Support: CodeAndmotion, providing media, video editing, and GFX help\n• Twitter (X): https://x.com/Cling_AI\n• Core Focus: High-speed AI search, clean UX, lightweight performance, and affordable access\n\nThough still a lean team, ClingAI is growing fast with a passionate community and big ambitions.\n\n💬 Our Philosophy\n\nWe believe:\n• AI should be accessible, not intimidating.\n• Clean UI + fast responses = happy users.\n• Tools should respect your time and deliver instant value.\n• Even with limited resources, great products can be built with the right mindset.\n\nWhether you're a student, developer, researcher, or someone who just wants better answers without ads, distractions, or noise — ClingAI is built for you.\n\n❓Frequently Asked Questions (FAQs)\n\nWhat is ClingAI?\nClingAI is an AI-powered search and answer assistant designed to help users get instant, accurate answers in a beautiful, distraction-free UI.\n\nWho created ClingAI?\nClingAI was founded by FaizuRrehman, a solo developer and entrepreneur from Pakistan, in 2025.\n\nHow many people are behind ClingAI?\nCurrently, ClingAI is built and maintained by a single person. However, media and graphics support is provided by CodeAndmotion, a backend partner focused on visuals and marketing content.\n\nWhat makes ClingAI different from ChatGPT or Perplexity?\nClingAI is built for speed, clarity, and simplicity. It offers a minimal interface, tailored responses, and a focus on real-time productivity, unlike bloated chat platforms or over-complicated AI tools.\n\nIs ClingAI free to use?\nYes, ClingAI offers a free plan with limited access. Paid subscriptions are also available with extended features, like unlimited searches, enhanced answer depth, and custom AI behaviors.\n\nCan I follow ClingAI on social media?\nYes! Follow us on Twitter/X: https://x.com/Cling_AI to stay updated on new features, stories, and releases.\n\n🚀 Looking Ahead\n\nClingAI is just getting started. With more features, APIs, and integrations planned for the future, the goal is to become Pakistan’s first globally-known AI SaaS product — built by one, used by thousands.\n\nIf you're someone who values clarity, speed, and focus — we invite you to join us. Use ClingAI. Support independent builders. Help shape the future of AI.`;

export default function AboutCopyBox() {
  const preRef = useRef(null);

  const handleCopy = () => {
    if (preRef.current) {
      navigator.clipboard.writeText(preRef.current.innerText);
    }
  };

  return (
    <>
      <div className="flex justify-center mb-6">
        <Button onClick={handleCopy} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow">
          <Copy className="h-5 w-5" /> Copy About Us Page
        </Button>
      </div>
      <pre ref={preRef} className="whitespace-pre-wrap bg-slate-50 p-6 rounded-xl border border-slate-200 text-[15px] leading-relaxed overflow-x-auto mb-10 font-sans shadow-inner">
        {aboutText}
      </pre>
    </>
  );
} 