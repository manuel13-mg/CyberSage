import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import {
  Activity, Bell, ChevronRight, CircleHelp, Cloud, Gauge, LockKeyhole,
  Network, ScanSearch, Settings, ShieldCheck, Sparkles, Terminal,
} from 'lucide-react'
import { createAssessment, createTarget, getAssessments, getComponentStatus, getDashboardSummary, getHealth, getTargets, type Assessment, type ComponentsResponse, type Target } from './lib/api'

type HealthState = 'loading' | 'connected' | 'disconnected' | 'error'

const navigation = [
  { label: 'Overview', icon: Gauge, path: '/' },
  { label: 'Attack surface', icon: Network, path: '/attack-surface' },
  { label: 'Vulnerabilities', icon: ShieldCheck, path: '/vulnerabilities' },
  { label: 'AI workspace', icon: Sparkles, path: '/ai-workspace' },
  { label: 'Assessments', icon: ScanSearch, path: '/assessments' },
  { label: 'Targets', icon: Cloud, path: '/targets' },
]

function App() {
  const [health, setHealth] = useState<HealthState>('loading')
  const [healthError, setHealthError] = useState('')
  const [components, setComponents] = useState<ComponentsResponse | null>(null)
  const [path, setPath] = useState(window.location.pathname)
  const [targets, setTargets] = useState<Target[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [summary, setSummary] = useState({ total_targets: 0, active_assessments: 0, open_findings: 0, critical_exposure: 0 })
  const [formError, setFormError] = useState('')
  const [showTargetForm, setShowTargetForm] = useState(false)
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)

  const checkConnection = () => {
    setHealth('loading')
    setHealthError('')
    getHealth()
      .then(() => setHealth('connected'))
      .catch((error: unknown) => {
        setHealth(error instanceof TypeError ? 'disconnected' : 'error')
        setHealthError(error instanceof Error ? error.message : 'Unable to reach the CyberSage API.')
      })
    getComponentStatus()
      .then(setComponents)
      .catch((error: unknown) => {
        setComponents({
          gemini: { status: 'error' },
          postgresql: { status: 'error' },
          neo4j: { status: 'error' },
        })
    getTargets().then((result) => setTargets(result.items)).catch(() => undefined)
    getAssessments().then((result) => setAssessments(result.items)).catch(() => undefined)
    getDashboardSummary().then(setSummary).catch(() => undefined)
        setHealthError(error instanceof Error ? `Optional component status unavailable: ${error.message}` : 'Optional component status unavailable.')
      })
  }

  useEffect(() => {
    checkConnection()
    const handlePopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (event: MouseEvent<HTMLAnchorElement>, destination: string) => {
    event.preventDefault()
    window.history.pushState({}, '', destination)
    setPath(destination)
  }

  const activePage = navigation.find((item) => item.path === path)?.label ?? 'Placeholder'
  const healthLabel = health === 'loading' ? 'Connecting' : health === 'connected' ? 'API connected' : health === 'disconnected' ? 'API disconnected' : 'API error'
  const submitTarget = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const form = event.currentTarget.form
    if (!form) return
    const data = new FormData(form)
    try {
      const target = await createTarget({
        name: data.get('name'),
        base_url: data.get('base_url'),
        description: data.get('description'),
        environment: data.get('environment'),
        scope: { allowed_domains: [new URL(String(data.get('base_url'))).hostname], authorization_confirmed: data.get('authorization') === 'on' },
      })
      setTargets((current) => [target, ...current])
      setShowTargetForm(false)
      setFormError('')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create target.')
    }
  }
  const submitAssessment = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const form = event.currentTarget.form
    if (!form) return
    const data = new FormData(form)
    try {
      const assessment = await createAssessment({ name: data.get('name'), target_id: data.get('target_id'), purpose: data.get('purpose') })
      setAssessments((current) => [assessment, ...current])
      setShowAssessmentForm(false)
      setFormError('')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create assessment.')
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><ShieldCheck size={20} /></div>
          <span>Cyber<span>Sage</span></span>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-avatar">AC</div>
          <div><strong>Acme workspace</strong><small>Security team</small></div>
          <ChevronRight size={16} />
        </div>
        <nav aria-label="Primary navigation">
          <p className="nav-heading">Workspace</p>
          {navigation.map(({ label, icon: Icon, path: itemPath }) => (
            <a className={`nav-item ${path === itemPath ? 'active' : ''}`} href={itemPath} onClick={(event) => navigate(event, itemPath)} key={label}>
              <Icon size={17} /> {label}
            </a>
          ))}
          <p className="nav-heading">Manage</p>
          <a className={`nav-item ${path === '/scans' ? 'active' : ''}`} href="/scans" onClick={(event) => navigate(event, '/scans')}><ScanSearch size={17} /> Scans</a>
          <a className={`nav-item ${path === '/settings' ? 'active' : ''}`} href="/settings" onClick={(event) => navigate(event, '/settings')}><Settings size={17} /> Settings</a>
        </nav>
        <div className="sidebar-footer">
          <a className="nav-item" href="/help" onClick={(event) => navigate(event, '/help')}><CircleHelp size={17} /> Help center</a>
          <div className="profile"><div className="profile-avatar">M</div><div><strong>Security admin</strong><small>Administrator</small></div><ChevronRight size={15} /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>Overview</strong></div>
          <div className="topbar-actions"><div className={`status-pill ${health}`}><span /> {healthLabel}</div><button className="icon-button" aria-label="Notifications"><Bell size={18} /></button></div>
        </header>
        <section className="content">
          {path === '/targets' && <TargetPage targets={targets} onAdd={() => setShowTargetForm(true)} />}
          {path === '/assessments' && <AssessmentPage assessments={assessments} targets={targets} onAdd={() => setShowAssessmentForm(true)} />}
          {path !== '/' && path !== '/targets' && path !== '/assessments' && <div className="placeholder-page"><p className="eyebrow"><Activity size={14} /> {activePage}</p><h1>{activePage}</h1><p>This Phase 1 surface is reserved for the {activePage.toLowerCase()} workflow. No scan or vulnerability data is generated here.</p><a className="secondary-button" href="/" onClick={(event) => navigate(event, '/')}>Return to overview <ChevronRight size={16} /></a></div>}
          {path === '/' && <>
          <div className="hero">
            <div><p className="eyebrow"><Activity size={14} /> Security intelligence platform</p><h1>Good morning, security team.</h1><p className="hero-copy">Your workspace is ready. Connect your first environment to begin building a clear, actionable view of your security posture.</p>{healthError && <p className="connection-error" role="alert">{healthError} <button onClick={checkConnection}>Retry</button></p>}</div>
            <button className="primary-button"><ScanSearch size={17} /> Configure a scan</button>
          </div>
          <div className="metric-grid">
            {[['Assets monitored', summary.total_targets, 'Registered targets'], ['Active assessments', summary.active_assessments, 'Database-backed status'], ['Open findings', summary.open_findings, 'No scanner data yet'], ['Critical exposure', summary.critical_exposure, 'No scanner data yet']].map(([label, value, caption]) => <div className="metric-card" key={label}><span>{label}</span><strong>{value}</strong><small>{caption}</small></div>)}
          </div>
          <div className="panel-grid">
            <section className="panel empty-panel"><div className="panel-heading"><div><p className="eyebrow">Environment coverage</p><h2>Connect your first environment</h2></div><Cloud size={21} /></div><div className="empty-state"><div className="empty-icon"><Terminal size={24} /></div><h3>No environments connected</h3><p>CyberSage does not run scans automatically. Configure an environment to securely provide the scope for a future assessment.</p><button className="secondary-button">Add environment <ChevronRight size={16} /></button></div></section>
            <section className="panel"><div className="panel-heading"><div><p className="eyebrow">System readiness</p><h2>Foundation status</h2></div><LockKeyhole size={21} /></div><div className="readiness-list"><div><span className="readiness-dot ready" />Frontend shell<strong>Ready</strong></div><div><span className={`readiness-dot ${health === 'connected' ? 'ready' : 'pending'}`} />Backend API<strong>{health === 'connected' ? 'Connected' : health === 'loading' ? 'Checking' : health === 'disconnected' ? 'Disconnected' : 'Error'}</strong></div><div><span className={`readiness-dot ${components?.gemini.status === 'configured' ? 'ready' : 'pending'}`} />Gemini<strong>{components ? components.gemini.status === 'configured' ? 'Configured' : components.gemini.status === 'error' ? 'Error' : 'Not configured' : 'Checking'}</strong></div><div><span className={`readiness-dot ${components?.postgresql.status === 'connected' ? 'ready' : 'pending'}`} />PostgreSQL<strong>{components ? components.postgresql.status === 'connected' ? 'Connected' : components.postgresql.status === 'error' ? 'Error' : 'Not configured' : 'Checking'}</strong></div><div><span className={`readiness-dot ${components?.neo4j.status === 'connected' ? 'ready' : 'pending'}`} />Neo4j<strong>{components ? components.neo4j.status === 'connected' ? 'Connected' : components.neo4j.status === 'error' ? 'Error' : 'Not configured' : 'Checking'}</strong></div></div><div className="notice"><Sparkles size={16} /><span>Gemini, PostgreSQL, and Neo4j statuses are checked by the backend. No credentials are exposed to the browser.</span></div></section>
          </div>
          </>}
        </section>
      </main>
      {showTargetForm && <Dialog title="Register target" onClose={() => setShowTargetForm(false)}><form className="data-form"><label>Target name<input name="name" required placeholder="OWASP Juice Shop" /></label><label>Base URL<input name="base_url" type="url" required placeholder="http://127.0.0.1:3000" /></label><label>Environment<select name="environment" defaultValue="local_lab"><option value="local_lab">Local Lab</option><option value="development">Development</option><option value="testing">Testing</option><option value="staging">Staging</option><option value="production">Production</option></select></label><label>Description<textarea name="description" rows={3} /></label><label className="checkbox-label"><input name="authorization" type="checkbox" required /> I confirm I am authorized to test this application.</label>{formError && <p className="connection-error">{formError}</p>}<button className="primary-button" onClick={submitTarget}>Save target</button></form></Dialog>}
      {showAssessmentForm && <Dialog title="Create assessment" onClose={() => setShowAssessmentForm(false)}><form className="data-form"><label>Assessment name<input name="name" required placeholder="Initial security review" /></label><label>Target<select name="target_id" required defaultValue=""><option value="" disabled>Select target</option>{targets.map((target) => <option value={target.id} key={target.id}>{target.name}</option>)}</select></label><label>Purpose<textarea name="purpose" rows={3} placeholder="Document the intended assessment purpose" /></label><p className="form-note">The assessment will be saved as Draft. No scanner will start automatically.</p>{formError && <p className="connection-error">{formError}</p>}<button className="primary-button" onClick={submitAssessment}>Save draft</button></form></Dialog>}
    </div>
  )
}

function TargetPage({ targets, onAdd }: { targets: Target[]; onAdd: () => void }) {
  return <div className="workspace-page"><div className="page-heading"><div><p className="eyebrow"><Cloud size={14} /> Target management</p><h1>Targets</h1><p>Register authorized web applications and define their testing boundaries.</p></div><button className="primary-button" onClick={onAdd}>Add target</button></div><div className="table-card">{targets.length === 0 ? <div className="empty-state"><div className="empty-icon"><Cloud size={24} /></div><h3>No targets registered</h3><p>Register an application before creating an assessment.</p><button className="secondary-button" onClick={onAdd}>Register first target</button></div> : <table><thead><tr><th>Name</th><th>Base URL</th><th>Environment</th><th>Scope</th><th>Assessments</th></tr></thead><tbody>{targets.map((target) => <tr key={target.id}><td><strong>{target.name}</strong><small>{target.description || 'No description'}</small></td><td>{target.base_url}</td><td><span className="table-tag">{target.environment}</span></td><td>{target.scope?.authorization_confirmed ? 'Authorized' : 'Incomplete'}</td><td>{target.assessment_count}</td></tr>)}</tbody></table>}</div></div>
}

function AssessmentPage({ assessments, targets, onAdd }: { assessments: Assessment[]; targets: Target[]; onAdd: () => void }) {
  return <div className="workspace-page"><div className="page-heading"><div><p className="eyebrow"><ScanSearch size={14} /> Assessment center</p><h1>Assessments</h1><p>Configure future assessments. Phase 2 saves configuration only and never starts a scanner.</p></div><button className="primary-button" onClick={onAdd} disabled={targets.length === 0}>Create assessment</button></div><div className="table-card">{assessments.length === 0 ? <div className="empty-state"><div className="empty-icon"><ScanSearch size={24} /></div><h3>No assessments created</h3><p>Authorized targets are required before an assessment draft can be created.</p></div> : <table><thead><tr><th>Name</th><th>Target</th><th>Status</th><th>Created</th><th>Findings</th></tr></thead><tbody>{assessments.map((assessment) => <tr key={assessment.id}><td><strong>{assessment.name}</strong><small>{assessment.purpose || 'No purpose provided'}</small></td><td>{assessment.target_name}</td><td><span className="table-tag">{assessment.status}</span></td><td>{new Date(assessment.created_at).toLocaleString()}</td><td>{assessment.findings_count}</td></tr>)}</tbody></table>}</div></div>
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="dialog-backdrop" role="presentation"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className="dialog-heading"><h2 id="dialog-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog">×</button></div>{children}</section></div>
}

export default App
