# Implementation Plan: IrishCareConnect

Transform the application into **IrishCareConnect** tailored for Mrs. Brimberg and the caregiving team, featuring shared iPad team switching, automated midnight liquid resets, date navigation to review prior days' notes, and resilient data storage.

---

## 1. App Identity & Resident Profile
- **Rename Application to IrishCareConnect**:
  - Update `metadata.json`, `index.html`, and top branding to **IrishCareConnect**.
  - Add Irish caregiving team theme accents and clean clinical typography.
- **Update Primary Resident Profile**:
  - Resident: **Mrs. Brimberg**
  - Address / Room: **480 Park**
  - Age / Details: **93 years old this December** (DOB: December 1933 approx).
  - Precaution tags: Fall Risk (Morse 65), Highchair transfer with footwear, Depend brief care, Skin integrity & barrier cream protocol.

---

## 2. Team Member Roster & Shared iPad Login System
- **Care Team Roster**:
  - **Margaret Brady** — Head Nurse (Lead Supervisor)
  - **Lisa Peters** — Caregiver / CNA
  - **Fiona Byrne** — Caregiver / CNA
  - **Helene Cashin** — Caregiver / CNA
  - **Pauline Gilroy** — Caregiver / CNA
- **Shared iPad & Mobile Multi-User Experience**:
  - **Shared iPad Profile Switcher**: Fast top-bar avatar and 1-tap selector designed for a shared facility/home iPad. Caregivers can switch who is actively signing and dictating notes in 1 second without typing tedious passwords each time.
  - **Head Nurse Remote / Mobile View**: Head nurse badge for Margaret Brady allowing supervisory review, editing pinned protocol memos, approving handover notes, and signing off on bowel/intake flowsheets.
  - **Active Author Attribution**: Each note recorded on the lined diary shows the author's name (e.g., *“Lisa Peters, Caregiver”* or *“Margaret Brady, Head Nurse”*).

---

## 3. Daily Midnight Liquid Tracker Reset & 24-Hour Windows
- **Automated Midnight Reset**:
  - Liquid intake progress bar automatically resets to **0 oz** at **12:00 AM (midnight)** for the new calendar day.
  - Real-time display showing *“Today's Fluid Intake (00:00 – 23:59)”* with daily target (e.g., 48 oz goal).
  - 6:30 PM reminder alert logic remains active for the evening shift to avoid nighttime fluid overload.
- **Historical Daily Totals**:
  - Fluid intake is stored per calendar date so past days retain their recorded intake (e.g., Oct 8: 36 oz; Oct 7: 42 oz).
  - Easy summary chip showing yesterday's total fluid intake for clinical continuity.

---

## 4. Date Flipping & Historical Notepad Diary
- **Calendar & Page Flipping Navigation**:
  - Add lined notepad header controls:
    - **`◀ Previous Day`** and **`Next Day ▶`** buttons styled like flipping notepad pages.
    - **Calendar Date Picker** allowing jumping directly to any prior shift or date.
    - **“Today” quick button** to immediately jump back to the current active shift.
- **Date-Filtered Notepad & Flowsheet**:
  - Selecting a past date displays the diary notes, checklist status, and fluid/BM events recorded on that date.
  - A gentle top banner clarifies when viewing past archives (e.g., *“Viewing Archive: Wednesday, Oct 7, 2026 — Read-Only Mode (tap edit to append head nurse memo)”*).
- **Persistent Data Storage**:
  - All shift notes, routine checklist items, and input/output logs are structured by date and persisted in `localStorage`.
  - Added “Export Care Record” (PDF/JSON) button so the team can save, print, or email care records to family or physicians.

---

## 5. Verification Plan
- Verify team switcher works smoothly between Lisa Peters, Fiona Byrne, Helene Cashin, Pauline Gilroy, and Margaret Brady.
- Test date picker and previous/next page navigation to confirm past notes are preserved and loaded accurately.
- Verify midnight reset logic and 24-hour calculation for liquid intake.
- Test note authoring under different team members.
- Run `lint_applet` and `compile_applet` to ensure zero build errors.
