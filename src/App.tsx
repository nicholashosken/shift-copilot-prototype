import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { recentChats, sources, type Source } from './mockData'

type View = 'home' | 'review' | 'next-steps'
type ShippingDecision = 'unresolved' | 'confirmed' | 'unknown'
type IconName =
  | 'arrow'
  | 'check'
  | 'chevron'
  | 'close'
  | 'document'
  | 'info'
  | 'link'
  | 'plus'
  | 'send'
  | 'spark'
  | 'stop'
  | 'warning'

const coreUseCases: Array<{ title: string; description: string; icon: IconName }> = [
  { title: 'Review a document', description: 'Check structure, clarity, and risks', icon: 'document' },
  { title: 'Summarize files', description: 'Turn long documents into key points', icon: 'spark' },
  { title: 'Draft an update', description: 'Create a first draft from company context', icon: 'send' },
  { title: 'Compare sources', description: 'Find differences across documents', icon: 'link' },
]

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    spark: <><path d="m12 3-1.4 3.6L7 8l3.6 1.4L12 13l1.4-3.6L17 8l-3.6-1.4Z"/><path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8Z"/></>,
    stop: <rect x="5" y="5" width="14" height="14" rx="2"/>,
    warning: <><path d="M10.3 3.8 2.2 18a2 2 0 0 0 1.8 3h16a2 2 0 0 0 1.8-3L13.7 3.8a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function App() {
  const conversationRef = useRef<HTMLElement | null>(null)
  const [view, setView] = useState<View>('home')
  const [inventoryVariance, setInventoryVariance] = useState('')
  const [inventoryUnknown, setInventoryUnknown] = useState(false)
  const [shippingDecision, setShippingDecision] = useState<ShippingDecision>('unresolved')
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [whyOpen, setWhyOpen] = useState(false)
  const [recurrenceActive, setRecurrenceActive] = useState(true)
  const [approved, setApproved] = useState(false)
  const [draftComposerValue, setDraftComposerValue] = useState('')
  const [draftQuestion, setDraftQuestion] = useState<string | null>(null)
  const [deliveryComplete, setDeliveryComplete] = useState(false)
  const [repeatNextMonday, setRepeatNextMonday] = useState(true)
  const [toast, setToast] = useState('')

  const inventoryResolved = inventoryUnknown || inventoryVariance.trim().length > 0
  const shippingResolved = shippingDecision !== 'unresolved'
  const canApprove = inventoryResolved && shippingResolved

  useEffect(() => {
    conversationRef.current?.scrollTo({ top: 0 })
  }, [view])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  const startNewChat = () => {
    setView('home')
    notify('New mock conversation started.')
  }

  const submitDraftMessage = (event: FormEvent) => {
    event.preventDefault()
    const message = draftComposerValue.trim()
    if (!message) return
    setDraftQuestion(message)
    setDraftComposerValue('')
  }

  return (
    <div className="copilot-app">
      <Sidebar view={view} onHome={() => setView('home')} onNewChat={startNewChat} />
      <section className="copilot-main">
        <Header view={view} completed={deliveryComplete} onBack={() => setView(view === 'next-steps' ? 'review' : 'home')} />
        <main className="conversation-area" ref={conversationRef}>
          {view === 'home' ? (
            <Home
              recurrenceActive={recurrenceActive}
              onReview={() => setView('review')}
              onWhy={() => setWhyOpen(true)}
            />
          ) : view === 'review' ? (
            <ReviewConversation
              approved={approved}
              canApprove={canApprove}
              draftComposerValue={draftComposerValue}
              draftQuestion={draftQuestion}
              inventoryVariance={inventoryVariance}
              inventoryUnknown={inventoryUnknown}
              shippingDecision={shippingDecision}
              onInventoryChange={(value) => {
                setInventoryVariance(value)
                if (value) setInventoryUnknown(false)
              }}
              onInventoryUnknown={() => {
                setInventoryUnknown((current) => !current)
                setInventoryVariance('')
              }}
              onShippingDecision={setShippingDecision}
              onSource={setSelectedSource}
              onDraftComposerChange={setDraftComposerValue}
              onDraftSubmit={submitDraftMessage}
              onApprove={() => {
                setApproved(true)
                setView('next-steps')
                notify('Approved. Nothing was sent or published.')
              }}
              onWhy={() => setWhyOpen(true)}
            />
          ) : (
            <NextSteps
              completed={deliveryComplete}
              repeatNextMonday={repeatNextMonday}
              onRepeatChange={setRepeatNextMonday}
              onComplete={() => {
                setDeliveryComplete(true)
                setRecurrenceActive(repeatNextMonday)
                notify('Mock delivery completed. No external message was sent.')
              }}
              onDownload={() => notify('Mock download selected. No file was created.')}
              onHome={() => setView('home')}
            />
          )}
        </main>
      </section>

      {selectedSource && <SourcePopover source={selectedSource} onClose={() => setSelectedSource(null)} />}
      {whyOpen && (
        <WhyPopover
          recurrenceActive={recurrenceActive}
          onClose={() => setWhyOpen(false)}
          onStop={() => {
            setRecurrenceActive(false)
            setWhyOpen(false)
            notify('Future preparation stopped. This draft remains available.')
          }}
        />
      )}
      {toast && <div className="toast" role="status"><Icon name="check" size={16} />{toast}</div>}
    </div>
  )
}

