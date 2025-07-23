import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { Clock, Link, Send } from 'lucide-react'
import moment from 'moment'
import React, { useState } from 'react'

function Header({ searchInputRecord }) {
    const [copied, setCopied] = useState(false);
    const [shareError, setShareError] = useState('');
    const chatUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(chatUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    };

    const handleShare = async () => {
        setShareError('');
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'ClingAI Chat',
                    text: searchInputRecord?.searchInput || 'Check out this chat!',
                    url: chatUrl
                });
            } catch (err) {
                setShareError('Share cancelled or failed.');
            }
        } else {
            // Fallback: copy to clipboard
            await handleCopy();
            setShareError('Link copied!');
            setTimeout(() => setShareError(''), 1500);
        }
    };

    return (
        <div className='p-4 border-b flex flex-wrap justify-between items-center gap-4'>
            <div className='flex gap-2 items-center min-w-0'>
                <UserButton />
                <div className='flex gap-1 items-center'>
                    <Clock className='h-5 w-5 text-gray-500' />
                    <h2 className='text-sm text-gray-500'>
                        {searchInputRecord?.created_at ? moment(searchInputRecord.created_at).fromNow() : ''}
                    </h2>
                </div>
            </div>

            <h2 className='line-clamp-1 min-w-0 flex-1 text-center truncate px-2'>
                {searchInputRecord?.searchInput || ''}
            </h2>

            <div className='flex gap-2 flex-shrink-0 max-w-xs w-full justify-end -translate-x-[30%]'>
                <Button className='min-w-0 px-2 relative' onClick={handleCopy} title="Copy chat link">
                    <Link />
                    {copied && (
                        <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs rounded px-2 py-0.5 shadow -translate-y-6 translate-x-2">Copied!</span>
                    )}
                </Button>
                <Button className='min-w-0 px-2 relative' onClick={handleShare} title="Share chat">
                    <Send />Share
                    {shareError && (
                        <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs rounded px-2 py-0.5 shadow -translate-y-6 translate-x-2">{shareError}</span>
                    )}
                </Button>
            </div>
        </div>
    )
}

export default Header
