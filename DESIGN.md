# DESIGN.md — Liut.me

> Système de design **"Swiss minimal dark / dossier"**. Base near-black, une seule couleur accent (violet `#7568FF`, inchangée). Signature = grille stricte + système éditorial `///` + scorecards data. Ce fichier documente le système réellement implémenté dans [`src/input.css`](src/input.css) et [`index.html`](index.html).

---

## 1. Visual Theme

**Archétype :** Swiss minimal (Linear / Vercel). Grille stricte, hiérarchie nette, retenue.
**Base :** noir profond (void near-black), aéré, discipliné.
**Singularité (2 axes) :**
- **Système éditorial** — marqueurs `///` en label de section + numérotation `01 → 05` comme device graphique récurrent.
- **Data discret** — chaque preuve chiffrée devient une **ScoreCard** avec micro-viz (compteur animé, barre, avant/après) qui tranche sur le noir.

**Une seule audace tenue partout :** l'accent + les scorecards. Le reste est calme.

---

## 2. Color Palette & Roles

Couleurs en `oklch()`. Mode sombre = défaut natif (`color-scheme: dark`).

| Token | oklch | Rôle |
|---|---|---|
| base | `oklch(.145 .005 265)` ≈ `#0B0C0E` | Fond principal (near-black) |
| surface | `oklch(.185 .006 265)` ≈ `#141518` | Cards, panels |
| text | `oklch(.965 .003 265)` ≈ `#EEEEF0` | Texte principal (near-white) |
| muted | `oklch(.68 .015 265)` ≈ `#8A8F98` | Texte secondaire |
| border | `oklch(.30 .008 265)` ≈ `#2E3138` | Hairline 1px teintée |
| **accent** | **`oklch(.606 .223 277.5)` = `#7568FF`** | **INCHANGÉ** |
| accent-soft | `color-mix(in oklch, accent 12%, transparent)` | Glows, halos scorecards |

**Règle accent sur noir (a11y) :** l'accent `#7568FF` ne change jamais de teinte. Sur petit texte, on renforce via **poids, taille, puce, liseré ou surface** plutôt qu'un aplat.

---

## 3. Typography

Self-hosted (woff2 latin), `font-display: swap`, preload des 2 familles critiques.

| Rôle | Famille | Usage |
|---|---|---|
| **Display** | `Plus Jakarta Sans` (500/700/800) | Titres, valeurs scorecards |
| **Body** | `IBM Plex Sans` (400/600) | Texte courant. **Remplace Inter (interdit).** |
| **Mono** | `JetBrains Mono` (400/500) | Labels `///`, numérotation, chiffres ROI |

**Features :** `font-feature-settings: "liga","kern"`. `font-variant-numeric: tabular-nums` (`.tnum`, `.font-mono`, valeurs scorecards) pour l'alignement des chiffres.
**Fluid :** `--fs-h1: clamp(...)` etc. via tailwind + clamp sur `.sc-value`.

---

## 4. Component Stylings (5 états)

### Button (accent, pill)
| État | Style |
|---|---|
| default | bg accent, texte blanc, `rounded-full` |
| hover | `bg-[#6457E5]`, glow accent |
| focus-visible | ring 2px accent, offset 3px |
| active | `scale(.95)` |
| disabled | opacité réduite, pas de glow |

### Card (surface)
| État | Style |
|---|---|
| default | bg surface, hairline border, `rounded-[2rem]` |
| hover | `border-[#3E4149]`, `-translate-y-1` |
| focus-within | ring accent subtil |
| disabled | opacité 0.5 |

### ScoreCard (signature)
- Valeur géante (`Plus Jakarta Sans`, `tnum`, clamp).
- Micro-viz : `.sc-bar` (barre animée `scaleX`) OU `.sc-ba` (avant→après).
- Reveal au scroll : compteur `0 → valeur` via IntersectionObserver.
- `prefers-reduced-motion` → valeur finale instantanée, barre pleine.

### Input
`rounded` 10px, focus ring accent, bg surface.

---

## 5. Layout

- **max-width** 1200px (`max-w-6xl`), gutters `px-6`.
- **Breakpoints** Tailwind : 640 / 768 / 1024 / 1280 / 1536.
- **Section gap** vertical généreux (`py-28`).
- **Anti-centré** : sections de contenu alignées à gauche, headers `///` à gauche. Bandeau Offres centré assumé (device de rupture).

**Radii par rôle :** pill (boutons), `2rem` (cards), `1.5rem` (accordéons), `24px` (scorecards), `xl` (badges).

---

## 6. Depth & Elevation

Sur fond noir : **hairlines lumineuses + glows accent subtils**. Pas de `shadow-xl` générique.

| Niveau | Traitement |
|---|---|
| 0 | Fond base |
| 1 | Surface + hairline border |
| 2 | Surface + glow accent `radial-gradient` (scorecards `::before`) |
| 3 (CTA) | Glow accent `shadow-[0_0_20px_-5px_rgba(117,104,255,.4)]` |

---

## 7. Do's & Don'ts

**Do**
- Aligner à gauche par défaut.
- Utiliser `///` + numérotation comme device récurrent.
- Transformer chaque chiffre en ScoreCard.
- Hairlines + glows, jamais drop-shadow lourd.

**Don't**
- ❌ Inter, Lorem ipsum, `shadow-xl`.
- ❌ Seconde couleur décorative (un seul accent).
- ❌ Changer la teinte de l'accent.

---

## 8. Responsive

Mobile-first. Grilles collapse en 1 colonne < 768px. Scorecards en `auto-fit minmax(220px, 1fr)`. Nav → overlay mobile. Timeline garde son rail vertical. `prefers-reduced-motion` respecté partout.

---

## 9. Agent Prompt Guide

Pour itérer sur ce système :
- **Toujours** utiliser les tokens CSS (`var(--color-*)`, `var(--font-*)`). Jamais de hex hardcodé dans les nouveaux composants.
- **Toujours** vérifier `prefers-reduced-motion` (désactiver, pas réduire).
- **Toujours** aligner à gauche sauf raison éditoriale.
- Accent : renforcer par poids/taille/surface, jamais changer la teinte.
- Un seul set d'icônes SVG inline. Logo = SVG/webp custom.
- Animations : `transform`/`opacity` uniquement, easing entrée `--ease-in: cubic-bezier(.16,1,.3,1)`.
- Le fichier source à éditer est **[`index.html`](index.html) à la racine** (jamais `_site/`). Puis `npm run build` régénère `_site/`.
