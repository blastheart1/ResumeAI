// src/lib/api.ts
export interface SuggestionItem {
  category: string;
  title: string;
  score: number;
  items?: Record<string, string[]>;
  message: string;
}

export interface ApiResponse {
  success: boolean;
  suggestions: SuggestionItem[];
}

export async function analyzeResume(resumeFile: File, jobDescription: string): Promise<ApiResponse | null> {
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
