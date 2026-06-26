/**
 * KTS · "Compose your journey" — Cloudflare Worker (IA gratuite via Workers AI)
 *
 * Déploiement (tableau de bord Cloudflare, sans rien installer) :
 *  1. Crée un compte gratuit sur https://dash.cloudflare.com
 *  2. Menu "Workers & Pages" → "Create" → "Create Worker"
 *  3. Donne un nom (ex. kts-journey-ai) → "Deploy"
 *  4. "Edit code" → colle TOUT ce fichier à la place de l'exemple → "Deploy"
 *  5. Onglet "Settings" → "Bindings" → "Add binding" → "Workers AI"
 *       - Variable name : AI
 *     puis "Deploy" à nouveau
 *  6. Copie l'URL du Worker (ex. https://kts-journey-ai.TON-SOUS-DOMAINE.workers.dev)
 *     et envoie-la — on la colle dans assets/journey.js (variable AI_ENDPOINT).
 *
 * Le Worker reçoit { lang, text, themes, destinations, catalog } et renvoie
 * { intro, ids } — uniquement des id présents dans le catalogue fourni.
 */

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'; // modèle actuel ; voir AI → Models pour la liste à jour

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'POST')
      return json({ error: 'POST only' }, 405);

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

    let aiText = '';
    try {
      const out = await env.AI.run(MODEL, {
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user },
        ],
        max_tokens: 400,
        temperature: 0.3,
      });
      aiText = (out && (out.response || out.result || '')) + '';
    } catch (e) {
      return json({ error: 'AI error', detail: String(e) }, 502);
    }

    // Extraction tolérante du JSON renvoyé par le modèle
    let data = {};
    const m = aiText.match(/\{[\s\S]*\}/);
    if (m) { try { data = JSON.parse(m[0]); } catch (e) { /* ignore */ } }

    const ids = Array.isArray(data.ids) ? data.ids.filter((id) => validIds.has(id)).slice(0, 8) : [];
    const intro = typeof data.intro === 'string' ? data.intro.slice(0, 300) : '';

    return json({ intro, ids });
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
