import { getWishStore } from "@/lib/wish-store.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  try {
    const rows = getWishStore().list();
    return json({ wishes: rows });
  } catch {
    return json(
      {
        error:
          "The wishes wall is temporarily unavailable. Please try again shortly.",
      },
      503,
    );
  }
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    const url = new URL(request.url);
    const expectedOrigin = process.env.RENDER_EXTERNAL_URL || `${url.protocol}//${request.headers.get("host") || url.host}`;
    if (origin && origin !== expectedOrigin)
      return json(
        { error: "Please send your wish from this invitation." },
        403,
      );
    if (Number(request.headers.get("content-length") || 0) > 8000)
      return json({ error: "Your wish is too long." }, 413);
    const raw = await request.text();
    if (raw.length > 8000)
      return json({ error: "Your wish is too long." }, 413);
    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      return json({ error: "Please check your message." }, 400);
    }
    if (!input || typeof input !== "object" || Array.isArray(input))
      return json({ error: "Please check your message." }, 400);
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const message =
      typeof input.message === "string" ? input.message.trim() : "";
    if (input.website) return json({ error: "Unable to send this wish." }, 400);
    if (
      name.length < 2 ||
      name.length > 80 ||
      message.length < 3 ||
      message.length > 800
    )
      return json(
        {
          error:
            "Enter your name (2–80 characters) and a wish (3–800 characters).",
        },
        400,
      );
    if (/https?:\/\/|www\./i.test(message))
      return json(
        { error: "Please share your wishes without web links." },
        400,
      );
    if (typeof input.id !== "string" || !/^[0-9a-f-]{36}$/.test(input.id))
      return json({ error: "Please reload and try again." }, 400);
    const visitor =
      request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
      "local";
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode("komal-harsh-wishes:" + visitor),
    );
    const visitorHash = Array.from(new Uint8Array(digest), (x) =>
      x.toString(16).padStart(2, "0"),
    ).join("");
    const result = getWishStore().add({ id: input.id, name, message, visitorHash, createdAt: Date.now() });
    if (result === "duplicate") return json({ ok: true });
    if (result === "limited") return json({ error: "Thank you! Please wait a minute before sending another wish." }, 429);
    return json({ ok: true }, 201);
  } catch {
    return json(
      {
        error:
          "Your wish was not confirmed. Please try again; your message is still here.",
      },
      503,
    );
  }
}
