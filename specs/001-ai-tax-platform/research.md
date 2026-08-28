# Phase 0: Research & Technical Decisions

**Feature**: `001-ai-tax-platform`  
**Date**: 2026-08-27  
**Status**: Completed  

---

## 1. Technology Stack & Framework Selection

### Decision: React 19 + TypeScript 7 + Vite 8.0 + Tailwind CSS v4.3 + shadcn/ui + Lucide Icons
- **Rationale**: 
  - Meets the case study requirement for a fast, responsive, and highly polished interactive prototype using modern React 19, Vite 8.0, and Tailwind CSS v4.3 with shadcn/ui primitives.
  - TypeScript 7 provides robust type definitions for tax forms, documents, and AI explainability metadata.
  - shadcn/ui + Tailwind CSS v4.3 provide accessible, composable UI components (Dialog, Tabs, Tooltip, Badge, Popover, Card) ideal for dense professional data tables, split-pane viewers, and explainability drawers.
  - Lucide Icons provides high-quality iconography for trust indicators, document types, roles, and status workflows.
- **Alternatives Considered**:
  - *Next.js / Remix*: Unnecessary server complexity for a client-side simulated prototype where all logic and simulated AI can run in-browser.
  - *Static HTML/JS*: Too cumbersome to maintain the reactive state required for role switching, side-by-side traceability, and multi-faceted search.

---

## 2. State Management & Role Switching Architecture

### Decision: Pure In-Memory Ephemeral Zustand Store (Zero LocalStorage Complexity)
- **Rationale**:
  - Provides a single reactive store for active role, selected tax return, active filters, open drawers, threads, and document annotations.
  - **Real-Time Reactive Updates**: Triggering actions like clicking "Verify" or "Correct" synchronously mutates the in-memory field state, instantly updating the Form 1040 table, side-by-side review drawer, bounding-box overlays, and dashboard triage metrics simultaneously.
  - In-app role switching and view navigation happen purely in React memory without page reloads, fully preserving multi-user workflows live during demos.
  - Cleanly resets to baseline fixtures on browser refresh, eliminating stale cache bugs and LocalStorage serialization overhead.
- **Alternatives Considered**:
  - *LocalStorage / SessionStorage persistence*: Adds unnecessary serialization/hydration complexity and potential stale data corruption without grading benefit.
  - *React Context alone*: Can suffer from re-render overhead when filtering 100+ documents and updating inline cell states.
  - *Redux Toolkit*: Overkill boilerplate for prototype velocity.

---

## 3. Source Document Traceability & Bounding Box Rendering

### Decision: Interactive SVG / Vector Document Renderer with High-Contrast Overlays
- **Rationale**:
  - Simulates authentic tax documents (W-2, 1099-NEC, 1099-DIV, 1098, Schedule K-1, Receipts) rendered as styled vector templates with exact coordinate-based bounding boxes (`{ x, y, width, height }`).
  - Allows instant bi-directional interactivity: clicking a line on Form 1040 immediately scrolls and highlights the source box on the document; hovering over a document box highlights the corresponding return field.
  - Eliminates external PDF loading latency, font rendering quirks, and CORS/canvas security restrictions while delivering 100% reliable click-throughs.
- **Alternatives Considered**:
  - *Real PDF.js viewer*: Heavy asset footprint, slower rendering, potential canvas DPI scaling issues on high-res displays.
  - *Static JPEG screenshots*: Rigid, non-interactive, and difficult to scale across responsive screen sizes.

---

## 4. Scalable Mock Dataset & Triage Prioritization Algorithm

