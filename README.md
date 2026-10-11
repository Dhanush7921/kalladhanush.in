# Kalla Dhanush — Personal Portfolio

**Beyond Vision. Into Reality.** — https://kalladhanush.in

A static, single-page portfolio built with **React 19 + TypeScript + Vite**, one lazy-loaded **Three.js** hero scene, and hand-written CSS. No backend, no database, no trackers, no paid services.

## Run it

Requires Node.js 20.19+ (22 LTS recommended).

```bash
npm install        # first time only — creates package-lock.json (commit it)
npm run dev        # local dev server → http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build → http://localhost:4173
```

## Where things live

| Path | What it is |
| --- | --- |
| `src/content/portfolio.ts` | **All text and data** — roles, about, journey, projects, skills, experience, My World, vision, journal, contact links |
| `src/content/assets.ts` | Photo + logo registry (responsive AVIF/WebP sources and alt text) |
| `src/styles/tokens.css` | Design tokens — palette, gradients, type scale, motion, spacing, self-hosted fonts |
| `src/sections/*` | One component + stylesheet per section (Hero, About, Projects, Skills, Experience, MyWorld, Vision, Journal, Contact) |
| `src/components/*` | Shared UI — navbar, footer, intro, icons, buttons, project artwork, particles |
| `src/three/globeScene.ts` | The WebGL globe/orbit scene (loaded only on capable devices, after the intro) |
| `public/` | Favicons, OG image, fonts, manifest, robots.txt, sitemap.xml |
| `.github/workflows/deploy.yml` | Build + deploy to GitHub Pages on every push to `main` |

### Common edits

- **Contact links** — `contact` in `portfolio.ts`. Empty strings are hidden automatically (e.g. add your LinkedIn URL there).
- **Publish a confidential project's details** — set `visibility: 'public'` and fill `problem / approach / role / outcome / stack` for that project.
- **Remove a project** — delete its entry from `projects`.
- **Certificates** — put the image in `src/assets/`, import it in `portfolio.ts`, add it to `certificates`. The "certificate wall" placeholder disappears automatically.
- **Journal articles** — add entries to `journal`; the "coming soon" panel switches to a list.
- **Skill depth labels** — edit `depth` per discipline (no percentage bars by design).

## Motion, 3D and accessibility

- Opening KD particle animation plays once per browser session, has a **Skip intro** button (and `Esc`), and never plays for reduced-motion users or deep links. "Replay intro" lives in the footer.
- The WebGL scene starts after the intro, pauses off-screen and in background tabs, caps device-pixel-ratio, and disposes everything on unmount. Devices with ≤2 CPU threads, Save-Data, no WebGL or `prefers-reduced-motion` get a lightweight SVG globe instead.
- Keyboard: skip link, visible focus rings, arrow-key tabs in Skills, `Esc` closes menu/dialogs, native `<dialog>` focus handling.

## Deploying to GitHub Pages (free)

The workflow builds with the correct base path automatically:
`/` when a custom domain is set, `/kalladhanush.in/` on `dhanush7921.github.io`.

1. Push this project to `main` of **Dhanush7921/kalladhanush.in**.
2. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Wait for the "Deploy to GitHub Pages" workflow to go green.

### Custom domain (once GoDaddy's verification hold is cleared)

At GoDaddy → DNS for `kalladhanush.in` (leave MX/TXT and other records untouched):

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | dhanush7921.github.io |

Remove any GoDaddy "parked"/forwarding A record on `@` first, and don't add wildcard (`*`) records.
Then: GitHub profile → Settings → Pages → **verify** `kalladhanush.in` → repo → Settings → Pages → Custom domain `kalladhanush.in` → **Enforce HTTPS** (can take up to 24 h to become available).
No `CNAME` file is needed with an Actions deployment.
Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Credits

Fonts: Manrope and Cormorant Garamond (SIL Open Font License — see `public/fonts/`).
Globe land outline derived from Natural Earth (public domain).
