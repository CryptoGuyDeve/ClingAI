'use client'
import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Compass, GalleryHorizontal, LogIn, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

const MenuOptions = [
  {
    title: 'Home',
    icon: Search,
    path: '/'
  },
  {
    title: 'Discover',
    icon: Compass,
    path: '/discover'
  },
  {
    title: 'Library',
    icon: GalleryHorizontal,
    path: '/library'
  },
  {
    title: 'Sign In',
    icon: LogIn,
    path: '#'
  },
]


function AppSidebar() {
  const path = usePathname();
  return (
    <Sidebar>
      <SidebarHeader className='bg-accent flex items-center py-5'>
        <span className="text-black font-extrabold text-3xl tracking-wide uppercase relative">
          clingai
          <span className="block w-2/3 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 mx-auto"></span>
        </span>
      </SidebarHeader>
      <SidebarContent className='bg-accent'>
        <SidebarGroup>
          <SidebarContent>
            <SidebarMenu>
              {MenuOptions.map((menu, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild
                    className={`p-5 py-6 hover:bg-transparent hover:font-bold
              ${path?.includes(menu.path) && 'font-bold'}`}>
                    <a href={menu.path} className=''>
                      <menu.icon className='h-8 w-8' />
                      <span className='text-lg'>{menu.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <Button className='rounded-full mx-4 mt-4'>Sign Up</Button>
          </SidebarContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className='bg-accent'>
        <div className='p-2'>
          <h2 className='text-gray-600'>Try pro</h2>
          <p className='text-gray-400'>Upgrade for Image Upload, Smarter AI & more copilot</p>
          <Button variant={'secondary'} className={'text-gray-500'}>Learn More</Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar