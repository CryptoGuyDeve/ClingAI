import Image from 'next/image';
import React, { useEffect, useState, useRef, useContext } from 'react'
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/services/supabase';
import LoaderOverlay from "@/app/_components/LoaderOverlay";
import { useEffect as useReactEffect } from 'react';
import { UserDetailContext } from '@/context/UserDetailContext';

function AnswerDisplay({ searchInput, libId }) {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatValue, setChatValue] = useState('');
  const chatInputRef = useRef(null);
  // Chat history: [{query, answer}]
  const [history, setHistory] = useState([]);
  const [blocked, setBlocked] = useState(false);

  // Helper to fetch all previous chats for this libId
  const fetchHistory = async () => {
    if (!libId) return;
    const { data: chats } = await supabase
      .from('Chats')
      .select('id, userQuery, aiResp, created_at')
      .eq('libId', libId)
      .order('created_at', { ascending: true });
    if (chats && chats.length > 0) {
      // Each chat row now has userQuery and aiResp
      const pairs = chats.map(chat => ({ query: chat.userQuery, answer: chat.aiResp }));
      setHistory(pairs);
    } else if (searchInput) {
      setHistory([{ query: searchInput, answer: '' }]);
    }
  };

  // On mount, fetch all previous chats for this libId
  useReactEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [libId]);

  // Fetch latest user credits/subscription on mount and after each search
  const fetchUserDetail = async () => {
    if (!userDetail?.email) return;
    const { data: users } = await supabase
      .from('Users')
      .select('*')
      .eq('email', userDetail.email);
    if (users && users.length > 0) setUserDetail(users[0]);
  };

  useReactEffect(() => {
    fetchUserDetail();
  }, []);

  // Helper to build Gemini contents array from history
  const buildGeminiHistory = (historyArr, newUserMsg) => {
    const contents = [];
    historyArr.forEach(item => {
      contents.push({ role: 'user', parts: [{ text: item.query }] });
      if (item.answer) contents.push({ role: 'model', parts: [{ text: item.answer }] });
    });
    if (newUserMsg) contents.push({ role: 'user', parts: [{ text: newUserMsg }] });
    return contents;
  };

  // Save Gemini response to Supabase
  const saveAIResponse = async (userQuery, aiResp) => {
    if (!libId || !aiResp) return;
    await supabase.from('Chats').insert({ libId, userQuery, aiResp });
  };

  // On initial searchInput prop, add to history if present
  useEffect(() => {
    if (!searchInput) return;
    setLoading(true);
    setError('');
    // Only add initial search if not already present
    if (history.length > 0 && history[0].query === searchInput) {
      setLoading(false);
      return;
    }
    const contents = buildGeminiHistory([], searchInput);
    fetch('/api/chatgpt-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    })
      .then(res => res.json())
      .then(async data => {
        if (data?.summary) {
          // Only save if not already present
          if (!(history.length > 0 && history[0].query === searchInput)) {
            await saveAIResponse(searchInput, data.summary);
            await fetchHistory();
          }
        } else if (data?.error) {
          setError('Failed to fetch summary from Gemini.');
        } else {
          setError('No summary found.');
        }
      })
      .catch((err) => {
        setError('Failed to fetch summary from Gemini.');
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [searchInput]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatValue.trim()) return;
    // Always fetch latest user credits/subscription before allowing search
    let latestUser = userDetail;
    if (userDetail?.email) {
      const { data: users } = await supabase
        .from('Users')
        .select('*')
        .eq('email', userDetail.email);
      if (users && users.length > 0) latestUser = users[0];
    }
    console.log('DEBUG: latestUser before search', latestUser);
    if (!latestUser?.is_subscribed && (latestUser?.credits ?? 0) < 10) {
      setBlocked(true);
      console.log('DEBUG: Blocked due to insufficient credits', latestUser.credits);
      return;
    }
    setLoading(true);
    setError('');
    const userQuery = chatValue.trim();
    setChatValue('');
    const contents = buildGeminiHistory(history, userQuery);
    fetch('/api/chatgpt-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    })
      .then(res => res.json())
      .then(async data => {
        if (data?.summary) {
          await saveAIResponse(userQuery, data.summary);
          // Deduct 10 credits if not subscribed
          if (!latestUser?.is_subscribed) {
            const newCredits = (latestUser.credits ?? 0) - 10;
            await supabase.from('Users')
              .update({ credits: newCredits })
              .eq('email', latestUser.email);
            console.log('DEBUG: Deducted credits, newCredits:', newCredits);
            setUserDetail({ ...latestUser, credits: newCredits });
            if (newCredits < 10) setBlocked(true);
            if (newCredits < 10) console.log('DEBUG: Blocked after deduction, newCredits:', newCredits);
          }
          await fetchHistory(); // Re-fetch after saving to prevent duplicates
        } else if (data?.error) {
          setError('Failed to fetch summary from Gemini.');
    } else {
          setError('No summary found.');
        }
      })
      .catch(() => {
        setError('Failed to fetch summary from Gemini.');
      })
      .finally(() => {
        setLoading(false);
      });
    chatInputRef.current?.focus();
  };

  return (
    <div className="relative mt-5 w-full max-w-2xl mx-auto flex flex-col items-center" style={{ minHeight: '80vh' }}>
      {/* Animated background */}
      {/* <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-gradient-move" /> */}
      <LoaderOverlay show={loading} />
      {/* Remove glassy card for chat area, render content directly */}
      {/* Web results carousel at the top */}
      <WebCarousel searchInput={searchInput} />
      <div className="flex-1 pb-20 w-full">
        {history.length === 0 && !loading && (
          <div className="mt-8 w-full text-gray-400 text-center">No results yet. Start a conversation!</div>
        )}
        {history.map((item, idx) => (
          <div key={idx} className="mb-8">
            {/* User message */}
            <div className="flex mb-2 justify-end">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-3 rounded-2xl max-w-[80%] shadow-lg font-medium text-base transition-all duration-200 animate-pop">
                <span className="font-semibold">You:</span> {item.query}
              </div>
            </div>
            {/* Gemini answer */}
            <div className="flex">
              <div className="bg-white/80 border border-gray-100 text-gray-900 px-5 py-3 rounded-2xl max-w-[80%] shadow-md backdrop-blur-sm transition-all duration-200 animate-pop">
                {item.answer && /```/.test(item.answer) ? (
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown
                      components={{
                        code({node, inline, className, children, ...props}) {
                          return !inline ? (
                            <pre className="bg-gray-900 text-white rounded p-4 overflow-x-auto my-4"><code>{children}</code></pre>
                          ) : (
                            <code className="bg-gray-200 rounded px-1 py-0.5 text-sm">{children}</code>
                          );
                        }
                      }}
                    >{item.answer}</ReactMarkdown>
          </div>
                ) : (
                  <div className="text-base leading-relaxed">
                    <ReactMarkdown>{item.answer}</ReactMarkdown>
        </div>
                )}
                {!item.answer && (
                  <div className="text-gray-400">No answer available.</div>
        )}
      </div>
          </div>
            {/* Separator */}
            {idx < history.length - 1 && (
              <div className="flex justify-center my-4">
                <div className="h-4 w-1 bg-gray-300 rounded-full mx-2" />
                <div className="h-4 w-1 bg-gray-300 rounded-full mx-2" />
                <div className="h-4 w-1 bg-gray-300 rounded-full mx-2" />
        </div>
      )}
          </div>
        ))}
        {loading && <div className="text-center text-gray-400 mt-4">Loading...</div>}
        {error && !loading && <div className="mt-8 w-full text-red-500 text-center">{error}</div>}
      <style>{`
          @keyframes gradient-move {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-move {
            background-size: 200% 200%;
            animation: gradient-move 8s ease-in-out infinite;
          }
          .animate-pop {
            animation: pop-in 0.4s cubic-bezier(.23,1.02,.64,1.01);
          }
          @keyframes pop-in {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          pre {
            background: #1a202c;
            color: #fff;
            border-radius: 0.5rem;
            padding: 1rem;
            overflow-x: auto;
            margin: 1.5rem 0;
          }
          code {
            font-family: 'Fira Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
        }
      `}</style>
      </div>
      <form
        onSubmit={handleChatSubmit}
        className="sticky bottom-0 z-20 border-t border-gray-200 flex items-center gap-2 px-4 py-3 rounded-b-2xl shadow-lg bg-transparent"
        style={{ minHeight: 64 }}
      >
        {blocked && (
          <div className="w-full text-center text-red-500 font-semibold mb-2">
            You are out of credits. Please subscribe to continue.
            {/* TODO: Add Stripe payment button here */}
          </div>
        )}
        <input
          ref={chatInputRef}
          type="text"
          className="flex-1 px-4 py-3 border-none rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 text-base shadow-sm transition"
          placeholder="Ask anything..."
          value={chatValue}
          onChange={e => setChatValue(e.target.value)}
          aria-label="Ask more about this topic"
        />
         {chatValue && (
           <button
             type="button"
             onClick={() => setChatValue('')}
             className="text-gray-400 hover:text-gray-600 px-2 focus:outline-none"
             tabIndex={-1}
             aria-label="Clear input"
           >
             &#10005;
           </button>
         )}
          <button
            type="submit"
            className="ml-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
            disabled={loading || !chatValue.trim()}
          >
            Ask
          </button>
        </form>
    </div>
  )
}

// ImagesDisplay component for the Images tab
function ImagesDisplay({ searchInput }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!searchInput) return;
    setLoading(true);
    setError('');
    setImages([]);
    fetch('/api/brave-search-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchInput, searchType: 'images' })
    })
      .then(res => res.json())
      .then(data => {
        // Brave image results are in data.images.results or data.results
        const imgResults = data?.images?.results || data?.results || [];
        setImages(imgResults);
        if (!imgResults.length) setError('No images found.');
      })
      .catch(() => {
        setError(''); // Don't show 'Failed to fetch images.'
      })
      .finally(() => setLoading(false));
  }, [searchInput]);

  return (
    <div className="w-full">
      {loading && <div className="text-center text-gray-400 mt-4">Loading images...</div>}
      {/* Don't show error message for failed fetch */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {images.map((img, idx) => (
          <a
            key={idx}
            href={img.url || img.properties?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="relative w-full aspect-square rounded-lg overflow-hidden" style={{ background: 'transparent' }}>
              <Image
                src={img.thumbnail?.src || img.properties?.url || img.url}
                alt={img.title || 'Image'}
                fill
                className="object-cover group-hover:opacity-80 transition"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="mt-1 text-xs text-gray-700 truncate">{img.title || img.source || img.url}</div>
          </a>
        ))}
      </div>
      {images.length === 0 && !loading && !error && (
        <div className="text-center text-gray-400 mt-4">No images yet.</div>
      )}
    </div>
  );
}

// WebCarousel component for web results
function WebCarousel({ searchInput }) {
  const [webResult, setWebResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cardWidth = 160; // px
  const gap = 16; // px
  const visibleCount = 3;
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    if (!searchInput) return;
    setLoading(true);
    setError('');
    setWebResult([]);
    fetch('/api/brave-search-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchInput })
    })
      .then(res => res.json())
      .then(data => {
        if (data?.web?.results && Array.isArray(data.web.results) && data.web.results.length > 0) {
          setWebResult(data.web.results);
        } else {
          setError('No results found.');
        }
      })
      .catch(() => {
        setError('');
      })
      .finally(() => setLoading(false));
  }, [searchInput]);

  const handleScroll = (dir) => {
    if (dir === 'left') {
      setCarouselIndex((prev) => Math.max(0, prev - visibleCount));
    } else {
      setCarouselIndex((prev) => Math.min(webResult.length - visibleCount, prev + visibleCount));
    }
  };

  const atStart = carouselIndex === 0;
  const atEnd = carouselIndex >= webResult.length - visibleCount;

  if (loading) return <div className="text-center text-gray-400 mt-4">Loading web results...</div>;
  if (error) return <div className="text-center text-red-400 mt-4">{error}</div>;
  if (!webResult.length) return null;

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-6">
      {webResult.length > visibleCount && (
        <>
          <button
            onClick={() => handleScroll('left')}
            className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white border rounded-full shadow p-2 z-10 ${atStart ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Previous"
            disabled={atStart}
          >
            &#8592;
          </button>
          <button
            onClick={() => handleScroll('right')}
            className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white border rounded-full shadow p-2 z-10 ${atEnd ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Next"
            disabled={atEnd}
          >
            &#8594;
          </button>
        </>
      )}
      <div className="overflow-x-hidden w-full" style={{ minHeight: 140 }}>
        <div
          className="flex gap-4 transition-transform duration-500"
          style={{
            transform: `translateX(-${carouselIndex * (cardWidth + gap)}px)`
          }}
        >
          {webResult.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 p-2 bg-accent rounded-lg w-[160px] cursor-pointer hover:bg-[#F0F0F0] transition-shadow shadow-md"
              onClick={() => window.open(item.url, '_blank')}
              style={{ minHeight: 120 }}
            >
              <div className='flex gap-2 items-center mb-2'>
                <Image src={item?.profile?.img}
                  alt={item.profile?.name || 'Profile'}
                  width={20}
                  height={20}
                  className='rounded-full'
                />
                <h2 className='text-xs font-semibold'>{item?.profile?.long_name}</h2>
            </div>
              <h2 className='line-clamp-2 text-black text-xs mb-1'>{item?.description}</h2>
            </div>
        ))}
        </div>
      </div>
    </div>
  );
}

export default AnswerDisplay;
export { ImagesDisplay, WebCarousel };