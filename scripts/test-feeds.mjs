#!/usr/bin/env node
/**
 * test-feeds.mjs — Validatore feed RSS (categoria "translations" e non solo)
 *
 * Replica il comportamento del backend Rust `fetch_rss_feed` (fetch server-side,
 * niente CORS) per capire QUALI feed candidati in lib/news-feeds.ts funzionano
 * davvero: stato HTTP, content-type, validità XML (rss/atom), numero di voci e
 * data dell'ultima voce.
 *
 * Uso:
 *   node scripts/test-feeds.mjs              # testa solo i candidati ITA + GamesTranslator
 *   node scripts/test-feeds.mjs --all        # testa TUTTI i feed translations
 *   node scripts/test-feeds.mjs --url <URL>  # testa un singolo URL
 *
 * Nessuna dipendenza esterna (richiede Node >= 18 per fetch globale).
 */

const ARGS = process.argv.slice(2);
const TEST_ALL = ARGS.includes('--all');
const SINGLE_URL = ARGS.includes('--url') ? ARGS[ARGS.indexOf('--url') + 1] : null;
const TIMEOUT_MS = 15000;

// Stesso pool di User-Agent "browser-like": Invision/itch.io/Cloudflare spesso
// bloccano UA di default tipo "node". Il backend Tauri invia un UA realistico.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/124.0.0.0 Safari/537.36';

// Candidati ITA da news-feeds.ts (righe ~111, 115-119) + le sorgenti già attive.
const FEEDS = [
  // ── Candidati prioritari (richiamati nel digest) ──
  { id: 'ctrltrad', name: 'Ctrl+Trad', candidate: true,
    url: 'https://ctrltrad.itch.io/devlog.rss' },
  { id: 'gamestranslator', name: 'GamesTranslator.it', candidate: true,
    url: 'https://www.gamestranslator.it/index.php?/discover/&type=core_File&changeType=new&format=rss' },

  // ── Altri candidati aggiunti il 2026-05-20 (enabled:false, da verificare) ──
  { id: 'romhacking_it', name: 'Romhacking.it', candidate: true,
    url: 'https://romhacking.it/feed/' },
  { id: '2duerighe', name: '2duerighe Videogiochi', candidate: true,
    url: 'https://www.2duerighe.com/videogiochi/feed/' },
  { id: 'oldgamesitalia', name: 'OldGamesItalia', candidate: true,
    url: 'https://www.oldgamesitalia.net/forum/index.php?app=core&module=global&section=rss&type=forums&id=1' },
  { id: 'pcgw_italian_translations', name: 'PCGW — Italian Fan Translations', candidate: true,
    url: 'https://www.pcgamingwiki.com/w/api.php?action=feedrecentchanges&format=xml&days=30&limit=20&titles=List_of_Italian_fan_translations' },

  // ── Sorgenti translations già presenti (riferimento) ──
  { id: 'romhackplaza', name: 'RomHack Plaza', candidate: false, alreadyEnabled: true,
    url: 'https://romhackplaza.org/feed/' },
  { id: 'nexusmods', name: 'NexusMods', candidate: false,
    url: 'https://www.nexusmods.com/news/rss/' },
];

/** Verde/rosso essenziali per terminale. */
const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function looksLikeFeed(text) {
  return /<rss[\s>]/i.test(text) || /<feed[\s>]/i.test(text) || /<channel[\s>]/i.test(text);
}

function countItems(text) {
  const rss = (text.match(/<item[\s>]/gi) || []).length;
  const atom = (text.match(/<entry[\s>]/gi) || []).length;
  return { rss, atom, total: rss + atom };
}

function firstTitles(text, n = 3) {
  const titles = [];
  const re = /<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/gi;
  let m;
  while ((m = re.exec(text)) && titles.length < n + 1) {
    let t = m[1]
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (t) titles.push(t);
  }
  // Il primo <title> è quasi sempre il titolo del canale: scartalo.
  return titles.slice(1, n + 1);
}

