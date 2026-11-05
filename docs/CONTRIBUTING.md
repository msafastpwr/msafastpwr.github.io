# Contributing

## Golden rules
1. Never push to `main`. Work on a branch, open a Pull Request, wait for approval.
2. Edit only your own section folder, your `data/` file and your `images/<section>/` folder.
3. Locked files are never edited by members. Need a change there? Message the lead.
4. Colors, fonts, spacing: only `var(--...)` from `theme.css`. Reuse classes from `components.css` first.
5. Prefix every new CSS class with your section name (`.events-card`).
6. Never invent society facts. Use `TODO` placeholders until real content is available.

## Daily workflow
```bash
# first time only
git clone https://github.com/msafastpwr/msafastpwr.github.io.git
cd msafastpwr.github.io

# every task
git checkout main
git pull
git checkout -b section/events          # section/<your-section>

# ...edit, test with Live Server...

git add .
git status                               # check ONLY your files are listed
git commit -m "events: add event cards"  # prefix with your section
git push -u origin section/events
# open a Pull Request on GitHub; fill in the template
```

## Before opening a PR
- Page works at phone width (browser dev tools, device toolbar) and with keyboard only
- No red errors in the browser console
- `git status` shows only your files

## Review (both leads must approve)
Every PR needs approval from BOTH the lead and the co-lead. The check `both-leads-approved` stays red until both have approved, and nothing can be merged while it is red.
- If the lead or co-lead opens the PR, the other one approves (you cannot approve your own PR).
- New commits after approval cancel the approvals, so push your final changes before asking for review.
- Merge only after both approvals: the site updates in about a minute.
After a merge: `git checkout main && git pull`, then branch again.

## If something goes wrong
- *Merge conflict*: you probably edited a file that is not yours. Ask the lead before fixing.
- *Changes not visible locally*: hard refresh (Ctrl+Shift+R).
- *CSS not applying*: check the `<link>` path and that the file name matches your section.
