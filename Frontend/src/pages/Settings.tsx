import React from 'react';
import { Settings as SettingsIcon, Save, Server, Wrench, BrainCircuit, ScanSearch, Database, Bell } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Settings</h1>
          <p className="text-slate-400 mt-1">Configure global application parameters and integrations.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-12">

        {/* General */}
        <section>
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2 border-b border-slate-800 pb-2">
            <SettingsIcon className="w-5 h-5 text-slate-400" />
            General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Node Designation</label>
              <input type="text" defaultValue="CyberSage-Primary-Controller" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Deployment Environment</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
                <option>Production (Secure Segment)</option>
                <option>Staging</option>
                <option>Local / Research</option>
              </select>
            </div>
          </div>
        </section>

        {/* LLM Configuration */}
        <section>
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2 border-b border-slate-800 pb-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            LLM Configuration
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Provider</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-purple-500">
                  <option>OpenAI</option>
                  <option>Local (Ollama / Llama3)</option>
                  <option>Anthropic</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Model</label>
                <input type="text" defaultValue="gpt-4o" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">API Key</label>
              <input type="password" placeholder="••••••••••••••••••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-purple-500 placeholder:text-slate-700" />
              <p className="text-xs text-slate-500">Keys are not stored in local storage for prototype environments.</p>
            </div>
          </div>
        </section>

        {/* Security Tools */}
        <section>
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            Underlying Security Tools
          </h2>
          <div className="space-y-4">
            <ToolRow name="SQLMap" version="v1.8.3" status="Connected" />
            <ToolRow name="Nuclei" version="v3.1.8" status="Connected" />
            <ToolRow name="XSStrike" version="v3.1.5" status="Connected" />
            <ToolRow name="Nmap" version="-" status="Not Configured" />
          </div>
        </section>

        {/* Knowledge Base */}
        <section>
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Database className="w-5 h-5 text-orange-400" />
            Knowledge Base / RAG Connection
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Vector Database</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-orange-500">
                  <option>Qdrant</option>
                  <option>Chroma</option>
                  <option>Milvus</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Graph DB (Neo4j)</label>
                <input type="text" defaultValue="bolt://localhost:7687" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-orange-500 font-mono text-sm" />
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function ToolRow({ name, version, status }: any) {
  const isConnected = status === 'Connected';
  return (
    <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-lg">
      <div className="flex items-center gap-4">
        <ScanSearch className="w-5 h-5 text-slate-500" />
        <div>
          <h3 className="font-semibold text-slate-200">{name}</h3>
          <p className="text-xs text-slate-500 font-mono">{version}</p>
        </div>
      </div>
      <div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}>
          {status}
        </span>
      </div>
    </div>
  );
}