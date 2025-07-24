import React from 'react';
import Head from 'next/head';

export const metadata = {
  title: 'About Us | ClingAI',
  description: 'Learn about ClingAI, the modern AI chat platform with Gemini, OpenAI, Supabase, Stripe, and more. Meet the team, discover our mission, and see why we are the best AI workspace for productivity, code, and research.'
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Head>
        <title>About Us | ClingAI</title>
        <meta name="description" content="Learn about ClingAI, the modern AI chat platform with Gemini, OpenAI, Supabase, Stripe, and more. Meet the team, discover our mission, and see why we are the best AI workspace for productivity, code, and research." />
        <meta name="keywords" content="ClingAI, AI chat, Gemini, OpenAI, Supabase, Stripe, AI workspace, productivity, code generation, research, FaizuRrehman, Pakistan, web development, software engineering, AI subscription, chat history, modern UI, Vercel, Clerk, Brave Search, Google Gemini, GPT-3.5, Gemini Pro, Gemini 2.0 Flash, react-markdown, Next.js, Stripe payments, Supabase database, AI credits, AI library, chat sidebar, discover page, analytics, SEO" />
      </Head>
      <h1 className="text-4xl font-extrabold mb-4">About ClingAI</h1>
      <p className="text-lg mb-6 text-gray-700">
        <strong>ClingAI</strong> is a cutting-edge AI chat and productivity platform designed to empower users with the latest advancements in artificial intelligence. Built with Next.js, Supabase, Stripe, Clerk, and powered by Google Gemini and OpenAI, ClingAI offers a seamless, modern, and feature-rich workspace for research, code generation, and everyday productivity.
      </p>
      <h2 className="text-2xl font-bold mt-8 mb-2">Our Mission</h2>
      <p className="mb-6 text-gray-700">
        Our mission is to make advanced AI accessible, affordable, and easy to use for everyone. Whether you are a developer, student, researcher, or business professional, ClingAI provides the tools you need to chat, code, organize, and collaborate with AI in a beautiful, intuitive environment.
      </p>
      <h2 className="text-2xl font-bold mt-8 mb-2">Key Features</h2>
      <ul className="list-disc pl-6 mb-6 text-gray-700">
        <li>Modern AI chat interface with follow-up questions and chat history</li>
        <li>Integration with Google Gemini (Pro, 2.0 Flash) and OpenAI (GPT-3.5 Turbo)</li>
        <li>Web search results, image carousel, and code generation with syntax highlighting</li>
        <li>Supabase-powered database for chat history, credits, and user management</li>
        <li>Stripe subscription payments and real-time credit tracking</li>
        <li>Library and sidebar for organizing and accessing all your chats</li>
        <li>Responsive, glassmorphic, and modern UI/UX with loaders, animations, and dark mode</li>
        <li>Clerk authentication for secure sign-in and user management</li>
        <li>Vercel Analytics for usage tracking and performance</li>
        <li>SEO-optimized, fast, and scalable for global users</li>
      </ul>
      <h2 className="text-2xl font-bold mt-8 mb-2">Meet the Founder</h2>
      <div className="mb-6 text-gray-700">
        <strong>FaizuRrehman</strong> — 16 y/o, Pakistan<br />
        Founder & CEO of ClingAI<br />
        Experienced in web development and a little bit in software engineering.<br />
        Passionate about building the future of AI-powered productivity tools.<br />
        <span className="italic">Company details coming soon!</span>
      </div>
      <h2 className="text-2xl font-bold mt-8 mb-2">Why Choose ClingAI?</h2>
      <ul className="list-disc pl-6 mb-6 text-gray-700">
        <li>Affordable AI credits and subscription plans</li>
        <li>Real-time credit tracking and easy top-up</li>
        <li>Powerful AI models for code, research, and conversation</li>
        <li>Organize your chats, code, and research in one place</li>
        <li>Modern, beautiful, and responsive design</li>
        <li>Secure, scalable, and privacy-focused</li>
        <li>Built by a passionate team for the next generation of AI users</li>
      </ul>
      <h2 className="text-2xl font-bold mt-8 mb-2">Technologies We Use</h2>
      <ul className="list-disc pl-6 mb-6 text-gray-700">
        <li>Next.js (React framework)</li>
        <li>Supabase (PostgreSQL database, authentication)</li>
        <li>Stripe (payments, subscriptions)</li>
        <li>Clerk (user authentication)</li>
        <li>Google Gemini & OpenAI APIs</li>
        <li>Brave Search API</li>
        <li>react-markdown for code and markdown rendering</li>
        <li>Tailwind CSS for modern UI</li>
        <li>Vercel for hosting and analytics</li>
      </ul>
      <h2 className="text-2xl font-bold mt-8 mb-2">Contact & Socials</h2>
      <p className="mb-6 text-gray-700">
        For support, feedback, or partnership inquiries, please contact us at <a href="mailto:support@clingai.com" className="text-blue-600 underline">support@clingai.com</a>.<br />
        Follow us on social media for updates and news (links coming soon).
      </p>
      <h2 className="text-2xl font-bold mt-8 mb-2">ClingAI — The Future of AI Workspaces</h2>
      <p className="mb-12 text-gray-700">
        Join thousands of users who trust ClingAI for their daily AI-powered productivity, research, and coding needs. Experience the future of AI chat and workspace — fast, modern, and built for you.
      </p>
    </div>
  );
} 