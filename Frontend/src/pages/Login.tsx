import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Key, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network authentication
        setTimeout(() => {
            navigate('/');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center relative overflow-hidden">

            {/* Background decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">

                {/* Logo Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-2xl animate-pulse" />
                        <Shield className="w-8 h-8 text-blue-400 relative z-10" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">CyberSage</h1>
                    <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">Secure Analyst Portal</p>
                </div>

                {/* Login Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">

                    <div className="flex items-center gap-2 mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-semibold">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        Authorized Personnel Only
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operator ID</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    defaultValue="admin@cybersage.local"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-200 font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Passphrase</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="password"
                                    defaultValue="••••••••••••••••"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-200"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900" defaultChecked />
                                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Trust this node</span>
                            </label>
                            <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Reset key</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Lock className="w-4 h-4 group-hover:hidden" />
                                    <ArrowRight className="w-4 h-4 hidden group-hover:block" />
                                    Authenticate
                                </>
                            )}
                        </button>

                    </form>

                    <div className="mt-8 text-center border-t border-slate-800 pt-6">
                        <p className="text-xs text-slate-600 font-mono">
                            IP: 192.168.1.104 • ENCRYPTED SESSION
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
