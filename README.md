# ga-say / Gaeltacht

**Irish pronunciation tool.** Tap a word, hear it spoken in Irish.

Available at:
- `ga-say.sionnach.ie`
- `gaeltacht.sionnach.ie`

Both names point at the same Cloudflare Pages project.

## How it speaks

1. **Azure Neural Irish voices first.** On load the app asks its own `/speech-token` endpoint for a short-lived Azure Speech token. If it gets one, the voice menu offers `ga-IE-OrlaNeural` (Orla) and `ga-IE-ColmNeural` (Colm), and the badge reads "Azure Neural Irish". The Azure Speech SDK is lazy-loaded from jsDelivr the first time Speak is pressed.
2. **Web Speech API as the fallback.** If the token endpoint is unavailable, or an Azure synthesis call fails, the app falls back to the browser's own voices, preferring Irish (`ga`), then Irish English (`en-IE`), then British English (`en-GB`). Quality then depends entirely on the device.

The rate and pitch sliders only affect the Web Speech fallback. The Azure path ignores them, and the UI dims them when Azure is active.

## Features

- 65 pre-loaded words across six categories: greetings (8), phrases (12), culture (21), nature (6), numbers (10), projects (8)
- Add your own words; they persist in `localStorage` under `ga-say-words` and default to a seventh category, `misc`
- Category tabs for navigation
- Four themes (Parchment, Folio, Obsidian, Studio) matching Sionnach

## Stack

Vanilla HTML/CSS/JS · Azure Speech neural TTS through a Cloudflare Pages Function · Web Speech API fallback · Cloudflare Pages

No build step. The only runtime dependency is the Azure Speech SDK, loaded from a CDN on demand.

## The speech-token function

`functions/speech-token.js` is a Cloudflare Pages Function served at `/speech-token`. It exchanges the Azure Speech key for a token so the key itself never reaches the browser.

- Returns `{ "token": "...", "region": "..." }` with `Cache-Control: no-store`
- Azure tokens last 10 minutes; the client caches one for 9
- Returns `503` with `Speech service not configured` when the environment variables are missing, which sends the app to the Web Speech fallback
- CORS is limited to an allowlist of origins in the function:
  - `https://ga-say.sionnach.ie`
  - `https://gaeltacht.sionnach.ie`
  - `https://foghlaim.sionnach.ie`
  - `https://foxxelabs.ie`
  - `https://www.foxxelabs.ie`
  - `http://localhost:8788`
  - `http://127.0.0.1:8788`

**Foghlaim (`foghlaim.sionnach.ie`) uses this endpoint for its own voices**, so breaking it breaks both apps. To let another site use it, add its origin to the `allowed` array.

### Environment variables

Set both in the Cloudflare Pages dashboard for this project:

| Variable | Value |
| --- | --- |
| `AZURE_SPEECH_KEY` | Key 1 from the Azure Speech resource |
| `AZURE_SPEECH_REGION` | The resource's region, e.g. `northeurope` |

## Known issues

- **The Azure Speech SDK is loaded unpinned.** `app.js` requests `microsoft-cognitiveservices-speech-sdk@latest` from jsDelivr, so an upstream release can change or break Speak without any commit here. Pin a version.
- The first Speak downloads the SDK bundle, so there is a delay before the first word on a slow connection.

## Deployment

Push to GitHub and Cloudflare Pages auto-deploys.

1. Add two CNAMEs in Cloudflare DNS, both pointing at the same Pages URL:
   - `ga-say` → `<project>.pages.dev`
   - `gaeltacht` → `<project>.pages.dev`
2. Set `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` in the Pages project's environment variables. Without them the site still works, on browser voices only.

## Adding words

Edit `words.js`:

```js
{ irish:"focal", eng:"word", phonetic:"FOK-ul", cat:"misc" }
```

Categories: `greetings | phrases | culture | nature | numbers | projects | misc`

Foghlaim's word list was seeded from this file, but it is a copy, not a live import. New words added here do not appear there.
