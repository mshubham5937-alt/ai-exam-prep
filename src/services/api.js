
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const callGeminiAPI = async (prompt, systemInstruction = "") => {
  if (!API_KEY) {
    console.warn("Gemini API Key is missing");
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-exp-02-05:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : { parts: [{ text: "You are an elite exam preparation assistant for JEE/NEET. Your goal is to generate HIGHLY DIVERSE, challenging, and multi-step reasoning questions. Avoid repetitive structures. Vary the question format (some conceptual, some numerical calculations, some graphical descriptions). MANDATORY: Randomly distribute the correct answer across options A, B, C, and D. Ensure no two questions in a batch follow the same pattern or theme." }] },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.9, // Increased temperature for higher variety
            topP: 0.95
          }
        }),
      }
    );

    if (!response.ok) throw new Error('API call failed');

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const callGeminiChat = async (history, userMsg) => {
  if (!API_KEY) return "API Key missing. Please configure VITE_GEMINI_API_KEY.";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-exp-02-05:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            ...history, // { role: "user" | "model", parts: [{ text: "..." }] }
            { role: "user", parts: [{ text: userMsg }] }
          ]
        }),
      }
    );
    if (!response.ok) throw new Error('Chat API failed');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
  } catch (e) {
    console.error(e);
    return "Sorry, I'm having trouble connecting to the AI Tutor right now.";
  }
};
