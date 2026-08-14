import React from 'react';
import { ShieldAlert, ArrowDown, ExternalLink, ShieldCheck, Share, Search, Key, Database, UserX } from 'lucide-react';
import { cn } from '../lib/utils';
import { SeverityBadge } from './Dashboard';

export default function AttackPaths() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Attack Path Intelligence</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Research Module
            </span>
          </div>
          <p className="text-slate-400">Analyze relationships between vulnerabilities to identify potential multi-step attack paths.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Saved paths / List */}
        <div className="xl:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[700px] gap-2 overflow-y-auto">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-2 mb-2">Discovered Chains</h2>

          <PathCard title="Database Exfiltration" risk="Critical" steps={5} confidence={92} active />
          <PathCard title="Admin Account Takeover" risk="High" steps={3} confidence={87} />
          <PathCard title="RCE via File Upload" risk="Critical" steps={4} confidence={65} />
          <PathCard title="Privilege Escalation" risk="Medium" steps={2} confidence={89} />

        </div>

        {/* Visualizer */}
        <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-10 flex flex-col items-center h-[700px] overflow-y-auto relative">

          <div className="absolute top-6 right-6 text-right">
            <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg mb-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Attack Path Risk</span>
              <SeverityBadge severity="Critical" />
            </div>
            <div className="flex justify-between items-center bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-sm">
              <span className="text-slate-500 font-semibold mr-4">Path Confidence</span>
              <span className="text-emerald-400 font-bold">92%</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-sm mt-2">
              <span className="text-slate-500 font-semibold mr-4">Total Steps</span>
              <span className="text-slate-200 font-bold font-mono">5</span>
            </div>
          </div>

          <div className="max-w-xl w-full mx-auto space-y-4 pt-10 pb-10">

            <PathStep icon={<Search />} label="Public Endpoint" detail="/api/login" />
            <PathConnector label="Discovered parameter" />

            <PathStep icon={<Search className="rotate-90" />} label="SQL Injection" detail="Boolean Blind SQLi" severity="Critical" />
            <PathConnector label="Allows backend execution" />

            <PathStep icon={<Database />} label="Database Access" detail="PostgreSQL user: app_prod" severity="High" />
            <PathConnector label="Data extraction" />

            <PathStep icon={<Key />} label="Credential Exposure" detail="Extracted bcrypt hashes" severity="Critical" />
            <PathConnector label="Offline cracking / Pass-the-hash" />

            <PathStep icon={<UserX />} label="Administrative Account" detail="user: admin@example.com" severity="High" />
            <PathConnector label="Full authentication bypass" />

            <div className="border border-red-500/50 bg-red-500/10 p-6 rounded-2xl text-center shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-red-100 mb-2">Application Compromise</h2>
              <p className="text-red-400 text-sm">Attacker gains full administrative control over the web application.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

function PathCard({ title, risk, steps, confidence, active }: any) {
  return (
    <div className={cn(
      "border rounded-xl p-4 cursor-pointer transition-colors",
      active ? "bg-slate-950 border-blue-500/50 relative overflow-hidden" : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
    )}>
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
      <div className="flex justify-between items-start mb-3">
        <h3 className={cn("font-semibold text-sm", active ? "text-slate-200" : "text-slate-300")}>{title}</h3>
      </div>
      <div className="flex items-center gap-3">
        <SeverityBadge severity={risk} />
        <span className="text-xs text-slate-500">{steps} steps</span>
        <span className="text-xs text-slate-500 flex items-center gap-1"><Share className="w-3 h-3" /> {confidence}%</span>
      </div>
    </div>
  );
}

function PathStep({ icon, label, detail, severity }: any) {
  return (
    <div className="flex items-center gap-6 group">
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 w-full flex items-center gap-4 shadow-sm group-hover:border-slate-600 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
          {React.cloneElement(icon, { className: "w-5 h-5 text-slate-400" })}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-200">{label}</div>
          <div className="text-sm text-slate-500 font-mono mt-0.5">{detail}</div>
        </div>
        {severity && <SeverityBadge severity={severity} />}
      </div>
    </div>
  );
}

function PathConnector({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center -my-2 relative z-10">
      <div className="w-px h-6 bg-slate-700" />
      <div className="border border-slate-700 bg-slate-900 px-3 py-1 rounded text-[10px] uppercase font-bold text-slate-400 tracking-wider">
        {label}
      </div>
      <div className="w-px h-6 bg-slate-700 relative">
        <ArrowDown className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 text-slate-600" />
      </div>
    </div>
  );
}