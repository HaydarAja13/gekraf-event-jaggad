# Business Skill Mastery — product truth

## What it is

A one-page Indonesian landing site for a one-day business class ("National Business
Growth Class", Gets Hotel Semarang, 21 November 2026) plus the small admin behind it.

Two surfaces ship from one Next.js app:

- **Public site** (`/`): landing page, ticket picker, checkout with manual bank
  transfer, and a downloadable ticket page per ticket number.
- **Admin** (`/dashboard`): the operator's back office — approve or reject incoming
  transfer proofs, see customers, manage the bank accounts shown at checkout, and edit
  every word and image on the landing page (the CMS).

## Who uses the admin

One operator (username `admin`, single-user cookie session). They work in short bursts
between other tasks: check what needs approving, approve it, fix a price or a photo,
leave. Sessions are desktop during working hours and phone in the evening. They are not
a trained back-office user; the wording is Indonesian and must stay that way.

## What is true about the data

- Orders arrive from `/checkout` with an uploaded transfer proof, status `pending` until
  an operator approves them. Approval issues a ticket number and emails the ticket.
- Rejection is the only destructive action; it is terminal.
- Each order is attached to one bank account and one pricing plan.
- Plans are gated: a later plan only opens once the earlier ones fill up. Slots per plan
  come from the CMS, so the CMS and the quota logic are the same source of truth.
- Customers are derived from checkout submissions and linked to their orders.
- The landing page content lives in `data/site.json`, edited section by section through
  the CMS and read by the public page.

## Product constraints

- Indonesian UI copy, `Rp` amounts, `0822…` phone style, first-person operator tone.
- No user management, no roles, no audit log: one admin.
- Email sends only through the approve action, so a failed send must leave the order
  pending and say why.
- The public site's visual identity (cyan `#0299c3` + gold `#f2cb19`, Plus Jakarta Sans,
  Playfair for display, light surfaces) is an existing brand commitment.
