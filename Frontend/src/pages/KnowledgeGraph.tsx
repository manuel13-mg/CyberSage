import React from 'react';
import { Network, Database, BrainCircuit, Bug, FileCode, Beaker } from 'lucide-react';

export default function KnowledgeGraph() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-8rem)] flex flex-col">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Security Knowledge Graph</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5 flex-shrink-0">
              <Beaker className="w-3 h-3" /> Experimental / Research Module
            </span>
          </div>
          <p className="text-slate-400">Autonomous modeling of entity relationships, CVEs, and exploitation logic.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Nodes" value="3,492" />
        <StatCard label="Relationships" value="12,845" />
        <StatCard label="CVEs Mapped" value="84" />
        <StatCard label="CWEs Context" value="112" />
        <StatCard label="Vulnerabilities" value="24" />
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0 bg-slate-900 border border-slate-800 rounded-xl">

        {/* Graph Canvas */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden rounded-l-xl p-8 flex items-center justify-center">
          {/* Background grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

          {/* Faux graph network SVG visualization */}
          <svg className="w-full h-full text-slate-800 absolute opacity-50 stroke-1">
            <line x1="50%" y1="50%" x2="20%" y2="30%" />
            <line x1="50%" y1="50%" x2="80%" y2="20%" />
            <line x1="50%" y1="50%" x2="70%" y2="70%" />
            <line x1="50%" y1="50%" x2="30%" y2="80%" />
            <line x1="20%" y1="30%" x2="10%" y2="20%" />
            <line x1="80%" y1="20%" x2="90%" y2="30%" />
          </svg>

          {/* Central Node */}
          <GraphNode x="50%" y="50%" icon={<FileCode />} label="/api/login" type="Endpoint" color="blue" active />

          {/* Related Nodes */}
          <GraphNode x="20%" y="30%" icon={<Bug />} label="SQL Injection" type="Vulnerability" color="red" />
          <GraphNode x="80%" y="20%" icon={<Database />} label="CWE-89" type="Category" color="yellow" />
          <GraphNode x="70%" y="70%" icon={<BrainCircuit />} label="PostgreSQL 14" type="Technology" color="emerald" />
          <GraphNode x="30%" y="80%" icon={<Database />} label="A03:2021" type="OWASP" color="purple" />

          {/* Connecting Labels */}
          <div className="absolute top-[40%] left-[30%] text-[10px] font-mono text-slate-500 bg-slate-950 px-1 border border-slate-800 rounded">contains</div>
          <div className="absolute top-[35%] right-[30%] text-[10px] font-mono text-slate-500 bg-slate-950 px-1 border border-slate-800 rounded">classified_as</div>
          <div className="absolute bottom-[40%] right-[38%] text-[10px] font-mono text-slate-500 bg-slate-950 px-1 border border-slate-800 rounded">affects</div>
        </div>

        {/* Info Panel Right */}
        <div className="w-80 border-l border-slate-800 bg-slate-900 p-6 flex flex-col h-full overflow-y-auto">
          <h2 className="text-sm font-semibold text-slate-200 mb-6 uppercase tracking-wider">Node Details</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-200 text-lg">/api/login</div>
              <div className="text-slate-400 text-xs font-mono">Type: Endpoint</div>
            </div>
          </div>

          <div className="space-y-4 text-sm mb-6">
            <div className="bg-slate-950 border border-slate-800 rounded p-3">
              <div className="text-slate-500 text-xs mb-1">Risk Score</div>
              <div className="font-bold text-red-500 text-lg">9.8 Critical</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3">
              <div className="text-slate-500 text-xs mb-1">Knowledge Agent Confidence</div>
              <div className="font-bold text-emerald-400">96.4%</div>
            </div>
          </div>

          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Edges (Relationships)</h3>
          <ul className="space-y-2 font-mono text-xs text-slate-300 flex-1">
            <li className="flex items-center gap-2 p-2 rounded bg-slate-950/50 hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-700">
              <span className="text-blue-500 shrink-0">contains &rarr;</span>
              <span className="truncate">VULN-101 (SQLi)</span>
            </li>
            <li className="flex items-center gap-2 p-2 rounded bg-slate-950/50 hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-700">
              <span className="text-emerald-500 shrink-0">&larr; hosted_on</span>
              <span className="truncate">Node.js Server</span>
            </li>
            <li className="flex items-center gap-2 p-2 rounded bg-slate-950/50 hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-700">
              <span className="text-purple-500 shrink-0">requires &rarr;</span>
              <span className="truncate">No Auth</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
      <div className="text-xl font-bold text-slate-100">{value}</div>
      <div className="text-xs text-slate-500 uppercase font-semibold">{label}</div>
    </div>
  );
}

function GraphNode({ x, y, icon, label, type, color, active }: any) {
  const colorMap: any = {
    blue: 'bg-blue-500 text-blue-950 border-blue-400',
    red: 'bg-red-500 text-red-950 border-red-400',
    yellow: 'bg-yellow-500 text-yellow-950 border-yellow-400',
    emerald: 'bg-emerald-500 text-emerald-950 border-emerald-400',
    purple: 'bg-purple-500 text-purple-950 border-purple-400',
  };

  return (
    <div
      className={`absolute flex flex-col items-center gap-2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 z-10`}
      style={{ left: x, top: y }}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${colorMap[color]} shadow-lg ${active ? 'ring-4 ring-blue-500/30' : ''}`}>
        {React.cloneElement(icon, { className: "w-6 h-6 currentColor" })}
      </div>
      <div className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-xs font-semibold text-slate-300 shadow-md">
        {label}
      </div>
    </div>
  );
}