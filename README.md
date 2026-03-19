# ga-say

**Irish pronunciation tool** — `ga-say.sionnach.ie`

Browser-based, no backend. Uses the Web Speech API with automatic preference for Irish (`ga`) and Irish English (`en-IE`) voices.

## Features
- 40+ pre-loaded words across 6 categories
- Four themes (Parchment, Folio, Obsidian, Studio) matching Sionnach
- Adjustable speech rate and pitch
- Add your own words (persisted in localStorage)
- Category tabs for navigation

## Stack
Vanilla HTML/CSS/JS · Web Speech API · Cloudflare Pages

## Deployment
Push to GitHub → Cloudflare Pages auto-deploys.
CNAME `ga-say.sionnach.ie` → the Pages URL.
No build step. No dependencies.

## Adding Words
Edit `words.js`:
```js
{ irish:"focal", eng:"word", phonetic:"FOK-ul", cat:"misc" }
```
Categories: `greetings | phrases | culture | nature | numbers | misc`
