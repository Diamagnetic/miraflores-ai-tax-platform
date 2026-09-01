# MiraFlores AI Tax Platform

> **Enterprise AI-Powered Tax Preparation, Review & Collaboration Platform**  
> Built for High-Volume CPA Firms, Cross-Entity Complex Filings, and Frictionless Client Experience.

---

## Overview

The **MiraFlores AI Tax Platform** is a specialized tax review, triage, and taxpayer collaboration workspace designed for complex individual (Form 1040), corporate (Form 1120-S), and partnership (Form 1065) returns. 

It solves the critical human-AI collaboration challenges in professional tax accounting: **Explainability, Audit Defensibility under IRS Circular 230, Multi-Attribute Deep Search across 150+ workpapers, and Closed-Loop Client Inquiries**.

---

## Key Highlights & The 10 Challenges Solved

| # | Challenge | Implemented Solution & Key Components |
| :-: | :--- | :--- |
| **01** | **Traceability & AI Trust** | **Vector Document Viewer with Interactive SVG Coordinate Bounding Boxes**: Click any line item on Form 1040/Schedule C (e.g., Tony Stark $142,500 Gross Receipts) to instantly highlight exact source 1099/receipt bounding boxes with 100% concordance. [`AIExplainabilityCard.tsx`](src/components/ai-explainability/AIExplainabilityCard.tsx) |
| **02** | **Triage Command Center** | **Deterministic Urgency Scoring & Work Queue**: Composite algorithm factoring IRS deadlines, missing document blockers, review readiness, and AI confidence into a 0–100 priority score with traffic light badges. [`CpaDashboard.tsx`](src/components/dashboard/CpaDashboard.tsx) |
| **03** | **Client Onboarding (10-Sec Flow)** | **Frictionless Taxpayer Experience**: Peter Parker onboarding hero with drag-and-drop receipt simulation, instant progress indicators, and auto-closing document requests. [`PeterParkerOnboardingHero.tsx`](src/components/client-portal/PeterParkerOnboardingHero.tsx) |
| **04** | **Contextual Collaboration** | **Field-Level In-App Discussions**: Thread drawers anchored to specific return line items with internal firm vs. client-visible channel toggling and pure-text AI thread synthesis. [`ContextualThreadDrawer.tsx`](src/components/collaboration/ContextualThreadDrawer.tsx) |
| **05** | **Persona Role Switcher** | **Dual-Role Switching & Staff Personal Mode**: Instant 1-click persona switching (Sam Wilson CPA, Steve Rogers Reviewer, Tony Stark Client, Firm Employee Personal Return Mode). [`UserAccountMenu.tsx`](src/components/common/UserAccountMenu.tsx) |
| **06** | **Dual Lifecycle Steppers** | **Synchronized Lifecycle Stages**: 7-stage internal CPA workflow vs. 6-milestone consumer progress sharing identical rounded-node design with deterministic bidirectional mapping. [`CpaStatusStepper.tsx`](src/components/status/CpaStatusStepper.tsx) |
| **07** | **5-State Affordance Language** | **Semantic Color Tokens & Audit Justification**: Visual contract (`ai_extracted`, `verified`, `user_edited`, `calculated_locked`, `requires_approval`) with mandatory Circular 230 audit reason tracking. [`AffordanceLegend.tsx`](src/components/return-review/AffordanceLegend.tsx) |
| **08** | **IRS MeF Gateway & E-Sign** | **Form 8879 Workflow & Transmissions**: Interactive e-signature modal with canvas signature pad, instant submission ID generation, and partner sign-off acknowledgment. [`Form8879SignatureModal.tsx`](src/components/client-portal/Form8879SignatureModal.tsx) |
| **09** | **Closed-Loop AI Next Actions** | **Actionable AI Banners**: 1-click blocker dispatch from CPA Workbench to Client Portal, with AI receipt auto-analysis on incoming taxpayer uploads. [`AiNextActionBanner.tsx`](src/components/return-review/AiNextActionBanner.tsx) |
| **10** | **Scalable Deep Search (150+ Docs)** | **High-Performance Document Hub**: Sub-second fuzzy search for "Vibranium", multi-attribute filter bar, category sidebar hierarchy, page-scoped selection, batch verification, and CSV ledger export. [`DocumentHub.tsx`](src/components/document-hub/DocumentHub.tsx) |

