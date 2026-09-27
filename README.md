# EaseITR

EaseITR is an independent prototype for a resident individual in India. It organises income, documents, and open questions so a complex return takes less chartered-accountant time, and a simple return can be prepared as a worksheet. It does not file on the Income Tax portal and it is not a full replacement for a chartered accountant.

The tax estimate and the ITR suggestion run in the browser. Google sign-in saves an assessment through a Cloud Run API into Firestore in Mumbai. Signed-in document reading uses Document AI in Mumbai. A file is deleted after it is read, a PAN is masked, and a field is imported only after the user accepts it.

## Setup

Requirements: Node.js 22.13 or newer and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by the development server, usually http://localhost:5173.

Quality commands:

```bash
npm run typecheck
npm run lint
npm test
npx next build
```

`npm run build` produces the Cloudflare bundle. Firebase Hosting serves the static export from `npx next build` (`out/`). The API in `server/` is deployed separately to Cloud Run.

## Routes

- `/` — product landing page
- `/assessment` — assessment preparation
- `/assessment/[step]` — guided questionnaire
- `/documents` — document reading after Google sign-in, including “Choose for me” and a sample Form 16
- `/dashboard` — assessment summary
- `/results` — regime comparison and ITR suggestion
- `/help` — plain-language guides
- `/settings` — theme, Google account, local data, and export
- `/privacy` — what is stored, and how a document is read and deleted
- `/terms` — what the prototype is, and what it is not
- `/costs` — running cost of each feature, including document reading per person
- `/limitations` — cases and calculations this prototype does not cover

## Architecture

```text
app/                       Next.js App Router routes
components/easeitr/        Product screens
lib/domain/                Tax rules, filing gates, and import of accepted fields
lib/services/document-map.ts  Field mapping and document-type detection
lib/services/remote/       Cloud Run client for save and document reading
lib/state/                 Assessment state and Google sign-in
server/                    Cloud Run API: assessments, uploads, extraction, field explanation
public/sample-form-16.pdf Fictional Form 16 used by the document centre
```

An assessment always has a browser copy. After sign-in, the same assessment is also saved in Firestore. The client never talks to Firestore directly. Document AI reads an uploaded file; Gemini explains one field only when asked, and does not compute tax or choose the ITR form.

## Current limitations

See [docs/LIMITATIONS.md](docs/LIMITATIONS.md) and the in-app page at `/limitations`. The short version: no e-filing, a general-purpose document reader, human acceptance of every figure, and several tax computations left out on purpose.

EaseITR is not affiliated with the Government of India or the Income Tax Department and does not provide certified legal or tax advice.
