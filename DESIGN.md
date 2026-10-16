# Design system — admin back office

Written from the built dashboard. The public landing page keeps its own identity
(cyan + gold, Playfair display); everything below is scoped to `.admin-shell`.

## The one idea

The back office is a quiet sheet of paper: a white rail inset in a light grey page, a
dated greeting, and one bordered card per job. Cards are told apart by a single 1px
border — there is no shadow anywhere in the admin. Colour only ever means state.

## Tokens

Defined as custom properties in `app/globals.css` and registered as Tailwind colours
(`@theme inline`) so they read as `bg-dash-surface`, `text-dash-muted`, `border-dash-line`.

| Token | Value | Used for |
| --- | --- | --- |
| `--dash-bg` | `#f6f7f9` | page ground, hovered rows, inset panels |
| `--dash-surface` | `#ffffff` | rail, top bar, cards, inputs |
| `--dash-line` | `#e9eaee` | the only border on a card or field |
| `--dash-line-soft` | `#f1f2f5` | rules inside a card, column separators |
| `--dash-ink` | `#14181f` | headings, values, primary labels |
| `--dash-muted` | `#6b7280` | secondary text (4.83:1 on white) |
| `--dash-muted-strong` | `#565c66` | muted text on a tinted pill or track |
| `--dash-faint` | `#8a919c` | icons only, never text |
| `--dash-accent` | `#0299c3` | brand accent: focus rings, progress fill, side dots |
| `--dash-fill` | `#017a99` | filled buttons and the active nav row (white text 4.95:1) |
| `--dash-fill-hover` | `#016b86` | pressed/hover on filled, link text on white |
| `--dash-soft` / `--dash-edge` | `#e8f6fa` / `#cfe9f1` | tinted chips and dashed empty rings |
| `--dash-track` | `#eceef2` | neutral pill, progress track |
| `--dash-gutter` | `1rem` → `1.25rem` ≥1024px → `1.5rem` ≥1536px | the padding inside every card, row and toolbar |
| ok | `#e6f5e9` / `#17683a` | ACC, terbit |
| wait | `#f5eafb` / `#7a2ba8` | menunggu ACC |
| off | `#fdeceb` / `#a3231b` | ditolak, destructive |
| warn | `#fdf3e2` / `#8a5a08` | incomplete content, blocked delete |

Status tints clear 4.5:1 against their own background; every filled state uses
`--dash-fill`, not `--dash-accent`, so white text stays legible.

## Shape and rhythm

- Cards: 14px radius, 1px border, no shadow. Controls: 10px radius. Pills: full radius.
- Rail 252px wide, inset 8px, 16px radius. Top bar 56px tall, full width, 1px bottom rule.
- Content fills the remaining width: no max-width column, page padding 16px → 24px → 32px
  → 40px at 2xl, and 16px between cards. Cards always stretch to the full column.
- Grids open up rather than stranding space: the KPI strip is 1 column on a phone, 2 at
  `sm`, and one row of up to four at `xl`; the CMS field grid is 2 columns at `md` and 3 at
  `xl`; the landing-page section list runs 2 columns from `sm`.
- Table rows 66–68px with a 39px tinted header strip; `+` separators between columns.
  Rows grow to 72px and cells to 14px from `xl`.
- Type: Plus Jakarta Sans only, fixed rem scale, 1.125 ratio — 30px h1, 15px card titles
  (16px at `xl`), 22px KPI values, 13.5px body and table cells, 12.5px meta, 12px headers.
- Prose stays readable at any width: page subtitles cap at 62–68ch, so only data fills the
  screen edge to edge.

## Components

`app/dashboard/ui.tsx` (presentational, server-safe) and `app/dashboard/menu.tsx`
(client) — imported by every admin screen:

- `Icon` — one authored 24px stroke set at 1.7 weight; no icon font, no emoji.
- `Card` + `CardHead` — head is icon + title + optional meta pills + right slot.
- `Btn` / `BtnLink` — `primary | outline | ghost | danger | quiet` × `sm | md`.
- `Pill` + `OrderStatus` — status is always pill + icon + label, never colour alone.
- `Avatar` / `AvatarStack` — initials on a deterministic brand-neutral tint.
- `StatStrip` — one bordered strip, up to four metrics as icon + value + label, with
  hairline row and column dividers that follow the grid at every breakpoint.
- `TableShell` / `Td` — `colgroup` widths, tinted header, rule hover, empty row slot.
- `Field` + `inputClass` — label, required marker, hint, inline error.
- `EmptyState`, `Notice`, `PageHead`, `Progress`, `Meta`.
- `Menu` (clones the trigger to carry `aria-expanded`/`aria-haspopup`), `MenuButton`,
  `SearchBox` (⌘/Ctrl+K), `InlineConfirm`, `CopyButton`, `ProofPreview`.

## Rules that keep it coherent

1. Adding a screen: `PageHead` → content cards. Never invent a new card shape.
2. Every list has an empty state that teaches what will appear there.
3. Destructive actions go through `InlineConfirm`; modals are only for inspecting an
   image (`ProofPreview`).
4. Tables never truncate silently: a filtered-to-nothing table says so and offers reset.
5. New colour must earn a state. If it is not a status, it is a neutral or the accent.
6. Focus is always 2px `--dash-accent` with a 2px offset; `prefers-reduced-motion`
   collapses all transitions in the admin.
