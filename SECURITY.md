# Security Policy

## Reporting a vulnerability

Please **don't open a public issue** for security problems.

Report them privately through GitHub instead: on
[Microsoft-Club/Microsoft_Club_Website](https://github.com/Microsoft-Club/Microsoft_Club_Website),
go to **Security → Report a vulnerability**. If that isn't available to you, contact a current club
Dev lead directly and ask for a private channel.

Please include:
- what is affected (a page, an API route or a file)
- the steps to reproduce it
- the impact you expect

We aim to acknowledge a report within a week. This is a student-run project, so fixes ship as soon as
the Dev team can verify them.

## Scope

- **Frontend:** `frontend/`, the React site served on GitHub Pages.
- **Backend:** `backend/`, the Express + Prisma API on Render, including admin auth, uploads and mail.

## Practices in this repo

- **Secrets:** they live only in environment variables. `.env` files are git-ignored and only
  `.env.example` is committed. Rotate any secret that is ever exposed.
- **Admin access:** admin routes need a signed JWT, and the backend re-checks the role on every request.
  The frontend role check only decides what the UI shows.
- **Outside links:** user-supplied links go through `safeExternalUrl`, which only allows http, https and
  mailto (see `tests/url.test.js`).
- **Rate limits:** the contact form endpoint is rate-limited with `backend/middleware/rateLimit.js`.
