import { getModel } from '../../../../../engines/ai/pipeline';
import { generateText } from 'ai';

const SYSTEM_PROMPT_QUERY = `
You are an expert temporal knowledge graph assistant. Your job is to answer the user's question based strictly and ONLY on the provided knowledge graph data.

The graph data contains nodes (entities) and links (relations with timestamps).
Pay close attention to timestamps to explain how facts and relations change over time.

Your response must be a JSON object containing:
1. "answer": Your Markdown-formatted answer based strictly on the graph data. If the answer cannot be found in the graph, say "I cannot find information regarding this in the knowledge graph."
2. "highlightedNodeIds": An array of node IDs that were referenced to construct your answer.

Format your output ONLY as a valid JSON object matching this schema:
{
  "answer": "Your answer text here...",
  "highlightedNodeIds": ["node_id_1", "node_id_2"]
}

Do NOT wrap the JSON in markdown code blocks (\`\`\`json).
Do NOT include any commentary outside of the JSON object.
`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { query, graph, provider, apiKey, geminiKey } = body;

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'Query is required' }, { status: 400, headers: corsHeaders });
    }

    if (!graph || !graph.nodes) {
      return Response.json({ error: 'Valid graph data is required' }, { status: 400, headers: corsHeaders });
    }

    const model = getModel(provider || 'openai', apiKey, geminiKey);

    const graphContext = JSON.stringify(graph, null, 2);

    const { text: responseText } = await generateText({
      model,
      system: SYSTEM_PROMPT_QUERY,
      prompt: `[Knowledge Graph Data]\n${graphContext}\n\n[User Question]\n${query}\n\nAnswer the question using the graph:`,
    });

    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    const result = JSON.parse(cleanedText);

    return Response.json(result, { headers: corsHeaders });
  } catch (error) {
    console.error('Query API error:', error);
    return Response.json({ error: error.message || 'Failed to query knowledge graph' }, { status: 500, headers: corsHeaders });
  }
}
