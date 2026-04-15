export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { texte } = req.body || {};
  if (!texte || typeof texte !== 'string') {
    return res.status(400).json({ error: 'Missing texte' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 20,
      system: `Tu catégorises les articles de courses en français. Réponds UNIQUEMENT avec une de ces valeurs exactes, sans ponctuation ni explication :
Fruits & Légumes, Viandes & Poissons, Produits laitiers, Épicerie, Boissons, Surgelés, Boulangerie, Hygiène & Beauté, Entretien, Autre

Règles importantes :
- PQ, PH, papier toilette, papier hygiénique, mouchoirs, sopalin, coton, serviettes hygiéniques, tampons → Hygiène & Beauté
- Lessive, liquide vaisselle, éponge, sacs poubelle, produit ménager, nettoyant → Entretien
- Pain, baguette, croissant, brioche, viennoiserie → Boulangerie
- Lait, yaourt, fromage, beurre, crème fraîche, œufs → Produits laitiers
- Eau, jus, soda, bière, vin, café, thé → Boissons
- Pâtes, riz, conserves, farine, huile, sucre, sauce → Épicerie
- Pomme, carotte, tomate, salade, banane, poireau → Fruits & Légumes
- Poulet, steak, saumon, jambon, crevettes → Viandes & Poissons
- Pizza surgelée, glace, poisson pané surgelé → Surgelés

Exemples de cas ambigus :
- "PQ" → Hygiène & Beauté
- "PH" → Hygiène & Beauté
- "papier" → Hygiène & Beauté
- "sopalin" → Hygiène & Beauté
- "cotons" → Hygiène & Beauté
- "éponges" → Entretien
- "sacs" → Entretien
- "chips" → Épicerie
- "chocolat" → Épicerie
- "compote" → Épicerie`,
      messages: [{ role: 'user', content: texte }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return res.status(response.status).json({ error: err?.error?.message || 'Anthropic API error' });
  }

  const data = await response.json();
  const rayon = data.content?.[0]?.text?.trim() || null;
  return res.status(200).json({ rayon });
}
