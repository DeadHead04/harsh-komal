import { getWishStore } from '@/lib/wish-store.mjs';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export function GET() {
  try { getWishStore().list(); return Response.json({status:'ok'}); }
  catch { return Response.json({status:'unavailable'},{status:503}); }
}
