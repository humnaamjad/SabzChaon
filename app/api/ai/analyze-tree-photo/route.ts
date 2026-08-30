import { analyzeTreePhoto } from "@/lib/ai/treeHealth";
import type { ApiResponse } from "@/types/entities";

interface AnalyzeBody {
  photoUrl: string;
  textNote?: string;
}

interface AnalysisData {
  aiStatus: "healthy" | "needs_attention" | "unknown";
  aiCareRecommendation: string;
  aiConfidenceNote?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeBody;

    if (!body.photoUrl || typeof body.photoUrl !== "string") {
      const res: ApiResponse = {
        success: false,
        error: "photoUrl is required and must be a string",
      };
      return Response.json(res, { status: 400 });
    }

    const result = await analyzeTreePhoto({
      photoUrl: body.photoUrl,
      textNote: body.textNote,
    });

    const data: AnalysisData = {
      aiStatus: result.aiStatus,
      aiCareRecommendation: result.aiCareRecommendation,
      ...(result.aiConfidenceNote && {
        aiConfidenceNote: result.aiConfidenceNote,
      }),
    };

    const res: ApiResponse<AnalysisData> = {
      success: true,
      data,
    };
    return Response.json(res);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("[/api/ai/analyze-tree-photo] Unexpected error:", message);

    const res: ApiResponse = {
      success: false,
      error: message,
    };
    return Response.json(res, { status: 500 });
  }
}
