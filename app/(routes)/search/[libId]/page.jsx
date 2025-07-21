'use client'
import { supabase } from '@/services/supabase';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Header from './_components/Header';
import DisplayResult from './_components/DisplayResult';

function SearchQueryResult() {
    const { libId } = useParams();
    const [searchInputRecord, setSearchInputRecord] = useState(null);
    const [error, setError] = useState(null);
    console.log(libId);

    useEffect(() => {
        GetSearchQueryRecord();
        // Only run when libId changes
    }, [libId]);

    const GetSearchQueryRecord = async () => {
        let { data: Library, error } = await supabase
            .from('Library')
            .select('*')
            .eq('libId', libId);

        if (error) {
            setError(error.message);
            setSearchInputRecord(null);
            return;
        }
        setSearchInputRecord(Library && Library.length > 0 ? Library[0] : null);
    }

    return (
        <div>
            <Header searchInputRecord={searchInputRecord} />
            <div className='px-10 md:px-20 lg:px-36 xl:px-56 mt-20'>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <DisplayResult searchInputRecord={searchInputRecord} />
            </div>
        </div>
    )
}

export default SearchQueryResult