function Sidebar({ view, onHome, onNewChat }: { view: View; onHome: () => void; onNewChat: () => void }) {
  return (
    <aside className="copilot-sidebar" aria-label="Copilot navigation">
      <div className="brand"><span><Icon name="spark" size={18} /></span><strong>Shift Copilot</strong></div>
      <button className="new-chat-button" onClick={onNewChat}><Icon name="plus" size={16} />New chat</button>
      <div className="chat-list">
        <p>Recent chats</p>
        {recentChats.map((chat, index) => (
          <button key={chat} className={index === 0 && view !== 'home' ? 'active' : ''} onClick={index === 0 ? onHome : undefined} disabled={index !== 0}>
            <Icon name="document" size={15} /><span>{chat}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-user"><span>MC</span><div><strong>Mariana Costa</strong><small>Cerrado Alimentos</small></div></div>
    </aside>
  )
}

function Header({ view, completed, onBack }: { view: View; completed: boolean; onBack: () => void }) {
  const isWorkView = view !== 'home'
  let subtitle = 'Grounded in your company documents'
  if (view === 'review') subtitle = 'Draft review conversation'
  if (view === 'next-steps') subtitle = completed ? 'Completed · routine confirmed' : 'Approved · choose what to do next'

  return (
    <header className="copilot-header">
      <div className="header-context">
        {isWorkView ? <button onClick={onBack} aria-label={view === 'next-steps' ? 'Back to approved draft' : 'Back to Copilot home'}><Icon name="chevron" size={17} /></button> : <span className="mobile-brand"><Icon name="spark" size={16} /></span>}
        <div><strong>{isWorkView ? 'Weekly operations report' : 'Shift Copilot'}</strong><small>{subtitle}</small></div>
      </div>
      <span className="prototype-label">Prototype · fictional data</span>
    </header>
  )
}

type HomeProps = {
  recurrenceActive: boolean
  onReview: () => void
  onWhy: () => void
}

function Home({ recurrenceActive, onReview, onWhy }: HomeProps) {
  return (
    <div className="home-conversation">
      <div className="home-intro">
        <span className="copilot-orb"><Icon name="spark" size={24} /></span>
        <h1>Good morning, Mariana</h1>
        <p>Ask a question or create a draft from your operations documents.</p>
      </div>

      <section className="core-product-preview" aria-label="Core Shift Copilot use cases">
        <div className="core-input-shell" aria-hidden="true">
          <span><Icon name="plus" size={17} /></span>
          <p>Ask about your company documents…</p>
          <i><Icon name="send" size={16} /></i>
        </div>
        <div className="core-use-cases">
          <span>Common ways to use Shift Copilot</span>
          <div className="use-case-grid">
            {coreUseCases.map((useCase) => (
              <div className="use-case-card" key={useCase.title}>
                <span><Icon name={useCase.icon} size={16} /></span>
                <div><strong>{useCase.title}</strong><small>{useCase.description}</small></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="prepared-section-label"><span>Prepared for you</span><small>Optional proactive work</small></div>
      <section className="prepared-inline-card" aria-label="Prepared work">
        <div className="prepared-card-top"><span className="new-label">New · Prepared work</span><span>Prepared today at 8:12 AM</span></div>
        <div className="pattern-signal"><span><Icon name="spark" size={15} /></span><p><strong>You usually prepare this report on Monday mornings.</strong> We prepared a draft using the same approved structure and sources.</p></div>
        <div className="prepared-card-body">
          <div className="file-mark"><Icon name="document" size={21} /></div>
          <div className="prepared-copy">
            <h2>Weekly operations report</h2>
            <p>Draft prepared from 2 authorized sources</p>
            <div className="prepared-meta"><span><i></i>Draft prepared</span><span className="meta-separator">·</span><span className="attention-text">2 inputs needed</span></div>
          </div>
          <button className="primary-button" onClick={onReview}>Review draft <Icon name="arrow" size={16} /></button>
        </div>
        <div className="prepared-card-footer"><button onClick={onWhy}><Icon name="info" size={14} />Why am I seeing this?</button>{!recurrenceActive && <span>Future preparation stopped</span>}</div>
      </section>
    </div>
  )
}

type ReviewProps = {
  approved: boolean
  canApprove: boolean
  draftComposerValue: string
  draftQuestion: string | null
  inventoryVariance: string
  inventoryUnknown: boolean
  shippingDecision: ShippingDecision
  onInventoryChange: (value: string) => void
  onInventoryUnknown: () => void
  onShippingDecision: (decision: ShippingDecision) => void
  onSource: (source: Source) => void
  onDraftComposerChange: (value: string) => void
  onDraftSubmit: (event: FormEvent) => void
  onApprove: () => void
  onWhy: () => void
}

function ReviewConversation(props: ReviewProps) {
  const { approved, canApprove, draftComposerValue, draftQuestion, inventoryVariance, inventoryUnknown, shippingDecision, onInventoryChange, onInventoryUnknown, onShippingDecision, onSource, onDraftComposerChange, onDraftSubmit, onApprove, onWhy } = props

  return (
    <div className="thread">
      <div className="thread-date">Monday, June 8</div>
      <Message role="user"><p>Create this week’s operations summary using the same structure as last Monday.</p></Message>
      <Message role="assistant">
        <p>I prepared the next weekly operations report using the structure and document scope you approved. Two inputs still need your review.</p>
        <button className="why-inline" onClick={onWhy}><Icon name="info" size={14} />Why was this prepared?</button>
      </Message>

      <div className={`draft-block ${approved ? 'approved' : ''}`}>
        <div className="draft-header">
          <div className="file-mark"><Icon name={approved ? 'check' : 'document'} size={21} /></div>
          <div><span>{approved ? 'Approved draft' : 'Prepared draft · 2 inputs needed'}</span><h2>Weekly Operations Report</h2><p>Week of June 8, 2026</p></div>
        </div>

        <div className="draft-content">
          <section><h3>Summary</h3><p>Week 23 operations remained stable, with throughput at <strong>96% of plan</strong>. No critical incidents were reported. Two Southeast shipments moved to the next dispatch window.</p></section>
          <section><h3>Key updates</h3><ul><li>Goiânia throughput improved week over week.</li><li>Final inventory reconciliation remains open.</li><li>{shippingDecision === 'confirmed' ? 'Shipping delay attributed to confirmed carrier capacity constraints.' : shippingDecision === 'unknown' ? 'Reason for the shipping delay remains unconfirmed.' : 'Shipping delay explanation requires confirmation.'}</li></ul></section>

          <section className="preparation-progress" aria-label="Draft preparation progress">
            <div className="progress-heading"><h3>Draft preparation</h3><span>{approved ? '5 of 5 complete' : `${3 + Number(inventoryResolvedForProgress(inventoryVariance, inventoryUnknown)) + Number(shippingDecision !== 'unresolved')} of 5 complete`}</span></div>
            <ul>
              <li className="complete"><span><Icon name="check" size={13} /></span><div><strong>Reused the approved report structure</strong><small>Based on last Monday’s report</small></div></li>
              <li className="complete"><span><Icon name="check" size={13} /></span><div><strong>Reviewed 2 permitted sources</strong><small>Only the authorized mock documents</small></div></li>
              <li className="complete"><span><Icon name="check" size={13} /></span><div><strong>Drafted summary and key updates</strong><small>Statements remain linked to their sources</small></div></li>
              <li className={inventoryResolvedForProgress(inventoryVariance, inventoryUnknown) ? 'complete' : 'pending'}><span>{inventoryResolvedForProgress(inventoryVariance, inventoryUnknown) ? <Icon name="check" size={13} /> : '4'}</span><div><strong>Resolve inventory variance</strong><small>{inventoryResolvedForProgress(inventoryVariance, inventoryUnknown) ? 'Reviewed by Mariana' : 'Human input still needed'}</small></div></li>
              <li className={shippingDecision !== 'unresolved' ? 'complete' : 'pending'}><span>{shippingDecision !== 'unresolved' ? <Icon name="check" size={13} /> : '5'}</span><div><strong>Confirm shipping delay context</strong><small>{shippingDecision !== 'unresolved' ? 'Reviewed by Mariana' : 'Human judgment still needed'}</small></div></li>
            </ul>
          </section>

          <div className="source-references"><span>Sources</span>{sources.map((source) => <button key={source.id} onClick={() => onSource(source)}><Icon name="link" size={13} />{source.name}</button>)}</div>

          {!approved && (
            <div className="input-review">
              <div className={`input-item ${inventoryVariance || inventoryUnknown ? 'resolved' : ''}`}>
                <div className="input-item-heading"><span>{inventoryVariance || inventoryUnknown ? <Icon name="check" size={14} /> : <Icon name="warning" size={14} />}</span><div><strong>Final inventory variance unavailable</strong><small>Not present in the authorized sources</small></div></div>
                <div className="inventory-entry"><label htmlFor="variance">Add variance</label><div><input id="variance" inputMode="decimal" value={inventoryVariance} placeholder="e.g. 1.8" disabled={inventoryUnknown} onChange={(event) => onInventoryChange(event.target.value)} /><span>%</span></div></div>
                <label className="unknown-control"><input type="checkbox" checked={inventoryUnknown} onChange={onInventoryUnknown} />Mark unknown</label>
              </div>

              <div className={`input-item ${shippingDecision !== 'unresolved' ? 'resolved' : ''}`}>
                <div className="input-item-heading"><span>{shippingDecision !== 'unresolved' ? <Icon name="check" size={14} /> : <Icon name="warning" size={14} />}</span><div><strong>Confirm reason for shipping delay</strong><small>Proposed from one mock source</small></div></div>
                <blockquote>“Carrier capacity constraints affected the Southeast dispatch window.”</blockquote>
                <div className="input-actions"><button className={shippingDecision === 'confirmed' ? 'selected' : ''} onClick={() => onShippingDecision('confirmed')}><Icon name="check" size={14} />Confirm input</button><button className={shippingDecision === 'unknown' ? 'selected' : ''} onClick={() => onShippingDecision('unknown')}>Mark unknown</button></div>
              </div>
            </div>
          )}
        </div>

        <div className="draft-footer"><span>{approved ? 'Nothing was sent or published.' : canApprove ? 'Both inputs are resolved.' : 'Resolve or mark both inputs unknown to approve.'}</span>{!approved && <button className="primary-button" disabled={!canApprove} onClick={onApprove}>Approve draft <Icon name="arrow" size={16} /></button>}</div>
      </div>

      {approved && (
        <Message role="assistant" accent><div className="approval-confirmation"><span><Icon name="check" size={15} /></span><div><strong>Approved</strong><p>Nothing was sent or published. The report is ready for you to use.</p></div></div></Message>
      )}
      <section className="draft-chat-panel" aria-labelledby="draft-chat-title">
        <div className="draft-chat-heading">
          <span><Icon name="spark" size={17} /></span>
          <div><h2 id="draft-chat-title">Discuss this draft</h2><p>Ask questions or explore revisions in the context of this report.</p></div>
        </div>
        {draftQuestion && (
          <div className="draft-chat-exchange" aria-label="Draft-specific conversation">
            <Message role="user"><p>{draftQuestion}</p></Message>
            <Message role="assistant"><p>I’m answering within the context of this Weekly Operations Report draft. I can explain a statement, compare it with the cited sources, or help revise the wording. No change is applied automatically.</p></Message>
          </div>
        )}
        <Composer
          value={draftComposerValue}
          onChange={onDraftComposerChange}
          onSubmit={onDraftSubmit}
          placeholder={approved ? 'Ask about the approved draft…' : 'Ask about this draft…'}
          ariaLabel="Ask about the weekly operations draft"
          helperText="This conversation is scoped to the Weekly Operations Report draft."
        />
      </section>
    </div>
  )
}

function inventoryResolvedForProgress(value: string, unknown: boolean) {
  return unknown || value.trim().length > 0
}

type NextStepsProps = {
  completed: boolean
  repeatNextMonday: boolean
  onRepeatChange: (value: boolean) => void
  onComplete: () => void
  onDownload: () => void
  onHome: () => void
}

function NextSteps({ completed, repeatNextMonday, onRepeatChange, onComplete, onDownload, onHome }: NextStepsProps) {
  if (completed) {
    return (
      <div className="next-steps-page completed-page">
        <div className="completion-mark"><Icon name="check" size={24} /></div>
        <span className="next-eyebrow">Report completed</span>
        <h1>Weekly operations report is complete</h1>
        <p className="next-intro">The prototype simulated the same delivery routine used last week. No external message was actually sent.</p>

        <section className="completion-recap">
          <div><span><Icon name="send" size={15} /></span><div><strong>Mock delivery complete</strong><small>Operations Leadership · Microsoft Teams</small></div></div>
          <div><span><Icon name="document" size={15} /></span><div><strong>Report format</strong><small>PDF with source references</small></div></div>
          <div><span><Icon name="spark" size={15} /></span><div><strong>{repeatNextMonday ? 'Next draft authorized' : 'No next draft scheduled'}</strong><small>{repeatNextMonday ? 'Monday, June 15 at 8:00 AM · same context, review required' : 'Mariana can restart this routine later'}</small></div></div>
        </section>

        <button className="primary-button completion-home" onClick={onHome}>Return to Copilot home</button>
        <p className="prototype-safety"><Icon name="info" size={14} />Illustrative confirmation only. Nothing left this prototype.</p>
      </div>
    )
  }

  return (
    <div className="next-steps-page">
      <div className="completion-mark"><Icon name="check" size={24} /></div>
      <span className="next-eyebrow">Draft approved</span>
      <h1>Complete this weekly report</h1>
      <p className="next-intro">Use the same delivery setup as last week, or download the approved report instead.</p>

      <section className="delivery-setup">
        <div className="delivery-heading"><span><Icon name="spark" size={15} /></span><div><strong>Based on last week’s routine</strong><small>Review the preset options before completing</small></div></div>
        <dl>
          <div><dt>Recipients</dt><dd>Operations Leadership</dd></div>
          <div><dt>Destination</dt><dd>Microsoft Teams · Weekly Operations</dd></div>
          <div><dt>Format</dt><dd>PDF with source references</dd></div>
        </dl>
        <label className="repeat-option"><input type="checkbox" checked={repeatNextMonday} onChange={(event) => onRepeatChange(event.target.checked)} /><span><strong>Prepare this again next Monday</strong><small>8:00 AM · same approved structure and source scope</small></span></label>
      </section>

      <div className="next-actions">
        <button className="next-action primary" onClick={onComplete}><span><Icon name="send" size={19} /></span><div><strong>Complete and send</strong><small>Use the preset delivery routine above</small></div><Icon name="chevron" size={16} /></button>
        <button className="next-action" onClick={onDownload}><span><Icon name="document" size={19} /></span><div><strong>Download report</strong><small>Keep a local copy without sending</small></div><Icon name="chevron" size={16} /></button>
      </div>

      <p className="prototype-safety"><Icon name="info" size={14} />Both actions are simulated. Nothing will be sent or downloaded.</p>
    </div>
  )
}

function Message({ role, accent = false, children }: { role: 'user' | 'assistant'; accent?: boolean; children: ReactNode }) {
  return <div className={`message ${role} ${accent ? 'accent' : ''}`}><span className="message-avatar">{role === 'assistant' ? <Icon name="spark" size={15} /> : 'MC'}</span><div className="message-body"><strong>{role === 'assistant' ? 'Shift Copilot' : 'You'}</strong>{children}</div></div>
}

function Composer({ value, onChange, onSubmit, placeholder = 'Ask about your company documents…', ariaLabel = 'Message Shift Copilot', helperText = 'Shift Copilot can make mistakes. Review sources and outputs.' }: { value: string; onChange: (value: string) => void; onSubmit: (event: FormEvent) => void; placeholder?: string; ariaLabel?: string; helperText?: string }) {
  return (
    <div className="composer-wrap">
      <form className="composer" onSubmit={onSubmit}>
        <button type="button" className="attach-button" aria-label="Attach a mock document" onClick={() => onChange(value ? `${value} [mock document]` : '[Mock document attached]')}><Icon name="plus" size={17} /></button>
        <input aria-label={ariaLabel} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
        <button className="send-button" type="submit" disabled={!value.trim()} aria-label="Send message"><Icon name="send" size={16} /></button>
      </form>
      <p>{helperText}</p>
    </div>
  )
}

function Modal({ titleId, onClose, children }: { titleId: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>{children}<button className="modal-close" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button></div>
    </div>
  )
}

function SourcePopover({ source, onClose }: { source: Source; onClose: () => void }) {
  return (
    <Modal titleId="source-title" onClose={onClose}>
      <div className="modal-eyebrow">Mock source excerpt</div>
      <div className="source-heading"><span>{source.type}</span><div><h2 id="source-title">{source.name}</h2><p>{source.supports}</p></div></div>
      <blockquote className="source-excerpt">“{source.excerpt}”</blockquote>
      <div className="fictional-note"><Icon name="info" size={15} />Fictional content for this prototype. No customer file was accessed.</div>
      <button className="secondary-button full" onClick={onClose}>Close</button>
    </Modal>
  )
}

function WhyPopover({ recurrenceActive, onClose, onStop }: { recurrenceActive: boolean; onClose: () => void; onStop: () => void }) {
  return (
    <Modal titleId="why-title" onClose={onClose}>
      <div className="modal-eyebrow">Prepared work</div>
      <h2 id="why-title">Why am I seeing this?</h2>
      <p className="modal-copy">Last Monday, you chose to reuse this report structure and authorized two operations documents for the next weekly draft.</p>
      <dl className="why-details"><div><dt>Schedule</dt><dd>{recurrenceActive ? 'Every Monday at 8:00 AM' : 'Future preparation stopped'}</dd></div><div><dt>Permitted scope</dt><dd>2 authorized operations documents</dd></div><div><dt>Control</dt><dd>Review and approval always required</dd></div></dl>
      <div className="fictional-note"><Icon name="info" size={15} />This prototype does not run a real schedule or access external documents.</div>
      {recurrenceActive ? <button className="stop-button" onClick={onStop}><Icon name="stop" size={14} />Stop preparing this task</button> : <button className="secondary-button full" onClick={onClose}>Close</button>}
    </Modal>
  )
}

export default App
