import React from 'react';
import { Globe, FileCode2, Lock, Workflow, Share2, Layers } from 'lucide-react';
import { mockEndpoints } from '../data/mockData';
import { SeverityBadge } from './Dashboard';

export default function AttackSurface() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      <div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Attack Surface</h1>
        <p className="text-slate-400 mt-2">Discovered application topology and exposed interfaces.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SurfaceCard title="Endpoints" count={38} icon={<Globe />} color="blue" />
        <SurfaceCard title="APIs" count={9} icon={<Workflow />} color="purple" />
        <SurfaceCard title="Forms" count={17} icon={<Layers />} color="emerald" />
        <SurfaceCard title="Parameters" count={63} icon={<Share2 />} color="orange" />
        <SurfaceCard title="Auth Points" count={4} icon={<Lock />} color="red" />
        <SurfaceCard title="JS Files" count={24} icon={<FileCode2 />} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Table representation */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Discovered Interfaces
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-tl-lg">Endpoint</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold text-center">Params</th>
                  <th className="px-4 py-3 font-semibold">Auth</th>
                  <th className="px-4 py-3 font-semibold rounded-tr-lg">Risk exposure</th>
                </tr>
              </thead>
              <tbody>
                {mockEndpoints.map((ep, i) => (
                  <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-300">{ep.path}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded font-bold ${ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400' :
                          ep.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                        {ep.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{ep.type}</td>
                    <td className="px-4 py-3 text-center font-mono text-slate-300">{ep.parameters}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${ep.authentication === 'Required' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {ep.authentication}
                      </span>
                    </td>
                    <td className="px-4 py-3"><SeverityBadge severity={ep.risk} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tree visualization */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-400" />
            Topological Hierarchy
          </h2>
          <div className="font-mono text-sm leading-8 text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div><span className="text-emerald-400">Website</span> <span className="text-slate-500">(example.com)</span></div>
            <div> ├── <span className="text-blue-400">Pages</span> [142]</div>
            <div> ├── <span className="text-purple-400">APIs</span> [9]</div>
            <div> │   ├── /api/users</div>
            <div> │   ├── /api/login</div>
            <div> │   └── /api/checkout</div>
            <div> ├── <span className="text-emerald-400">Forms</span> [17]</div>
            <div> ├── <span className="text-orange-400">Parameters</span> [63]</div>
            <div> └── <span className="text-red-400">Authentication</span> [4]</div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500 leading-relaxed">
              Tree map represents hierarchical structural clusters automatically identified down to a confidence depth of 4 layers. Full structural model available via API export.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

function SurfaceCard({ title, count, icon, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <div className={`border rounded-xl p-4 flex flex-col justify-between ${colorMap[color]}`}>
      <div className="flex justify-between items-center mb-4">
        {React.cloneElement(icon, { className: "w-5 h-5 opacity-80" })}
      </div>
      <div>
        <div className="text-3xl font-bold mb-1 tracking-tight">{count}</div>
        <div className="text-xs font-medium uppercase tracking-wider opacity-80">{title}</div>
      </div>
    </div>
  );
}