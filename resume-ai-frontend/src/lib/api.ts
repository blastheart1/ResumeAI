// src/lib/api.ts
export interface SuggestionItem {
  category: string;
  title: string;
  score: number;
  items?: Record<string, string[]>; // old free-mode matched/missing
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

export async function analyzeResume(
  resumeFile: File,
  jobDescription: string
): Promise<ApiResponse | null> {
  try {
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job_description", jobDescription);

    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("API Error:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
}
