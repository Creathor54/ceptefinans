import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash"; 

export const analyzeReceiptImage = async (base64Image: string): Promise<ReceiptData> => {
  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await genAI.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          {
            text: "Bu fiş fotoğrafını analiz et. Aşağıdaki kurallara kesinlikle uy:\n1. Mağaza adını (merchant), tarihi (YYYY-MM-DD), ürünleri ve toplamı çıkar.\n2. Para birimi (currency) varsayılan olarak '₺' olsun.\n3. JSON formatındaki sayısal değerlerde (price, total) ondalık ayracı olarak virgül (,) DEĞİL, nokta (.) kullan. Örneğin 12,50 yerine 12.50 yaz.\n4. Yanıtı sadece saf JSON formatında ver.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            date: { type: Type.STRING },
            total: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  quantity: { type: Type.STRING },
                },
              },
            },
          },
          required: ["merchant", "total", "items"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Clean any markdown formatting that might slip through (e.g. ```json ... ```)
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        const data = JSON.parse(cleanText) as ReceiptData;
        return {
            merchant: data.merchant || "Bilinmeyen Mağaza",
            date: data.date || new Date().toISOString().split('T')[0],
            items: data.items || [],
            total: data.total || 0,
            currency: data.currency || "₺"
        };
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw Text:", cleanText);
        throw new Error("Gemini yanıtı geçerli JSON değil.");
    }
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a fallback/empty structure on error, but log it clearly
    return {
      merchant: "Okuma Hatası",
      date: new Date().toISOString().split('T')[0],
      items: [],
      total: 0,
      currency: "₺"
    };
  }
};

export const parseVoiceExpense = async (text: string, availableCategories: string[]): Promise<{ merchant: string, amount: number, category: string, date: string }> => {
  try {
    const response = await genAI.models.generateContent({
      model: modelId,
      contents: {
        parts: [{
          text: `
            Analyze this Turkish voice command for an expense: "${text}".
            
            Extract the following:
            1. Merchant/Description (merchant)
            2. Total Amount (amount) - convert text numbers to digits if needed.
            3. Category (category) - Pick the best match strictly from this list: ${JSON.stringify(availableCategories)}. If no match, use "Diğer".
            4. Date (date) - YYYY-MM-DD format. Default to today (${new Date().toISOString().split('T')[0]}) unless specified otherwise in the text (e.g. "yesterday", "last friday").

            Return ONLY JSON.
          `
        }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            date: { type: Type.STRING }
          },
          required: ["merchant", "amount", "category", "date"]
        }
      }
    });

    const cleanText = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!cleanText) throw new Error("No text returned");
    
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Voice Parse Error:", error);
    throw new Error("Sesli komut anlaşılamadı.");
  }
};