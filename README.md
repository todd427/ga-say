# ga-say / Gaeltacht

**Irish pronunciation tool**

Available at:
- `ga-say.sionnach.ie`
- `gaeltacht.sionnach.ie`

Browser-based, no backend. Uses the Web Speech API with automatic preference for Irish (`ga`) and Irish English (`en-IE`) voices.

## Features
- 70+ pre-loaded words across 7 categories (greetings, phrases, culture, nature, numbers, projects, misc)
- Four themes (Parchment, Folio, Obsidian, Studio) matching Sionnach
- Adjustable speech rate and pitch
- Add your own words (persisted in localStorage)
- Category tabs for navigation

## Stack
Vanilla HTML/CSS/JS · Web Speech API · Cloudflare Pages

## Deployment
Push to GitHub → Cloudflare Pages auto-deploys.
Add two CNAMEs in Cloudflare DNS, both pointing at the same Pages URL:
- `ga-say` → `<project>.pages.dev`
- `gaeltacht` → `<project>.pages.dev`

No build step. No dependencies.

## Adding Words
Edit `words.js`:
```js
{ irish:"focal", eng:"word", phonetic:"FOK-ul", cat:"misc" }
```
Categories: `greetings | phrases | culture | nature | numbers | projects | misc`
