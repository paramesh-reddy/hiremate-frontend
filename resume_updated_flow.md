# AI Resume Studio — Production Implementation Guide
**Version 3.0 | SaaS-Grade | End-to-End**
> 30+ years perspective: This document is the **single source of truth** for engineering, product, and QA.  
> Follow it top-to-bottom. Every section is a contract — not a suggestion.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [URL & Routing Contract (Critical Fix)](#2-url--routing-contract-critical-fix)
3. [Chrome Extension — Scraper & Handoff Protocol](#3-chrome-extension--scraper--handoff-protocol)
4. [State Machine — Build Screen](#4-state-machine--build-screen)
5. [Context Resolution Decision Matrix](#5-context-resolution-decision-matrix)
6. [AI Section Generation — Per-Section with Streaming](#6-ai-section-generation--per-section-with-streaming)
7. [Resume Templates — Production System](#7-resume-templates--production-system)
8. [User Customization System](#8-user-customization-system)
9. [Keyword Intelligence Pipeline](#9-keyword-intelligence-pipeline)
10. [API Reference — Complete](#10-api-reference--complete)
11. [Database Schema — Production](#11-database-schema--production)
12. [Frontend State Management](#12-frontend-state-management)
13. [Generation Phases — Detailed](#13-generation-phases--detailed)
14. [Error Handling & Edge Cases](#14-error-handling--edge-cases)
15. [Performance & Scalability](#15-performance--scalability)
16. [Priority Roadmap](#16-priority-roadmap)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI RESUME STUDIO                             │
│                                                                     │
│  ┌──────────────┐   ┌─────────────────┐   ┌─────────────────────┐  │
│  │   Chrome     │   │  Resume         │   │  ATS Scanner +      │  │
│  │  Extension   │──▶│  Generator      │   │  Analyzer           │  │
│  │  (Scraper)   │   │  /build         │   │  /job-scan          │  │
│  └──────────────┘   └────────┬────────┘   └─────────────────────┘  │
│                              │                                      │
│                    ┌─────────▼──────────┐                           │
│                    │  Shared Context    │                           │
│                    │  Layer (Redis +    │                           │
│                    │  Postgres)         │                           │
│                    └────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Three-Tool Ecosystem

| Tool | Route | Input | Output | Primary API |
|------|-------|-------|--------|-------------|
| Resume Generator | `/resume-generator/build` | JD + Profile / Existing Resume | Tailored Resume + Editor + PDF | `POST /resume/generate` |
| ATS Scanner | `/job-scan` | Resume PDF + Job Description | ATS Score + Match Report | `POST /resume/ats-scan` |
| Resume Analyzer | `/resume-analyzer` | Resume PDF | Quality Score + Fix List | `POST /resume/analyze` |

---

## 2. URL & Routing Contract (Critical Fix)

> **This is the most important section.** Broken URLs = broken sessions = broken trust.  
> URL is the **single source of truth** for navigable state. `localStorage` is for UI-only cosmetics.

### 2.1 Canonical URL Schema

```
/resume-generator/build
  ?tailor=1              → Entry from extension (activates JD resolution)
  &job_id=<uuid>         → Job context reference from extension scrape
  &resume_id=<uuid>      → Force-select a specific resume in preview mode
  &view=inputs|preview   → Panel view state (replaces localStorage key)
  &source=extension|app  → Analytics: how the user arrived
```

### 2.2 All Valid URL Permutations

| URL | Scenario | State |
|-----|----------|-------|
| `/resume-generator/build` | Fresh generation, inputs view | `INIT → inputs` |
| `/resume-generator/build?view=preview` | Open in preview, most recent resume | `PREVIEW_MODE` |
| `/resume-generator/build?resume_id=<id>` | Open specific resume | `PREVIEW_MODE` |
| `/resume-generator/build?tailor=1` | Extension tailor, job_id pending or will open dialog | `RESOLVING_CONTEXT` |
| `/resume-generator/build?tailor=1&job_id=<id>` | Full extension tailor with known job | `AUTO_GENERATING` |
| `/resume-generator/build?tailor=1&job_id=<id>&resume_id=<id>` | Repeat tailor, resume already exists | `PREVIEW_MODE` (skip regen) |

### 2.3 Extension URL Construction (Strict Protocol)

```typescript
// chrome-extension/src/background.ts

const BASE_ORIGIN_PRIORITY = [
  () => extensionStorage.get('loginPageUrl').then(url => url ? new URL(url).origin : null),
  () => Promise.resolve('http://localhost:5173'),           // dev fallback
  () => Promise.resolve('https://app.hiremate.ai'),         // prod fallback
];

async function resolveBaseOrigin(): Promise<string> {
  for (const resolver of BASE_ORIGIN_PRIORITY) {
    const origin = await resolver();
    if (origin) return origin;
  }
  return 'https://app.hiremate.ai';
}

async function buildTailorURL(jobId: string): Promise<string> {
  const base = await resolveBaseOrigin();
  const url = new URL(`${base}/resume-generator/build`);
  url.searchParams.set('tailor', '1');
  url.searchParams.set('job_id', jobId);
  url.searchParams.set('source', 'extension');
  return url.toString();
}
```

**Example output:**
```
https://app.hiremate.ai/resume-generator/build?tailor=1&job_id=d47e2c91-3fa0-4b8e-b1cc-9a2ef83f5e0d&source=extension
```

### 2.4 Frontend URL Parsing (On Mount)

```typescript
// hooks/useResumeGeneratorParams.ts

export function useResumeGeneratorParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  return {
    tailor:    searchParams.get('tailor') === '1',
    jobId:     searchParams.get('job_id') ?? null,
    resumeId:  searchParams.get('resume_id') ?? null,
    view:      (searchParams.get('view') ?? 'inputs') as 'inputs' | 'preview',
    source:    searchParams.get('source') ?? 'app',

    // Setters — all state changes go through URL
    setResumeId: (id: string | null) => {
      if (id) searchParams.set('resume_id', id);
      else searchParams.delete('resume_id');
      setSearchParams(searchParams, { replace: true });
    },
    setView: (v: 'inputs' | 'preview') => {
      searchParams.set('view', v);
      setSearchParams(searchParams, { replace: true });
    },
  };
}
```

### 2.5 localStorage Audit — What Stays, What Moves

| Key | Current Use | Action | Reason |
|-----|-------------|--------|--------|
| `resumeGeneratorView` | Panel toggle | **→ Move to URL `?view=`** | Breaks on new tab / incognito |
| `resumeGeneratorSelectedId` | Active resume ID | **→ Move to URL `?resume_id=`** | Stale ID after delete causes wrong resume load |
| `resumeGeneratorLastTailorJobId` | Repeat-tailor detection | **→ Move to server-side** query `resumes` by `job_id` | Breaks cross-device; incognito triggers duplicate generation |
| `resumeGeneratorLeftPanelWidth` | Editor panel width | **Keep** — pure UI cosmetic | No business logic |
| `resumeGenExtensionDismissed` | Banner dismiss | **Keep** — fine in localStorage | No business logic |

---

## 3. Chrome Extension — Scraper & Handoff Protocol

### 3.1 Scraper Architecture

The extension operates as a **DOM scraper + relay**, not a processor. All business logic lives in the backend.

```typescript
// content-script.ts — runs on job listing pages

interface ScrapedJobData {
  title:        string;
  company:      string;
  description:  string;
  url:          string;
  source_site:  'linkedin' | 'indeed' | 'naukri' | 'glassdoor' | 'generic';
}

async function scrapeJobPage(): Promise<ScrapedJobData> {
  const scrapers: Record<string, () => ScrapedJobData> = {
    'linkedin.com':   scrapeLinkedIn,
    'indeed.com':     scrapeIndeed,
    'naukri.com':     scrapeNaukri,
    'glassdoor.com':  scrapeGlassdoor,
  };

  const hostname = window.location.hostname;
  const scraper = Object.entries(scrapers).find(([domain]) => hostname.includes(domain));
  return scraper ? scraper[1]() : scrapeGeneric();
}
```

### 3.2 Scraper — Site-Specific Selectors

```typescript
function scrapeLinkedIn(): ScrapedJobData {
  return {
    title:       document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim() ?? '',
    company:     document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim() ?? '',
    description: document.querySelector('.jobs-description__content')?.innerText?.trim() ?? '',
    url:         window.location.href,
    source_site: 'linkedin',
  };
}

function scrapeIndeed(): ScrapedJobData {
  return {
    title:       document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.textContent?.trim() ?? '',
    company:     document.querySelector('[data-testid="inlineHeader-companyName"]')?.textContent?.trim() ?? '',
    description: document.querySelector('#jobDescriptionText')?.innerText?.trim() ?? '',
    url:         window.location.href,
    source_site: 'indeed',
  };
}

function scrapeGeneric(): ScrapedJobData {
  // Fallback: grab largest text block on page
  const allBlocks = Array.from(document.querySelectorAll('div, section, article'))
    .map(el => ({ el, text: (el as HTMLElement).innerText }))
    .filter(({ text }) => text.length > 300)
    .sort((a, b) => b.text.length - a.text.length);

  return {
    title:       document.title,
    company:     '',
    description: allBlocks[0]?.text ?? '',
    url:         window.location.href,
    source_site: 'generic',
  };
}
```

### 3.3 Extension → Backend Handoff

```typescript
// background.ts — service worker

async function handleTailorClick(scrapedData: ScrapedJobData): Promise<void> {
  try {
    // Step 1: POST to backend — save context, get job_id
    const response = await fetch(`${await resolveBaseOrigin()}/api/chrome-extension/tailor-context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Version': chrome.runtime.getManifest().version,
      },
      credentials: 'include',  // sends auth cookie
      body: JSON.stringify(scrapedData),
    });

    if (!response.ok) throw new Error(`Backend returned ${response.status}`);

    const { job_id } = await response.json();  // { job_id: "uuid" }

    // Step 2: Build URL with job_id
    const appUrl = await buildTailorURL(job_id);

    // Step 3: Store for BASE_ORIGIN resolution on next visit
    await chrome.storage.local.set({ lastJobId: job_id, lastTailorUrl: appUrl });

    // Step 4: Open tab
    await chrome.tabs.create({ url: appUrl });

  } catch (err) {
    // Fallback: open app without job_id — user will see JD_DIALOG
    const fallbackUrl = `${await resolveBaseOrigin()}/resume-generator/build?tailor=1&source=extension&error=scrape_failed`;
    await chrome.tabs.create({ url: fallbackUrl });
  }
}
```

### 3.4 Backend — `POST /chrome-extension/tailor-context`

```typescript
// api/routes/extension.ts

router.post('/chrome-extension/tailor-context', authenticate, async (req, res) => {
  const { title, company, description, url, source_site } = req.body;

  // Upsert job record
  const job = await db.jobs.upsert({
    where: { url, user_id: req.user.id },
    create: { title, company, description, url, source_site, user_id: req.user.id },
    update: { title, company, description },  // refresh if already exists
  });

  // Create tailor_context with TTL
  const context = await db.tailor_contexts.create({
    user_id:         req.user.id,
    job_id:          job.id,
    job_description: description,
    job_title:       title,
    source:          'extension',
    expires_at:      new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hour TTL
  });

  return res.json({ job_id: job.id, context_id: context.id });
});
```

---

## 4. State Machine — Build Screen

> Implement with `useReducer` or XState. **Never** scatter state in multiple `useState` + `useEffect` hooks.

### 4.1 State Definitions

```typescript
type BuildScreenState =
  | { phase: 'INIT' }
  | { phase: 'RESOLVING_CONTEXT' }
  | { phase: 'JD_DIALOG';         prefillUrl?: string }
  | { phase: 'AUTO_GENERATING';   jobId: string; jobTitle: string }
  | { phase: 'PREVIEW_MODE';      resumeId: string; keywordScore?: number }
  | { phase: 'EDITING';           resumeId: string; section?: SectionKey }
  | { phase: 'SECTION_GENERATING'; resumeId: string; section: SectionKey }
  | { phase: 'TAILORING';         resumeId: string }
  | { phase: 'EXPORT';            resumeId: string }
  | { phase: 'ERROR';             code: ErrorCode; retryAction?: Action };

type Action =
  | { type: 'PARAMS_PARSED';        params: URLParams }
  | { type: 'WORKSPACE_LOADED';     workspace: Workspace }
  | { type: 'CONTEXT_RESOLVED';     jobId: string; jd: string; title: string }
  | { type: 'NO_CONTEXT_FOUND' }
  | { type: 'JD_SUBMITTED';         jd: string; title: string }
  | { type: 'GENERATION_STARTED';   jobId: string; jobTitle: string }
  | { type: 'GENERATION_SUCCESS';   resume: Resume }
  | { type: 'GENERATION_FAILED';    error: APIError }
  | { type: 'OPEN_PREVIEW';         resumeId: string }
  | { type: 'OPEN_EDITOR';          section?: SectionKey }
  | { type: 'SECTION_GENERATE_START'; section: SectionKey }
  | { type: 'SECTION_GENERATE_DONE';  section: SectionKey; content: string }
  | { type: 'TAILOR_MORE_CLICKED' }
  | { type: 'EXPORT_STARTED' }
  | { type: 'EXPORT_COMPLETE' };
```

### 4.2 State Transition Table

| Current State | Action | Next State |
|--------------|--------|------------|
| `INIT` | `PARAMS_PARSED` | `RESOLVING_CONTEXT` |
| `RESOLVING_CONTEXT` | `WORKSPACE_LOADED` | runs decision matrix |
| `RESOLVING_CONTEXT` | `CONTEXT_RESOLVED` | `AUTO_GENERATING` |
| `RESOLVING_CONTEXT` | `NO_CONTEXT_FOUND` | `JD_DIALOG` |
| `JD_DIALOG` | `JD_SUBMITTED` | `AUTO_GENERATING` |
| `AUTO_GENERATING` | `GENERATION_SUCCESS` | `PREVIEW_MODE` |
| `AUTO_GENERATING` | `GENERATION_FAILED` | `ERROR` |
| `PREVIEW_MODE` | `OPEN_EDITOR` | `EDITING` |
| `PREVIEW_MODE` | `TAILOR_MORE_CLICKED` | `TAILORING` |
| `PREVIEW_MODE` | `EXPORT_STARTED` | `EXPORT` |
| `EDITING` | `SECTION_GENERATE_START` | `SECTION_GENERATING` |
| `SECTION_GENERATING` | `SECTION_GENERATE_DONE` | `EDITING` |
| `TAILORING` | `GENERATION_SUCCESS` | `PREVIEW_MODE` |
| `ERROR` | `GENERATION_STARTED` | `AUTO_GENERATING` (retry) |

---

## 5. Context Resolution Decision Matrix

Runs once after workspace loads. **First matching condition wins — no fall-through.**

```typescript
async function resolveContext(params: URLParams, workspace: Workspace): Promise<Action> {
  const { resumeId, tailor, jobId } = params;

  // Priority 1: Explicit resume_id in URL
  if (resumeId && workspace.resumes.find(r => r.id === resumeId)) {
    return { type: 'OPEN_PREVIEW', resumeId };
  }

  // Priority 2: tailor=1 AND same job_id as last tailored (server-side check)
  if (tailor && jobId) {
    const existing = await api.resumes.findByJobId(jobId);
    if (existing) return { type: 'OPEN_PREVIEW', resumeId: existing.id };
  }

  // Priority 3: tailor=1 AND workspace has live tailor_context
  if (tailor && workspace.tailor_context?.job_description) {
    const ctx = workspace.tailor_context;
    if (!isExpired(ctx.expires_at)) {
      return { type: 'CONTEXT_RESOLVED', jobId: ctx.job_id, jd: ctx.job_description, title: ctx.job_title };
    }
  }

  // Priority 4: tailor=1 AND valid job_id param — fetch job
  if (tailor && jobId) {
    const job = await api.jobs.get(jobId).catch(() => null);
    if (job) {
      return { type: 'CONTEXT_RESOLVED', jobId: job.id, jd: job.description, title: job.title };
    }
  }

  // Priority 5: tailor=1 AND no JD found anywhere
  if (tailor) {
    return { type: 'NO_CONTEXT_FOUND' };
  }

  // Priority 6: No tailor, resumes exist → open most recent
  if (workspace.resumes.length > 0) {
    return { type: 'OPEN_PREVIEW', resumeId: workspace.resumes[0].id };
  }

  // Priority 7: Truly fresh — show inputs
  return { type: 'PARAMS_PARSED', params };
}
```

---

## 6. AI Section Generation — Per-Section with Streaming

> This is the core differentiator. Each resume section can be generated independently, streamed to the UI, and regenerated without touching other sections.

### 6.1 Section Keys

```typescript
type SectionKey =
  | 'summary'
  | 'experience'        // entire experience block
  | 'experience_bullet' // single bullet within one role
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'achievements'
  | 'cover_letter';     // bonus: companion section
```

### 6.2 Per-Section Generate API

```
POST /resume/:id/section/generate
```

**Request payload:**

```typescript
interface SectionGenerateRequest {
  section:          SectionKey;
  tone?:            'professional' | 'confident' | 'concise' | 'detailed';
  context?: {
    role_index?:    number;   // for experience_bullet — which role
    bullet_index?:  number;   // for experience_bullet — which bullet to rewrite
    instruction?:   string;   // user's custom instruction e.g. "make it more quantified"
  };
  stream:           boolean;  // true = SSE stream, false = full JSON
}
```

**Response (streamed):**

```typescript
// SSE events — frontend renders tokens as they arrive
data: {"delta": "Led cross-functional team"}
data: {"delta": " of 8 engineers"}
data: {"delta": " to deliver..."}
data: {"done": true, "full_content": "...", "word_count": 42}
```

### 6.3 Frontend — Section Generation UX

```typescript
// components/SectionEditor.tsx

function SectionEditor({ section, resumeId }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');

  async function handleGenerateSection(instruction?: string) {
    setIsGenerating(true);
    setStreamedContent('');

    const response = await fetch(`/api/resume/${resumeId}/section/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ section, stream: true, context: { instruction } }),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const event = JSON.parse(line.slice(6));
          if (event.delta) setStreamedContent(prev => prev + event.delta);
          if (event.done)  dispatch({ type: 'SECTION_GENERATE_DONE', section, content: event.full_content });
        }
      }
    }

    setIsGenerating(false);
  }

  return (
    <div className="section-editor">
      <div className="section-toolbar">
        <button onClick={() => handleGenerateSection()} disabled={isGenerating}>
          ✨ {isGenerating ? 'Generating...' : 'Generate with AI'}
        </button>
        <InstructionInput onSubmit={instruction => handleGenerateSection(instruction)} />
      </div>
      <div className="section-content">
        {isGenerating ? <StreamingText content={streamedContent} /> : <SectionFields section={section} />}
      </div>
    </div>
  );
}
```

### 6.4 Backend — Section Generation with LLM

```typescript
// api/routes/resume-section.ts

router.post('/resume/:id/section/generate', authenticate, async (req, res) => {
  const { section, tone, context, stream } = req.body;
  const resume = await db.resumes.findOne({ id: req.params.id, user_id: req.user.id });
  const profile = resume.current_snapshot;
  const jd = resume.job_description_snapshot;

  const prompt = buildSectionPrompt({ section, profile, jd, tone, context });

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const llmStream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      max_tokens: 600,
    });

    let fullContent = '';
    for await (const chunk of llmStream) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      fullContent += delta;
      if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true, full_content: fullContent, word_count: fullContent.split(' ').length })}\n\n`);
    res.end();
  } else {
    const result = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ content: result.choices[0].message.content });
  }
});
```

### 6.5 Section Prompt Templates

```typescript
const SECTION_PROMPTS: Record<SectionKey, (ctx: PromptContext) => string> = {
  summary: ({ profile, jd, tone }) => `
    You are an expert resume writer. Write a compelling professional summary for this candidate.
    
    Candidate Profile: ${JSON.stringify(profile.basics)}
    Target Job Description: ${jd}
    Tone: ${tone ?? 'professional'}
    
    Rules:
    - 3-4 sentences maximum
    - Lead with years of experience and core expertise
    - Mirror 2-3 key terms from the JD naturally
    - End with a value proposition statement
    - NO first-person pronouns (no "I", "my", "me")
    - Output only the summary text, no labels or formatting
  `,

  skills: ({ profile, jd }) => `
    Extract and organize skills for this resume.
    
    Candidate's Current Skills: ${profile.skills.join(', ')}
    Job Description Keywords: ${jd}
    
    Rules:
    - Group into: Technical Skills | Tools & Platforms | Soft Skills
    - Prioritize skills that appear in the JD
    - Add 2-3 relevant skills the candidate likely has based on experience (mark as inferred)
    - Format: Category: skill1, skill2, skill3
    - Maximum 5 skills per category
  `,

  experience_bullet: ({ profile, jd, context }) => `
    Rewrite this experience bullet point to be more impactful.
    
    Original bullet: "${context?.instruction ?? profile.experience[context?.role_index ?? 0].bullets[context?.bullet_index ?? 0]}"
    Role: ${profile.experience[context?.role_index ?? 0]?.title}
    Company: ${profile.experience[context?.role_index ?? 0]?.company}
    JD context: ${jd?.slice(0, 500)}
    ${context?.instruction ? `User instruction: ${context.instruction}` : ''}
    
    Rules:
    - Start with a strong action verb (Led, Built, Reduced, Increased, Delivered...)
    - Include ONE quantified metric if possible (%, $, time saved, users, etc.)
    - One line max — 15-20 words ideal
    - Mirror relevant JD language naturally
    - Output only the rewritten bullet, no labels
  `,
};
```

---

## 7. Resume Templates — Production System

### 7.1 Template Registry

```typescript
interface ResumeTemplate {
  id:             string;
  name:           string;
  thumbnail:      string;         // static preview image URL
  category:       TemplateCategory;
  ats_score:      number;         // 0-100: how ATS-friendly
  best_for:       string[];       // e.g. ['tech', 'senior', 'creative']
  premium:        boolean;
  fonts:          string[];       // available font choices for this template
  color_schemes:  ColorScheme[];
  sections_order: SectionKey[];   // default section order (user can reorder)
  layout:         'single_column' | 'two_column' | 'sidebar';
}

type TemplateCategory = 'classic' | 'modern' | 'creative' | 'minimal' | 'executive' | 'academic';
```

### 7.2 Template Definitions (Production-Grade)

```typescript
export const TEMPLATES: ResumeTemplate[] = [
  {
    id: 'classic-pro',
    name: 'Classic Pro',
    category: 'classic',
    ats_score: 98,
    best_for: ['all', 'ats-optimized', 'corporate'],
    premium: false,
    layout: 'single_column',
    fonts: ['Georgia', 'Times New Roman', 'Garamond'],
    color_schemes: [
      { id: 'default', primary: '#1a1a1a', accent: '#2c5f8a', bg: '#ffffff' },
      { id: 'navy',    primary: '#0d2b4e', accent: '#c8a84b', bg: '#ffffff' },
    ],
    sections_order: ['summary', 'experience', 'education', 'skills', 'certifications'],
  },
  {
    id: 'modern-edge',
    name: 'Modern Edge',
    category: 'modern',
    ats_score: 92,
    best_for: ['tech', 'product', 'startup'],
    premium: false,
    layout: 'two_column',
    fonts: ['Inter', 'Roboto', 'DM Sans'],
    color_schemes: [
      { id: 'indigo',  primary: '#1e1b4b', accent: '#6366f1', bg: '#f8fafc' },
      { id: 'emerald', primary: '#064e3b', accent: '#10b981', bg: '#f0fdf4' },
    ],
    sections_order: ['summary', 'skills', 'experience', 'projects', 'education'],
  },
  {
    id: 'executive-slate',
    name: 'Executive Slate',
    category: 'executive',
    ats_score: 96,
    best_for: ['senior', 'director', 'vp', 'c-suite'],
    premium: true,
    layout: 'single_column',
    fonts: ['Playfair Display', 'EB Garamond', 'Lora'],
    color_schemes: [
      { id: 'charcoal', primary: '#1c1c1e', accent: '#8b7355', bg: '#fefefe' },
    ],
    sections_order: ['summary', 'experience', 'achievements', 'education', 'skills'],
  },
  {
    id: 'minimal-zen',
    name: 'Minimal Zen',
    category: 'minimal',
    ats_score: 99,
    best_for: ['ats-optimized', 'consulting', 'finance'],
    premium: false,
    layout: 'single_column',
    fonts: ['Helvetica Neue', 'Arial', 'Source Sans Pro'],
    color_schemes: [
      { id: 'mono', primary: '#000000', accent: '#000000', bg: '#ffffff' },
    ],
    sections_order: ['summary', 'experience', 'education', 'skills'],
  },
  {
    id: 'creative-spark',
    name: 'Creative Spark',
    category: 'creative',
    ats_score: 74,
    best_for: ['design', 'marketing', 'creative', 'media'],
    premium: true,
    layout: 'sidebar',
    fonts: ['Poppins', 'Raleway', 'Nunito'],
    color_schemes: [
      { id: 'coral',    primary: '#1a1a2e', accent: '#e94560', bg: '#f5f5f5' },
      { id: 'teal',     primary: '#0f3460', accent: '#00b4d8', bg: '#f8f9fa' },
    ],
    sections_order: ['summary', 'skills', 'experience', 'projects', 'education', 'achievements'],
  },
];
```

### 7.3 Template HTML Rendering Engine

```typescript
// server/resume-renderer/index.ts

export async function renderResumeHTML(resume: Resume, template: ResumeTemplate): Promise<string> {
  const templateRenderer = TEMPLATE_RENDERERS[template.layout];
  const styles = buildTemplateCSS(template, resume.design_config);
  const body = templateRenderer(resume.content, template);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(resume.design_config.font_family)}&display=swap" rel="stylesheet">
  <style>${styles}</style>
</head>
<body class="resume-body template-${template.id}">
  ${body}
</body>
</html>`;
}
```

### 7.4 Template Switching (Zero Data Loss)

```typescript
// Switching templates never loses user data
// Only the visual wrapper changes — content is preserved in snapshot

async function switchTemplate(resumeId: string, newTemplateId: string): Promise<void> {
  await api.resumes.patch(resumeId, {
    template_id: newTemplateId,
    // Only visual — no profile_snapshot mutation
  });
  // Trigger live preview re-render
  dispatch({ type: 'TEMPLATE_CHANGED', templateId: newTemplateId });
}
```

---

## 8. User Customization System

> This is where SaaS products win or lose. Give users control at every level.

### 8.1 Design Config Schema

```typescript
interface DesignConfig {
  // Typography
  font_family:          string;       // 'Inter', 'Georgia', etc.
  font_size_base:       number;       // 10 | 11 | 12 (pt)
  line_height:          number;       // 1.2 | 1.4 | 1.6
  font_weight_name:     400 | 600;    // light vs bold name
  font_weight_body:     400 | 500;

  // Colors
  color_primary:        string;       // hex — name, company
  color_accent:         string;       // hex — section headers, dividers
  color_body:           string;       // hex — body text
  color_background:     string;       // hex — page background

  // Spacing
  margin_top_mm:        number;       // 10-25
  margin_side_mm:       number;       // 10-25
  section_spacing:      'compact' | 'normal' | 'spacious';
  bullet_indent:        'none' | 'small' | 'standard';

  // Sections
  sections_visible:     SectionKey[];          // user can hide sections
  sections_order:       SectionKey[];          // user can reorder via drag
  show_photo:           boolean;
  show_linkedin:        boolean;
  show_github:          boolean;
  show_location:        boolean;

  // Paper
  paper_size:           'A4' | 'US_Letter';

  // Template
  template_id:          string;
  color_scheme_id:      string;
}
```

### 8.2 Customization Panel UI Spec

```
┌─────────────────────────────────────┐
│  CUSTOMIZE                          │
├─────────────────────────────────────┤
│  📄 Templates                       │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐         │
│  │  │ │  │ │  │ │  │ │  │         │
│  └──┘ └──┘ └──┘ └──┘ └──┘         │
│  Classic Modern Exec Minimal Creativ│
├─────────────────────────────────────┤
│  🎨 Color Scheme                    │
│  ● Default  ○ Navy  ○ Teal          │
│  [Custom color picker]              │
├─────────────────────────────────────┤
│  🔤 Typography                      │
│  Font:  [Inter ▼]                   │
│  Size:  [10 ● 11 ○ 12]             │
│  Line:  ─────●──── 1.4             │
├─────────────────────────────────────┤
│  📏 Spacing                         │
│  Margins: [─●───] 15mm             │
│  Sections: Compact ● Normal ○ Wide  │
├─────────────────────────────────────┤
│  🔲 Sections (drag to reorder)      │
│  ☑ ≡ Summary                       │
│  ☑ ≡ Experience                    │
│  ☑ ≡ Skills                        │
│  ☑ ≡ Education                     │
│  ☐ ≡ Certifications                │
│  ☐ ≡ Projects                      │
├─────────────────────────────────────┤
│  📤 Paper Size: ● A4  ○ US Letter   │
└─────────────────────────────────────┘
```

### 8.3 User Preferences (Persisted to Profile)

```typescript
interface UserResumePreferences {
  // Auto-saved to user profile — applied to all new resumes
  default_template_id:      string;
  default_font_family:      string;
  default_color_scheme:     string;
  preferred_paper_size:     'A4' | 'US_Letter';
  default_tone:             'professional' | 'confident' | 'concise';
  show_keyword_score:       boolean;
  auto_save_interval_ms:    300 | 500 | 1000;
  preferred_sections:       SectionKey[];
}
```

### 8.4 Custom Section Builder

Users can add non-standard sections:

```typescript
interface CustomSection {
  id:         string;
  label:      string;       // user-defined: "Publications", "Patents", "Languages"
  type:       'list' | 'bullets' | 'freetext' | 'dated_entries';
  position:   number;       // order in sections_order
  content:    CustomSectionContent;
}
```

---

## 9. Keyword Intelligence Pipeline

### 9.1 Architecture

```
JD text
  │
  ▼
[Client NLP — quick extract] ──────────────────────────────▶ target_keywords[]
  │                                                                  │
  │                                                                  ▼
  │                                                    [Backend LLM prompt injection]
  │                                                                  │
  ▼                                                                  ▼
[Backend — deep extract via LLM]                         Generated Resume Content
  │                                                                  │
  ▼                                                                  ▼
ranked_keywords[]                                        [Score: matched / total]
                                                                  │
                                                                  ▼
                                                        keyword_score (0–100)
```

### 9.2 Client-Side NLP (Pre-Generation Extract)

```typescript
// utils/keywordExtractor.ts

const STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);

export function extractKeywords(jd: string): string[] {
  // 1. Extract noun phrases and technical terms
  const words = jd
    .toLowerCase()
    .replace(/[^\w\s+#.]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));

  // 2. Count frequency
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) ?? 0) + 1));

  // 3. Identify known tech terms (always include even if freq=1)
  const TECH_TERMS = new Set(['react', 'typescript', 'python', 'aws', 'docker', 'kubernetes', 'postgresql', 'graphql', 'rest', 'api', 'ci/cd', 'agile', 'scrum']);
  const techFound = words.filter(w => TECH_TERMS.has(w));

  // 4. Sort by freq, deduplicate, include tech terms
  return [...new Set([
    ...techFound,
    ...[...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([w]) => w),
  ])].slice(0, 30);
}
```

### 9.3 Server-Side Deep Keyword Extraction

```typescript
// POST /resume/keywords/extract — called server-side during generation
async function extractKeywordsDeep(jd: string): Promise<RankedKeyword[]> {
  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',   // fast + cheap for extraction
    messages: [{
      role: 'user',
      content: `Extract the most important keywords from this job description for resume optimization.
      
      Return JSON array: [{ "term": string, "importance": "critical"|"important"|"nice_to_have", "category": "technical"|"soft_skill"|"domain"|"tool" }]
      Maximum 40 keywords. Only JSON, no explanation.
      
      JD: ${jd.slice(0, 3000)}`,
    }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(result.choices[0].message.content!).keywords ?? [];
}
```

### 9.4 Keyword Match Scoring

```typescript
function scoreKeywords(resumeText: string, keywords: RankedKeyword[]): KeywordScore {
  const text = resumeText.toLowerCase();
  const results = keywords.map(kw => ({
    ...kw,
    found: text.includes(kw.term.toLowerCase()),
  }));

  const weights = { critical: 3, important: 2, nice_to_have: 1 };
  const totalWeight = results.reduce((sum, k) => sum + weights[k.importance], 0);
  const matchWeight = results.filter(k => k.found).reduce((sum, k) => sum + weights[k.importance], 0);

  return {
    score:    Math.round((matchWeight / totalWeight) * 100),
    matched:  results.filter(k => k.found),
    missing:  results.filter(k => !k.found),
    critical_missing: results.filter(k => !k.found && k.importance === 'critical'),
  };
}
```

---

## 10. API Reference — Complete

### 10.1 All Endpoints

| Method | Endpoint | Purpose | Auth | Status |
|--------|----------|---------|------|--------|
| `GET` | `/resume/workspace` | Init: resumes + tailor context | ✅ | Refactor — split into separate calls |
| `GET` | `/resume/list` | Paginated resume list | ✅ | Current |
| `GET` | `/resume/:id` | Full resume record | ✅ | Add — currently missing |
| `POST` | `/resume/generate` | Generate or re-tailor | ✅ | Current + extend |
| `POST` | `/resume/:id/section/generate` | Per-section AI generation with streaming | ✅ | **New** |
| `GET` | `/resume/:id/versions` | Version history list | ✅ | New |
| `GET` | `/resume/:id/versions/:vId` | Specific version snapshot | ✅ | New |
| `PATCH` | `/resume/:id/snapshot` | Save profile snapshot (debounced) | ✅ | Split from generic PATCH |
| `PATCH` | `/resume/:id/rename` | Rename title only | ✅ | Split from generic PATCH |
| `PATCH` | `/resume/:id/design` | Save design config changes | ✅ | **New** |
| `PATCH` | `/resume/:id/sections-order` | Save user's drag-reordered sections | ✅ | **New** |
| `DELETE` | `/resume/:id` | Delete resume | ✅ | Current |
| `POST` | `/resume/preview-html` | Live HTML preview | ✅ | Current |
| `POST` | `/resume/preview` | Generate PDF blob | ✅ | Current |
| `POST` | `/resume/upload` | Upload existing PDF | ✅ | Current |
| `POST` | `/resume/keywords/extract` | Extract keywords from JD | ✅ | **New — server-side** |
| `POST` | `/resume/keywords/analyze` | On-demand keyword score | ✅ | Rename + move |
| `GET` | `/jobs/:id` | Job fetch by ID | ✅ | Current |
| `POST` | `/chrome-extension/tailor-context` | Save scraped JD → return job_id | ✅ | Current |
| `GET` | `/tailor-context/:jobId` | Fetch context by job ID | ✅ | New |
| `GET` | `/resume/templates` | List all available templates | Public | **New** |
| `GET` | `/user/preferences` | Load user resume preferences | ✅ | **New** |
| `PATCH` | `/user/preferences` | Save user resume preferences | ✅ | **New** |

### 10.2 `POST /resume/generate` — Payload

```typescript
interface GenerateRequest {
  // Required
  job_title:            string;         // fallback to "Resume" if empty
  job_description:      string;

  // Generation context
  resume_id?:           string;         // if present → tailor-more on existing
  profile_override?:    ProfileSnapshot; // current editor state for re-tailor quality
  target_keywords?:     string[];       // client-extracted keywords for AI guidance
  ranked_keywords?:     RankedKeyword[]; // server-extracted with importance weights

  // Design
  template_id?:         string;         // default: 'classic-pro'
  design_config?:       Partial<DesignConfig>;

  // Metadata
  version_trigger?:     'initial_generate' | 'tailor_more' | 'upload'; // audit trail
  tone?:                'professional' | 'confident' | 'concise' | 'detailed';
}
```

### 10.3 `POST /resume/generate` — Response

```typescript
interface GenerateResponse {
  id:               string;       // resume UUID (created or updated)
  title:            string;
  content:          ProfileSnapshot;
  keyword_score:    number;       // 0–100 match % at generation time
  keyword_details:  KeywordScore; // matched / missing breakdown
  version_number:   number;       // this generation's version index
  template_id:      string;
  preview_html?:    string;       // optional: return HTML to avoid second round-trip
  created_at:       string;
  updated_at:       string;
}
```

---

## 11. Database Schema — Production

### 11.1 `resumes` — Core Record

```sql
CREATE TABLE resumes (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title                     VARCHAR(255)  NOT NULL,
  template_id               VARCHAR(50)   NOT NULL DEFAULT 'classic-pro',
  design_config             JSONB         NOT NULL DEFAULT '{}',
  job_id                    UUID          REFERENCES jobs(id) ON DELETE SET NULL,
  job_description_snapshot  TEXT,
  keyword_score             SMALLINT      CHECK (keyword_score BETWEEN 0 AND 100),
  keyword_details           JSONB,
  status                    VARCHAR(20)   NOT NULL DEFAULT 'ready'
                              CHECK (status IN ('generating', 'ready', 'error')),
  current_version_id        UUID,         -- FK added after resume_versions table
  sections_order            JSONB         NOT NULL DEFAULT '[]',
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_resumes_user_id      ON resumes(user_id);
CREATE INDEX idx_resumes_job_id       ON resumes(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX idx_resumes_user_updated ON resumes(user_id, updated_at DESC);
```

### 11.2 `resume_versions` — Version History (Critical — Implement First)

```sql
CREATE TABLE resume_versions (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id         UUID          NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  version_number    SMALLINT      NOT NULL,
  profile_snapshot  JSONB         NOT NULL,
  design_config     JSONB         NOT NULL DEFAULT '{}',
  trigger           VARCHAR(30)   NOT NULL
                      CHECK (trigger IN ('initial_generate', 'tailor_more', 'manual_edit', 'upload', 'section_edit')),
  keyword_score     SMALLINT,
  keyword_details   JSONB,
  jd_snapshot       TEXT,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (resume_id, version_number)
);

CREATE INDEX idx_resume_versions_resume_id ON resume_versions(resume_id, version_number DESC);
```

### 11.3 `tailor_contexts` — Session Context with TTL

```sql
CREATE TABLE tailor_contexts (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id            UUID          REFERENCES jobs(id) ON DELETE SET NULL,
  job_description   TEXT          NOT NULL,
  job_title         VARCHAR(255),
  source            VARCHAR(20)   NOT NULL
                      CHECK (source IN ('extension', 'manual_paste', 'job_listing')),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  expires_at        TIMESTAMPTZ   NOT NULL DEFAULT (now() + INTERVAL '4 hours')
);

-- Auto-cleanup expired contexts (run via pg_cron or background job)
CREATE INDEX idx_tailor_contexts_expires ON tailor_contexts(expires_at);
CREATE INDEX idx_tailor_contexts_user    ON tailor_contexts(user_id, created_at DESC);
```

### 11.4 `jobs` — Job Listing Records

```sql
CREATE TABLE jobs (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(255)  NOT NULL,
  company       VARCHAR(255),
  description   TEXT          NOT NULL,
  url           VARCHAR(1000),
  source_site   VARCHAR(30),  -- 'linkedin', 'indeed', 'naukri', 'generic'
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (user_id, url)       -- prevent duplicate jobs from same URL
);

CREATE INDEX idx_jobs_user_id ON jobs(user_id, created_at DESC);
```

### 11.5 `user_resume_preferences`

```sql
CREATE TABLE user_resume_preferences (
  user_id               UUID          PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  default_template_id   VARCHAR(50)   NOT NULL DEFAULT 'classic-pro',
  default_font_family   VARCHAR(100)  NOT NULL DEFAULT 'Inter',
  default_color_scheme  VARCHAR(50)   NOT NULL DEFAULT 'default',
  preferred_paper_size  CHAR(10)      NOT NULL DEFAULT 'A4',
  default_tone          VARCHAR(20)   NOT NULL DEFAULT 'professional',
  show_keyword_score    BOOLEAN       NOT NULL DEFAULT true,
  auto_save_ms          SMALLINT      NOT NULL DEFAULT 300,
  preferred_sections    JSONB         NOT NULL DEFAULT '[]',
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

## 12. Frontend State Management

### 12.1 State Architecture

```
URL Params (source of truth for navigation)
    │
    ▼
useReducer (BuildScreen state machine)
    │
    ├──▶ useWorkspace()           — resume list, tailor context
    ├──▶ useResumeEditor()        — active resume content
    ├──▶ useDesignConfig()        — template + style settings
    ├──▶ useKeywordScore()        — keyword match state
    └──▶ useVersionHistory()      — version list for active resume

localStorage (UI-only, no business logic)
    ├── resumeGeneratorLeftPanelWidth
    └── resumeGenExtensionDismissed
```

### 12.2 Custom Hooks

```typescript
// hooks/useResumeEditor.ts

export function useResumeEditor(resumeId: string | null) {
  const [snapshot, setSnapshot] = useState<ProfileSnapshot | null>(null);
  const debouncedSave = useDebounce(snapshot, 300);

  // Auto-save on change
  useEffect(() => {
    if (!debouncedSave || !resumeId) return;
    api.resumes.saveSnapshot(resumeId, debouncedSave);
  }, [debouncedSave, resumeId]);

  // Optimistic section update
  const updateSection = useCallback((section: SectionKey, value: unknown) => {
    setSnapshot(prev => prev ? { ...prev, [section]: value } : prev);
  }, []);

  return { snapshot, updateSection };
}
```

### 12.3 Debounced Snapshot Save

```typescript
// Flush immediately before Tailor More / Download to prevent data loss
function useFlushableDebounce<T>(value: T, delay: number) {
  const timerRef = useRef<NodeJS.Timeout>();
  const pendingRef = useRef<T>(value);

  useEffect(() => {
    pendingRef.current = value;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveFn(value), delay);
  }, [value]);

  const flush = useCallback(async () => {
    clearTimeout(timerRef.current);
    await saveFn(pendingRef.current);
  }, []);

  return { flush };
}
```

---

## 13. Generation Phases — Detailed

### Full Sequence: Extension → Build → Download

```
Extension (content-script)
  │
  ├─ 1. User clicks "Tailor Resume"
  ├─ 2. scrapeJobPage() → { title, company, description, url }
  ├─ 3. POST /chrome-extension/tailor-context → { job_id }
  ├─ 4. buildTailorURL(job_id) → full URL with params
  └─ 5. chrome.tabs.create({ url })

Frontend (component mounts)
  │
  ├─ 6. useResumeGeneratorParams() → parse { tailor, job_id }
  ├─ 7. GET /resume/workspace → { resumes, tailor_context }
  ├─ 8. resolveContext() → decision matrix → Action
  ├─ 9. dispatch(GENERATION_STARTED)
  │
  ├─ Phase B: extractKeywords(jd) → target_keywords[]
  │
  ├─ 10. POST /resume/generate { jd, profile, target_keywords }
  │         ├─ LLM: generate resume with keyword awareness
  │         ├─ Score: scoreKeywords(output, keywords)
  │         ├─ DB: INSERT resumes + resume_versions (v1)
  │         └─ Response: { id, content, keyword_score, version_number }
  │
  ├─ 11. dispatch(GENERATION_SUCCESS) → PREVIEW_MODE
  ├─ 12. Render ResumeHtmlPreview (right panel)
  │
  User edits (left panel editor)
  │
  ├─ 13. updateSection(section, value) → debounced snapshot
  ├─ 14. PATCH /resume/:id/snapshot (300ms debounce)
  │
  Per-section AI (optional)
  │
  ├─ 15. POST /resume/:id/section/generate { section, stream: true }
  ├─ 16. Stream tokens → live render in section field
  │
  Tailor More
  │
  ├─ 17. flush() → PATCH /resume/:id/snapshot (immediate)
  ├─ 18. POST /resume/generate { resume_id, profile_override, target_keywords }
  ├─ 19. DB: UPDATE resumes, INSERT resume_versions (v2)
  └─ 20. dispatch(GENERATION_SUCCESS) → PREVIEW_MODE (v2)

Download
  │
  ├─ 21. POST /resume/preview → PDF blob
  └─ 22. URL.createObjectURL + anchor.click() → file download
```

---

## 14. Error Handling & Edge Cases

| Scenario | Detection | Recovery |
|----------|-----------|----------|
| Generate API failure | `response.ok === false` | Show error with retry CTA; preserve last good preview |
| No JD found in tailor flow | Priority 5 in decision matrix | Open `JD_DIALOG` with auto-focus; track analytics event |
| Invalid `resume_id` in URL | 404 from `GET /resume/:id` | Clear URL param; show most recent resume |
| No resumes after delete | Empty workspace after `DELETE` | Navigate to `/resume-generator` start screen (not hub) |
| Extension context expired | `expires_at < now()` | Prompt user to re-paste JD; do NOT silently use stale context |
| Tailor More on unchanged content | Hash content before/after diff | Warn user: "No new content to tailor — consider editing first" |
| Generation timeout (>30s) | Poll `GET /resume/:id` every 3s on `status=generating` | Show async progress UI; no UI hang |
| Concurrent edits (2 tabs) | `updated_at` optimistic lock | If `updated_at` mismatch on PATCH → fetch latest → merge or warn |
| Scraper returns empty JD | `description.length < 50` | Fall back to `JD_DIALOG`; log scrape failure with site+URL |
| LLM returns malformed JSON | Try/catch on parse | Retry once; on second fail → `ERROR` state with support link |
| PDF generation failure | Puppeteer/wkhtmltopdf crash | Offer "Download as HTML" fallback |

---

## 15. Performance & Scalability

### 15.1 API Response Time Targets

| Endpoint | P50 Target | P95 Target |
|----------|-----------|-----------|
| `GET /resume/workspace` | < 200ms | < 500ms |
| `POST /resume/generate` | < 8s | < 15s |
| `POST /resume/:id/section/generate` | First token < 1s | - |
| `PATCH /resume/:id/snapshot` | < 100ms | < 200ms |
| `POST /resume/preview-html` | < 500ms | < 1s |
| `POST /resume/preview` (PDF) | < 3s | < 6s |

### 15.2 Caching Strategy

```typescript
// Redis cache keys
const CACHE_KEYS = {
  workspace:      (userId: string) => `workspace:${userId}`,         // TTL: 60s
  resumeHtml:     (resumeId: string, versionId: string) => `html:${resumeId}:${versionId}`, // TTL: 5min
  keywordExtract: (jdHash: string) => `keywords:${jdHash}`,          // TTL: 1hr
  templateList:   () => 'templates:all',                             // TTL: 24hr
};
```

### 15.3 Generation Queue (For Scale)

```typescript
// Use BullMQ for async generation at scale
const resumeGenerationQueue = new Queue('resume-generation', { connection: redis });

// Producer (API handler)
await resumeGenerationQueue.add('generate', { userId, payload }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
});

// Consumer (worker)
const worker = new Worker('resume-generation', async job => {
  const result = await generateResume(job.data.payload);
  await db.resumes.update({ id: job.data.resumeId, status: 'ready', ...result });
  await pusher.trigger(`user-${job.data.userId}`, 'resume:ready', { resumeId: job.data.resumeId });
});
```

---

## 16. Priority Roadmap

### P0 — Blocking (Ship First)

| Feature | Why | Effort | Owner |
|---------|-----|--------|-------|
| `resume_versions` table + version history UI | Every Tailor More is a destructive write today | M | Backend + Frontend |
| URL-first state (remove localStorage business logic) | Incognito breaks, shareable links broken | S | Frontend |
| Split `PATCH /resume/:id` into `/snapshot` and `/rename` | Generic PATCH is a maintenance bomb | S | Backend |
| `tailor_contexts.expires_at` TTL enforcement | Stale JD triggers wrong generations | S | Backend |

### P1 — High ROI

| Feature | Why | Effort |
|---------|-----|--------|
| Per-section AI generation with streaming | Core UX differentiator — "Generate this bullet with AI" | M |
| Keyword extraction pre-generation (server-side) | Makes Tailor More actually intelligent | M |
| Template system with 5 production templates | First visual hook for new users | L |
| User design config + preferences persistence | Reduces friction on every subsequent resume | M |

### P2 — Meaningful

| Feature | Why | Effort |
|---------|-----|--------|
| Version diff view (before/after Tailor More) | Major engagement + "wow" moment | L |
| Custom instruction per section ("make this more concise") | Power user retention | M |
| Drag-to-reorder sections | Requested by >40% of resume tool users | M |
| Generation status polling (async at scale) | Required when LLM latency spikes | M |

### P3 — Polish

| Feature | Why | Effort |
|---------|-----|--------|
| Concurrent edit protection (optimistic locking) | Edge case — multi-tab same resume | M |
| Resume analytics (views, downloads, applications) | Engagement loop | L |
| Cover letter companion generation | Natural upsell for premium | M |
| ATS pre-check before download | Confidence builder — "your resume passes ATS" | M |

---
