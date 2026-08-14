export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
export type ScanStatus = 'Completed' | 'Running' | 'Failed' | 'Queued';
export type AgentStatus = 'Active' | 'Completed' | 'Waiting' | 'Processing' | 'Idle';

export interface Scan {
  id: string;
  target: string;
  startedAt: string;
  duration: string;
  status: ScanStatus;
  vulnerabilitiesFound: number;
  risk: Severity;
  progress?: number;
}

export interface Agent {
  id: string;
  name: string;
  purpose: string;
  responsibilities: string[];
  status: AgentStatus;
  tasksCompleted: number;
  findingsProcessed: number;
  averageExecutionTime: string;
  icon?: any;
}

export interface Vulnerability {
  id: string;
  severity: Severity;
  title: string;
  target: string;
  endpoint: string;
  parameter: string;
  confidence: number;
  status: 'Verified' | 'Open' | 'Mitigated';
  discovered: string;
  cvss: string;
  description: string;
  evidence: string;
  impact: string;
  remediation: string;
  cve?: string;
  cwe?: string;
  owasp?: string;
}

export interface Endpoint {
  path: string;
  method: string;
  type: string;
  parameters: number;
  authentication: string;
  risk: Severity;
}

export interface AttackPath {
  id: string;
  steps: string[];
  risk: Severity;
  confidence: number;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: string;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface Report {
  id: string;
  target: string;
  generatedAt: string;
  risk: Severity;
  findings: number;
  status: string;
}