import './style.css';
import { deleteExample, getExamples, getPreferences, getSessions, replaceAll, saveExample, savePreferences, saveSession } from './db';
import { competencyMap, decryptExport, encryptExport, evidenceParts, FREE_EXAMPLE_LIMIT, makeExport, makePrompt, toCsv } from './data';
import { captureLicense, checkoutUrl, clearLicense, hasLicenseToken, isOptimisticallyUnlocked, storeLicense, verifyLicense } from './license';
import type { Example, Preferences, RecallRating, Session } from './types';

type Route = 'home' | 'deck' | 'edit' | 'rehearse' | 'sheet' | 'settings';
type Rehearsal = { cards: Example[]; index: number; remaining: number; paused: boolean; revealed: boolean; answer: string; startedAt: string; results: { exampleId: string; rating: RecallRating }[] };

const app = document.querySelector<HTMLDivElement>('#app')!;
let examples: Example[] = [];
let sessions: Session[] = [];
let preferences: Preferences = { duration: 90, reduceMotion: false, ttsRate: 1 };
let unlocked = false;
let rehearsal: Rehearsal | null = null;
let timer: number | undefined;
let notice = '';

const icons: Record<string, string> = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 11 8-7 8 7v9h-5v-6H9v6H4z"/></svg>',
  deck: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="14" height="16" rx="2"/><path d="M8 8h6M8 12h6M20 7v11"/></svg>',
  rehearse: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V7a4 4 0 0 0-4-4Z"/><path d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3"/></svg>',
  sheet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h4M9 12h7M9 16h7"/></svg>',
  settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19 14.5l1.5 1-2 3.5-1.8-.8a8 8 0 0 1-2.2 1.3l-.2 2h-4l-.2-2a8 8 0 0 1-2.2-1.3l-1.8.8-2-3.5 1.5-1a8 8 0 0 1 0-5l-1.5-1 2-3.5 1.8.8a8 8 0 0 1 2.2-1.3l.2-2h4l.2 2a8 8 0 0 1 2.2 1.3l1.8-.8 2 3.5-1.5 1a8 8 0 0 1 0 5Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  volume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10v4h4l5 4V6l-5 4zM17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg>'
};

function esc(value: string): string {
  return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
}

