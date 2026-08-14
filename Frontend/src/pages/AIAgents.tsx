import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { mockAgents } from '../data/mockData';
import { getAgentStatusColor } from '../lib/utils';
import {
  ShieldCheck,
  Search,
  Brain,
  TestTube2,
  CheckCircle,
  Network,
  FileText,
  XCircle,
  Info,
} from 'lucide-react';
import { Agent } from '../types';

const agentIconMap: { [key: string]: React.ElementType } = {
  'Supervisor Agent': ShieldCheck,
  'Reconnaissance Agent': Search,
  'Planning Agent': Brain,
  'Testing Agent': TestTube2,
  'Verification Agent': CheckCircle,
  'Knowledge/RAG Agent': Network,
  'Reporting Agent': FileText,
};

const AIAgents: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-50">AI Agent Center</h1>
        <p className="mt-1 text-gray-400">Overview and management of autonomous security agents.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockAgents.map((agent) => {
          const IconComponent = agentIconMap[agent.name];
          return (
            <Card
              key={agent.name}
              className="flex flex-col items-center p-6 text-center cursor-pointer hover:border-blue-600"
              onClick={() => setSelectedAgent(agent)}
            >
              {IconComponent && <IconComponent className="h-10 w-10 text-blue-400 mb-4" />}
              <h3 className="text-xl font-semibold text-gray-50 mb-2">{agent.name}</h3>
              <Badge className={getAgentStatusColor(agent.status)}>{agent.status}</Badge>
              <p className="mt-3 text-sm text-gray-400 line-clamp-2">{agent.purpose}</p>
              <div className="mt-4 text-xs text-gray-500 space-y-1">
                {agent.tasksCompleted !== undefined && <p>Tasks Completed: {agent.tasksCompleted}</p>}
                {agent.findingsProcessed !== undefined && <p>Findings Processed: {agent.findingsProcessed}</p>}
                {agent.averageExecutionTime && <p>Avg. Time: {agent.averageExecutionTime}</p>}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detailed Agent Panel */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setSelectedAgent(null)}
            >
              <XCircle className="h-6 w-6" />
            </Button>

            <div className="flex items-center space-x-4 mb-6">
              {agentIconMap[selectedAgent.name] && React.createElement(agentIconMap[selectedAgent.name], { className: 'h-10 w-10 text-blue-400' })}
              <div>
                <h2 className="text-3xl font-bold text-gray-50">{selectedAgent.name}</h2>
                <Badge className={`mt-1 ${getAgentStatusColor(selectedAgent.status)}`}>{selectedAgent.status}</Badge>
              </div>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-gray-50 mb-1">Purpose</h3>
                <p>{selectedAgent.purpose}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-50 mb-1">Responsibilities</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {selectedAgent.name === 'Reconnaissance Agent' && (
                    <>
                      <li>Crawl application</li>
                      <li>Discover URLs</li>
                      <li>Identify forms</li>
                      <li>Identify parameters</li>
                      <li>Discover APIs</li>
                      <li>Identify JavaScript resources</li>
                    </>
                  )}
                  {selectedAgent.name === 'Supervisor Agent' && (
                    <>
                      <li>Orchestrate assessment phases</li>
                      <li>Manage agent communication</li>
                      <li>Monitor overall progress</li>
                      <li>Handle errors and recovery</li>
                    </>
                  )}
                  {selectedAgent.name === 'Planning Agent' && (
                    <>
                      <li>Analyze reconnaissance data</li>
                      <li>Generate testing strategies</li>
                      <li>Prioritize test modules</li>
                      <li>Adapt plans based on findings</li>
                    </>
                  )}
                  {selectedAgent.name === 'Testing Agent' && (
                    <>
                      <li>Execute various vulnerability tests (SQLi, XSS, etc.)</li>
                      <li>Interact with application endpoints</li>
                      <li>Record potential findings</li>
                      <li>Handle test execution environments</li>
                    </>
                  )}
                  {selectedAgent.name === 'Verification Agent' && (
                    <>
                      <li>Validate detected vulnerabilities</li>
                      <li>Reduce false positives</li>
                      <li>Confirm impact and exploitability</li>
                      <li>Provide concrete evidence</li>
                    </>
                  )}
                  {selectedAgent.name === 'Knowledge/RAG Agent' && (
                    <>
                      <li>Process new security information</li>
                      <li>Update the security knowledge graph</li>
                      <li>Perform Retrieval-Augmented Generation (RAG)</li>
                      <li>Provide context for findings</li>
                    </>
                  )}
                  {selectedAgent.name === 'Reporting Agent' && (
                    <>
                      <li>Aggregate assessment data</li>
                      <li>Generate comprehensive security reports</li>
                      <li>Summarize findings and recommendations</li>
                      <li>Prepare for various export formats</li>
                    </>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-50 mb-1">Current Status Details</h3>
                <p>Status: <Badge className={getAgentStatusColor(selectedAgent.status)}>{selectedAgent.status}</Badge></p>
                {selectedAgent.currentTask && <p>Current Task: {selectedAgent.currentTask}</p>}
                {selectedAgent.executionTime && <p>Execution Time: {selectedAgent.executionTime}</p>}
                {selectedAgent.tasksCompleted !== undefined && <p>Tasks Completed: {selectedAgent.tasksCompleted}</p>}
                {selectedAgent.findingsProcessed !== undefined && <p>Findings Processed: {selectedAgent.findingsProcessed}</p>}
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-2 text-sm text-gray-400 bg-gray-900 border border-gray-800 p-3 rounded-md">
              <Info className="h-4 w-4 text-blue-400" />
              <p>This is a frontend representation. Actual agent operations are simulated.</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIAgents;