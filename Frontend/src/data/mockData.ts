import { Scan, Agent, Vulnerability, Endpoint, Report } from '../types';

export const mockScans: Scan[] = [
  { id: 'SCAN-001', target: 'shop-demo.local', startedAt: 'Today, 18:42', duration: '8m 32s', status: 'Completed', vulnerabilitiesFound: 12, risk: 'High', progress: 100 },
  { id: 'SCAN-002', target: 'demo-bank.local', startedAt: 'Today, 17:10', duration: '5m 14s', status: 'Completed', vulnerabilitiesFound: 5, risk: 'Medium', progress: 100 },
  { id: 'SCAN-2026-001', target: 'https://example.com', startedAt: 'Just now', duration: '2m 14s', status: 'Running', vulnerabilitiesFound: 3, risk: 'High', progress: 67 },
];

export const mockVulnerabilities: Vulnerability[] = [
  {
    id: 'VULN-101',
    severity: 'Critical',
    title: 'SQL Injection',
    target: 'example.com',
    endpoint: '/api/login',
    parameter: 'username',
    confidence: 96,
    status: 'Verified',
    discovered: 'Today, 18:44',
    cvss: '9.8',
    description: 'A boolean-based blind SQL injection was detected in the username parameter. The application fails to properly sanitize user input before passing it into a database query.',
    evidence: "Payload: ' OR 1=1-- Time delay observed: 0s. Authentication bypassed.",
    impact: 'An attacker could execute arbitrary SQL commands, potentially exfiltrating sensitive database contents or gaining administrative access.',
    remediation: 'Use parameterized queries or prepared statements instead of directly concatenating user input into SQL commands.',
    cwe: 'CWE-89',
    owasp: 'A03:2021-Injection'
  },
  {
    id: 'VULN-102',
    severity: 'High',
    title: 'Stored XSS',
    target: 'example.com',
    endpoint: '/comments',
    parameter: 'message',
    confidence: 91,
    status: 'Verified',
    discovered: 'Today, 18:02',
    cvss: '7.5',
    description: 'The message parameter is vulnerable to Stored Cross-Site Scripting. Input is stored without sanitization and rendered on the comments page.',
    evidence: 'Payload: <script>alert(1)</script> successfully executed on page load.',
    impact: 'Attackers can steal session cookies, perform actions on behalf of users, or deface the application.',
    remediation: 'Implement contextual output encoding and use a robust HTML sanitization library for user-generated content.',
    cwe: 'CWE-79',
    owasp: 'A03:2021-Injection'
  },
  {
    id: 'VULN-103',
    severity: 'Medium',
    title: 'Security Misconfiguration',
    target: 'example.com',
    endpoint: '/server',
    parameter: '-',
    confidence: 82,
    status: 'Open',
    discovered: 'Today, 17:15',
    cvss: '5.3',
    description: 'The server exposes detailed error messages and stack traces.',
    evidence: 'Stack trace leaked Spring framework version 5.3.18 in the response body.',
    impact: 'Information disclosure that aids attackers in fingerprinting the backend technology stack and finding specific framework exploits.',
    remediation: 'Configure a generic error handler that does not leak internal stack traces to the end user.',
    cwe: 'CWE-209',
    owasp: 'A05:2021-Security Misconfiguration'
  }
];

export const mockEndpoints: Endpoint[] = [
  { path: '/login', method: 'POST', type: 'Authentication', parameters: 4, authentication: 'Required', risk: 'High' },
  { path: '/api/users', method: 'GET', type: 'API', parameters: 2, authentication: 'Required', risk: 'Medium' },
  { path: '/api/checkout', method: 'POST', type: 'API', parameters: 12, authentication: 'Required', risk: 'High' },
  { path: '/about', method: 'GET', type: 'Page', parameters: 0, authentication: 'None', risk: 'Low' },
  { path: '/assets/app.js', method: 'GET', type: 'JavaScript File', parameters: 0, authentication: 'None', risk: 'Informational' },
];

export const mockAgents: Agent[] = [
  {
    id: 'agt-1',
    name: 'Supervisor Agent',
    purpose: 'Orchestrates the entire assessment process.',
    responsibilities: ['Task delegation', 'Workflow state management', 'Progress monitoring'],
    status: 'Active',
    tasksCompleted: 42,
    findingsProcessed: 8,
    averageExecutionTime: '0.2s'
  },
  {
    id: 'agt-2',
    name: 'Reconnaissance Agent',
    purpose: 'Discovers the web application\'s attack surface.',
    responsibilities: ['Crawl application', 'Discover URLs', 'Identify forms', 'Identify parameters', 'Discover APIs', 'Identify JavaScript resources'],
    status: 'Completed',
    tasksCompleted: 142,
    findingsProcessed: 38,
    averageExecutionTime: '5.4s'
  },
  {
    id: 'agt-3',
    name: 'Planning Agent',
    purpose: 'Selects the most appropriate testing strategies.',
    responsibilities: ['Analyze attack surface', 'Select vulnerability modules', 'Prioritize endpoints'],
    status: 'Completed',
    tasksCompleted: 14,
    findingsProcessed: 0,
    averageExecutionTime: '1.2s'
  },
  {
    id: 'agt-4',
    name: 'Testing Agent',
    purpose: 'Executes security payloads against identified targets.',
    responsibilities: ['Payload injection', 'Response analysis', 'Bypass filtering', 'Fuzzing'],
    status: 'Active',
    tasksCompleted: 832,
    findingsProcessed: 12,
    averageExecutionTime: '3.8s'
  },
  {
    id: 'agt-5',
    name: 'Verification Agent',
    purpose: 'Eliminates false positives by validating findings.',
    responsibilities: ['Confirm exploitability', 'Check state changes', 'Assess impact', 'Rank severity'],
    status: 'Waiting',
    tasksCompleted: 8,
    findingsProcessed: 3,
    averageExecutionTime: '4.1s'
  },
  {
    id: 'agt-6',
    name: 'Knowledge/RAG Agent',
    purpose: 'Provides contextual intelligence on vulnerabilities.',
    responsibilities: ['Query CVE database', 'Analyze remediation strategies', 'Build knowledge graph'],
    status: 'Processing',
    tasksCompleted: 4,
    findingsProcessed: 3,
    averageExecutionTime: '2.5s'
  },
  {
    id: 'agt-7',
    name: 'Reporting Agent',
    purpose: 'Generates final artifacts and documentation.',
    responsibilities: ['Synthesize findings', 'Format reports', 'Export data'],
    status: 'Waiting',
    tasksCompleted: 0,
    findingsProcessed: 0,
    averageExecutionTime: '-'
  }
];

export const mockReports: Report[] = [
  { id: 'RPT-001', target: 'example.com', generatedAt: 'Today', risk: 'High', findings: 12, status: 'Ready' },
  { id: 'RPT-002', target: 'shop-demo.local', generatedAt: 'Yesterday', risk: 'Critical', findings: 24, status: 'Ready' },
];