function routeInfo(): { route: Route; id?: string } {
  const [first = 'home', second] = location.hash.replace(/^#\/?/, '').split('/');
  const route = ['home', 'deck', 'edit', 'rehearse', 'sheet', 'settings'].includes(first) ? first as Route : 'home';
  return { route, id: second };
}

function navLink(route: Route, label: string): string {
  const active = routeInfo().route === route;
  return `<a href="#/${route}" ${active ? 'aria-current="page"' : ''}>${icons[route]}<span>${label}</span></a>`;
}

function shell(content: string): void {
  const offline = navigator.onLine ? '' : '<div class="status-banner offline" role="status">Offline — your saved deck still works here.</div>';
  app.innerHTML = `${offline}
    <div class="app-shell">
      <header class="brand"><a href="#/home" aria-label="Interview Recall Deck home"><span class="brand-mark" aria-hidden="true">◌</span><span>Recall<br><strong>Deck</strong></span></a></header>
      <nav class="rail" aria-label="Primary navigation">
        ${navLink('home', 'Home')}${navLink('deck', 'Deck')}${navLink('rehearse', 'Rehearse')}${navLink('sheet', 'Recall sheet')}${navLink('settings', 'Settings')}
      </nav>
      <main id="main" tabindex="-1">${content}</main>
      <footer><span>Private by default. Stored on this device.</span><span><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · Original generated artwork</span></footer>
    </div>
    <div id="live" class="sr-only" aria-live="polite">${esc(notice)}</div>
    <div id="toast-zone" aria-live="polite"></div>`;
  document.documentElement.classList.toggle('reduce-motion', preferences.reduceMotion);
}

function pageHead(kicker: string, title: string, intro: string, action = ''): string {
  return `<div class="page-head"><div><p class="kicker">${kicker}</p><h1>${title}</h1><p class="lede">${intro}</p></div>${action}</div>`;
}

function homeView(): string {
  const competencies = competencyMap(examples).size;
  const next = examples.length ? '#/rehearse' : '#/edit';
  const label = examples.length ? 'Start a calm rehearsal' : 'Add your first example';
  return `<section class="hero">
    <div class="hero-copy"><p class="eyebrow"><span></span>Your experience, easier to reach</p><h1>Find the story<br>when you need it.</h1>
      <p>Turn work you’ve already done into short evidence cards. Practise in small, pausable rounds—without sending your notes anywhere.</p>
      <div class="actions"><a class="button primary" href="${next}">${label} <span aria-hidden="true">→</span></a><a class="button quiet" href="#/sheet">Open recall sheet</a></div>
      <p class="trust"><span aria-hidden="true">●</span> Local-first · Works offline · No account</p></div>
    <figure class="hero-art"><picture><source media="(max-width: 760px)" srcset="/assets/recall-landscape-768.webp"><img src="/assets/recall-landscape-1280.webp" width="1280" height="853" alt="Three glass memory cards connected by glowing paths and evidence points" decoding="async" fetchpriority="high"></picture><figcaption>Scattered details become a path you can retrace.</figcaption></figure>
  </section>
  <section class="snapshot" aria-labelledby="snapshot-title"><div><p class="kicker">Today’s landscape</p><h2 id="snapshot-title">Your deck at a glance</h2></div>
    <dl><div><dt>Examples</dt><dd>${examples.length}</dd></div><div><dt>Competencies</dt><dd>${competencies}</dd></div><div><dt>Rehearsals</dt><dd>${sessions.length}</dd></div></dl>
  </section>
  <section class="steps" aria-labelledby="path-title"><p class="kicker">A lighter preparation path</p><h2 id="path-title">Recall, don’t recite</h2><ol><li><span>01</span><div><h3>Capture one true moment</h3><p>Save the situation, what you did, and what changed.</p></div></li><li><span>02</span><div><h3>Practise the doorway</h3><p>Use a short cue to find the story before revealing your notes.</p></div></li><li><span>03</span><div><h3>Carry the landmarks</h3><p>Bring a one-page sheet of prompts—not a script—to the interview.</p></div></li></ol></section>`;
}

function deckView(): string {
  const canAdd = unlocked || examples.length < FREE_EXAMPLE_LIMIT;
  const action = canAdd ? `<a class="button primary" href="#/edit">${icons.plus} Add example</a>` : '<a class="button primary" href="#/settings">Unlock unlimited</a>';
  if (!examples.length) return `${pageHead('Your evidence', 'Build your deck', 'Start with one project you know well. Short, specific notes are enough.', action)}
    <section class="empty-state"><div class="empty-orbit" aria-hidden="true"><i></i><i></i><i></i></div><h2>No examples yet</h2><p>Your first card takes about three minutes. Everything stays in this browser.</p><a class="button primary" href="#/edit">Add your first example</a></section>`;
  return `${pageHead('Your evidence', 'Your recall deck', `${examples.length} truthful ${examples.length === 1 ? 'example' : 'examples'}, ready to rehearse.`, action)}
    ${!canAdd ? '<div class="inline-note"><strong>Free deck complete.</strong> Keep rehearsing these six, or unlock unlimited examples for $9 once.</div>' : ''}
    <section class="card-grid" aria-label="Saved examples">${examples.map(example => `<article class="memory-card">
      <div class="card-top"><span class="evidence-dot"></span><span>${esc(example.role || 'Your role')}</span></div><h2>${esc(example.title)}</h2>
      <p class="card-cue">“${esc(example.cue || makePrompt(example))}”</p><ul class="chips">${example.competencies.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
      <div class="card-actions"><a href="#/edit/${example.id}">Edit<span class="sr-only"> ${esc(example.title)}</span></a><a href="#/rehearse/${example.id}">Rehearse<span class="sr-only"> ${esc(example.title)}</span></a></div>
    </article>`).join('')}</section>`;
}

function editorView(id?: string): string {
  const example = examples.find(item => item.id === id);
  if (!example && !unlocked && examples.length >= FREE_EXAMPLE_LIMIT) return `${pageHead('Deck limit', 'Your six examples are ready', 'The free deck remains fully usable. Unlimited examples are included in the one-time unlock.')}<div class="glass-callout"><a class="button primary" href="#/settings">See the $9 unlock</a><a class="button quiet" href="#/deck">Back to deck</a></div>`;
  const value = (key: keyof Example) => esc(String(example?.[key] ?? ''));
  return `${pageHead('Your own words', example ? 'Edit this example' : 'Capture one true moment', 'Write landmarks, not a polished script. You can refine this later.')}
    <form id="example-form" class="editor" data-id="${esc(example?.id ?? '')}" novalidate>
      <p class="required-note span-2">Fields marked * are required.</p><div class="form-intro"><span>01</span><div><h2>Name the moment</h2><p>A project or event you can picture clearly.</p></div></div>
      <div class="field span-2"><label for="title">Project or moment <b aria-hidden="true">*</b></label><input id="title" name="title" value="${value('title')}" required maxlength="80" autocomplete="off"><small>For example: “Checkout reliability launch”</small></div>
      <div class="field"><label for="role">Your role</label><input id="role" name="role" value="${value('role')}" maxlength="60" autocomplete="off"></div>
      <div class="field"><label for="competencies">Competencies</label><input id="competencies" name="competencies" value="${esc(example?.competencies.join(', ') ?? '')}" maxlength="120" aria-describedby="competency-help"><small id="competency-help">Separate with commas: leadership, debugging</small></div>
      <div class="form-intro"><span>02</span><div><h2>Place three landmarks</h2><p>Specific fragments help more than perfect prose.</p></div></div>
      <div class="field"><label for="situation">Situation <b aria-hidden="true">*</b></label><textarea id="situation" name="situation" required maxlength="320">${value('situation')}</textarea><small>What was at stake?</small></div>
      <div class="field"><label for="action">Your action <b aria-hidden="true">*</b></label><textarea id="action" name="action" required maxlength="420">${value('action')}</textarea><small>What did you specifically do?</small></div>
      <div class="field span-2"><label for="result">Result or learning <b aria-hidden="true">*</b></label><textarea id="result" name="result" required maxlength="320">${value('result')}</textarea><small>Use a number if you genuinely remember one.</small></div>
      <div class="form-intro"><span>03</span><div><h2>Choose the doorway</h2><p>This short phrase will start your rehearsal.</p></div></div>
      <div class="field span-2"><label for="cue">Recall cue</label><input id="cue" name="cue" value="${value('cue')}" maxlength="100" placeholder="The Friday rollback"><small>Your words only. The app does not invent experience.</small></div>
      <div id="form-error" class="form-error" role="alert"></div>
      <div class="form-actions span-2"><button class="button primary" type="submit">Save example</button><a class="button quiet" href="#/deck">Cancel</a>${example ? `<button class="button danger" type="button" data-action="delete" data-id="${esc(example.id)}">Delete example</button>` : ''}</div>
    </form>`;
}

function rehearseView(id?: string): string {
  if (!examples.length) return `${pageHead('Practice space', 'Nothing to rehearse yet', 'Add one true example first. Then this space will help you retrieve it without reading a script.')}<a class="button primary" href="#/edit">Add an example</a>`;
  if (!rehearsal) {
    const selected = id ? examples.find(e => e.id === id) : undefined;
    return `${pageHead('Practice space', 'A calm recall round', 'Pause at any point. Your evidence stays hidden until you choose to reveal it.')}
      <section class="rehearse-setup"><div class="setup-visual" aria-hidden="true"><div class="pulse-card"><span></span><span></span><span></span></div></div><div><h2>${selected ? `Rehearse “${esc(selected.title)}”` : `Rehearse ${examples.length} ${examples.length === 1 ? 'example' : 'examples'}`}</h2><ul class="check-list"><li>No score and no audience</li><li>Type, speak, or think your answer</li><li>Compare only with your own notes</li></ul><button class="button primary" data-action="start-rehearsal" data-id="${selected?.id ?? ''}">Begin ${preferences.duration}-second ${selected ? 'round' : 'rounds'}</button></div></section>`;
  }
  const current = rehearsal.cards[rehearsal.index];
  if (!current) return rehearsalCompleteView();
  const progress = Math.round((rehearsal.index / rehearsal.cards.length) * 100);
  return `${pageHead(`Round ${rehearsal.index + 1} of ${rehearsal.cards.length}`, 'Retrieve the story', 'Start anywhere. A useful answer does not need to sound polished.')}
    <section class="rehearsal" aria-label="Active rehearsal">
      <div class="progress-track" role="progressbar" aria-label="Rehearsal progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
      <div class="timer-row"><div class="timer ${rehearsal.paused ? 'is-paused' : ''}"><span id="timer-value">${formatTime(rehearsal.remaining)}</span><small>${rehearsal.paused ? 'Paused' : 'Remaining'}</small></div><button class="icon-button" data-action="speak-prompt">${icons.volume}<span>Read prompt</span></button><button class="button quiet" data-action="pause">${rehearsal.paused ? 'Resume' : 'Pause'}</button></div>
      <article class="prompt-pane"><p class="kicker">Recall cue</p><h2>${esc(current.cue || current.title)}</h2><p>${esc(makePrompt(current))}</p></article>
      <div class="answer-field"><label for="answer">What comes back? <span>Optional—thinking aloud counts.</span></label><textarea id="answer" maxlength="1200" placeholder="Type fragments here, or use the microphone…">${esc(rehearsal.answer)}</textarea><button type="button" class="button quiet mic" data-action="dictate">${icons.rehearse} Start dictation</button><p id="speech-status" class="helper" aria-live="polite">Speech recognition availability depends on your browser. Audio is never stored by this app.</p></div>
      ${rehearsal.revealed ? `<section class="evidence-reveal"><p class="kicker">Your saved evidence</p><h2>${esc(current.title)}</h2><dl>${evidenceParts(current).map(p => `<div><dt>${p.label}</dt><dd>${esc(p.value)}</dd></div>`).join('')}</dl><p>Could you reach the main idea?</p><div class="rating-actions"><button class="button success" data-action="rate" data-rating="recalled">Yes, I recalled it</button><button class="button quiet" data-action="rate" data-rating="needs-pass">Needs another pass</button></div></section>` : `<button class="button primary reveal" data-action="reveal">Reveal my evidence</button>`}
    </section>`;
}

function rehearsalCompleteView(): string {
  const recalled = rehearsal?.results.filter(r => r.rating === 'recalled').length ?? 0;
  return `${pageHead('Round complete', 'You found your way back', 'The goal is familiarity, not a perfect performance.')}
    <section class="complete-state"><div class="complete-mark" aria-hidden="true">✓</div><h2>${recalled} of ${rehearsal?.results.length ?? 0} felt reachable</h2><p>“Needs another pass” is useful information. Your notes are still yours, and nothing was scored.</p><div class="actions"><button class="button primary" data-action="restart">Practise again</button><a class="button quiet" href="#/sheet">Open recall sheet</a></div></section>`;
}

function sheetView(): string {
  const map = competencyMap(examples);
  if (!examples.length) return `${pageHead('One-page view', 'Your pre-interview recall sheet', 'This will condense your cue words and evidence once you add examples.')}<div class="empty-state"><h2>No landmarks yet</h2><p>Add an example, then return here for a compact sheet.</p><a class="button primary" href="#/edit">Add an example</a></div>`;
  return `${pageHead('One-page view', 'Your pre-interview recall sheet', 'Prompts, not scripts. Use this for a quick scan before the conversation.', '<button class="button primary no-print" data-action="print">Print or save PDF</button>')}
    <section class="recall-sheet"><header><div><span class="brand-mark" aria-hidden="true">◌</span><strong>Recall Deck</strong></div><p>${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date())}</p></header>
    ${[...map.entries()].map(([competency, items]) => `<section><h2>${esc(competency)}</h2><ol>${items.slice(0, 3).map(e => `<li><div><strong>${esc(e.cue || e.title)}</strong><span>${esc(e.title)}</span></div><p><b>Action:</b> ${esc(e.action)}</p><p><b>Result:</b> ${esc(e.result)}</p></li>`).join('')}</ol>${items.length < 3 ? `<p class="sheet-gap">${3 - items.length} open ${3 - items.length === 1 ? 'slot' : 'slots'} for another example</p>` : ''}</section>`).join('')}
    ${map.size === 0 ? `<section><h2>Unsorted examples</h2><ol>${examples.map(e => `<li><strong>${esc(e.cue || e.title)}</strong><p>${esc(e.action)} → ${esc(e.result)}</p></li>`).join('')}</ol></section>` : ''}
    <footer>Pause. Find the cue. Tell what you actually did.</footer></section>`;
}

function settingsView(): string {
  const recent = sessions.slice(0, 5);
  return `${pageHead('Control room', 'Settings & data', 'Tune the rehearsal, own your notes, and manage the optional one-time unlock.')}
    <div class="settings-grid">
      <section><p class="kicker">Comfort</p><h2>Rehearsal controls</h2><form id="preferences-form"><div class="field"><label for="duration">Time per example</label><select id="duration" name="duration"><option value="60" ${preferences.duration === 60 ? 'selected' : ''}>60 seconds</option><option value="90" ${preferences.duration === 90 ? 'selected' : ''}>90 seconds</option>${unlocked ? `<option value="120" ${preferences.duration === 120 ? 'selected' : ''}>2 minutes</option><option value="180" ${preferences.duration === 180 ? 'selected' : ''}>3 minutes</option>` : ''}</select></div><label class="toggle"><input type="checkbox" name="reduceMotion" ${preferences.reduceMotion ? 'checked' : ''}><span></span><div><strong>Reduce motion</strong><small>Use instant state changes throughout the app</small></div></label><div class="field"><label for="ttsRate">Read-aloud speed</label><select id="ttsRate" name="ttsRate"><option value="0.8" ${preferences.ttsRate === .8 ? 'selected' : ''}>Gentle</option><option value="1" ${preferences.ttsRate === 1 ? 'selected' : ''}>Standard</option><option value="1.2" ${preferences.ttsRate === 1.2 ? 'selected' : ''}>Brisk</option></select></div><button class="button quiet" type="submit">Save comfort settings</button></form></section>
      <section><p class="kicker">Ownership</p><h2>Move or back up your deck</h2><p>Encrypted exports include examples and rehearsal history. The passphrase cannot be recovered.</p><form id="export-form"><div class="field"><label for="export-passphrase">Export passphrase</label><input type="password" id="export-passphrase" minlength="8" required autocomplete="new-password" aria-describedby="export-help"><small id="export-help">At least 8 characters. Store it separately.</small></div><div class="actions"><button class="button primary" type="submit">Download encrypted backup</button><button class="button quiet" type="button" data-action="csv">Export readable CSV</button></div></form><hr><form id="import-form"><div class="field"><label for="import-file">Encrypted backup file</label><input type="file" id="import-file" accept="application/json,.json" required></div><div class="field"><label for="import-passphrase">Backup passphrase</label><input type="password" id="import-passphrase" required autocomplete="current-password"></div><button class="button quiet" type="submit">Replace deck from backup</button><p class="helper">You’ll confirm before current data is replaced.</p></form></section>
      <section class="unlock"><p class="kicker">One-time unlock</p><h2>${unlocked ? 'Unlimited is active' : 'Keep every useful story'}</h2>${unlocked ? '<p class="license-good">✓ License active on this device</p><p>You have unlimited examples, longer rounds, and rehearsal history.</p><button class="button quiet" data-action="remove-license">Remove license from this device</button>' : `<p>The free deck includes 6 examples, every accessibility tool, rehearsal, recall sheet, and all exports. Pay <strong>$9 once</strong> for:</p><ul><li>Unlimited examples</li><li>2- and 3-minute round options</li><li>Recent rehearsal history</li></ul><a class="button primary" href="${checkoutUrl()}">Buy the $9 lifetime unlock</a><p class="legal-note">Secure checkout is hosted by Sociobot/Dodo, the merchant of record. Refunds are handled there and revoke the license. <a href="/terms/">Terms</a> apply.</p><form id="license-form"><div class="field"><label for="license-token">Already bought it? Paste your license</label><input id="license-token" required autocomplete="off"></div><button class="button quiet" type="submit">Verify and restore</button></form>`}${hasLicenseToken() && !unlocked ? '<p class="warning">A saved license is not currently active. Reconnect and verify it, or purchase again if it was refunded.</p>' : ''}</section>
      ${unlocked ? `<section><p class="kicker">History</p><h2>Recent rehearsals</h2>${recent.length ? `<ul class="history">${recent.map(s => `<li><time datetime="${s.completedAt}">${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(s.completedAt))}</time><span>${s.results.filter(r => r.rating === 'recalled').length}/${s.results.length} felt reachable</span></li>`).join('')}</ul>` : '<p>No completed rounds yet. Your history will appear here.</p>'}</section>` : ''}
    </div>`;
}

function render(focusMain = false): void {
  window.clearInterval(timer);
  const { route, id } = routeInfo();
  const content = route === 'home' ? homeView() : route === 'deck' ? deckView() : route === 'edit' ? editorView(id) : route === 'rehearse' ? rehearseView(id) : route === 'sheet' ? sheetView() : settingsView();
  shell(content);
  bindEvents();
  if (route === 'rehearse' && rehearsal && rehearsal.cards[rehearsal.index] && !rehearsal.paused) startTimer();
  if (focusMain) document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true });
}

