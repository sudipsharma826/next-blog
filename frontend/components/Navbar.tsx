"use client";

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogIn, UserCircle, ChevronDown, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';



export default function Navbar({ user }: { user?: { name: string; avatar?: string } }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  return (
    <nav className="w-full sticky top-0 z-50 bg-navbar dark:bg-navbar-dark backdrop-blur border-b border-border dark:border-border-dark shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
          <Image src="/logo.jpg" alt="Logo" width={36} height={36} className="rounded-md" />
          <span className="hidden sm:inline-block">TechKnows</span>
        </Link>
        <div className="flex-1 flex justify-center min-w-[120px]">
          <ul className="flex gap-6 text-base">
            <li><Link href="/" className="text-white">Home</Link></li>
          </ul>
        </div>
        <div className="flex items-center gap-2 min-w-[120px] justify-end">
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <span className="w-5 h-5" />}
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3 py-1 rounded-full">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name?.[0] ?? <UserCircle />}</AvatarFallback>
                  </Avatar>
                  <span className="ml-2">{user.name}</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
              <Button asChild className="rounded-lg bg-primary dark:bg-primary-dark hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition">
                <Link href="/login" className="flex items-center gap-2 font-bold" style={{color: '#fff'}}>
                  <LogIn className="w-5 h-5" style={{color: '#fff'}} />
                  Login
                </Link>
              </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
