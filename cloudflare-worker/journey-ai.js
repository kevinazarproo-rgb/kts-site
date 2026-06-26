/**
 * KTS · "Compose your journey" — Cloudflare Worker (Workers AI)
 * Reçoit { lang, text, themes, destinations, catalog } et renvoie { intro, ids, model }.
 * Essaie plusieurs modèles jusqu'à en trouver un disponible sur le compte.
 *
 * Diagnostic : ouvre l'URL du Worker dans le navigateur avec ?debug=1
 *   -> https://kts-journey-ai.xxx.workers.dev/?debug=1
 *   Il teste les modèles et affiche lequel fonctionne / les erreurs.
 */

// Liste de modèles essayés dans l'ordre (le 1er qui marche est utilisé)
const MODELS = [
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  '@cf/meta/llama-4-scout-17b-16e-instruct',
  '@cf/meta/llama-3.1-8b-instruct-fast',
  '@cf/meta/llama-3.1-70b-instruct',
  '@cf/mistralai/mistral-small-3.1-24b-instruct',
  '@cf/meta/llama-3-8b-instruct',
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    // Mode diagnostic : ?debug=1 teste les modèles un par un
    const url = new URL(request.url);
    if (request.method === 'GET' && url.searchParams.get('debug') === '1') {
      const report = [];
      for (const m of MODELS) {
        try {
          const r = await env.AI.run(m, { messages: [{ role: 'user', content: 'ping' }], max_tokens: 5 });
          report.push({ model: m, ok: true, sample: (r && (r.response || r.result || '')) + '' });
        } catch (e) {
          report.push({ model: m, ok: false, error: String(e) });
        }
      }
      return json({ debug: report });
    }

    if (request.method !== 'POST') return json({ error: 'POST only' }, 405);

    let body;
    try { body = await request.json(); }
    catch (e) { return json({ error: 'invalid JSON' }, 400); }

    const lang = body.lang === 'fr' ? 'fr' : 'en';
    const text = (body.text || '').slice(0, 1000);
    const themes = Array.isArray(body.themes) ? body.themes : [];
    const dests = Array.isArray(body.destinations) ? body.destinations : [];
    const catalog = Array.isArray(body.catalog) ? body.catalog : [];
    const validIds = new Set(catalog.map((c) => c.id));

    const list = catalog
      .map((c) => `- ${c.id} | ${c.title} | dest:${c.dest} | themes:${(c.themes || []).join(',')} | ${c.blurb}`)
      .join('\n');

    const sys =
      `You are a luxury travel concierge for KTS France, a French DMC. ` +
      `You ONLY recommend experiences taken from the CATALOG provided by the user. ` +
      `Never invent experiences, destinations or ids. ` +
      `Choose the 4 to 7 catalog entries that best match the client's wishes (free text, themes, destinations). ` +
      `If the client named one or more destinations, stay within them. ` +
      `Reply with STRICT JSON only, no markdown, exactly: ` +
      `{"intro":"<one warm sentence in ${lang === 'fr' ? 'French' : 'English'} addressed to the client>","ids":["<catalog id>", ...]}. ` +
      `Every id MUST come from the catalog.`;

    const user =
      `CLIENT WISHES\n` +
      `Free text: ${text || '(none)'}\n` +
      `Themes: ${themes.join(', ') || '(none)'}\n` +
      `Destinations: ${dests.join(', ') || '(any)'}\n\n` +
      `CATALOG (id | title | dest | themes | blurb)\n${list}`;

    const messages = [
      { role: 'system', content: sys },
      { role: 'user', content: user },
    ];

    let aiText = '', usedModel = '', lastErr = '';
    for (const m of MODELS) {
      try {
        const out = await env.AI.run(m, { messages, max_tokens: 400, temperature: 0.3 });
        aiText = (out && (out.response || out.result || '')) + '';
        usedModel = m;
        break;
      } catch (e) {
        lastErr = String(e);
      }
    }
    if (!usedModel) return json({ error: 'no model available', detail: lastErr }, 502);

    let data = {};
    const mm = aiText.match(/\{[\s\S]*\}/);
    if (mm) { try { data = JSON.parse(mm[0]); } catch (e) { /* ignore */ } }

    const ids = Array.isArray(data.ids) ? data.ids.filter((id) => validIds.has(id)).slice(0, 8) : [];
    const intro = typeof data.intro === 'string' ? data.intro.slice(0, 300) : '';

    return json({ intro, ids, model: usedModel });
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
