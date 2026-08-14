import React from 'react';
import { Cpu, Terminal, Shield, Workflow, Target, Zap, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { mockAgents } from '../data/mockData';
import { cn } from '../lib/utils';
import { AgentStatus } from '../types';

export default function AgentsCenter() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            <div>
                <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Agent Center</h1>
                <p className="text-slate-400 mt-2">Monitor autonomous vulnerability assessment sub-systems.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockAgents.map((agent) => (
                    <div key={agent.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-colors group">

                        <div className="flex justify-between items-start mb-4">
                            <div className={cn(
                                "w-12 h-12 rounded-lg flex items-center justify-center relative",
                                agent.status === 'Active' ? 'bg-blue-500/10' : 'bg-slate-800'
                            )}>
                                {agent.status === 'Active' && <div className="absolute inset-0 bg-blue-500/20 rounded-lg animate-ping" />}
                                <Cpu className={cn("w-6 h-6", agent.status === 'Active' ? "text-blue-400 relative z-10" : "text-slate-500")} />
                            </div>
                            <AgentStatusBadge status={agent.status} />
                        </div>

                        <h3 className="text-xl font-bold text-slate-200 mb-2">{agent.name}</h3>
                        <p className="text-sm text-slate-400 mb-6 h-10">{agent.purpose}</p>

                        <div className="space-y-3 mb-6">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsibilities</span>
                            <ul className="space-y-1">
                                {agent.responsibilities.slice(0, 3).map((resp, i) => (
                                    <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                                        <ChevronRight className="w-3 h-3 text-blue-500" />
                                        {resp}
                                    </li>
                                ))}
                                {agent.responsibilities.length > 3 && (
                                    <li className="text-xs text-slate-500 pl-5">+{agent.responsibilities.length - 3} more...</li>
                                )}
                            </ul>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800">
                            <div className="text-center">
                                <div className="text-xs text-slate-500 mb-1 font-semibold">Txs</div>
                                <div className="text-sm font-mono text-slate-300">{agent.tasksCompleted}</div>
                            </div>
                            <div className="text-center border-l border-slate-800 border-r">
                                <div className="text-xs text-slate-500 mb-1 font-semibold">Findings</div>
                                <div className="text-sm font-mono text-slate-300">{agent.findingsProcessed}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-slate-500 mb-1 font-semibold">Avg T</div>
                                <div className="text-sm font-mono text-slate-300">{agent.averageExecutionTime}</div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
}

function AgentStatusBadge({ status }: { status: AgentStatus }) {
    const map = {
        Active: 'bg-blue-500/10 text-blue-400 border-blue-500/20 px-3',
        Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3',
        Waiting: 'bg-slate-800 border-slate-700 text-slate-400 px-3',
        Processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20 px-3',
        Idle: 'bg-slate-800 border-slate-700 text-slate-500 px-3'
    };

    return (
        <span className={cn("py-1 rounded-full text-xs font-bold border flex items-center gap-2", map[status])}>
            {status === 'Active' || status === 'Processing' ? (
                <Activity className="w-3 h-3 animate-pulse" />
            ) : null}
            {status}
        </span>
    );
}
