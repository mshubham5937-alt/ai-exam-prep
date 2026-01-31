
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; 

export const callGeminiAPI = async (prompt, systemInstruction = "") => {
  if (!API_KEY) {
    console.warn("Gemini API Key is missing");
    return null;
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          generationConfig: {
            responseMimeType: "application/json"
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
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
