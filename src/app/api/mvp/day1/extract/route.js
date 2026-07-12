import { getModel } from '../../../../../engines/ai/pipeline';
import { generateText } from 'ai';

const SYSTEM_PROMPT_EXTRACT = `
You are an expert AI knowledge graph extractor. Your task is to extract a temporally-aware knowledge graph from the given text.

Extract:
1. Nodes: Entities like Person, Organization, Project, Event, Concept, Location.
   Each node must have:
   - id: a unique, lowercase alphanumeric string (e.g., "sinae_cho", "postify_ai")
   - label: human readable name (e.g., "Sinae Cho", "Postify-AI")
   - type: one of ["Person", "Organization", "Project", "Event", "Concept", "Location"]
   - description: brief summary of who or what this node is.

2. Links: Relationships between nodes.
   Each link must have:
   - source: the id of the source node
   - target: the id of the target node
   - relation: the type of relation (e.g., "Founded", "WorkedAt", "PartneredWith", "Acquired", "Collaborated")
   - timestamp: a string specifying when this relationship started, changed, or happened (e.g., "2026-07", "2025-03", "2024", "June 2026"). If no time is mentioned, set it to "".
   - description: a short description of the relation (e.g., "Sinae founded Postify-AI in July 2026")

Make sure all source and target IDs match existing node IDs.
Keep the graph clean and focused on high-signal entities. Do not extract trivial concepts.

Return ONLY a valid JSON object matching this schema:
{
  "nodes": [{"id": "...", "label": "...", "type": "...", "description": "..."}, ...],
  "links": [{"source": "...", "target": "...", "relation": "...", "timestamp": "...", "description": "..."}, ...]
}

Do NOT include any markdown formatting, code block markers (like \`\`\`json), or text outside the JSON.
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
    const { text, provider, apiKey, geminiKey } = body;

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'Text prompt is required' }, { status: 400, headers: corsHeaders });
    }

    const model = getModel(provider || 'openai', apiKey, geminiKey);

    const { text: responseText } = await generateText({
      model,
      system: SYSTEM_PROMPT_EXTRACT,
      prompt: `Analyze this text and extract the knowledge graph: ${text}`,
    });

    // Clean Markdown block wrapper if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    const graph = JSON.parse(cleanedText);

    return Response.json(graph, { headers: corsHeaders });
  } catch (error) {
    console.error('Extraction API error:', error);
    return Response.json({ error: error.message || 'Failed to extract knowledge graph' }, { status: 500, headers: corsHeaders });
  }
}
