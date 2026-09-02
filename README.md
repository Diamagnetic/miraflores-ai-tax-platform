# MiraFlores AI Tax Platform

> **AI-Powered Tax Preparation, Review & Collaboration Workspace**  
> Built from scratch for complex individual (Form 1040), corporate (Form 1120-S), and partnership (Form 1065) filings.

- **Hosted Live Prototype**: [https://diamagnetic.github.io/miraflores-ai-tax-platform/](https://diamagnetic.github.io/miraflores-ai-tax-platform/)
- **Video Walkthrough**: [https://drive.google.com/file/d/1unzmiPfHdSeFvM-Zyp7J28jtDCB4eA-1/view](https://drive.google.com/file/d/1unzmiPfHdSeFvM-Zyp7J28jtDCB4eA-1/view)
- **Detailed Architecture Log**: [`DECISIONS.md`](DECISIONS.md)

---

## Decisions Made (Addressing "What We Are Evaluating")

Each design decision directly answers the evaluation criteria specified in the case study:

### 1. Traceability & Defensibility (Challenge 01)
* **Evaluation Criteria**: *Traceability, transparency, side-by-side review, and how defensible you make AI output feel.*
* **Decision**: **Document Bounding Boxes + Formula Trees**. Clicking any tax schedule cell (e.g. Schedule C Line 1 Gross Receipts) slides open a dual-pane drawer that pins the exact bounding box on the source 1099/receipt alongside an explicit arithmetic breakdown. CPAs never have to take the AI's word for a number; they inspect the raw paper provenance in 1 click.

### 2. Collaboration Design & Task Ownership (Challenge 02)
* **Evaluation Criteria**: *Collaboration design, permissions, contextual communication, and task ownership.*
* **Decision**: **Contextual Thread Drawers with Privacy Firewalls**. Discussions live attached directly to return line items or source documents rather than in a detached inbox. Internal firm notes are cryptographically shielded from client view via role filtering, while actionable requests explicitly assign who owns the next action.

### 3. Time-to-First-Action & Information Hierarchy (Challenge 03)
* **Evaluation Criteria**: *First-run clarity, information hierarchy, and reducing time-to-first-action.*
* **Decision**: **10-Second Action Banner & Progressive Disclosure**. First-time filers (e.g., Kamala Khan) see only what matters: a 1-click `[ Upload W-2 Tax Form ]` hero and milestone tracker. Complex tax liability cards and legal signatures are deferred until intake documents exist.

### 4. Navigation & Context Preservation (Challenge 04)
* **Evaluation Criteria**: *Navigation design, orientation, and preserving context across a connected workflow.*
* **Decision**: **Non-Modal Slide-Over Drawers with Sticky Backdrop Blur**. Moving between return line items, source documents, and client inquiries uses slide-over drawers that keep the underlying tax return visible and scroll-locked, preventing CPAs from ever losing their place.

### 5. Role Architecture & Confidentiality (Challenge 05)
* **Evaluation Criteria**: *Role architecture, permission clarity, and context-switching design.*
* **Decision**: **Zero-Friction Persona Switcher + Personal Return Mode**. Supports 4 distinct personas (Preparer, Reviewer, Client, New Client) through an SSO account chooser. CPA employees with personal returns toggle an isolated "Employee Personal Return Mode", strictly sequestering client workpapers from personal filings.

### 6. Shared Mental Models & Status Legibility (Challenge 06)
* **Evaluation Criteria**: *Shared mental models, status legibility, and appropriate detail by audience.*
* **Decision**: **Synchronized Dual-Audience Lifecycles**. CPAs see a granular 7-stage pipeline (`INTAKE` -> `PREPARATION` -> `REVIEW` -> `CLIENT_SIGN` -> `E_FILED` -> `ACCEPTED`); clients see a friendly 6-milestone progress stepper (`Intake` -> `Preparation` -> `Review` -> `Signature` -> `E-Filing` -> `Accepted`). Actions in one dynamically advance the other.

### 7. Action-Orientation & Prioritization Logic (Challenge 07)
* **Evaluation Criteria**: *Action-orientation, prioritization logic, and dashboard information design.*
* **Decision**: **Deterministic 0–100 Urgency Scoring**. Work queues are ranked by an explicit composite formula: `(Days to Deadline × 2.5) + (Missing Docs × 15) + (Review Readiness × 20) + (Low AI Confidence × 10)`. CPAs immediately see *what* to work on and *why*, with 1-click transitions directly into review.

### 8. Affordance Clarity & Consistency (Challenge 08)
* **Evaluation Criteria**: *Affordance clarity and consistency of the interaction system across contexts.*
* **Decision**: **5-State Semantic Affordance Contract**. Every figure uses an unmistakable visual token:
  * 🟣 `ai_extracted` (purple pill with OCR confidence %)
  * 🟢 `verified` (green check)
  * 🔵 `user_edited` (blue badge with mandatory Circular 230 audit reason)
  * ⚪ `calculated_locked` (gray lock)
  * 🔴 `requires_approval` (amber warning)

### 9. Progressive Disclosure & Scale (Challenge 09)
* **Evaluation Criteria**: *Progressive disclosure, information hierarchy, and handling of scale.*
* **Decision**: **Hierarchical Taxonomy + Sub-Second Fuzzy Search**. In high-volume corporate/partnership returns (Wakanda Tech 1065 / 158 workpapers), data is organized into an expense category tree with live subtotals, instant deep search (e.g. "Vibranium"), and page-scoped batch verification (`[ Batch Verify (8) ]`).

### 10. Trust Design & Inline Corrections (Challenge 10)
* **Evaluation Criteria**: *Trust design, appropriate transparency, and correction workflows.*
* **Decision**: **4-Pillar AI Explainability + Non-Destructive Override**. The AI card discloses OCR confidence, extraction method, cross-check validation rules, and known uncertainty flags. If a CPA edits a value, the original OCR is preserved in an immutable audit trail.

---

## Genuinely Wired Up vs. Simulated Behind the Scenes

### Genuinely Wired Up (Live Reactive Code)
* **Dynamic Tax Math Cascade**: Editing gross receipts or deductions on Schedule C instantly recalculates Total Income, AGI, Tax Liability, and Refund/Due amounts across all schedules in real time.
* **Audit Trail & State Machine**: Editing any field automatically flips its affordance token to `user_edited`, prompts for a Circular 230 justification, and prepends a permanent audit history entry.
* **Bounding Box Geometry**: Coordinate boundaries (x, y, width, height) are dynamically rendered as bounding boxes over the document canvas.
* **Sub-Second Multi-Attribute Search**: High-volume receipt filtering across 158 items by keyword, category, status, confidence score, and dollar amount.
* **Batch Operations & Workpaper Export**: Multi-select document actions and real-time CSV ledger export.
* **Bidirectional Lifecycle Sync**: Taxpayer e-signing of Form 8879 unlocks the CPA's IRS MeF transmission trigger.
* **Closed-Loop Inquiries**: 1-click CPA AI dispatch attaches structured requests directly into the client portal; taxpayer uploads automatically mark inquiries resolved.

### Simulated Behind the Scenes (Realistic Mock Fixtures)
* **IRS MeF Gateway**: Generates realistic electronic submission IDs (`IRS-2026-TX-89104`) with simulated acknowledgment status rather than pinging IRS production web services.
* **OCR Pre-Extraction**: Document bounding boxes and confidence scores are fabricated fixtures representing realistic extraction outputs.
* **Data Persistence**: Backed by an in-memory Zustand store (ephemeral per session) allowing rapid demo resets rather than a remote database.

---

## Quick Exploration Guide

Use the **Persona Switcher** on the login screen (or user account menu in the top-right):

| Persona | Role | Key Scenario to Test |
| :--- | :--- | :--- |
| **Kamala Khan** | *New Client* | **10-Second Time-to-Action**: Clean welcome hero with `[ Upload W-2 Tax Form ]`. Tax summary unlocks immediately post-upload. |
| **Sam Wilson, CPA** | *Tax Preparer* | **Urgency Triage & Workbench**: Review prioritized queue (0–100 scores) -> open Tony Stark -> 1-click dispatch meal expense inquiry. |
| **Tony Stark** | *Existing Client* | **Closed-Loop Response**: Open portal -> see CPA inquiry -> upload meal receipts -> inquiry auto-resolves. |
| **Steve Rogers, CPA** | *Tax Reviewer* | **High-Volume Scale**: Open Wakanda Tech 1065 -> search "Vibranium" across 158 receipts -> execute `Batch Verify (8)`. |
| **Firm Employee** | *Personal Mode* | **Confidentiality**: Switch to Personal Return Mode -> review personal Form 1040 and e-sign Form 8879 without client data leakage. |

