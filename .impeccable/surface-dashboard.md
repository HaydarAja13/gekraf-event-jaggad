# Surface brief — /dashboard (admin back office)

## Scope

Every authenticated admin route: the shell (`shell.tsx`), home (`/dashboard`),
`/dashboard/transaksi`, `/dashboard/customer`, `/dashboard/pembayaran`, and the CMS
editor `/dashboard/[section]`. Public landing page and checkout are out of scope and
untouched.

Mode: **Operate**. The operator is mid-task; familiarity, scanability, and state
vocabulary outrank expression.

Audience and job: the single operator approving transfer proofs, watching quota, and
editing landing-page copy. Action: approve the waiting order, see what is left, edit the
section that is wrong. Content: real orders, real plans, real CMS sections — no
placeholder dashboards. Constraints: Next.js 16 App Router server components, Tailwind
v4, no new runtime dependencies, Indonesian copy, `Rp` amounts.

## Chosen direction

Pinned by the operator's own reference comp (a task workspace dashboard): a white
left rail inside a light grey page, a split primary action and a `⌘` search in the top
bar, a dated greeting heading, a single segmented stat pill, then table-and-widget cards
on a quiet border system. Accent is the brand cyan rather than the comp's blue; the
composition, component vocabulary, table anatomy, and status-pill grammar are taken from
the comp 1:1. No concept roll was run — a brief-pinned direction beats the roll.

## Direction contract

THESIS: the back office as one calm sheet of paper — a white rail, a dated greeting, and
one bordered card per job. It refuses the category default of three big KPI numbers over
a grey admin grid.

OWN-WORLD: white cards on `#f6f7f9`, one 1px `#e9eaee` border as the only elevation, no
shadow stacking; 14px radii on cards and 10px on controls; Inter-like workhorse sans
(Plus Jakarta Sans) at a tight 1.125 scale; brand cyan `#0299c3` for selection,
primary action, and current state only; pastel status pills (green / lavender / cyan /
red) as the only other colour; icons authored as one 1.7px-stroke SVG set.

STORY: within seconds the operator sees how many proofs wait, what is left per plan,
and which landing-page section is still empty; the approve action is one click from the
home table and never requires hunting a menu.

FIRST VIEWPORT: 232px white rail inset in the grey page; a 56px top bar with the rail's
search field, a cyan split action ("Tambah rekening" + quick-action menu), a bell
carrying the pending count, and the operator's avatar; below it a muted date line, a 30px
"Selamat malam, admin" heading, and two quiet outlined buttons (Lihat situs, Kelola
harga) on the right; then one segmented stat pill across three metrics; then the
"Transaksi terbaru" card with its See All action.

FORM: pinned comp, composition inherited from the operator's reference image; seed:
none (unavailable).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Open decisions

- Whether the reference's "Notes" card becomes a CMS completeness checklist (chosen) or
  free-form notes (rejected: nothing to store it in).
- Whether table filtering is server-rendered via query params (chosen) or client state
  (rejected: keeps the count honest without shipping the whole table).
