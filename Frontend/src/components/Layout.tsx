import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
    Shield, LayoutDashboard, Search, Fingerprint, Activity, Cpu,
    Network, FileText, Settings, Bell, User, Zap, LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'New Scan', path: '/scan/new', icon: <Search className="w-5 h-5" /> },
    { name: 'Scan Details', path: '/scan/active', icon: <Activity className="w-5 h-5" /> },
    { name: 'Vulnerabilities', path: '/vulnerabilities', icon: <Fingerprint className="w-5 h-5" /> },
    { name: 'Attack Surface', path: '/attack-surface', icon: <Shield className="w-5 h-5" /> },
    { name: 'AI Agents', path: '/agents', icon: <Cpu className="w-5 h-5" /> },
    { name: 'Knowledge Graph', path: '/knowledge', icon: <Network className="w-5 h-5" /> },
    { name: 'Attack Paths', path: '/attack-paths', icon: <Zap className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <FileText className="w-5 h-5" /> },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-slate-950 border-r border-slate-800 hidden md:flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-blue-600/20 border border-blue-500/50 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-wider text-slate-100 leading-tight">CyberSage</h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none">Security Platform</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            )}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-800 space-y-1">
                <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors">
                    <Settings className="w-5 h-5" />
                    Settings
                </Link>
                <Link to="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors mt-2">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </Link>
            </div>
        </aside>
    );
}

export function Topbar() {
    return (
        <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 fixed top-0 right-0 left-0 md:left-64 z-10 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                {/* Mobile menu button could go here */}
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">System Active</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full" />
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                </div>
            </div>
        </header>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-blue-500/30">
            <Sidebar />
            <div className="md:ml-64 flex flex-col min-h-screen">
                <Topbar />
                <main className="flex-1 mt-16 p-6 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