function showNotice(message: string): void {
  notice = message;
  const live = document.querySelector('#live');
  if (live) live.textContent = message;
}

function formValue(form: FormData, key: string): string { return String(form.get(key) ?? '').trim(); }

function bindEvents(): void {
  document.querySelector('#example-form')?.addEventListener('submit', handleExampleSubmit);
  document.querySelector('#preferences-form')?.addEventListener('submit', handlePreferences);
  document.querySelector('#export-form')?.addEventListener('submit', handleExport);
  document.querySelector('#import-form')?.addEventListener('submit', handleImport);
  document.querySelector('#license-form')?.addEventListener('submit', handleLicense);
  document.querySelector('#answer')?.addEventListener('input', event => { if (rehearsal) rehearsal.answer = (event.target as HTMLTextAreaElement).value; });
  document.querySelectorAll<HTMLElement>('[data-action]').forEach(element => element.addEventListener('click', handleAction));
}

async function handleExampleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const data = new FormData(form);
  const required = ['title', 'situation', 'action', 'result'];
  if (required.some(key => !formValue(data, key))) {
    const error = document.querySelector('#form-error')!;
    error.textContent = 'Add the project, situation, your action, and the result before saving.';
    form.querySelector<HTMLElement>(':invalid')?.focus(); return;
  }
  const now = new Date().toISOString();
  const existing = examples.find(e => e.id === form.dataset.id);
  const example: Example = { id: existing?.id ?? crypto.randomUUID(), title: formValue(data, 'title'), role: formValue(data, 'role'), situation: formValue(data, 'situation'), action: formValue(data, 'action'), result: formValue(data, 'result'), competencies: formValue(data, 'competencies').split(',').map(v => v.trim()).filter(Boolean).slice(0, 6), cue: formValue(data, 'cue'), createdAt: existing?.createdAt ?? now, updatedAt: now };
  try { await saveExample(example); examples = await getExamples(); showNotice(`${example.title} saved.`); location.hash = '#/deck'; }
  catch { document.querySelector('#form-error')!.textContent = 'This example could not be saved. Check your browser storage and try again.'; }
}

