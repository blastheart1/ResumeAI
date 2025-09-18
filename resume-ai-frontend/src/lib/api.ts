// src/lib/api.ts
export interface SuggestionItems {
  matched: string[];
  missing: string[];
}

export interface SuggestionItem {
  category: string;
  title: string;
  score: number;
  items?: SuggestionItems | null; // matched/missing
  message: string;

  // AI-enhanced optional fields
  priority?: "Critical" | "Important" | "Nice-to-Have";
  recommendation?: string;
  confidence?: number; // 0 to 1
}

export interface ApiResponse {
  success: boolean;
  suggestions: SuggestionItem[];
}

const API_BASE_URL = "https://resumeai-fastapi.onrender.com";

export async function analyzeResume(
  resumeFile: File,
  jobDescription: string
): Promise<ApiResponse | null> {
  try {
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job_description", jobDescription);

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("API Error:", response.statusText);
      return null;
    }

    const data: ApiResponse = await response.json();

    // Ensure items arrays exist
    data.suggestions.forEach((s) => {
      if (!s.items) {
        s.items = { matched: [], missing: [] };
      }
    });

    return data;
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
}