function lastPubDate(text) {
  const dates = [];
  const reRss = /<pubDate>([\s\S]*?)<\/pubDate>/gi;
  const reAtom = /<(?:updated|published)>([\s\S]*?)<\/(?:updated|published)>/gi;
  let m;
  while ((m = reRss.exec(text))) dates.push(m[1].trim());
  while ((m = reAtom.exec(text))) dates.push(m[1].trim());
  const parsed = dates.map((d) => new Date(d)).filter((d) => !isNaN(d)).sort((a, b) => b - a);
  return parsed[0] || null;
}

async function testFeed(feed) {
  const started = Date.now();
  const out = { ...feed, ok: false, status: null, contentType: '', items: 0, last: null, titles: [], note: '' };
  try {
    const res = await fetch(feed.url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: 'follow',
      headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml, */*' },
    });
    out.status = res.status;
    out.contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    out.ms = Date.now() - started;

    if (!res.ok) {
      out.note = `HTTP ${res.status}`;
      return out;
    }
    if (!looksLikeFeed(text)) {
      out.note = /<!doctype html|<html/i.test(text)
        ? 'Risposta HTML, non un feed (probabile blocco/anti-bot o pagina di errore)'
        : 'Contenuto non riconosciuto come RSS/Atom';
      return out;
    }
    const { total } = countItems(text);
    out.items = total;
    out.last = lastPubDate(text);
    out.titles = firstTitles(text, 3);
    out.ok = total > 0;
    if (total === 0) out.note = 'Feed valido ma senza voci';
    return out;
  } catch (e) {
    out.ms = Date.now() - started;
    out.note = e.name === 'TimeoutError' ? `Timeout (${TIMEOUT_MS}ms)` : (e.cause?.code || e.message || String(e));
    return out;
  }
}

function fmtDate(d) {
  if (!d) return '—';
  const days = Math.round((Date.now() - d.getTime()) / 86400000);
  return `${d.toISOString().slice(0, 10)} (${days} giorni fa)`;
}

async function main() {
  let list = FEEDS;
  if (SINGLE_URL) list = [{ id: 'custom', name: 'URL custom', candidate: true, url: SINGLE_URL }];
  else if (!TEST_ALL) list = FEEDS.filter((f) => f.candidate);

  console.log(c.bold(`\n🔎 Test feed RSS — ${new Date().toISOString().slice(0, 16).replace('T', ' ')}  (timeout ${TIMEOUT_MS}ms)\n`));

  const results = [];
  for (const feed of list) {
    process.stdout.write(c.dim(`  testing ${feed.name} …\r`));
    const r = await testFeed(feed);
    results.push(r);

    const badge = r.ok ? c.green('  OK  ') : c.red(' FAIL ');
    console.log(`${badge} ${c.bold(feed.name.padEnd(28))} ${c.dim(feed.url)}`);
    console.log(
      `        status=${r.status ?? '—'}  items=${r.items}  ultima=${fmtDate(r.last)}  ${r.ms ? r.ms + 'ms' : ''}` +
        (r.contentType ? `  ${c.dim(r.contentType.split(';')[0])}` : '')
    );
    if (r.note) console.log(`        ${c.yellow('⚠ ' + r.note)}`);
    if (r.ok && r.titles.length) r.titles.forEach((t) => console.log(c.dim(`          • ${t.slice(0, 90)}`)));
    console.log('');
  }

  const okIds = results.filter((r) => r.ok).map((r) => r.id);
  console.log(c.bold('── Riepilogo ──'));
  console.log(`  Funzionanti: ${okIds.length ? c.green(okIds.join(', ')) : c.red('nessuno')}`);
  const fail = results.filter((r) => !r.ok).map((r) => r.id);
  if (fail.length) console.log(`  Da scartare/riprovare: ${c.yellow(fail.join(', '))}`);
  console.log('');
  console.log(c.dim('  Suggerimento: per i feed OK, metti enabled:true in lib/news-feeds.ts e verifica in-app (Gestisci feed).'));
  console.log(c.dim('  Nota: un OK qui = endpoint raggiungibile lato server. In-app passa comunque dal proxy CORS, quindi conferma sempre nella UI.\n'));

  // Exit code utile in CI: 0 se almeno un candidato funziona.
  process.exit(okIds.length ? 0 : 1);
}

main();
