import React from 'react';
import {
  Bot, Clock, ShieldAlert, Cpu, Network, Flag, Terminal,
  ArrowDown, CheckCircle2, CircleDashed, PlayCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Agent } from '../types';
import { mockAgents } from '../data/mockData';

export default function ScanDetails() {
  const currentAgentId = 'agt-4'; // Testing Agent is active

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-1">
            Security Assessment <span className="text-blue-500">#SCAN-2026-001</span>
          </h1>
          <p className="text-slate-400 font-mono text-sm">Target: https://example.com</p>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-semibold uppercase tracking-wider text-sm">Running</span>
          </div>

          <div className="w-full md:w-64">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-slate-400 uppercase font-semibold">Overall Progress</span>
              <span className="text-slate-200 font-bold">67%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="h-full bg-blue-500 rounded-full w-[67%] transition-all duration-1000 relative">
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col: Workflow Pipeline */}
        <div className="lg:col-span-1 border-r border-slate-800/0 lg:border-slate-800 pr-0 lg:pr-8 space-y-2">
          <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <Network className="w-5 h-5 text-purple-400" />
            Multi-Agent Pipeline
          </h2>

          <div className="flex flex-col">
            {mockAgents.map((agent, index) => (
              <div key={agent.id} className="relative">
                {/* Connecting Line */}
                {index !== mockAgents.length - 1 && (
                  <div className={cn(
                    "absolute left-4 top-10 bottom-[-16px] w-0.5",
                    agent.status === 'Completed' ? "bg-emerald-500/50" :
                      agent.status === 'Active' ? "bg-gradient-to-b from-emerald-500/50 to-slate-800" :
                        "bg-slate-800"
                  )} />
                )}

                <div className={cn(
                  "relative z-10 flex items-center gap-4 p-3 rounded-xl border transition-all duration-300",
                  agent.status === 'Active' ? "bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] ml-2 ring-1 ring-blue-500/50" :
                    "bg-slate-900 border-slate-800/50 mb-4 opacity-70 hover:opacity-100"
                )}>
                  {/* Status Icon */}
                  <div className="bg-slate-950 p-1 rounded-full shrink-0">
                    {agent.status === 'Completed' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : agent.status === 'Active' ? (
                      <PlayCircle className="w-6 h-6 text-blue-500 animate-pulse" />
                    ) : (
                      <CircleDashed className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  <div>
                    <h3 className={cn("text-sm font-semibold", agent.status === 'Active' ? "text-blue-400" : "text-slate-300")}>
                      {agent.name.replace(' Agent', '')}
                    </h3>
                    <p className="text-xs text-slate-500 uppercase font-mono tracking-wider">{agent.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Active Agent & Live Feed */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Active Agent Detail */}
          <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
            <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              Active Sub-system Details
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <AgentStat icon={<Bot />} label="Agent" value="Testing Module" />
              <AgentStat icon={<Clock />} label="Exec Time" value="3.8s avg" />
              <AgentStat icon={<Terminal />} label="Tasks Executed" value="832" />
              <AgentStat icon={<ShieldAlert />} label="Anomalies" value="12" highlight />
            </div>

            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
              <span className="text-xs text-slate-500 block mb-2 uppercase tracking-widest font-semibold">Current Operation</span>
              <p className="font-mono text-sm text-green-400">
                <span className="text-blue-500">&gt;</span> Executing targeted boolean blind SQLi payload array against <span className="text-slate-300">/api/login[username]</span>...
              </p>
            </div>
          </div>

          {/* Live Security Events Console */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl flex-1 flex flex-col overflow-hidden relative">

            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900 block flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                Live Analysis Feed
              </h2>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>

            <div className="p-4 flex-1 space-y-4 font-mono text-sm">
              <TerminalLine time="18:42:12" source="Reconaissance" msg="Discovered high-value endpoint /login" />
              <TerminalLine time="18:42:19" source="Reconaissance" msg="Completed AST map. 14 input parameters identified." />
              <TerminalLine time="18:43:04" source="Planning" msg="Selected specialized Injection & XSS testing profiles." />
              <TerminalLine time="18:44:21" source="Testing" msg="DETECTED: Possible timing delay on /api/login parameters." alert />
              <TerminalLine time="18:45:03" source="Verification" msg="Initiating secondary validation sequence for SQLi..." />
              <TerminalLine time="18:46:18" source="Testing" msg="Refining payload delivery for WAF bypass mapping." />

              <div className="flex items-center gap-2 mt-4 text-slate-500 animate-pulse">
                <span>_</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

function AgentStat({ icon, label, value, highlight }: any) {
  return (
    <div className="bg-slate-950/50 border border-slate-800/50 p-4 rounded-lg">
      <div className="text-slate-500 mb-2">{React.cloneElement(icon, { className: 'w-4 h-4' })}</div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={cn("text-lg font-bold", highlight ? "text-orange-400" : "text-slate-200")}>{value}</div>
    </div>
  );
}

function TerminalLine({ time, source, msg, alert }: any) {
  return (
    <div className="flex items-start gap-4 border-l-2 border-slate-800 pl-4 py-1 hover:bg-slate-900/50 transition-colors">
      <span className="text-slate-500 shrink-0">{time}</span>
      <span className={cn("shrink-0 min-w-[120px] font-semibold", alert ? "text-yellow-500" : "text-purple-400")}>[{source}]</span>
      <span className={cn(alert ? "text-yellow-400" : "text-slate-300")}>{msg}</span>
    </div>
  );
}