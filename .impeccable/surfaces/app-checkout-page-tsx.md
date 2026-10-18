---
version: 1
slug: "app-checkout-page-tsx"
primary_target: "app/checkout/page.tsx"
related_targets: []
---

# Surface brief — /checkout (halaman sales tiket)

## Scope

The public ticket-purchase surface: `/checkout?plan=…` and the states inside it
(paket terkunci, slot habis, rekening belum diatur, galat validasi, pending
kirim, sukses). `/checkout/terkirim` continues the same flow and carries the
same ticket anatomy; the landing page, admin, and `/tiket/[code]` are out of
scope.

Mode: **Persuade** with an Operate core. The visitor has already chosen a plan
on the landing page; this surface must make the offer legible (what the ticket
buys, what the day is), make the manual transfer effortless, and get the
registration submitted without losing a single typed character.

Audience and job: Indonesian business owners, founders, and executives — on a
phone in the evening, or at a desk between meetings. Action: confirm the plan,
fill six identity fields, copy the account number, transfer, attach the proof,
send. Content: real plans, real bank accounts, real event facts from
`data/site.json`; no invented claims. Constraints: Indonesian copy, `Rp`
amounts, no new runtime dependencies, the existing `checkoutAction`
(place_order RPC) keeps working, and `prefers-reduced-motion` is respected.

## Chosen direction

Picked on the decision page (sketch `ticket`): the perforated ticket. Visual
world stays the landing page's — cyan `#0299c3` + gold `#f2cb19`, Plus Jakarta
Sans, Playfair Display for display.

Memorable moment: the A4 poster stub is physically perforated off the ticket
body — two punched notches and one dashed seam — so the flyer you keep and the
form you fill read as one object.

## Direction contract

THESIS: the checkout is the ticket itself — an A4 poster stub perforated off a
white ticket body that collects the buyer's data, payment, and proof — and it
refuses the category default of a grey form page with a summary card.

OWN-WORLD: cyan ground under the stub, white paper for the body, gold for the
plan band and the submit, ink `#0b0e16` text on both; one soft cyan shadow
`0 30px 70px rgba(2,153,195,.18)`; 28px ticket radius; 2px dashed seams with
punched notches; money and account numbers in tabular numerals; Playfair only
where the ticket speaks in its own voice.

STORY: the visitor confirms the plan and what it includes, sees the day on the
poster, reads exactly what to transfer, copies the account number, attaches the
proof, and sends — one scroll, three labelled beats, nothing typed twice.

FIRST VIEWPORT: a white 72px bar (brand → home, gold "Hubungi panitia" pill);
below it a gold slot badge, the Playfair h1, and the event facts on the right;
then the ticket — the 396px A4 poster stub on cyan with its gold band and
Playfair title, the perforation, and the white body opening with the plan chip,
the struck/current price row, and the first two fields.

FORM: code-led, composition from the chosen sketch
`.impeccable/mocks/decision/ticket.html` (dealt structure, position 2);
seed: ec344162c3760a99.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.

## Open decisions

- Whether the poster slot ever takes a real image: the stub renders the event's
  own facts when no `src` is given, and swaps to the image the day one exists.
  Chosen: no CMS field for it this round.
- Whether the ticket keeps one page with three labelled beats (chosen) or
  becomes a three-route wizard (rejected: it would hide fields behind a
  `required` submit and split one server action across routes).
- Whether validation errors return state (chosen: `useActionState`, so typed
  values survive) or keep redirecting with `?error=` (rejected: it wiped the
  form on every mistake).
