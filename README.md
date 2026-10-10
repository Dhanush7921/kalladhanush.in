# kalladhanush.in

The personal website of **Kalla Dhanush** — *AI & ML Engineer | Video Editor | Photographer*.
*Beyond Vision. Into Reality.*

A static, cinematic 3D portfolio built with **Astro**, **TypeScript** and **Three.js**, deployed for free on **GitHub Pages** with GitHub Actions.

- Real-time WebGL Earth with golden lighting, dotted continents, city lights and orbital paths
- Intro with an extruded metal **D.** monogram, START / SKIP, remembered on return, replayable
- Pages: About, Journey, Projects (+ one page per project), Skills, Achievements, My World, Vision, Creator's Journal, Connect, 404
- WebGL fallback, `prefers-reduced-motion` support, keyboard navigation, responsive layouts, sitemap and Open Graph tags

---

## Run it on Windows

1. Install **Node.js 22 LTS** from <https://nodejs.org> (tick "Add to PATH") and **Git** from <https://git-scm.com>.
2. Open **PowerShell** and run:

   ```powershell
   git clone https://github.com/Dhanush7921/kalladhanush.in.git
   cd kalladhanush.in
   npm ci
   npm run dev
   ```

3. Open <http://localhost:4321>. Edits reload automatically.

| Command | What it does |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run check` | TypeScript and Astro checks |

> Tip: to see the intro again, use **Replay intro** in the footer or menu, or open `http://localhost:4321/?intro=1`.

---

## Edit the content

Everything the site says lives in typed files under `src/data/`:

| File | Controls |
| --- | --- |
| `site.ts` | Name, title, tagline, location, contact links, navigation, résumé link |
| `projects.ts` | Project cards and project pages |
| `journey.ts` | Timeline entries |
| `skills.ts` | Skill groups (no percentages by design) |
| `achievements.ts` | Certificates — add only verified ones |
| `gallery.ts` | My World photos and captions |
| `vision.ts` | Roadmap (clearly marked as goals) |

**Publication flags.** Every project, timeline entry, photo and certificate has `published: true | false`. Unpublished items are left out of the live build entirely (no card, no page, no sitemap entry). To preview drafts locally in PowerShell:

```powershell
$env:SHOW_DRAFTS = "true"; npm run dev
```

Company or client work stays `published: false` until public release is approved. Keep the detailed write-ups for those projects **outside** this public repository until then.

**Photos.** Put web-ready copies (JPEG, about 2000 px on the long side, EXIF removed) in `src/assets/photos/` and reference them from `gallery.ts`. Astro generates AVIF and WebP versions automatically. Never commit original photo collections or ZIP files (`.gitignore` blocks the common ones).

**Journal.** Add a Markdown file to `src/content/journal/` (see `_template.md`) and set `published: true`.

**Résumé.** Put the PDF in `public/` and set `contact.resume` in `site.ts` (for example `'/kalla-dhanush-resume.pdf'`). The download button appears automatically on the Connect page.

---

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which installs dependencies, type-checks, builds, checks that no unpublished project slipped into the output, and deploys `dist/` to GitHub Pages.

Repository settings: **Settings → Pages → Source: GitHub Actions**, custom domain `kalladhanush.in`, **Enforce HTTPS** on.

DNS for `kalladhanush.in` (at the registrar):

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

Leave email records (MX, SPF/DKIM TXT) untouched. GitHub redirects `www` to the apex domain automatically.

---

## The 3D Earth data

`public/earth/` holds a texture and point data generated from [Natural Earth](https://www.naturalearthdata.com/) (public domain) by `scripts/generate-earth.py`:

```powershell
pip install pillow
python scripts/generate-earth.py path\to\natural-earth-geojson public\earth
```

It needs `ne_50m_land.geojson` and `ne_50m_populated_places_simple.geojson` from the Natural Earth vector repository.

## Credits

- [Astro](https://astro.build) and [Three.js](https://threejs.org) (MIT)
- Fonts: Bodoni Moda and Instrument Sans (SIL Open Font License), self-hosted via Fontsource
- Map data: Natural Earth (public domain)

Site content © Kalla Dhanush. All rights reserved.
