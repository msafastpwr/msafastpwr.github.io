# Task division

| Who | Owns | Files |
|---|---|---|
| Waleeja | Reviewer; Home + Join | `index.html`, `home/`, `images/home/` |
| Mohsin | Reviewer; Blog | `blog/`, `data/blog.json`, `images/blog/` |
| Yamin | About | `about/`, `images/about/` |
| Fasih | Events | `events/`, `data/events.json`, `images/events/` |
| Areej | Team | `team/`, `data/team.json`, `images/team/` |
| Sahar | Contact | `contact/`, `join/`, `images/contact/`, `images/join/` |

Locked shared files (`assets/`, `.github/`, `404.html`, `images/shared/`) are managed jointly by the lead and co-lead. Header, footer and the Join button come from `assets/js/site.js`.

**Every PR needs approval from both lead and co-lead.**

## Briefs (paste yours into the Claude prompt)

**Home (Waleeja)**: Hero is already in place; refine it. Add: short about teaser with link to /about/; next 3 upcoming events from `/data/events.json` rendered as cards into `#home-events` (sorted by date, only dates >= today); latest 3 posts from `/data/blog.json` into `#home-posts`; a closing call-to-action band with the Join button. Handle empty lists with a friendly message.

**About (Yamin)**: Mission and vision, what the society does (3-4 cards), a short history timeline (semantic `<ol>`), and a link to Join. All text TODO placeholders. Mostly HTML/CSS; JS not needed.

**Events (Fasih)**: Load `/data/events.json`. Show "Upcoming" and "Past" groups split by date (use `MSA.today()`), as card grids (title, formatted date, time, location, summary, optional image, optional link). Upcoming sorted soonest first, past newest first. Handle missing image and empty groups. You own `events.json`.

**Team (Areej)**: Load `/data/team.json`. Group by `group` (`leadership` first, then `member`). Each card: photo (fallback initials circle if no photo), name, role, optional LinkedIn/GitHub links. You own `team.json`.

**Blog (Mohsin)**: `blog/index.html` lists posts from `/data/blog.json` (newest first: title, date, author, summary, link). `blog/posts/sample-post.html` is the single-post pattern members copy. You own `blog.json`.

**Contact (Sahar)**: Email, location (campus address placeholder), social links, and a simple form that works with `mailto:` or a Formspree URL (TODO). Use the `.form` and `.field` classes from `components.css`. No JS needed.

**Join (Waleeja)**: Why join (3 benefits as cards), how to join (3 numbered steps in an `<ol>`), and one big button linking to the registration form (Google Form URL as TODO). No JS needed.

## Suggested order
1. Everyone: clone, run locally, open one tiny PR (e.g. replace a TODO line) to learn the flow.
3. Members build their sections in parallel.
4. Lead and co-lead: real logo, social links in `site.js`, final review, 404 and meta tags check.
