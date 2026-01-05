"use client";
import React, { useEffect, useState } from "react";
import NavbarSkeleton from '@/components/skeletons/NavbarSkeleton';
import { useUserStore } from '../lib/store/userStore';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, UserCircle, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthActions } from '@/lib/logic/auth';
import { X, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  // Add more links here as needed
];

export default function Navbar() {
  const { singleSessionLogout } = useAuthActions();
  const { user } = useUserStore();
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);


  // Show skeleton only in login/user area if user was previously logged in but user data is not yet loaded
  const renderUserArea = () => {
    if (loading) {
      return <NavbarSkeleton />;
    }
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {mounted ? (
            theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3 py-1 rounded-full">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{user.name?.[0] ?? <UserCircle />}</AvatarFallback>
                </Avatar>
                <span className="ml-2 flex items-center gap-1">
                  {user.name}
                  {user.emailVerified && (
                    <span title="Email Verified" className="inline-block ml-1 text-green-500">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="#22c55e" />
                        <path
                          d="M8 12l2 2 4-4"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-default select-none">
                <span className="text-xs text-zinc-500">{user.email}</span>
                <span className="text-xs text-zinc-500">
                  Roles: {Array.isArray(user.roles) ? user.roles.join(', ') : user.roles}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={async () => {
                  if (logoutLoading) return;
                  setLogoutLoading(true);
                  await singleSessionLogout();
                  setLogoutLoading(false);
                }}
                disabled={logoutLoading}
                style={logoutLoading ? { opacity: 0.6, pointerEvents: 'none' } : {}}
              >
                <LogOut className="w-4 h-4 mr-2" /> {logoutLoading ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            asChild
            className="rounded-lg bg-primary dark:bg-primary-dark hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition"
          >
            <Link
              href="/login"
              className="flex items-center gap-2 font-bold"
              style={{ color: '#fff' }}
            >
              <LogIn className="w-5 h-5" style={{ color: '#fff' }} />
              Login
            </Link>
          </Button>
        )}
      </>
    );
  };

  return (
    <nav className="w-full sticky top-0 z-50 bg-navbar dark:bg-navbar-dark backdrop-blur border-b border-border dark:border-border-dark shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
          <Image src="/logo.jpg" alt="Logo" width={36} height={36} className="rounded-md" />
          <span className="text-xs  sm:inline-block">TechKnows</span>
        </Link>
        {/* Desktop nav links */}
        <div className="flex-1 flex justify-center min-w-30">
          <ul className="hidden sm:flex gap-6 text-base">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <Link href={link.href} className="text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* User area (theme, login, user) */}
        <div className="flex items-center gap-2 min-w-30 justify-end">
          {renderUserArea()}
        </div>
        {/* Mobile menu button */}
        <div className="sm:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(m => !m)}
          >
            <span className="w-6 h-6">{menuOpen ? <X /> : <Menu />}</span>
          </Button>
        </div>
      </div>
      {/* Mobile nav links */}
      {menuOpen && (
        <div className="sm:hidden bg-navbar dark:bg-navbar-dark border-t border-border dark:border-border-dark px-4 pb-4">
          <ul className="flex flex-col gap-4 mt-2">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <Link href={link.href} className="text-white block w-full py-2" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
