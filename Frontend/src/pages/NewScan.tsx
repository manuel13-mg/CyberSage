import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Settings2, ShieldAlert, Globe, ServerCog } from 'lucide-react';

export default function NewScan() {
  const navigate = useNavigate();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/scan/active');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Start New Security Assessment</h1>
        <p className="text-slate-400 mt-2">Configure and launch a multi-agent autonomous scan.</p>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-4">
        <ShieldAlert className="text-yellow-500 shrink-0 w-6 h-6" />
        <div>
          <h3 className="font-semibold text-yellow-500 mb-1">Authorization Required</h3>
          <p className="text-sm text-yellow-400/80">
            Use this platform only on systems you own or have explicit authorization to assess.
            Unauthorized scanning is strictly prohibited.
          </p>
        </div>
      </div>

      <form onSubmit={handleStart} className="space-y-8">
        {/* Target */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Target Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Target URL</label>
              <input
                type="url"
                required
                placeholder="https://example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Scan Profile & Scope */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-purple-500" />
              Scan Profile
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950 hover:border-slate-600 cursor-pointer transition-colors">
                <input type="radio" name="profile" className="text-blue-500 focus:ring-blue-500 border-slate-700 bg-slate-950" />
                <div>
                  <div className="text-sm font-medium text-slate-200">Quick Scan</div>
                  <div className="text-xs text-slate-500">Fast surface-level checks and common CVEs.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-blue-500/50 bg-blue-500/5 cursor-pointer transition-colors">
                <input type="radio" name="profile" defaultChecked className="text-blue-500 focus:ring-blue-500 border-slate-700 bg-slate-950" />
                <div>
                  <div className="text-sm font-medium text-slate-200">Standard Scan</div>
                  <div className="text-xs text-slate-500">Comprehensive agent traversal and payload testing.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950 hover:border-slate-600 cursor-pointer transition-colors">
                <input type="radio" name="profile" className="text-blue-500 focus:ring-blue-500 border-slate-700 bg-slate-950" />
                <div>
                  <div className="text-sm font-medium text-slate-200">Deep Scan</div>
                  <div className="text-xs text-slate-500">Exhaustive parameter fuzzing and active exploitation.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <ServerCog className="w-5 h-5 text-emerald-500" />
              Authentication & Scope
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Scope</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500">
                  <option>Entire Application (default)</option>
                  <option>Selected Paths Only</option>
                  <option>External Dependencies Included</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Authentication</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500">
                  <option>No Authentication (Uncredentialed)</option>
                  <option>Session/Cookie Injection</option>
                  <option>Login Credentials (Form Based)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vulnerability Categories */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Vulnerability Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "SQL Injection", "Cross-Site Scripting", "Command Injection",
              "File Inclusion", "Security Misconfiguration", "Authentication Issues",
              "Authorization Issues", "Sensitive Data Exposure", "Other Supported Tests"
            ].map(cat => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-blue-500/50 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-300 text-sm hover:text-white transition-colors">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transform hover:-translate-y-0.5"
          >
            <Shield className="w-5 h-5" />
            Start Security Assessment
          </button>
        </div>

      </form>
    </div>
  );
}