"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Cloud,
    BarChart3,
    Settings,
    FileText,
    LogOut,
    Menu,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/firebase/auth';

const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/studio" },
    { icon: Cloud, label: "Deployments", href: "/deploy" },
    { icon: BarChart3, label: "Reports", href: "/reports" },
    { icon: FileText, label: "Notebooks", href: "/notebooks" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export default function FloatingSidebar() {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ width: "60px" }}
            animate={{ width: isHovered ? "240px" : "70px" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "fixed left-4 top-24 bottom-4 z-40 flex flex-col justify-between",
                "glass-panel rounded-2xl border-white/10 overflow-hidden transition-all duration-300",
                "hidden md:flex" // Hide on mobile for now
            )}
        >
            {/* Header / Logo Area */}
            <div className="p-4 flex items-center justify-center border-b border-border/50 h-20">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Menu className="w-6 h-6" />
                </div>
                <AnimatePresence>
                    {isHovered && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="ml-3 font-bold text-lg whitespace-nowrap overflow-hidden"
                        >
                            Studio
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 py-6 flex flex-col gap-2 px-3">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "flex items-center p-3 rounded-xl transition-all cursor-pointer group relative overflow-hidden",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}>
                                <item.icon className={cn("w-6 h-6 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />

                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="ml-3 font-medium whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {/* Active Indicator Dot */}
                                {!isHovered && isActive && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-border/50">
                <button
                    onClick={logout}
                    className="flex items-center p-3 w-full rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors group"
                >
                    <LogOut className="w-6 h-6 shrink-0" />
                    <AnimatePresence>
                        {isHovered && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="ml-3 font-medium whitespace-nowrap"
                            >
                                Sign Out
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.div>
    );
}
