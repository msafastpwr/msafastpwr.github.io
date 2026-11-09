# Microsoft Student Ambassadors &bull; FAST NUCES Peshawar
> Official Web Portal Repository for `msafastpwr.github.io`

Welcome to the official repository of the Microsoft Student Ambassadors (MSA) FAST Peshawar web portal. This repository is built on a clean, scalable GitHub Pages Jekyll layout architecture with centralized data contracts, strict WebP asset guardrails, and Microsoft Fluent design tokens.

---

## 🏛️ Architecture Overview

- **Layout Engine**: Native GitHub Pages Jekyll templating (`_layouts/default.html`, `_includes/header.html`, `_includes/footer.html`, `_config.yml`). No client-side `fetch()` for layout components (eliminating CORS failures and CLS).
- **Data Contracts**: Single source of truth managed via `_data/events.json` and `_data/team.json`, strictly validated against Draft 2020-12 schemas in `schemas/`.
- **Styling & Tokens**: Microsoft Azure Blue (`#0078D4`), Deep Cloud Navy (`#002050`), Accent Cyan (`#00A4EF`), Her Tech Purple (`#7B42BC`), Segoe UI font stack, and CSS custom variables in `assets/css/theme.css` and `base/theme.css`.
- **Responsive Standards**: Mobile-first design tested down to 360px viewport width with zero horizontal overflow and 44x44px minimum touch targets.

---

## 👥 Task Division & Page Ownership

| Page / Route | Developer | Scope & Deliverables | Styles & Scripts |
| :--- | :--- | :--- | :--- |
| **Home** (`index.html`) | **Fasih** | Hero banner, mission tagline, CTAs, upcoming events preview | `home/home.css`, `home/home.js` |
| **About Us** (`about/`) | **Yamin** | Chapter history, vision, executive leadership structure | `about/about.css` |
| **Events** (`events/`) | **Mohsin** | Upcoming workshops, past events archive, RSVP & speaker links | `events/events.css`, `events/events.js` |
| **Team** (`team/`) | **Areej** | Data-driven roster of all 56 members across 6 teams & HerTech | `team/team.css` (using `_data/team.json`) |
| **Gallery** (`gallery/`) | **Sahar** | Optimized event photography grid with responsive lightboxes | `gallery/gallery.css`, `gallery/gallery.js` |
| **Resources** (`resources/`) | **Waleeja** | Microsoft Learn paths, Azure for Students ($100), GitHub Student Pack | `resources/resources.css` |
| **Join Us** (`join/`) | **Waleeja** | Recruitment timeline, benefits, FAQs, orientation form links | `join/join.css` |

---

## 🚀 Local Development

You can run and test the website locally using any standard static file server:

### Option A: VS Code Live Server (Port 5500)
Right-click on `index.html` in VS Code and select **Open with Live Server**.

### Option B: Python HTTP Server
```bash
python3 -m http.server 8000
```
Open `http://localhost:8000` in your browser.

### Option C: Native Jekyll (If Ruby is installed)
```bash
bundle install
bundle exec jekyll serve
```

---

## 🔒 Contributor & Git Workflow Rules

1. **Branch Protection**: Direct commits to `main` are strictly blocked.
2. **Feature Branches**: Always branch off `main` (e.g. `feat/home-hero`, `feat/about-page`, `feat/team-roster`).
3. **Pull Request Reviews**: All PRs require review and approval from **Technical Lead (Waleeja Khan)** and **Co-Lead (Mohsin Ali)**.
4. **CSS Scoping**: Only use CSS variables from `theme.css`. Never invent hardcoded hex colors. Prefix all class names with your section name (e.g. `.about-...`, `.team-...`).
5. **Image Rules**: All photos must be in modern `.webp` format and respect size budgets:
   - Hero Banners: &le; 1200px width / &le; 180 KB
   - Event Posters: &le; 800px width / &le; 90 KB
   - Team Headshots: Exact 400 &times; 400px / &le; 35 KB
   - Gallery Photos: &le; 1080px width / &le; 120 KB

---

## 🧪 Automated CI Validation

Before opening a pull request, run local verification:
```bash
# Validate data contracts
python3 scripts/validate-schemas.py

# Validate image formats
bash scripts/validate-images.sh
```

---

&copy; Microsoft Student Ambassadors &bull; FAST NUCES Peshawar.
