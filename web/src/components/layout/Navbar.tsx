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

    useEffect(() => {
        const unsubscribe = useUser((u) => setUser(u));
        return () => unsubscribe();
    }, []);

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative flex items-center justify-center w-10 h-10 bg-blue-600/20 rounded-lg border border-blue-500/30 group-hover:bg-blue-600/40 transition-all">
                            <Cpu className="text-blue-400 w-6 h-6 group-hover:text-white transition-colors" />
                            <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            ChanceTEK
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link>
                        <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
                        <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">Docs</Link>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/studio">
                                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300">Dashboard</Button>
                                </Link>
                                <Button onClick={logout} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-900/20 hover:text-red-300">
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
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white">
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 space-y-4 animate-in slide-in-from-top-5">
                    <Link href="/features" className="block text-gray-400 hover:text-white">Features</Link>
                    <Link href="/pricing" className="block text-gray-400 hover:text-white">Pricing</Link>
                    {user ? (
                        <>
                            <Link href="/studio" className="block text-blue-400">Dashboard</Link>
                            <button onClick={logout} className="block text-red-400 w-full text-left">Sign Out</button>
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
