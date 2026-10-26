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
