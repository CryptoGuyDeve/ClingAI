import React from 'react';
import Head from 'next/head';
import AboutCopyBox from './AboutCopyBox';

export const metadata = {
  title: 'About Us | ClingAI.space',
  description: 'Learn about ClingAI.space, the modern AI assistant and search platform. Discover our story, mission, FAQs, and more. Built by FaizuRrehman, supported by CodeAndmotion.'
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Head>
        <title>About Us | ClingAI.space</title>
        <meta name="description" content="Learn about ClingAI.space, the modern AI assistant and search platform. Discover our story, mission, FAQs, and more. Built by FaizuRrehman, supported by CodeAndmotion." />
        <meta name="keywords" content="ClingAI, ClingAI.space, AI chat, Gemini, OpenAI, Supabase, Stripe, AI workspace, productivity, code generation, research, FaizuRrehman, Pakistan, web development, software engineering, AI subscription, chat history, modern UI, Vercel, Clerk, Brave Search, Google Gemini, GPT-3.5, Gemini Pro, Gemini 2.0 Flash, react-markdown, Next.js, Stripe payments, Supabase database, AI credits, AI library, chat sidebar, discover page, analytics, SEO" />
      </Head>
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-extrabold text-center mb-2 text-blue-700 tracking-tight">🧠 About Us – <span className="text-purple-600">ClingAI.space</span></h1>
        <p className="text-lg text-gray-600 text-center max-w-2xl mb-4">Welcome to ClingAI, your modern AI assistant for smarter search, research, and productivity. Built by <span className="font-bold text-blue-700">FaizuRrehman</span> in Pakistan, supported by <span className="font-bold text-purple-600">CodeAndmotion</span> for media and GFX.</p>
        <a href="https://x.com/Cling_AI" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-base flex items-center gap-1 mb-2">🐦 Follow us on Twitter/X <span className="font-mono">@Cling_AI</span></a>
        <span className="text-xs text-gray-400">1 employee • Launched 2025 • Backend support by CodeAndmotion</span>
      </div>
      <AboutCopyBox />
      <div className="prose prose-lg max-w-none text-gray-800">
        <h2 className="text-2xl font-bold text-blue-700 mt-10 mb-2">✨ Our Origin Story</h2>
        <p>FaizuRrehman was previously working at a company called <b>Ragon Solution</b>, a startup where he had invested his time and energy, trusting the environment and the people — including the founder, who was a friend. But things didn’t go as expected. Due to internal miscommunication and unprofessional HR handling, he was unexpectedly removed from the team — not because of performance, but due to internal politics and silence.</p>
        <p>While it was a tough moment, FaizuRrehman decided not to dwell on what happened — instead, he made a promise to himself: <b>"I’ll build something better on my own. I’ll create something so useful, so well-crafted, that the world will see what I’m capable of."</b></p>
        <p>That energy, ambition, and resilience became the foundation of ClingAI.</p>
        <h2 className="text-2xl font-bold text-blue-700 mt-10 mb-2">🌐 Who We Are Today</h2>
        <ul>
          <li><b>Website:</b> <a href="https://clingai.space" className="text-blue-600 hover:underline">clingai.space</a></li>
          <li><b>Built by:</b> A solo developer (currently 1 employee)</li>
          <li><b>Backend Support:</b> CodeAndmotion (media, video editing, GFX)</li>
          <li><b>Twitter (X):</b> <a href="https://x.com/Cling_AI" className="text-blue-600 hover:underline">@Cling_AI</a></li>
          <li><b>Core Focus:</b> High-speed AI search, clean UX, lightweight performance, affordable access</li>
        </ul>
        <h2 className="text-2xl font-bold text-blue-700 mt-10 mb-2">💬 Our Philosophy</h2>
        <ul>
          <li>AI should be accessible, not intimidating.</li>
          <li>Clean UI + fast responses = happy users.</li>
          <li>Tools should respect your time and deliver instant value.</li>
          <li>Even with limited resources, great products can be built with the right mindset.</li>
        </ul>
        <h2 className="text-2xl font-bold text-blue-700 mt-10 mb-2">❓ Frequently Asked Questions (FAQs)</h2>
        <ul>
          <li><b>What is ClingAI?</b><br />ClingAI is an AI-powered search and answer assistant designed to help users get instant, accurate answers in a beautiful, distraction-free UI.</li>
          <li><b>Who created ClingAI?</b><br />ClingAI was founded by FaizuRrehman, a solo developer and entrepreneur from Pakistan, in 2025.</li>
          <li><b>How many people are behind ClingAI?</b><br />Currently, ClingAI is built and maintained by a single person. However, media and graphics support is provided by CodeAndmotion, a backend partner focused on visuals and marketing content.</li>
          <li><b>What makes ClingAI different from ChatGPT or Perplexity?</b><br />ClingAI is built for speed, clarity, and simplicity. It offers a minimal interface, tailored responses, and a focus on real-time productivity, unlike bloated chat platforms or over-complicated AI tools.</li>
          <li><b>Is ClingAI free to use?</b><br />Yes, ClingAI offers a free plan with limited access. Paid subscriptions are also available with extended features, like unlimited searches, enhanced answer depth, and custom AI behaviors.</li>
          <li><b>Can I follow ClingAI on social media?</b><br />Yes! Follow us on Twitter/X: <a href="https://x.com/Cling_AI" className="text-blue-600 hover:underline">@Cling_AI</a> to stay updated on new features, stories, and releases.</li>
        </ul>
        <h2 className="text-2xl font-bold text-blue-700 mt-10 mb-2">🚀 Looking Ahead</h2>
        <p>ClingAI is just getting started. With more features, APIs, and integrations planned for the future, the goal is to become Pakistan’s first globally-known AI SaaS product — built by one, used by thousands.</p>
        <p>If you're someone who values clarity, speed, and focus — we invite you to join us. Use ClingAI. Support independent builders. Help shape the future of AI.</p>
      </div>
    </div>
  );
} 