function formatTime(total: number): string { return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`; }

function startTimer(): void {
  timer = window.setInterval(() => {
    if (!rehearsal || rehearsal.paused || rehearsal.revealed) return;
    rehearsal.remaining = Math.max(0, rehearsal.remaining - 1);
    const value = document.querySelector('#timer-value');
    if (value) value.textContent = formatTime(rehearsal.remaining);
    if (rehearsal.remaining === 0) { rehearsal.paused = true; render(); showNotice('Time is up. Reveal your evidence whenever you are ready.'); }
  }, 1000);
}

async function rateCurrent(rating: RecallRating): Promise<void> {
  if (!rehearsal) return;
  rehearsal.results.push({ exampleId: rehearsal.cards[rehearsal.index].id, rating });
  rehearsal.index += 1; rehearsal.remaining = preferences.duration; rehearsal.revealed = false; rehearsal.answer = ''; rehearsal.paused = false;
  if (rehearsal.index >= rehearsal.cards.length) {
    const session: Session = { id: crypto.randomUUID(), startedAt: rehearsal.startedAt, completedAt: new Date().toISOString(), results: rehearsal.results };
    await saveSession(session); sessions = await getSessions(); showNotice('Rehearsal complete and saved on this device.');
  }
  render();
}

async function handleAction(event: Event): Promise<void> {
  const target = event.currentTarget as HTMLElement;
  const action = target.dataset.action;
  if (action === 'delete') {
    const example = examples.find(e => e.id === target.dataset.id);
    if (example && confirm(`Delete “${example.title}”? This cannot be undone.`)) { await deleteExample(example.id); examples = await getExamples(); showNotice(`${example.title} deleted.`); location.hash = '#/deck'; }
  }
  if (action === 'start-rehearsal') {
    const chosen = target.dataset.id ? examples.filter(e => e.id === target.dataset.id) : [...examples].sort(() => Math.random() - .5);
    rehearsal = { cards: chosen, index: 0, remaining: preferences.duration, paused: false, revealed: false, answer: '', startedAt: new Date().toISOString(), results: [] }; render();
  }
  if (action === 'pause' && rehearsal) { rehearsal.paused = !rehearsal.paused; render(); showNotice(rehearsal.paused ? 'Rehearsal paused.' : 'Rehearsal resumed.'); }
  if (action === 'reveal' && rehearsal) { rehearsal.revealed = true; rehearsal.paused = true; render(); document.querySelector<HTMLElement>('.evidence-reveal')?.focus(); }
  if (action === 'rate') await rateCurrent(target.dataset.rating as RecallRating);
  if (action === 'restart') { rehearsal = null; render(); }
  if (action === 'speak-prompt' && rehearsal) {
    speechSynthesis.cancel(); const current = rehearsal.cards[rehearsal.index]; const utterance = new SpeechSynthesisUtterance(makePrompt(current)); utterance.rate = preferences.ttsRate; speechSynthesis.speak(utterance); showNotice('Reading the recall prompt aloud.');
  }
  if (action === 'dictate') startDictation();
  if (action === 'print') window.print();
  if (action === 'csv') download(`recall-deck-${dateStamp()}.csv`, toCsv(examples), 'text/csv');
  if (action === 'remove-license') { clearLicense(); unlocked = false; render(); showNotice('License removed from this device.'); }
}

function startDictation(): void {
  const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => { continuous: boolean; interimResults: boolean; onresult: (e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void; onerror: () => void; onend: () => void; start: () => void } }).SpeechRecognition
    ?? (window as unknown as { webkitSpeechRecognition?: new () => { continuous: boolean; interimResults: boolean; onresult: (e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void; onerror: () => void; onend: () => void; start: () => void } }).webkitSpeechRecognition;
  const status = document.querySelector('#speech-status');
  if (!SpeechRecognition) { if (status) status.textContent = 'Dictation is not supported in this browser. You can type or think aloud instead.'; return; }
  const recognition = new SpeechRecognition(); recognition.continuous = true; recognition.interimResults = false;
  recognition.onresult = event => { const transcript = Array.from(event.results).map(r => r[0].transcript).join(' '); const area = document.querySelector<HTMLTextAreaElement>('#answer'); if (area) { area.value = `${area.value} ${transcript}`.trim(); if (rehearsal) rehearsal.answer = area.value; } };
  recognition.onerror = () => { if (status) status.textContent = 'Dictation stopped. Check microphone permission, or continue by typing.'; };
  recognition.onend = () => { if (status) status.textContent = 'Dictation stopped. Audio was not saved by this app.'; };
  recognition.start(); if (status) status.textContent = 'Listening… select “Stop dictation” in your browser microphone control when finished.';
}

async function handlePreferences(event: Event): Promise<void> {
  event.preventDefault(); const data = new FormData(event.currentTarget as HTMLFormElement);
  preferences = { duration: Number(data.get('duration')), reduceMotion: data.get('reduceMotion') === 'on', ttsRate: Number(data.get('ttsRate')) };
  await savePreferences(preferences); render(); showNotice('Comfort settings saved.');
}

function dateStamp(): string { return new Date().toISOString().slice(0, 10); }
function download(name: string, content: string, type: string): void { const url = URL.createObjectURL(new Blob([content], { type })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 500); }

async function handleExport(event: Event): Promise<void> {
  event.preventDefault(); const data = new FormData(event.currentTarget as HTMLFormElement);
  try { const encrypted = await encryptExport(makeExport(examples, sessions, preferences), String(data.get('export-passphrase'))); download(`recall-deck-backup-${dateStamp()}.json`, encrypted, 'application/json'); showNotice('Encrypted backup downloaded.'); }
  catch (error) { showNotice(error instanceof Error ? error.message : 'The backup could not be created.'); }
}

async function handleImport(event: Event): Promise<void> {
  event.preventDefault(); const data = new FormData(event.currentTarget as HTMLFormElement); const file = data.get('import-file');
  if (!(file instanceof File) || !file.size) { showNotice('Choose an encrypted backup file first.'); return; }
  try {
    const imported = await decryptExport(await file.text(), String(data.get('import-passphrase')));
    if (!confirm(`Replace this deck with ${imported.examples.length} imported examples? Current examples will be overwritten.`)) return;
    await replaceAll(imported.examples, imported.sessions); await savePreferences(imported.preferences); examples = await getExamples(); sessions = await getSessions(); preferences = await getPreferences(); showNotice('Backup imported.'); location.hash = '#/deck';
  } catch (error) { showNotice(error instanceof Error ? error.message : 'The backup could not be imported.'); }
}

async function handleLicense(event: Event): Promise<void> {
  event.preventDefault(); const token = String(new FormData(event.currentTarget as HTMLFormElement).get('license-token') ?? '').trim();
  if (!token) return; storeLicense(token); showNotice('Checking your license…');
  try { unlocked = await verifyLicense(true); render(); showNotice(unlocked ? 'Unlimited features restored.' : 'That license is not active for this product.'); }
  catch { render(); showNotice('The license service could not be reached. Your free deck still works offline.'); }
}

function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  navigator.serviceWorker.register('/sw.js').then(registration => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdateToast(); });
    });
  }).catch(() => { /* app remains usable without install support */ });
}

function showUpdateToast(): void {
  const zone = document.querySelector('#toast-zone'); if (!zone) return;
  zone.innerHTML = '<div class="update-toast" role="status"><span>A fresh version is ready.</span><button class="button quiet" type="button">Reload</button></div>';
  zone.querySelector('button')?.addEventListener('click', () => location.reload());
}

async function init(): Promise<void> {
  captureLicense(); unlocked = isOptimisticallyUnlocked();
  try { [examples, sessions, preferences] = await Promise.all([getExamples(), getSessions(), getPreferences()]); }
  catch { shell(`${pageHead('Storage issue', 'Your deck could not open', 'Private browsing or browser storage settings may be blocking this app. Allow site storage, then reload.')}<button class="button primary" onclick="location.reload()">Try again</button>`); return; }
  render(); registerServiceWorker();
  if (hasLicenseToken()) verifyLicense().then(valid => { if (valid !== unlocked) { unlocked = valid; render(); showNotice(valid ? 'Unlimited features are active.' : 'License no longer active.'); } }).catch(() => { /* cached state or free tier remains available */ });
}

window.addEventListener('hashchange', () => { speechSynthesis?.cancel(); if (routeInfo().route !== 'rehearse') rehearsal = null; render(true); });
window.addEventListener('online', () => { render(); showNotice('Back online.'); });
window.addEventListener('offline', () => render());
void init();