---

## What is Live & Reactive vs. What is Simulated

To deliver an authentic, interactive tax software experience, the application distinguishes clearly between real in-memory computation and realistic mock simulation:

### Live & Reactive in the UI (Zustand In-Memory Store)
- **Mathematical Recalculations**: Modifying Schedule C gross receipts or deductions instantly re-sums total income, adjusted gross income (AGI), tax liability, and refund/due balances across all schedules in real time.
- **5-State Affordance System**: Field edits dynamically transition field affordances from `ai_extracted` to `user_edited`, recording chronological audit trail entries (`oldValue -> newValue`, `changedBy`, `timestamp`, `reason`).
- **Coordinate Bounding Box Highlights**: Clicking table cells dynamically activates source document overlays and draws SVG bounding box geometry over the document canvas.
- **Deep Search & Multi-Attribute Filters**: Real-time sub-second filtering across 155+ documents by keyword, document type, expense category, amount tier, and OCR confidence.
- **Batch Verification & CSV Export**: Selecting multiple documents updates global store ingestion statuses and generates downloadable CSV ledgers formatted for tax workpapers.
- **Bidirectional Status Sync**: Client Form 8879 signatures instantly advance the CPA stepper to `CLIENT_SIGN` and unlock MeF transmission buttons for the tax preparer.
- **Internal / Client Thread Messaging**: Sending messages appends chronological entries, resolves actionable document requests, and recalculates unresolved inquiry badges.

### Realistic Mock Baseline (Simulated Data Fixtures)
- **IRS MeF Gateway**: Generates authentic mock Submission IDs (`IRS-2026-TX-89104`) with realistic electronic acknowledgment latency.
- **OCR Vector Pre-Extraction**: Document bounding boxes, confidence percentages, and OCR previews are pre-extracted from representative tax documents and receipts.

---

## Tech Stack & Architecture

- **Framework**: React 19 + TypeScript + Vite
- **State Management**: Zustand (Pure in-memory ephemeral store for clean demo resets)
- **Styling**: Tailwind CSS + shadcn/ui (Sharp zero-radius design contract `--radius: 0rem`)
- **Icons**: Lucide React
- **Horizontal Scrolling Strategy**: Fixed non-collapsing container geometry (`overflow-x-auto min-w-[920px]` / `min-w-[1100px]`) ensuring financial figures and vendor names never clip.

---

## Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Run
```bash
# 1. Clone the repository
git clone https://github.com/your-org/miraflores_ai_case_study.git
cd miraflores_ai_case_study

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:3000
```

### Production Build & Typecheck
```bash
# Run strict TypeScript check and Vite production build
npm run build
```

---

## Personas & Demo Walkthrough Guide

Use the **Saved Logins Account Chooser** (or the User Account menu in the top-right header) to explore all roles:

| Persona | Role | Recommended Exploration |
| :--- | :--- | :--- |
| **Sam Wilson, CPA** | *Lead Tax Preparer* | • Open **Triage Command Center** to see prioritized queue.<br>• Open **Tony Stark (1040)** to inspect Schedule C AI explainability.<br>• Open **Wakanda Tech (1065)** $\to$ **Document Hub** to search "Vibranium" and batch-verify receipts. |
| **Steve Rogers, CPA** | *Partner / Reviewer* | • Filter queue by **Ready for Review**.<br>• Review Stark Industries Form 1120-S shareholder K-1 allocations.<br>• Acknowledge IRS MeF electronic acceptance. |
| **Tony Stark** | *High-Net-Worth Client* | • View personal Form 1040 milestone progress.<br>• Review Schedule C / Schedule D summary.<br>• Review CPA inquiry messages and upload requested workpapers. |
| **Peter Parker** | *Student / Freelancer Client* | • Experience the **10-Second Frictionless Onboarding Hero**.<br>• 1-click upload missing 1099-NEC workpapers to clear blockers. |
| **Firm Employee** | *Personal Return Mode* | • Switch to **Employee Personal Return Mode** to review internal staff return privacy and Form 8879 e-signing. |

---

## Architectural Decisions Log

For in-depth rationale, alternatives considered, and trade-off analysis across all 10 product challenges, see:
- [`DECISIONS.md`](DECISIONS.md) - Complete 11-Section Architectural & Product Decision Log.
