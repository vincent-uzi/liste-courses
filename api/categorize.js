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
      system: "Tu catégorises les articles de courses. Réponds uniquement avec une de ces valeurs sans rien d'autre : Fruits & Légumes, Viandes & Poissons, Produits laitiers, Épicerie, Boissons, Surgelés, Boulangerie, Hygiène & Beauté, Entretien, Autre",
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
