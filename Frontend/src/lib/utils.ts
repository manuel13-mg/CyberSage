import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Severity, ScanStatus, AgentStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'Critical':
      return 'bg-red-600 text-white';
    case 'High':
      return 'bg-orange-500 text-white';
    case 'Medium':
      return 'bg-yellow-500 text-gray-900';
    case 'Low':
      return 'bg-blue-500 text-white';
    case 'Informational':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-700 text-white';
  }
}

export function getScanStatusColor(status: ScanStatus): string {
  switch (status) {
    case 'Completed':
      return 'bg-green-600 text-white';
    case 'Running':
      return 'bg-blue-600 text-white animate-pulse';
    case 'Failed':
      return 'bg-red-600 text-white';
    case 'Queued':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-700 text-white';
  }
}

export function getAgentStatusColor(status: AgentStatus): string {
  switch (status) {
    case 'Active':
      return 'bg-blue-600 text-white animate-pulse';
    case 'Completed':
      return 'bg-green-600 text-white';
    case 'Waiting':
      return 'bg-gray-500 text-white';
    case 'Processing':
      return 'bg-yellow-500 text-gray-900 animate-pulse';
    case 'Idle':
      return 'bg-gray-700 text-white';
    default:
      return 'bg-gray-700 text-white';
  }
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'text-green-500';
  if (confidence >= 70) return 'text-yellow-500';
  if (confidence >= 50) return 'text-orange-500';
  return 'text-red-500';
}