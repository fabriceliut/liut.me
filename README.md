# liut.me

Site vitrine statique, léger et prêt au déploiement sur Cloudflare Pages.

## Stack

- HTML statique avec classes Tailwind
- Tailwind CSS v3 compilé (~24 KB minifié)
- JavaScript vanilla (~2 KB)
- Google Fonts (Inter, Plus Jakarta Sans, JetBrains Mono)
- Aucun framework client

## Structure

```
index.html          ← page principale (Home + Meeting views)
script.js           ← navigation, menu mobile, scroll navbar
dist/styles.css     ← CSS compilé (output Tailwind)
src/input.css       ← CSS source (directives Tailwind + custom)
tailwind.config.js  ← config Tailwind (fonts, safelist)
logo-liut.webp      ← favicon / logo
profile-banana3pro.jpg ← photo de profil
robots.txt          ← règles SEO
sitemap.xml         ← sitemap
sources/            ← fichier source de référence
```

## Dev local

```bash
npm install
npm run dev          # watch mode : recompile le CSS à chaque modif
# Dans un autre terminal :
python3 -m http.server 4173
```

Puis ouvrir http://localhost:4173.

## Build production

```bash
npm run build
```

Génère `dist/styles.css` minifié.

## Déploiement Cloudflare Pages

| Paramètre             | Valeur       |
|------------------------|-------------|
| Framework preset       | `None`       |
| Build command           | `npm run build` |
| Build output directory | `/`          |

### Étapes

1. Connecter le dépôt GitHub `fabriceliut/liut.me`
2. Créer un projet Cloudflare Pages avec les paramètres ci-dessus
3. Associer le domaine `liut.me`
4. HTTPS est activé automatiquement par Cloudflare

## À faire / noter

- Le fichier `og-image.jpg` référencé dans les meta OG n'existe pas encore → à créer (1200×630px recommandé)
- Les images `logo-liut.webp` et `profile-banana3pro.jpg` sont récupérées depuis le site live
