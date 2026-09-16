# EaseITR frontend prototype

EaseITR is an independent, explainable Indian income-tax assistance prototype. It guides resident individual taxpayers through a structured questionnaire, demonstrates document-extraction review, shows sample tax estimates and explains which ITR form may be applicable.

This repository is **frontend only**. It does not file returns, calculate production tax, authenticate users, store documents on a server, perform OCR, or call an AI model.

## Setup

Requirements: Node.js 22.13 or newer and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by the development server.

Quality commands:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

## Routes

- `/` — product landing page, supported income types, privacy and FAQ
- `/assessment` — assessment preparation and sample-data entry
- `/assessment/[step]` — nine-step guided questionnaire
- `/documents` — simulated upload and document-field verification
- `/dashboard` — sample/estimated assessment dashboard
- `/results` — explainable ITR recommendation and tax comparison
- `/help` — searchable education cards
- `/settings` — theme, display, local data and export controls

## Architecture

```text
app/                       Next.js App Router routes and metadata
components/easeitr/        Product components and composed UI
components/ui/             Shared shadcn-compatible primitives
lib/domain/                Tax-domain types, constants and Zod schemas
lib/services/interfaces.ts Replaceable frontend service contracts
lib/services/mocks/        Centralized mock implementations and seed data
lib/state/                 React Context assessment state and persistence
tests/                     Vitest and React Testing Library coverage
docs/                      Future API contract and verification report
```

Strict TypeScript is enabled. The UI uses Tailwind CSS, shadcn-compatible primitives, Lucide icons, React Hook Form with Zod, Recharts and React Context. Local storage is accessed only through the assessment service and settings preferences.

## Mock services

The UI depends on four interfaces in `lib/services/interfaces.ts`:

- `AssessmentService` handles local load, save, clear and export.
- `DocumentExtractionService` validates files and returns typed mock extraction results after an artificial delay.
- `TaxCalculationService` returns an illustrative old/new regime comparison.
- `ITRRecommendationService` returns an explainable sample form recommendation.

Mock API logic is centralized under `lib/services/mocks`. The ITR examples are deliberately marked as UI demonstration rules and must not be reused as production tax logic.

Seeded profiles cover salaried, investor, F&O trader and freelancer/presumptive examples.

## Future backend integration

Replace the mock service implementations without changing the route components. The expected HTTP surface is documented in `docs/API_CONTRACT.md`. A backend should add authenticated assessment storage, a professionally validated tax engine, versioned recommendation rules, secure uploads, job status, audit trails and deletion controls.

## Future document extraction

The frontend contract supports detected document type, OCR text, normalized entities, confidence, source-page coordinates, extracted tables, manual corrections, verification status, processing errors, model version and extraction timestamp. A production pipeline should use document-specific layout and table extraction; generic NER alone is not assumed to be sufficient.

## Current limitations

- Estimates and recommendations are illustrative and incomplete.
- No government, Income Tax Department or e-filing integration exists.
- No real file upload, OCR, NER or AI processing occurs.
- Browser storage is device-local and is not encrypted application storage.
- Non-resident, foreign-asset, international, partnership, audit and other advanced cases are not fully supported.
- Help content requires review by a qualified tax professional.

EaseITR is not affiliated with the Government of India or the Income Tax Department and does not provide certified legal or tax advice.
