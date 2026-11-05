# Claude prompt (every member pastes this in a NEW project)

How to use: copy everything inside the box below, fill the two fields at the top, then paste your section brief (from `docs/TASKS.md`) and the contents of these files where indicated: `assets/css/theme.css`, `assets/css/components.css`, `assets/js/site.js`, and your current `<section>/index.html`.

```
You are helping me build ONE section of a plain HTML/CSS/JavaScript website for the MSA society at FAST-NUCES Peshawar (hosted on GitHub Pages, no build step). Several people build different sections in parallel, so your output must strictly follow the shared design system pasted below. Consistency matters more than creativity.

MY SECTION: [home / about / events / team / blog / contact / join]
MY SKILL LEVEL: [comfortable / beginner: explain each step briefly]

HARD RULES
1. Never modify or suggest changes to: assets/css/theme.css, assets/css/components.css, assets/js/site.js, 404.html, .github/*, or the header/footer (they are injected by site.js via #site-header and #site-footer). If you need something they lack, tell me to ask the lead.
2. I may only edit: <section>/index.html (only inside the marked "OWNER EDITS" region in <main> and the page hero), <section>/<section>.css, <section>/<section>.js, my data file in data/ (if my brief says I own one), and images/<section>/.
3. Keep the <head> and page shell of index.html exactly as given (same stylesheet and script links, same #site-header, #site-footer, skip link).
4. Use ONLY CSS variables from theme.css (var(--color-primary), var(--space-2), ...). Never hardcode colors, fonts, spacing, radii or shadows. Reuse classes from components.css (.container, .section, .section-alt, .section-title, .grid, .card, .card-img, .tag, .btn, .btn-primary, .btn-accent, .btn-outline, .form, .field, .prose, .muted) before writing new ones. Prefix every new class with my section name (e.g. .events-card). Do not restyle shared classes.
5. Plain HTML, CSS and vanilla JS only. No frameworks, no npm, no CDNs, no external fonts or icon libraries, no inline styles, no inline event handlers.
6. Use root-absolute paths (/assets/..., /images/<section>/..., /data/...). Use fetch via MSA.getJSON from site.js for data. Escape all data with MSA.esc() before innerHTML (or use textContent). Respect the data contracts in README.md; never rename fields. Handle empty values (no image, empty list).
7. Mobile-first and responsive; semantic HTML (section, article, ol, figure); one h1 per page (already in the page hero); alt text on every meaningful image; visible keyboard focus; good contrast.
8. Do not invent facts about the society (names, dates, emails, achievements). Use clearly marked placeholders like "TODO: ..." instead.
9. Do not add menu items or change navigation.

HOW TO RESPOND
- First list the exact files you will change (full paths).
- Then give each file complete and ready to copy, in its own code block with the path as a heading. For index.html give the full file.
- End with: how to test locally (Live Server), and a short checklist confirming rules 1-9.
- Keep explanations short. No unrequested extras.

MY SECTION BRIEF:
[paste from docs/TASKS.md]

SHARED FILES (reference only, do not modify):
[paste theme.css]
[paste components.css]
[paste site.js]
[paste my current <section>/index.html]
```
