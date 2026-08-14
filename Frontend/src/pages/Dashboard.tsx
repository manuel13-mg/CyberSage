import React from 'react';
import {
  Activity, ShieldAlert, ShieldCheck, Search, Shield,
  ChevronRight, AlertOctagon, AlertTriangle, AlertCircle, Info, Hash
} from 'lucide-react';
import { mockScans } from '../data/mockData';
import { cn } from '../lib/utils';
import { ScanStatus, Severity } from '../types';

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Security Overview</h1>
        <p className="text-slate-400 mt-1">Monitor autonomous security assessments and application vulnerabilities.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Search className="text-blue-400" />}
          title="Active Scans"
          value="1"
          trend="+1 since yesterday"
          trendUp={true}
        />
        <StatCard
          icon={<AlertOctagon className="text-orange-400" />}
          title="Vulnerabilities Found"
          value="24"
          trend="+5 this week"
          trendUp={false}
        />
        <StatCard
          icon={<ShieldAlert className="text-red-400" />}
          title="Critical Findings"
          value="3"
          trend="Requires action"
          trendUp={false}
        />
        <StatCard
          icon={<ShieldCheck className="text-emerald-400" />}
          title="Verified Vulnerabilities"
          value="12"
          trend="-2 false positives"
          trendUp={true}
        />
      </div>

      {/* Main Grid: Score & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Posture */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-slate-200 mb-6 self-start">Security Posture</h2>

          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
              <circle
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                strokeDasharray="283" strokeDashoffset={283 - (283 * 78 / 100)}
                className="text-blue-500 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-white">78</span>
              <span className="text-slate-400 text-sm font-medium mt-1">/ 100</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Security Score</h3>
          <p className="text-sm text-slate-400">Based on verified vulnerabilities, severity, attack surface exposure and configuration risks.</p>
        </div>

        {/* Scans Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200">Recent Scans</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg font-semibold">Target</th>
                  <th className="px-4 py-3 font-semibold">Scan ID</th>
                  <th className="px-4 py-3 font-semibold">Started</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-center">Vulns</th>
                  <th className="px-4 py-3 font-semibold rounded-tr-lg">Risk</th>
                </tr>
              </thead>
              <tbody>
                {mockScans.map((scan, i) => (
                  <tr key={scan.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                    <td className="px-4 py-3 font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-500" />
                        {scan.target}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{scan.id}</td>
                    <td className="px-4 py-3 text-slate-400">
                      <div>{scan.startedAt}</div>
                      <div className="text-xs text-slate-500">{scan.duration}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={scan.status} />
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-300">
                      {scan.vulnerabilitiesFound > 0 ? scan.vulnerabilitiesFound : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={scan.risk} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vuln Severity Bar Chart Component */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-6">Vulnerability Severity</h2>
          <div className="space-y-5">
            <SeverityBar severity="Critical" count={3} total={24} color="bg-red-500" icon={<AlertOctagon className="w-4 h-4 text-red-500" />} />
            <SeverityBar severity="High" count={8} total={24} color="bg-orange-500" icon={<AlertTriangle className="w-4 h-4 text-orange-500" />} />
            <SeverityBar severity="Medium" count={7} total={24} color="bg-yellow-500" icon={<AlertCircle className="w-4 h-4 text-yellow-500" />} />
            <SeverityBar severity="Low" count={4} total={24} color="bg-blue-500" icon={<Shield className="w-4 h-4 text-blue-500" />} />
            <SeverityBar severity="Informational" count={2} total={24} color="bg-slate-500" icon={<Info className="w-4 h-4 text-slate-500" />} />
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-6">Recent Activity</h2>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
            {/* We will just create a simple left-aligned timeline for brevity and cleanliness */}
            <TimelineItem time="18:46" title="Security report generated" desc="SCAN-001 completed for shop-demo.local" isNew={true} />
            <TimelineItem time="18:42" title="XSS finding verified" desc="High confidence finding at /comments" />
            <TimelineItem time="18:35" title="SQL Injection detected" desc="Boolean-based blind SQLi at /api/login" />
            <TimelineItem time="18:22" title="Knowledge Graph updated" desc="Added 45 new relationships from scan" />
            <TimelineItem time="18:15" title="New endpoint discovered" desc="Found /admin/dashboard API endpoint" />
            <TimelineItem time="18:12" title="Reconnaissance completed" desc="Discovered 38 endpoints taking 5m 14s" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, trend, trendUp }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 font-medium text-sm">{title}</h3>
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className={cn("text-xs font-medium", trendUp ? "text-emerald-400" : "text-slate-400")}>
          {trend}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: ScanStatus }) {
  const styles = {
    Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Running: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    Queued: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-md text-xs font-semibold border inline-flex items-center gap-1.5", styles[status])}>
      {status === 'Running' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity | undefined }) {
  if (!severity) return null;
  const styles = {
    Critical: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]',
    High: 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_8px_rgba(249,115,22,0.2)]',
    Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Informational: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-md text-xs font-bold border", styles[severity])}>
      {severity}
    </span>
  );
}

function SeverityBar({ severity, count, total, color, icon }: any) {
  const percent = Math.round((count / total) * 100) || 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-slate-300">{severity}</span>
        </div>
        <span className="text-sm font-bold text-slate-200">{count}</span>
      </div>
      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function TimelineItem({ time, title, desc, isNew = false }: any) {
  return (
    <div className="relative pl-8 pb-1">
      {/* Node */}
      <div className={cn(
        "absolute left-1.5 w-2 h-2 rounded-full transform -translate-x-[50%] mt-1.5",
        isNew ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" : "bg-slate-700"
      )} />

      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-1">
        <span className="text-xs font-mono font-medium text-slate-500 shrink-0">{time}</span>
        <h4 className={cn("text-sm font-semibold", isNew ? "text-blue-400" : "text-slate-300")}>{title}</h4>
      </div>
      <p className="text-xs text-slate-400">{desc}</p>
    </div>
  );
}