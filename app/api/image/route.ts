export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const value = new URL(req.url).searchParams.get('url');
  if (!value) return new Response('Immagine non valida', { status: 400 });

  let imageUrl: URL;
  try { imageUrl = new URL(value); } catch { return new Response('Immagine non valida', { status: 400 }); }
  const allowed=['ansa.it','corriere.it','corriereobjects.it','repubblica.it','repstatic.it','ilfoglio.it','ilgiornale.it','ilriformista.it','lastampa.it','ilpost.it','umbria24.it','europarl.europa.eu','hdblog.it','punto-informatico.it','fcinternews.it','ilfoglio-produzione.fra1.cdn.digitaloceanspaces.com'];
  if (imageUrl.protocol !== 'https:' || imageUrl.username || imageUrl.password || (imageUrl.port && imageUrl.port!=='443') || !allowed.some(h=>imageUrl.hostname===h||imageUrl.hostname.endsWith('.'+h))) return new Response('Immagine non valida', { status: 400 });

  try {
    const upstream = await fetch(imageUrl, {
      headers: { Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8', 'User-Agent': 'Mozilla/5.0' },
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    });
    const type = upstream.headers.get('content-type') || '';
    if (!upstream.ok || !type.startsWith('image/')) return new Response('Immagine non disponibile', { status: 404 });
    return new Response(upstream.body, { headers: { 'Content-Type': type, 'Cache-Control': 'private, max-age=3600' } });
  } catch { return new Response('Immagine non disponibile', { status: 404 }); }
}
