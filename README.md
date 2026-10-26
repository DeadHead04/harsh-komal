# Harsh & Komal — Render deployment

This is the Render-compatible production edition of the Komal & Harsh wedding invitation. The original local/Cloudflare project remains in the sibling `komal-harsh` folder.

- Node 24; Next.js server, bound to Render's `PORT` on all interfaces.
- `npm ci`, `npm test`, `npm run build`, `npm start`.
- `render.yaml`: Singapore paid 0.5c-512mb web service named `harsh-komal`, with a 1 GB disk mounted at `/var/data`.
- Wishes use SQLite on that persistent disk, with idempotent submissions and per-visitor rate limiting. The database is created at runtime, not during build. No existing guest data is copied.
- `SQLITE_PATH=/var/data/wishes.sqlite` is required on Render. Local testing defaults to `.data/wishes.sqlite`.
- `/api/health` checks database availability. Keep one service instance with this disk-backed design.
- All invitation media, the music beginning at 38 seconds, and the Festeve360 WhatsApp CTA are bundled. No image-generation API keys are required or included.
- Render service creation and deployment must be confirmed separately; this repository alone does not indicate a live deployment.

## Wishes guestbook

- `/wishes` is a standalone public guestbook with names, full messages, IST timestamps, search, sorting and 12-item pagination. The invitation links to it from the wishes wall.
- `/api/wishes?view=guestbook&q=&order=newest&page=1` returns paginated public fields plus counts. Existing `/api/wishes` callers retain their original response shape.
- The generated hero uses optimized WebP assets (`wishes-hero-v1.webp`, 57 KB; mobile 20 KB). No API call is made by the website for image generation.
- Local preview fixtures are kept only in an ignored `.data/wishes-page-preview.sqlite` file and are never deployed.

Guestbook updates every 30 seconds while visible, and when returning to the tab or reconnecting. Long wishes have a six-line preview with an explicit full-message toggle. Existing messages remain visible if a background refresh fails.

English translation is requested on demand through a server-only OpenAI Responses API call (`gpt-4.1-mini`). Set `OPENAI_API_KEY` in Render's secret environment; never put it in client code or Git. `/api/wishes/translate` accepts only an existing wish ID, shares only that public name/message with OpenAI, and caches the English result separately in SQLite. Original wishes are never overwritten. Concurrent identical requests share one call, with two concurrent translations and ten new attempts per minute allowed per process. The UI labels AI translations and supports switching back to the original. `/wishes` has no audio or video.

Cached English translations are returned with guestbook results and shown by default; originals remain accessible. New wishes containing non-Latin letters request translation automatically through a serial client queue. The English/original choice stays stable during automatic refreshes.
