import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react'
import DOMPurify from 'dompurify';

function AnswerDisplay({ searchInput }) {
  const [webResult, setWebResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [brief, setBrief] = useState('');
  const scrollRef = useRef(null);
  const cardWidth = 160; // px
  const gap = 16; // px
  const visibleCount = 3;
  const scrollAmount = (cardWidth + gap) * visibleCount;
  const [scrollPos, setScrollPos] = useState(0);
  const [typedBrief, setTypedBrief] = useState('');
  const [enrichedBrief, setEnrichedBrief] = useState('');

  useEffect(() => {
    if (!searchInput) return;
    setLoading(true);
    setError('');
    setWebResult([]);
    setBrief('');
    fetch('/api/brave-search-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchInput })
    })
      .then(res => res.json())
      .then(data => {
        if (data?.web?.results && Array.isArray(data.web.results) && data.web.results.length > 0) {
          setWebResult(data.web.results);
          // Use the first result's description as the brief
          setBrief(data.web.results[0]?.description || '');
        } else {
          setError('No results found.');
        }
        // If Brave ever returns a summary/snippet, prefer that
        if (data?.web?.snippet) setBrief(data.web.snippet);
        if (data?.summary) setBrief(data.summary);
      })
      .catch(() => {
        setError('');
      })
      .finally(() => setLoading(false));
  }, [searchInput]);

  useEffect(() => {
    setTypedBrief(''); // Reset on new brief
    if (!enrichedBrief) return;
    let i = 0;
    let cancelled = false;
    function typeNext() {
      if (cancelled) return;
      setTypedBrief(prev => prev + enrichedBrief[i]);
      i++;
      if (i < enrichedBrief.length) {
        setTimeout(typeNext, 18 + Math.random() * 30);
      }
    }
    typeNext();
    return () => { cancelled = true; };
  }, [enrichedBrief]);

  // Helper to strip <strong> and other tags
  function stripTags(html) {
    // Remove <strong> and all HTML tags
    return html.replace(/<\/?strong>/gi, '').replace(/<[^>]+>/g, '');
  }

  // Helper to enrich the brief
  function enrichBrief(brief, input) {
    let cleanBrief = stripTags(brief);
    let isQuestion = /\?$/.test(input.trim());
    let extra = '';
    if (isQuestion) {
      extra = '\n\nHow you can approach this:';
      extra += '\n- Break down the question into smaller parts.';
      extra += '\n- Search for similar problems or examples.';
      extra += '\n- Try to understand the core concepts involved.';
      extra += '\n- If it is a technical or coding question, look for code samples or documentation.';
      extra += '\n- Don\'t hesitate to ask for help or clarification!';
    } else {
      extra = '\n\nRelated possibilities:';
      extra += '\n- Explore more about this topic.';
      extra += '\n- Check out related resources or articles.';
      extra += '\n- Try different keywords for deeper insights.';
      extra += '\n- Stay curious and keep learning!';
    }
    return cleanBrief + extra;
  }

  useEffect(() => {
    if (!brief) {
      setEnrichedBrief('');
      return;
    }
    setEnrichedBrief(enrichBrief(brief, searchInput));
  }, [brief, searchInput]);

  // Arrow logic
  const [carouselIndex, setCarouselIndex] = useState(0);
  const handleScroll = (dir) => {
    if (dir === 'left') {
      setCarouselIndex((prev) => Math.max(0, prev - visibleCount));
    } else {
      setCarouselIndex((prev) => Math.min(webResult.length - visibleCount, prev + visibleCount));
    }
  };

  // Track scroll position to disable arrows
  const atStart = carouselIndex === 0;
  const atEnd = carouselIndex >= webResult.length - visibleCount;

  return (
    <div className="relative mt-5 w-full max-w-2xl mx-auto">
      {loading && <div className="text-center text-gray-400 mt-4">Loading...</div>}
      {error && !loading && <div className="text-center text-red-400 mt-4">{error}</div>}
      {/* Carousel and arrows in their own relative container */}
      <div className="relative">
        {webResult.length > visibleCount && !loading && !error && (
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
        <div
          className="overflow-x-hidden w-full"
          style={{ minHeight: 140 }}
        >
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
                    alt={item.profile.name}
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
        {webResult.length === 0 && !loading && !error && (
          <div className="text-center text-gray-400 mt-4">No results yet.</div>
        )}
      </div>
      {/* Brief/summary as a separate section below carousel+arrows */}
      {brief && (
        <div className="mt-8 w-full">
          <div className="text-gray-700 text-base leading-relaxed w-full">
            <span className="font-medium text-gray-900">Here's what we found about <span className="text-blue-600">{searchInput}</span>:</span>
            <span className="typewriter-brief ml-2">
              {typedBrief.split('').map((char, idx) => (
                <span key={idx} className="fade-in-char" style={{ animationDelay: `${idx * 0.012}s` }}>{char}</span>
              ))}
            </span>
          </div>
        </div>
      )}
      {/* Add styles for typewriter and blending effect */}
      <style>{`
        .typewriter-brief {
          font-family: inherit;
          font-size: 1.05em;
          letter-spacing: 0.01em;
          white-space: pre-line;
          display: inline;
        }
        .fade-in-char {
          opacity: 0;
          animation: fadeInChar 0.4s forwards;
          will-change: opacity, filter;
          filter: blur(2px);
        }
        @keyframes fadeInChar {
          from { opacity: 0; filter: blur(2px); }
          to { opacity: 1; filter: blur(0); }
        }
      `}</style>
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

// VideosDisplay component for the Videos tab
function VideosDisplay({ searchInput }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!searchInput) return;
    setLoading(true);
    setError('');
    setVideos([]);
    fetch('/api/brave-search-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchInput, searchType: 'videos' })
    })
      .then(res => res.json())
      .then(data => {
        // Brave video results are in data.videos.results or data.results
        const vidResults = data?.videos?.results || data?.results || [];
        setVideos(vidResults);
        if (!vidResults.length) setError('No videos found.');
      })
      .catch(() => {
        setError('');
      })
      .finally(() => setLoading(false));
  }, [searchInput]);

  return (
    <div className="w-full">
      {loading && <div className="text-center text-gray-400 mt-4">Loading videos...</div>}
      {/* Don't show error message for failed fetch */}
      <div className="flex flex-col gap-4 mt-4">
        {videos.map((vid, idx) => (
          <a
            key={idx}
            href={vid.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-start gap-4 p-3 bg-white border border-gray-100 rounded-lg shadow hover:shadow-md transition group w-full"
          >
            <div className="relative w-full sm:w-48 h-32 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
              {vid.thumbnail?.src && (
                <Image
                  src={vid.thumbnail.src}
                  alt={vid.title || 'Video thumbnail'}
                  fill
                  className="object-cover group-hover:opacity-80 transition"
                  sizes="(max-width: 640px) 100vw, 192px"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base text-gray-900 truncate group-hover:text-blue-600 mb-1">{vid.title}</div>
              <div className="text-xs text-gray-500 mb-1 line-clamp-2 sm:line-clamp-3">{vid.description}</div>
              <div className="text-xs text-gray-400 mt-1">{vid.age || vid.page_age ? `Uploaded: ${vid.age || vid.page_age}` : ''}</div>
            </div>
          </a>
        ))}
      </div>
      {videos.length === 0 && !loading && !error && (
        <div className="text-center text-gray-400 mt-4">No videos yet.</div>
      )}
    </div>
  );
}

export default AnswerDisplay;
export { ImagesDisplay, VideosDisplay };