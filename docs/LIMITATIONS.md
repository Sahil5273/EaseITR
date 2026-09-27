# EaseITR limitations

EaseITR is a final-year prototype for a resident individual. It organises a return and, for a simple case, prepares a worksheet. It is not a full replacement for a chartered accountant.

- It does not log into the Income Tax portal and does not e-file. A result on the screen is not a filed return.
- Complex cases, non-resident cases, and foreign-income cases stay on the chartered-accountant path. Those cases do not show a confident payable figure.
- Document reading uses Google Document AI Form Parser and Invoice Parser in Mumbai. They are general-purpose readers, not a model trained on Indian tax forms.
- “Choose for me” can recognise Form 16, Form 26AS, an Annual Information Statement, a broker capital-gains statement, a home-loan interest certificate, or a bill. Any other type must be chosen by hand. An unclear file is refused rather than guessed.
- Every extracted figure stays unverified until the user accepts it. Low-confidence fields are not imported on their own.
- Tax is calculated in the browser from the rules in this prototype. Indexation, a full tax-audit test, and employer NPS are out of scope. Surcharge marginal relief is limited to the income above the threshold, not a full recomputation.
- Gemini is used only when someone clicks “What this means”. It must not calculate tax or choose an ITR form, and it is not called for a PAN.
- An uploaded file is deleted after it is read, and a one-day rule deletes anything left behind. Google still sees the file while it is being read. The full recognised text is not stored. A PAN is masked before it is shown or saved.
- Help articles are plain-language notes and still need review by a qualified tax professional.

The same points are shown in the application at `/limitations`.
