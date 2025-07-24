'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Atom, AudioLines, Cpu, Globe, Mic, Paperclip, SearchCheck, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AIModelsOption } from '@/services/Shared'
import { supabase } from '@/services/supabase'
import { useUser } from '@clerk/nextjs'
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'
import LoaderOverlay from "@/app/_components/LoaderOverlay";
import Image from 'next/image';
import { useContext } from 'react';
import { UserDetailContext } from '@/context/UserDetailContext';


function ChatInputBox() {
    const [userSearchInput, setUserSearchInput] = useState();
    const [searchType, setSearchType] = useState('search')
    const { user } = useUser();
    const [loading,setLoading]=useState(false);
    const router=useRouter();
    const { userDetail, setUserDetail } = useContext(UserDetailContext);
    const [error, setError] = useState('');

    const onSearchQuery = async () => {
        setLoading(true);
        setError('');
        // Always fetch latest user data
        let latestUser = userDetail;
        if (userDetail?.email) {
          const { data: users } = await supabase
            .from('Users')
            .select('*')
            .eq('email', userDetail.email);
          if (users && users.length > 0) latestUser = users[0];
        }
        if (!latestUser?.is_subscribed && (latestUser?.credits ?? 0) <= 10) {
          setError('You have ' + (latestUser?.credits ?? 0) + ' credits left. Please buy a subscription to continue.');
          setLoading(false);
          return;
        }
        const libId=uuidv4();
        const {data} = await supabase.from('Library').insert([
            {
                searchInput: userSearchInput,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                type: searchType,
                libId:libId
            }
        ]).select();
        setLoading(false);
        
        //redirect to new screen
        router.push('/search/'+libId)
        console.log(data[0])
    }

    const handleBuySubscription = async () => {
      if (!userDetail?.email) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/stripe-create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userDetail.email })
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError('Failed to start Stripe checkout.');
          setLoading(false);
        }
      } catch (err) {
        setError('Stripe error.');
        setLoading(false);
      }
    };

    return (
        <div className='flex flex-col h-screen items-center justify-center w-full'>
            <LoaderOverlay show={loading} />
            <div className="flex flex-col items-center mb-2">
                <Image src="/blackpng.png" alt="ClingAI Logo" width={120} height={120} priority />
            </div>
            <span className="font-extrabold text-5xl tracking-wide uppercase relative mb-8" style={{ color: '#243234' }}>
                clingai
            </span>
            <div className="p-2 w-full max-w-2xl border rounded-2xl mt-10">
                {error && (
                  <div className="text-red-500 text-center font-semibold mb-2">{error}</div>
                )}
                {error && error.includes('credits left') && (
                  <div className="flex justify-center mb-2">
                    <Button onClick={handleBuySubscription} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-2 rounded-xl">
                      Buy Subscription ($10/month)
                    </Button>
                  </div>
                )}
                <div className='flex justify-between items-end'>
                    <Tabs defaultValue="Search" className="w-[400px]">
                        <TabsContent value="Search"><input type="text" placeholder='Ask Anything' onChange={(e) => setUserSearchInput(e.target.value)} className='w-full p-4 outline-none' /></TabsContent>
                        <TabsContent value="Research"><input type="text" placeholder='Research Anything' onChange={(e) => setUserSearchInput(e.target.value)} className='w-full p-4 outline-none' /></TabsContent>
                        <TabsContent value="Code"><input type="text" placeholder='Code Anything' onChange={(e) => setUserSearchInput(e.target.value)} className='w-full p-4 outline-none' /></TabsContent>
                        <TabsList>
                            <TabsTrigger value="Search" className={'text-primary'} onClick={() => setSearchType('search')}> <SearchCheck /> Search</TabsTrigger>
                            <TabsTrigger value="Research" className={'text-primary'} onClick={() => setSearchType('research')}> <Atom /> Research</TabsTrigger>
                            <TabsTrigger value="Code" className={'text-primary'} onClick={() => setSearchType('code')}> <Code /> Code</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className='flex gap-4 items-center'>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant='ghost'>
                                    <Cpu className='text-gray-500 h-5 w-5' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator /> */}
                                {AIModelsOption.map((model, index) => (
                                    <DropdownMenuItem key={index}>
                                        <div className='mb-1'>
                                            <h2>{model.name}</h2>
                                            <p className='text-xs'>{model.desc}</p>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Globe className='text-gray-500 h-5 w-5' />
                        <Paperclip className='text-gray-500 h-5 w-5' />
                        <Mic className='text-gray-500 h-5 w-5' />
                        <Button onClick={() => {
                            userSearchInput ? onSearchQuery() : null
                        }}>
                            {!userSearchInput ? <AudioLines className='text-white h-5 w-5' />
                                : <ArrowRight className='text-white h-5 w-5' disabled={loading} />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatInputBox;