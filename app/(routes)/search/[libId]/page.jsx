'use client'
import { supabase } from '@/services/supabase';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Header from './_components/Header';
import AnswerDisplay from './_components/AnswerDisplay';
import { ImagesDisplay, VideosDisplay } from './_components/AnswerDisplay';

const tabs = [
    { label: 'Answer' },
    { label: 'Images' },
    { label: 'Videos' },
    { label: 'Sources' },
];

function SearchQueryResult() {
    const { libId } = useParams();
    const [searchInputRecord, setSearchInputRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Answer');

    useEffect(() => {
        const fetchSearchInput = async () => {
            const { data, error } = await supabase
                .from('Library')
                .select('*')
                .eq('libId', libId)
                .single();
            if (data && data.searchInput) {
                setSearchInputRecord(data);
            } else {
                setError('No search found for this workspace.');
            }
            setLoading(false);
        };
        fetchSearchInput();
    }, [libId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!searchInputRecord) return <div>No search input found.</div>;

    return (
        <div style={{ overflowX: 'hidden' }} className="w-full">
            <Header searchInputRecord={searchInputRecord} />
            <div className='px-10 md:px-20 lg:px-36 xl:px-56 mt-10'>
                {/* Search name at the top left */}
                <div className="mb-4 flex items-center">
                    <span className="text-2xl md:text-3xl font-bold text-gray-900">{searchInputRecord.searchInput}</span>
                </div>
                {/* Tab bar */}
                <div className="flex items-center space-x-6 border-b border-gray-200 pb-2 mt-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.label}
                            onClick={() => setActiveTab(tab.label)}
                            className={`flex items-center gap-1 relative text-sm font-medium text-gray-700 hover:text-black ${activeTab === tab.label ? 'text-black' : ''}`}
                        >
                            <span>{tab.label}</span>
                            {activeTab === tab.label && (
                                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-black rounded"></span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="mt-6">
                    {activeTab === 'Answer' && (
                        <AnswerDisplay searchInput={searchInputRecord.searchInput} libId={libId} />
                    )}
                    {activeTab === 'Images' && (
                        <ImagesDisplay searchInput={searchInputRecord.searchInput} />
                    )}
                    {activeTab === 'Videos' && (
                        <VideosDisplay searchInput={searchInputRecord.searchInput} />
                    )}
                    {activeTab === 'Sources' && (
                        <div className="text-center text-gray-400">Sources tab coming soon.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SearchQueryResult;