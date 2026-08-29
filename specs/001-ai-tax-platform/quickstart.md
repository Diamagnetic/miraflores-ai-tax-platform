# Phase 1: Quickstart Validation Guide

**Feature**: `001-ai-tax-platform`  
**Date**: 2026-08-27  
**Status**: Completed  

---

## 1. Prerequisites & Running the Prototype

```bash
# Navigate to the workspace
cd D:\E\Dhamange\Chirag\dev\miraflores_ai_case_study

# Install dependencies
npm install

# Run the local development server
npm run dev

# Open browser to http://localhost:5173
```

---

## 2. Interactive Validation Scenarios (10 Challenges Walkthrough)

### Scenario 1: Source Document Traceability (Challenge 01)
1. In the Top Bar, ensure role is **Senior Tax Reviewer (Steve Rogers)** or **Tax Preparer (Sam Wilson)**.
2. Select **Tony Stark (1040 Individual + Schedule C)** from the returns list.
3. Open the **Return Preparation / Workpapers** tab.
4. Click on **Schedule C -> Line 1: Gross Receipts ($142,500.00)**.
5. **Expected Outcome**:
   - Split-screen drawer / side-by-side pane opens.
   - The source document viewer displays `1099-NEC_Stark_Labs_2025.pdf` on Page 1.
   - The bounding box over Box 1 ($45,000.00) glows with high-contrast indicator.
   - The formula panel shows: `Sum(1099-NEC: Stark Labs $45,000 + MIT Defense $55,000 + Avengers Arc $42,500) = $142,500`.

---

### Scenario 2: Trustworthy AI & Explainability (Challenge 10)
1. In the same side-by-side drawer, inspect the **AI Explainability Card**.
2. Review the **Confidence Score (98%)**, extraction method, and supporting text snippet.
3. Switch to **Natasha Romanoff -> Form 1040 Line 2b (Taxable Interest)** where confidence is **74% (Flagged)**.
4. **Expected Outcome**:
   - Card highlights the uncertainty flag: *"Handwritten offshore account adjustment note detected on page 2"*.
   - Click the **"Correct Extraction"** button -> change $3,200 to $3,450.
   - State badge dynamically flips from `AI-Extracted` to `Human-Edited` with audit timestamp.

---

### Scenario 3: Clickable vs. Editable Affordances (Challenge 08)
1. View any Form 1040 line items table.
2. Observe the 5 distinct visual treatments:
   - **Purple Sparkle**: AI-Extracted (clickable for explainability & 1-click verify).
   - **Emerald Check**: Verified (read-only audit trail).
   - **Sky Blue Pill**: Human-Edited (displays author & reason on hover).
   - **Slate Lock**: Calculated / Formula-locked (shows formula tooltip, non-editable).
   - **Amber Warning**: Discrepancy requiring senior reviewer sign-off.
3. Click on a calculated cell (e.g. Line 15 Taxable Income).
4. **Expected Outcome**: System displays read-only calculation tree explanation without allowing accidental overwrites.

---

### Scenario 4: Client & CPA Contextual Collaboration (Challenge 02)
1. As **Tax Preparer (Sam Wilson)**, select **Tony Stark (1040)**.
2. Select **Schedule C Deductions -> Line 9 (Car and truck expenses / Arc Fleet: $6,400)**.
3. Click **"New Context Thread"** -> type: *"Please confirm flight/vehicle travel log for 2025"*.
4. Select visibility: **"Client Question (Sends Action Request)"**.
5. Switch the global Role Switcher to **Individual Taxpayer (Tony Stark)**.
6. **Expected Outcome**:
   - Client sees a prominent banner on their dashboard: `1 Action Required from Your CPA`.
   - Clicking it navigates directly to the travel expense item with one-click confirmation and reply box.
   - Internal firm notes from Steve Rogers remain completely hidden from client.

---

### Scenario 5: Client Portal Multi-Stage Progress Bar (Challenge 03 & 06)
1. Sign in as **Tony Stark (Client Taxpayer Portal)** or **Peter Parker**.
2. **Expected Outcome**:
   - The top fold does NOT display complex CPA metric cards.
   - Directly below the top navbar, a multi-stage **Return Progress Bar** displays 7 concise 2-3 word stage titles (`1. Documents Intake`, `2. AI Processing`, `3. Expert Prep`, `4. Partner Review`, `5. Client Signature`, `6. IRS Submission`, `7. Accepted`).
   - The active stage is prominently highlighted with an unambiguous callout: `Next Action Owner: Client (Upload Missing Receipts / e-Sign Form 8879)`.

---

### Scenario 6: Context-Preserving Navigation (Challenge 04)
1. While deep inside a multi-level workpaper (`Tony Stark -> Schedule C -> Expenses -> Arc Reactor R&D`), click on an open client message.
2. From the message, click the linked receipt document.
3. **Expected Outcome**:
   - Deep breadcrumb hierarchy: `Returns / Tony Stark / Schedule C / Messages / Receipt #4082`.
   - Clicking `Back` or using the persistent context dock returns the user to the exact scroll position in the Schedule C workpaper.

---

### Scenario 7: Saved Logins Landing Screen & Post-Login Personal Return Access (Challenge 05)
1. On initial load or after clicking **Logout** from the navbar account dropdown, observe the authentic corporate **Saved Logins (Account Chooser)** page.
2. Select **Sam Wilson, CPA** -> User logs into the Preparer workspace.
3. Click the top-right **Account Menu** (Sam Wilson, CPA) -> select **"Switch to My Personal Return"**.
4. **Expected Outcome**:
   - The workspace cleanly pivots into Dr. Bruce Banner's private employee Form 1040 (`ret-bruce-1040`).
   - Firm client rosters and senior reviewer internal notes are strictly gated to preserve confidentiality.
   - The user can toggle back to the firm workspace or click `Logout` to return to the Saved Logins screen.

---

### Scenario 8: Shared Return Status & Progress (Challenge 06)
1. Open **Tony Stark** return.
2. In **CPA View**: observe 7 granular lifecycle stages with blocker tag.
3. In **Client View**: observe 6 simplified milestones with reassuring progress bar and explicit badge: `Next Step: CPA preparing Schedule C (Est. completion: Oct 12)`.

---

### Scenario 9: Actionable CPA Triage Dashboard (Challenge 07)
1. Navigate to the **CPA Dashboard** as **Senior Reviewer (Steve Rogers)**.
2. Observe ranked triage queue sorted by Urgency Score.
3. Test filters: `High Urgency (<48h Deadline - Pym Tech)`, `Blocked on Client (Avengers Compound)`, `Needs Senior Review (Tony Stark)`.
4. Switch to `Team Workload View` to see return distribution across staff.

---

### Scenario 10: Navigating Scale & Complexity (Challenge 09)
1. Open **Wakanda Tech & Design LLC (1065)** which contains 150+ mock equipment & R&D receipts.
2. Test instant multi-attribute filter: `Type = RECEIPT`, `Category = Vibranium Tooling`, `Amount > $5000`.
3. **Expected Outcome**: Instant sub-second filtering with tree hierarchy and batch-action toolbar.
