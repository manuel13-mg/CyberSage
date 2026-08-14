import React, { useState } from 'react';
import { FileText, Download, Share2, FileDown, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { mockReports } from '../data/mockData';
import { SeverityBadge } from './Dashboard';

export default function Reports() {
  const [activeReport, setActiveReport] = useState(mockReports[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExport = (action: string) => {
    setToastMessage(`Report ${action} will be connected to the backend.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 text-slate-200 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-8">
          <CheckCircle2 className="text-emerald-400 w-5 h-5" />
          {toastMessage}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Assessment Reports</h1>
        <p className="text-slate-400 mt-1">View, export, and share comprehensive security reports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-[calc(100vh-14rem)]">
          <div className="p-4 border-b border-slate-800 bg-slate-950/50">
            <h2 className="font-semibold text-slate-200">Generated Reports</h2>
          </div>
          <div className="overflow-y-auto h-full p-2 space-y-2">
            {mockReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setActiveReport(report)}
                className={`p-4 rounded-lg cursor-pointer border transition-colors ${activeReport.id === report.id ? 'bg-blue-900/10 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-slate-950/50 border-slate-800/50 hover:border-slate-700'
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-200 text-sm">{report.id}</h3>
                  <span className="text-xs flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> {report.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mb-3 font-mono">{report.target}</div>
                <div className="flex justify-between items-center">
                  <SeverityBadge severity={report.risk} />
                  <span className="text-xs text-slate-500">{report.generatedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-14rem)]">

          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 shrink-0">
            <h2 className="font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Report Preview
            </h2>
            <div className="flex gap-2">
              <button onClick={() => handleExport('PDF')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700">
                <FileDown className="w-4 h-4 text-blue-400" /> PDF
              </button>
              <button onClick={() => handleExport('Download')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700">
                <Download className="w-4 h-4 text-emerald-400" /> JSON
              </button>
              <button onClick={() => handleExport('Share')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>

          <div className="p-8 overflow-y-auto flex-1 bg-white mx-4 my-4 rounded-lg shadow-inner">
            {/* Report Document Style */}
            <div className="max-w-3xl mx-auto text-slate-800 font-serif leading-relaxed">

              <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">CyberSage Assessment</h1>
                <p className="text-slate-500 font-sans">Confidential Report for {activeReport.target}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 font-sans text-sm p-6 bg-slate-50 rounded border border-slate-200">
                <div>
                  <div className="text-slate-500 mb-1 font-semibold uppercase tracking-wider text-xs">Report ID</div>
                  <div className="font-mono text-slate-800">{activeReport.id}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1 font-semibold uppercase tracking-wider text-xs">Date Generated</div>
                  <div className="text-slate-800">{activeReport.generatedAt}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1 font-semibold uppercase tracking-wider text-xs">Target Scope</div>
                  <div className="text-slate-800">{activeReport.target}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1 font-semibold uppercase tracking-wider text-xs">Overall Risk Rating</div>
                  <div className="font-bold text-red-600 uppercase flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {activeReport.risk}
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 font-sans text-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                1. Executive Summary
              </h2>
              <p className="mb-6">
                This assessment was performed by the CyberSage system utilizing a multi-agent architectural model. The scan comprehensively mapped the attack surface of <strong>{activeReport.target}</strong> and autonomously executed payload injections, fuzzing, and vulnerability verification.
                A total of {activeReport.findings} findings were identified, categorized primarily into injection and configuration flaws. Immediate remediation of Critical and High findings is highly recommended.
              </p>

              <div className="border-t border-slate-200 my-8"></div>

              <h2 className="text-xl font-bold mb-4 font-sans text-slate-800">2. Attack Surface Summary</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Discovered 142 total endpoints and 9 APIs.</li>
                <li>Identified 63 interactive parameters vulnerable to fuzzing.</li>
                <li>Successfully bypassed partial WAF rules via behavioral analysis.</li>
              </ul>

              <div className="border-t border-slate-200 my-8"></div>

              <h2 className="text-xl font-bold mb-4 font-sans text-slate-800">3. Detailed Findings Skeleton</h2>
              <div className="space-y-4">
                <div className="p-4 border border-red-200 bg-red-50 rounded">
                  <h3 className="font-bold text-red-800 font-sans flex items-center justify-between">
                    <span>[Critical] SQL Injection</span>
                    <span className="text-sm font-mono text-red-600">CVSS: 9.8</span>
                  </h3>
                  <p className="text-sm mt-2 text-red-900">Detected at endpoint /api/login in parameter username. Autonomous validation confirmed complete authentication bypass.</p>
                </div>
                <div className="p-4 border border-orange-200 bg-orange-50 rounded">
                  <h3 className="font-bold text-orange-800 font-sans flex items-center justify-between">
                    <span>[High] Stored Cross-Site Scripting</span>
                    <span className="text-sm font-mono text-orange-600">CVSS: 7.5</span>
                  </h3>
                  <p className="text-sm mt-2 text-orange-900">Detected at endpoint /comments via message body parameter. Validated via headless browser context.</p>
                </div>
              </div>

              <div className="mt-12 text-center text-xs text-slate-400 font-sans pb-4">
                -- End of Document Preview --
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}