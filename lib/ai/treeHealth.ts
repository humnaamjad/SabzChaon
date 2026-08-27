import type { AiStatus } from "@/types/entities";

const DASHSCOPE_BASE_URL =
  "https://ws-alumuj633rdp5mro.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1";

const SYSTEM_PROMPT = `You are assessing visible plant health from a photo. This is a non-professional, visible-signs-only assessment, not a diagnosis. If the image is unclear or not a plant, default aiStatus to "needs_attention" and explain in aiConfidenceNote.

Respond with ONLY a valid JSON object — no other text, no markdown, no code fences, no labels outside JSON. Use this exact format:
{"aiStatus": "healthy", "aiCareRecommendation": "1-2 short sentences of plain-language care advice", "aiConfidenceNote": "optional brief basis, e.g. yellowing leaves visible"}

aiStatus must be exactly one of: "healthy", "needs_attention", or "unknown".`;

const FAILURE_RESULT = {
  aiStatus: "unknown" as const,
  aiCareRecommendation: "AI analysis unavailable — manual review recommended",
};

interface AnalysisResult {
  aiStatus: AiStatus;
  aiCareRecommendation: string;
  aiConfidenceNote?: string;
}

const VALID_STATUSES: AiStatus[] = ["healthy", "needs_attention", "unknown"];

function parseFallbackText(text: string): AnalysisResult | null {
  const lower = text.toLowerCase();

  // Extract status — match patterns like "status: healthy", "aiStatus: needs_attention"
  const statusMatch = lower.match(
    /(?:ai)?status\s*[:=]\s*(healthy|needs_attention|unknown)/
  );
  if (!statusMatch) return null;
  const aiStatus = statusMatch[1] as AiStatus;

  // Extract recommendation — match various label patterns
  const recMatch = text.match(
    /(?:ai)?(?:care)?recommendation\s*[:=]\s*(.+)/i
  );
  const aiCareRecommendation = recMatch
    ? recMatch[1].trim()
    : "See AI response for care advice";

  // Extract confidence note — optional
  const confMatch = text.match(
    /(?:ai)?confidence(?:note)?\s*[:=]\s*(.+)/i
  );
  const aiConfidenceNote = confMatch ? confMatch[1].trim() : undefined;

  return {
    aiStatus,
    aiCareRecommendation,
    ...(aiConfidenceNote && { aiConfidenceNote }),
  };
}

export async function analyzeTreePhoto(input: {
  photoUrl: string;
  textNote?: string;
}): Promise<AnalysisResult> {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    console.error("[analyzeTreePhoto] DASHSCOPE_API_KEY is not set");
    return {
      ...FAILURE_RESULT,
      aiConfidenceNote: "AI service not configured",
    };
  }

  const { photoUrl, textNote } = input;

  try {
    const response = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen3-vl-plus",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: photoUrl },
              },
              {
                type: "text",
                text: textNote || "Assess this tree/plant photo.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "<unreadable>");
      console.error(
        `[analyzeTreePhoto] API error: ${response.status} ${response.statusText}`,
        errorText
      );
      return {
        ...FAILURE_RESULT,
        aiConfidenceNote: `AI service error: ${response.status}`,
      };
    }

    const data = await response.json();

    const rawContent = data?.choices?.[0]?.message?.content;
    if (typeof rawContent !== "string" || !rawContent.trim()) {
      console.error("[analyzeTreePhoto] Empty or missing content in response");
      return {
        ...FAILURE_RESULT,
        aiConfidenceNote: "AI returned empty response",
      };
    }

    // Clean the response: strip markdown fences, trim, extract JSON object
    let cleaned = rawContent.trim();

    // Strip markdown code fences (```json ... ``` or ``` ... ```)
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "");
    cleaned = cleaned.replace(/\n?```\s*$/i, "");
    cleaned = cleaned.trim();

    // If there's extra text around the JSON, extract just the {...} portion
    if (!cleaned.startsWith("{")) {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
    }

    let parsed: AnalysisResult;
    try {
      parsed = JSON.parse(cleaned) as AnalysisResult;
    } catch {
      // Fallback: extract from labeled text like "status: healthy"
      const fallback = parseFallbackText(rawContent);
      if (fallback) {
        return fallback;
      }
      console.error(
        "[analyzeTreePhoto] JSON parse failed. Raw content:",
        rawContent
      );
      return {
        ...FAILURE_RESULT,
        aiConfidenceNote: "AI response was not valid JSON",
      };
    }

    // Validate the parsed result has required fields
    if (
      !parsed.aiStatus ||
      !parsed.aiCareRecommendation ||
      typeof parsed.aiStatus !== "string" ||
      typeof parsed.aiCareRecommendation !== "string"
    ) {
      console.error("[analyzeTreePhoto] Invalid response shape:", parsed);
      return {
        ...FAILURE_RESULT,
        aiConfidenceNote: "AI response missing required fields",
      };
    }

    // Validate aiStatus is a valid value
    if (!VALID_STATUSES.includes(parsed.aiStatus)) {
      console.error(
        `[analyzeTreePhoto] Invalid aiStatus: ${parsed.aiStatus}`
      );
      return {
        ...FAILURE_RESULT,
        aiConfidenceNote: `AI returned invalid status: ${parsed.aiStatus}`,
      };
    }

    return {
      aiStatus: parsed.aiStatus,
      aiCareRecommendation: parsed.aiCareRecommendation,
      ...(parsed.aiConfidenceNote && {
        aiConfidenceNote: parsed.aiConfidenceNote,
      }),
    };
  } catch (error) {
    // Log error but never expose API key
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[analyzeTreePhoto] Exception:", message);

    return {
      ...FAILURE_RESULT,
      aiConfidenceNote: message.slice(0, 100),
    };
  }
}
