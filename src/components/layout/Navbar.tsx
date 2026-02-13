"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { useUser, logout } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Cpu, Menu, X } from "lucide-react";

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const unsubscribe = useUser((u) => setUser(u));

        // Initialize theme
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }

        return () => unsubscribe();
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg border border-primary/20 group-hover:bg-primary/20 transition-all">
                            <Cpu className="text-primary w-6 h-6 group-hover:text-foreground transition-colors" />
                            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                            ChanceTEK
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/learn-more" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                        <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                        <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground"
                            aria-label="Toggle Theme"
                        >
                            {isDark ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                            )}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/studio">
                                    <Button variant="ghost" className="text-primary hover:text-primary/80">Dashboard</Button>
                                </Link>
                                <Button onClick={logout} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login">
                                    <Button variant="ghost">Log In</Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="elite">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={toggleTheme} className="text-muted-foreground">
                            {isDark ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                            )}
                        </button>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-muted-foreground hover:text-foreground">
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border p-4 space-y-4 animate-in slide-in-from-top-5">
                    <Link href="/learn-more" className="block text-muted-foreground hover:text-foreground">Features</Link>
                    <Link href="/pricing" className="block text-muted-foreground hover:text-foreground">Pricing</Link>
                    {user ? (
                        <>
                            <Link href="/studio" className="block text-primary">Dashboard</Link>
                            <button onClick={logout} className="block text-destructive w-full text-left">Sign Out</button>
                        </>
                    ) : (
                        <Link href="/login" className="block">
                            <Button className="w-full" variant="elite">Get Started</Button>
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
