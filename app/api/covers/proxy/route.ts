import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = [
  'api.mobygames.com',
  'api.thegamesdb.net',
  'cdn.thegamesdb.net',
];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
  }

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'GameStringer/1.8',
    };

    // Forward API key if present in original URL
    const apikey = parsedUrl.searchParams.get('apikey');
    if (apikey) {
      headers['Authorization'] = `Bearer ${apikey}`;
    }

    const response = await fetch(parsedUrl.toString(), { headers, signal: AbortSignal.timeout(10000) });
    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Proxy error';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
