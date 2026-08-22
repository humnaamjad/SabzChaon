# Sabz Chaon — Shared Visual Theme

> **How to use this file:** Upload this exact document into Qoder's Qmind (or equivalent knowledge/context source) on all four teammates' machines, alongside `Sabz-Chaon-Project-Context.md`. Every UI-related prompt to your Coder should reference this file explicitly (e.g. "use the colors from THEME.md"). Do not let individual Coders invent their own colors, spacing, or icon choices — if a value isn't covered here, add it to this file first and re-sync, the same way §20 of the project context doc describes for feature changes.

---

## 1. Color Palette

Earthy tones — deep forest green + warm brown/soil. **Not** default Tailwind green (no parrot/neon green anywhere).

Add these as custom tokens in `tailwind.config.js` under `theme.extend.colors` — do not use Tailwind's default `green-*` / `amber-*` scale.

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      forest: {
        DEFAULT: '#2D5A3D', // primary brand color
        hover: '#1F4429',   // primary hover/active state
      },
      brown: {
        DEFAULT: '#6B4E3D', // secondary/earth accent
      },
      ochre: {
        DEFAULT: '#B8792F', // warning / needs_attention
      },
      brick: {
        DEFAULT: '#A3432F', // danger / destructive actions only
      },
      cream: {
        DEFAULT: '#F7F4EE', // page background
        card: '#FBF9F5',    // card surface (or use white #FFFFFF)
      },
      warmgray: {
        border: '#D9D1C4',  // card borders, dividers
        text: '#6B6355',    // secondary/muted text
      },
      inktext: '#2B2620',   // primary text (warm near-black)
    }
  }
}
```

| Token | Hex | Use |
|---|---|---|
| `forest` | `#2D5A3D` | Primary buttons, active nav, links, "healthy" status |
| `forest-hover` | `#1F4429` | Primary button/nav hover state |
| `brown` | `#6B4E3D` | Secondary buttons, soil/planting-related icons |
| `ochre` | `#B8792F` | "needs_attention" status, warning badges |
| `brick` | `#A3432F` | Destructive actions only (delete, dismiss) |
| `cream` | `#F7F4EE` | Page background |
| `cream-card` | `#FBF9F5` | Card surface (white `#FFFFFF` also acceptable) |
| `warmgray-border` | `#D9D1C4` | Card borders, dividers |
| `warmgray-text` | `#6B6355` | Secondary/muted text |
| `inktext` | `#2B2620` | Primary text |

**Rule:** no bright/saturated greens, no stark white/gray backgrounds, no default Tailwind blue/purple accents anywhere.

---

## 2. Status Colors (used identically across dashboard, tree cards, alerts)

| Status | Badge background | Badge text |
|---|---|---|
| `healthy` | `forest` at ~10% tint | `forest` |
| `needs_attention` | `ochre` at ~10% tint | `ochre` |
| `unknown` | `warmgray-text` at ~10% tint | `warmgray-text` |

Badges: `rounded-full`, `px-3 py-1`, `text-xs font-medium`.

---

## 3. Typography

- Font: **Inter** (Google Fonts) or system sans-serif — pick ONE for the whole app, apply globally.
- Headings: `font-semibold`, color `inktext`.
- Body: `font-normal`, `text-sm` to `text-base`, color `inktext`; secondary copy uses `warmgray-text`.

---

## 4. Components

**Buttons**
- `rounded-lg`, `px-4 py-2`
- Primary: `bg-forest text-white`, hover `bg-forest-hover`
- Secondary: `bg-cream text-forest border border-forest`

**Cards**
- Background: `cream-card` or white
- `rounded-xl` (12px), `border border-warmgray-border`, `p-4` to `p-6`, subtle `shadow-sm`

**Nav bar**
- Background: `cream` or white
- "Sabz Chaon" wordmark + small tree/leaf icon in `forest`
- Role-based items: NGO sees Dashboard / Campaigns / Alerts; Volunteer sees Campaigns / My Trees

**Icons**
- Use **Lucide icons** (`lucide-react`) everywhere — don't mix icon libraries across the four parts.
- Color icons `forest` or `brown` depending on context; never bright/saturated colors.

---

## 5. Guardian Avatar Growth Stages

Visual progression from soil/brown toward full forest-green canopy — shared between **Part 3** (embeds the avatar in the tree profile page) and **Part 4** (builds the avatar component). Agree on the exact icon/illustration set together before building, since this is the one UI element both parts render.

| Stage | Visual direction |
|---|---|
| `seedling` | Mostly brown/soil tones, a tiny green sprout |
| `sprout` | More green emerging, still some brown at the base |
| `sapling` | Mostly green, slim form |
| `young_tree` | Full deep forest-green canopy |

---

## 6. Team Rule

Nobody invents their own hex values, spacing, or icon set mid-build. If a UI need isn't covered above (a value THEME.md doesn't specify), propose it to the team first and update this file — then everyone re-syncs it into Qmind, same process as changes to the main project context doc (§20).
