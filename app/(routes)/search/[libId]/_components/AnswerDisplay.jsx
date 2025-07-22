import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react'
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';

function AnswerDisplay({ searchInput }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatValue, setChatValue] = useState('');
  const chatInputRef = useRef(null);
  // Chat history: [{query, answer}]
  const [history, setHistory] = useState([]);

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

  // On initial searchInput prop, add to history if present
  useEffect(() => {
    if (!searchInput) return;
    setLoading(true);
    setError('');
    const contents = buildGeminiHistory([], searchInput);
    fetch('/api/chatgpt-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    })
      .then(res => res.json())
      .then(data => {
        if (data?.summary) {
          setHistory(prev => [...prev, { query: searchInput, answer: data.summary }]);
        } else if (data?.error) {
          setError('Failed to fetch summary from Gemini.');
          setHistory(prev => [...prev, { query: searchInput, answer: '' }]);
        } else {
          setError('No summary found.');
          setHistory(prev => [...prev, { query: searchInput, answer: '' }]);
        }
      })
      .catch((err) => {
        setError('Failed to fetch summary from Gemini.');
        setHistory(prev => [...prev, { query: searchInput, answer: '' }]);
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [searchInput]);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatValue.trim()) return;
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
      .then(data => {
        if (data?.summary) {
          setHistory(prev => [...prev, { query: userQuery, answer: data.summary }]);
        } else if (data?.error) {
          setError('Failed to fetch summary from Gemini.');
          setHistory(prev => [...prev, { query: userQuery, answer: '' }]);
        } else {
          setError('No summary found.');
          setHistory(prev => [...prev, { query: userQuery, answer: '' }]);
        }
      })
      .catch(() => {
        setError('Failed to fetch summary from Gemini.');
        setHistory(prev => [...prev, { query: userQuery, answer: '' }]);
      })
      .finally(() => {
        setLoading(false);
      });
    chatInputRef.current?.focus();
  };

  return (
    <div className="relative mt-5 w-full max-w-2xl mx-auto" style={{height: '80vh', display: 'flex', flexDirection: 'column'}}>
      {/* Web results carousel at the top */}
      <WebCarousel searchInput={searchInput} />
      <div className="flex-1 pb-20">
        {history.length === 0 && !loading && (
          <div className="mt-8 w-full text-gray-400 text-center">No results yet. Start a conversation!</div>
        )}
        {history.map((item, idx) => (
          <div key={idx} className="mb-8">
            {/* User message */}
            <div className="flex mb-2">
              <div className="bg-blue-100 text-blue-900 px-4 py-2 rounded-lg max-w-[80%] ml-auto shadow">
                <span className="font-semibold">You:</span> {item.query}
              </div>
            </div>
            {/* Gemini answer */}
            <div className="flex">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg max-w-[80%] mr-auto shadow">
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
        className="sticky bottom-0 z-20 bg-white border-t border-gray-200 flex items-center gap-2 px-3 py-2 rounded-b-lg shadow-sm"
        style={{ minHeight: 56 }}
      >
        <input
          ref={chatInputRef}
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ask more about this topic..."
          value={chatValue}
          onChange={e => setChatValue(e.target.value)}
          aria-label="Ask more about this topic"
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
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
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
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