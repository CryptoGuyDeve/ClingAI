import axios from "axios";
import { NextResponse } from "next/server";
import { supabase } from '@/services/supabase';

export async function POST(req) {
    const { searchInput, searchType, chatId } = await req.json();

    if (searchInput) {
        let result;
        if (searchType === 'images') {
            result = await axios.get("https://api.search.brave.com/res/v1/images/search?q=" + encodeURIComponent(searchInput) + '&count=20', {
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip',
                    'X-Subscription-Token': process.env.BRAVE_API_KEY
                }
            });
        } else {
            result = await axios.get("https://api.search.brave.com/res/v1/web/search?q=" + encodeURIComponent(searchInput) + '&count=5', {
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip',
                    'X-Subscription-Token': process.env.BRAVE_API_KEY
                }
            });
        }

        // Store the full Brave result in the Chats table if chatId is provided
        if (chatId) {
            await supabase
                .from('Chats')
                .update({ searchResult: result.data })
                .eq('id', chatId);
        }

        return NextResponse.json(result.data)
    } else {
        return NextResponse.json({ error: 'Please pass user search query' })
    }
}