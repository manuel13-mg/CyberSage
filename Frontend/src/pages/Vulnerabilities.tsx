import React, { useState } from 'react';
import { Filter, Search, ShieldAlert, Cpu, Fingerprint } from 'lucide-react';
import { mockVulnerabilities } from '../data/mockData';
import { SeverityBadge } from './Dashboard';

export default function Vulnerabilities() {
  const [selectedVuln, setSelectedVuln] = useState(mockVulnerabilities[0]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Vulnerability Findings</h1>
          <p className="text-slate-400 mt-1">Review and manage verified security issues.</p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search CVE, title, target..."
              className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-200 w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* List / Table */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[700px]">
          <div className="overflow-y-auto flex-1 p-0">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 sticky top-0 z-10 shadow-md">
                <tr>
                  <th className="px-4 py-4 font-semibold">Severity</th>
                  <th className="px-4 py-4 font-semibold">Vulnerability</th>
                  <th className="px-4 py-4 font-semibold">Endpoint</th>
                  <th className="px-4 py-4 font-semibold">Confidence</th>
                  <th className="px-4 py-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockVulnerabilities.map((vuln) => (
                  <tr
                    key={vuln.id}
                    onClick={() => setSelectedVuln(vuln)}
                    className={`border-b border-slate-800 cursor-pointer transition-colors ${selectedVuln.id === vuln.id ? 'bg-blue-900/20' : 'hover:bg-slate-800/40'}`}
                  >
                    <td className="px-4 py-4"><SeverityBadge severity={vuln.severity} /></td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-200">{vuln.title}</div>
                      <div className="text-xs text-slate-500">{vuln.target}</div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="text-xs bg-slate-950 px-2 py-1 rounded text-slate-300 border border-slate-800/50">
                        {vuln.endpoint}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${vuln.confidence > 90 ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                            style={{ width: `${vuln.confidence}%` }}
                          />
                        </div>
                        <span className="text-slate-400 text-xs">{vuln.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full border ${vuln.status === 'Verified' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}>
                        {vuln.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="xl:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-y-auto h-[700px]">
          {selectedVuln ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <SeverityBadge severity={selectedVuln.severity} />
                  <span className="text-sm font-mono text-slate-500">{selectedVuln.id}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-100">{selectedVuln.title}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">CVSS Base Score</div>
                  <div className="text-lg font-bold text-slate-200">{selectedVuln.cvss}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">AI Confidence</div>
                  <div className="text-lg font-bold text-emerald-400">{selectedVuln.confidence}%</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">Description & Impact</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-3">{selectedVuln.description}</p>
                <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-sm text-red-200">
                  <span className="font-semibold text-red-400">Impact: </span> {selectedVuln.impact}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">Evidence & Context</h3>
                <div className="space-y-2">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <span className="text-xs text-slate-500 block mb-1">Affected Endpoint</span>
                    <code className="text-sm text-blue-400 font-mono">{selectedVuln.endpoint}</code>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <span className="text-xs text-slate-500 block mb-1">Parameter / Injection Point</span>
                    <code className="text-sm text-orange-400 font-mono">{selectedVuln.parameter}</code>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300">
                    <span className="text-slate-500 block mb-1 font-sans">Testing Output</span>
                    {selectedVuln.evidence}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">References</h3>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {selectedVuln.cwe && <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded">{selectedVuln.cwe}</span>}
                  {selectedVuln.owasp && <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded">{selectedVuln.owasp}</span>}
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                  View Attack Path
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button className="w-full bg-slate-800 hover:bg-emerald-900/50 text-slate-300 font-medium py-2 rounded-lg transition-colors border border-slate-700 hover:border-emerald-500/50">
                    Mark false positive
                  </button>
                  <button className="w-full bg-slate-800 hover:bg-red-900/50 text-slate-300 font-medium py-2 rounded-lg transition-colors border border-slate-700 hover:border-red-500/50">
                    Ignore finding
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <ShieldAlert className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a vulnerability to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}