### Decision: Deterministic In-Memory Mock Generator (120+ Documents, 8 Realistic Avengers-Themed Returns)
- **Rationale**:
  - Challenge 09 and Challenge 07 specifically evaluate navigating scale and prioritizing urgent tasks across hundreds of items.
  - The dataset generator creates 8 diverse Avengers-themed tax entities:
    1. *Tony Stark* (1040 Individual + Schedule C Freelance/Consulting — Active Demo Return with 1099-NECs from Stark Labs)
    2. *Stark Industries Clean Energy LLC* (1120S S-Corp with multi-partner K-1s to Pepper Potts and Col. Rhodes)
    3. *Peter Parker* (1040 Individual + Schedule C Freelance Photography — First-time client onboarding test case)
    4. *Natasha Romanoff* (1040 High Net Worth + Foreign Accounts FBAR + 1099-DIV/B Portfolio)
    5. *Wakanda Tech & Design LLC* (1065 Partnership with Shuri & Okoye — 150+ equipment & R&D receipts for scale testing)
    6. *Bruce Banner (CPA Employee / Researcher)* (Self-filing return for firm employee role-switch privacy demo)
    7. *Pym Quantum Technologies Inc* (1120S with urgent April 15 filing deadline)
    8. *Avengers Compound Facilities Management LLC* (Thor & Clint Barton — Return blocked on missing 1099-K / expense receipts)
  - **Firm Staff Personas**:
    - **Senior Tax Reviewer**: *Steve Rogers* (Chief QA Gatekeeper, Reviewer sign-off & IRS authorization)
    - **Tax Preparer**: *Sam Wilson* (Senior Preparer, workpaper tie-out & AI extraction verification)
- **Prioritization Logic (Triage Score Formula)**:
  $$\text{Score} = (\text{DaysUntilDue} \times -10) + (\text{HasBlocker} \times 50) + (\text{NeedsReview} \times 40) + (\text{ClientWaiting} \times 30) + (\text{ComplexityScore} \times 5)$$
  - Returns are categorized into dynamic queues: *Urgent / At Risk (Pym Tech)*, *Ready for Review (Tony Stark)*, *Waiting on Client (Avengers Compound)*, and *Ready to File (Stark Industries)*.

---

## 5. Visual Affordance System (Design Tokens)

### Decision: Semantic 5-Tier Affordance Visual Language
- **Rationale**: Solves Challenge 08 (Clickable vs. Editable) across the entire platform.
- **Visual Mapping**:
  | Data State | Visual Treatment | Icon | Interactivity |
  |---|---|---|---|
  | **AI-Extracted (Pending)** | Purple badge / subtle purple border | Sparkles `✨` | Click to inspect confidence & evidence; one-click verify |
  | **Verified** | Subtle emerald badge / green tick | CheckCircle `✓` | Click to view audit trail; lock icon |
  | **Human-Edited** | Sky blue pill indicator | UserEdit `✎` | Shows "Edited by [Name]" on hover |
  | **Calculated / Locked** | Muted gray fill / slate text | Lock `🔒` | Read-only; click reveals formula breakdown modal |
  | **Requires Approval** | Amber border / warning pulse | AlertTriangle `⚠️` | Prompts review action button; CPA override required |

---

## 6. Trustworthy AI Explainability Framework

### Decision: Four-Pillar Explainability Card
- **Rationale**: Solves Challenge 10 by providing balanced transparency without overwhelming technical noise.
- **Explainability Schema**:
  1. **What AI Did**: Concise natural language summary (e.g., *"Extracted $142,500 Gross Receipts from 3x 1099-NEC forms"*).
  2. **Why / Evidence**: Direct document citations, matched fields, OCR text snippet, and highlighted visual bounding box.
  3. **Uncertainty & Risk**: Clear risk rating (High/Med/Low) with specific flags (e.g., *"1099-NEC from Acme Corp has handwritten correction in Box 1"*).
  4. **Actionable Correction**: Single-click actions: `Accept Extraction`, `Edit Value`, `Request Client Re-upload`, `Flag for Senior Review`.

---

## 7. Viewport Strategy: Horizontal Scroll Containers (Preventing Content Squeezing)

### Decision: Container-Level Horizontal Scrollability (`overflow-x-auto`) with Minimum Readable Widths
- **Rationale**:
  - Tax review tables, side-by-side split workbenches (Form 1040 + PDF Document Viewer + AI Trust Card), and multi-column triage queues require significant horizontal real estate to remain legible.
  - Squeezing multi-column financial data into narrow browser windows causes truncation, overlapping numbers, and degraded affordance visibility.
  - By applying explicit minimum widths (e.g. `min-w-[850px]` on tax schedule tables and `min-w-[1100px]` on split-screen workbenches) wrapped in container-level `overflow-x-auto`, the interface preserves data clarity, allows smooth horizontal panning on smaller screens, and prevents awkward layout collapse.
- **Alternatives Considered**:
  - *Aggressive column collapsing/wrapping*: Makes side-by-side comparison impossible and forces numbers onto multiple lines, creating severe readability issues for tax professionals.
  - *Full page zoom out*: Makes typography unreadably small on lower-resolution laptop displays.
