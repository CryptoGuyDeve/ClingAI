import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Atom, AudioLines, Cpu, Globe, Mic, Paperclip, SearchCheck } from 'lucide-react'
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

function ChatInputBox() {
    return (
        <div className='flex flex-col h-screen items-center justify-center w-full'>
            <span className="font-extrabold text-5xl tracking-wide uppercase relative mb-8" style={{ color: '#243234' }}>
                clingai
            </span>
            <div className="p-2 w-full max-w-2xl border rounded-2xl mt-10">

                <div className='flex justify-between items-end'>
                    <Tabs defaultValue="Search" className="w-[400px]">
                        <TabsContent value="Search"><input type="text" placeholder='Ask Anything' className='w-full p-4 outline-none' /></TabsContent>
                        <TabsContent value="Research"><input type="text" placeholder='Research Anything' className='w-full p-4 outline-none' /></TabsContent>
                        <TabsList>
                            <TabsTrigger value="Search" className={'text-primary'}> <SearchCheck /> Search</TabsTrigger>
                            <TabsTrigger value="Research" className={'text-primary'}> <Atom /> Research</TabsTrigger>
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
                                {AIModelsOption.map((model,index)=>(
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
                        <Button>
                            <AudioLines className='text-white h-5 w-5' />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatInputBox