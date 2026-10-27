# Implementation Plan: Google Sheets Apps Script Sync Integration & Final Readiness Verification

A comprehensive readiness enhancement for the DC Bandung Stock Opname SIM Driver Web App, adding an interactive **Google Sheets Apps Script Cloud Webhook Simulator & Direct Sync Panel** alongside full offline IndexedDB persistence, SheetJS Excel import/export, photo compression, duplicate detection, and A4 print audit sheets.

## User Review & Critical Decisions

> [!IMPORTANT]
> The final feature focus has been confirmed:

- **Google Sheets Apps Script Sync Integration**: Add an interactive Webhook & Apps Script Integration Modal / Sync Console that simulates real-time bi-directional sync with Google Sheets backend (`MASTER_DRIVER`, `DATABASE_SIM`, `LOG_AKTIVITAS`), supports custom Apps Script Webhook URL endpoints, test payloads, sync status indicators, and 1-click push/pull operations.
- **Dataset & Export Preserved**: Retain the 15+ verified DC Bandung drivers dataset with full SheetJS (`xlsx`) Excel file generation, CSV templates, and active driver auto-fill rules.

---

## 1. Overview & Core Concept

### What It Does
This update completes the production readiness of the DC Bandung Stock Opname SIM Driver web app by introducing:
1. **Google Sheets Apps Script Integration Modal & Remote Sync Simulator**:
   - Allows fleet admins to configure a Google Apps Script Web App URL (`https://script.google.com/macros/s/.../exec`).
   - Simulates live bi-directional payload sync (`action: 'SYNC_SO_DATA'`) for `MASTER_DRIVER`, `DATABASE_SIM`, and `LOG_AKTIVITAS`.
   - Displays live latency, sync logs, connection status, and 1-click Push/Pull buttons.
   - Provides ready-to-copy standard Google Apps Script (`Code.gs`) backend code snippet for instant deployment into real Google Sheets!
2. **Comprehensive Readiness & UX Audit**:
   - Ensures mobile & desktop responsive perfection across all 6 views.
   - Validates client-side image compression, SweetAlert2 duplicate handling, and SheetJS Excel exports.

---

## 2. User Experience & Visual Design

- **Sync Control Badge**: Integrated into the Top Header contract showing live sync status (`🟢 Cloud Synced` / `🟡 Local Cache Mode`).
- **Apps Script Modal**: Modern minimalist dialog featuring:
  - Webhook URL input field with validation.
  - Interactive **"Uji Koneksi Apps Script"** and **"Sync Ke Google Sheets"** buttons.
  - Live payload preview inspector (JSON payload sent to Google Sheets).
  - Copyable `Code.gs` Google Apps Script backend snippet for Google Sheets integration.
- **Color Discipline**: Deep Slate Navy (`#0F172A`), Vibrant Teal (`#14B8A6`), Emerald Green (`#16A34A`), and Soft Cool Gray (`#F8FAFC`).

---

## 3. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DC Bandung Web App Workspace                          │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐ │
│  │   Header & Live Sync  │  │ Apps Script Webhook   │  │  A4 Print View  │ │
│  │    Status Badge       │  │ Modal & Code.gs Copy  │  │  & Excel Export │ │
│  └───────────┬───────────┘  └───────────┬───────────┘  └────────┬────────┘ │
│              │                          │                       │          │
│  ┌───────────▼──────────────────────────▼───────────────────────▼────────┐ │
│  │                            React App Controller                       │ │
│  │   - Dashboard Overview   - Form Stock Opname   - Database SIM         │ │
│  │   - Master Driver        - Log Aktivitas       - Cloud Sync Modal     │ │
│  └──────────────────────────────────────┬────────────────────────────────┘ │
│                                         │                                  │
│  ┌──────────────────────────────────────▼────────────────────────────────┐ │
│  │               IndexedDB / LocalStorage & Sync Service                 │ │
│  │                                                                       │ │
│  │   HTTP POST / Webhook Payload ─────────► Google Apps Script Web App   │ │
│  │   (action: SYNC_ALL_SHEETS)             (doPost / Google Sheets)      │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Integrations & Sequences

1. **Google Apps Script Webhook Service (`src/services/googleSheetsSync.ts`)**:
   - Manages webhooks, sync logs, payload formatting, and local cache updates.
   - Prepares exact column schemas for Sheet 1 (`MASTER_DRIVER`), Sheet 2 (`DATABASE_SIM`), and Sheet 3 (`LOG_AKTIVITAS`).
   - Generates production-ready `Code.gs` script for Google Apps Script deployment.
2. **Sync Modal (`src/components/GoogleSheetsModal.tsx`)**:
   - Enables admins to test endpoint connections, trigger manual cloud sync, view request payloads, and copy `Code.gs`.
