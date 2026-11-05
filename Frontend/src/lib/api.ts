export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export type HealthResponse = {
  status: string
  service: string
  environment: string
}

export type ConfigStatusResponse = {
  gemini_configured: boolean
  gemini_model: string
}

export type ComponentStatus = 'configured' | 'not_configured' | 'connected' | 'error'
export type ComponentsResponse = Record<'gemini' | 'postgresql' | 'neo4j', { status: ComponentStatus; detail?: string }>
export type Scope = {
  id: string
  target_id: string
  allowed_domains: string[]
  included_paths: string[]
  excluded_paths: string[]
  excluded_endpoints: string[]
  allow_subdomains: boolean
  testing_restrictions: string
  authorization_confirmed: boolean
  authorization_confirmed_at: string | null
}
export type Target = {
  id: string
  name: string
  base_url: string
  description: string
  environment: string
  owner: string | null
  enabled: boolean
  created_at: string
  updated_at: string
  scope: Scope | null
  assessment_count: number
}
export type Assessment = {
  id: string
  name: string
  description: string
  target_id: string
  target_name: string | null
  purpose: string
  status: string
  findings_count: number
  created_at: string
  updated_at: string
}
export type Page<T> = { items: T[]; total: number; page: number; page_size: number }
export type DashboardSummary = {
  total_targets: number
  active_assessments: number
  open_findings: number
  critical_exposure: number
  latest_assessment: Assessment | null
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

export const getHealth = () => get<HealthResponse>('/health')
export const getConfigStatus = () => get<ConfigStatusResponse>('/config/status')
export const getComponentStatus = () => get<ComponentsResponse>('/components/status')
export const getTargets = () => get<Page<Target>>('/targets')
export const createTarget = (payload: unknown) => post<Target>('/targets', payload)
export const getAssessments = () => get<Page<Assessment>>('/assessments')
export const getDashboardSummary = () => get<DashboardSummary>('/dashboard/summary')
export const createAssessment = (payload: unknown) => post<Assessment>('/assessments', payload)

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const detail = await response.json().catch(() => null) as { detail?: string } | null
    throw new Error(detail?.detail || `API request failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}
