# EaseITR future API contract

All endpoints are proposed and are **not implemented** in this frontend phase. Production APIs should use authenticated HTTPS, request IDs, explicit schema versions, audit logs and redaction-aware error handling. Sensitive values must not appear in URLs or logs.

## Assessments

- `POST /v1/assessments` — create an assessment; returns `assessmentId`, `status`, `schemaVersion` and timestamps.
- `GET /v1/assessments/{assessmentId}` — return the typed assessment aggregate.
- `PATCH /v1/assessments/{assessmentId}` — update one or more sections using optimistic concurrency/version fields.
- `DELETE /v1/assessments/{assessmentId}` — request deletion and return deletion status.
- `POST /v1/assessments/{assessmentId}/calculate` — produce a versioned tax estimate and old/new regime comparison.
- `POST /v1/assessments/{assessmentId}/recommend-itr` — produce a recommendation, confidence, triggered rule explanations, exclusions and professional-review flags.

## Documents and extraction

- `POST /v1/documents/uploads` — create a short-lived upload target with file constraints.
- `POST /v1/documents` — register an uploaded object and requested document type.
- `GET /v1/documents/{documentId}` — return metadata, retention status and processing state.
- `DELETE /v1/documents/{documentId}` — delete source and derived data according to retention policy.
- `POST /v1/documents/{documentId}/extractions` — start a versioned extraction job.
- `GET /v1/extractions/{extractionId}` — return status, detected type, OCR text reference, fields, tables, confidence, page coordinates, errors, model version and timestamps.
- `PATCH /v1/extractions/{extractionId}/fields/{fieldId}` — store normalized manual corrections and verification status.
- `POST /v1/extractions/{extractionId}/accept` — accept verified fields for assessment import.
- `POST /v1/extractions/{extractionId}/reject` — reject the extraction without importing it.

Extraction fields use category, raw value, normalized value, confidence from 0–1, source page and normalized bounding box, sensitivity flag and verification status. Tables include columns, typed row values, source page and confidence.

## Reference data and help

- `GET /v1/reference/assessment-years`
- `GET /v1/reference/deduction-categories?assessmentYear=...`
- `GET /v1/help/articles?query=...`

Help and rule responses should include a professional-review status, effective dates and content/rule version.

## Errors

Use a consistent envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Review the highlighted fields.",
    "fieldErrors": [
      { "path": "salary.grossSalary", "message": "Amount is required." }
    ],
    "requestId": "req_placeholder"
  }
}
```

Do not return raw OCR content, PAN, account numbers or financial values in generic error messages.
