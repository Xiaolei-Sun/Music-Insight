/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { MusicInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function fetchMusicInfo(query: string): Promise<MusicInfo> {
  const prompt = `
    TASK: Act as a high-end music researcher and editorial writer. 
    QUERY: "${query}"
    
    INSTRUCTION:
    1. FACTUAL ACCURACY IS PARAMOUNT. You must provide absolutely accurate information. Do not hallucinate, guess, or invent details about artists, nationalities, or backgrounds.
    2. Identity Verification: Ensure the artist and song you identify are the correct ones associated with the query. Do not confuse artists with similar names.
    3. Retrieve accurate information about the artist (specifically their actual nationality and background), track background, and musical style.
    4. Generate high-quality, professional editorial summaries in both Chinese and English.
    
    EDITORIAL GUIDELINES:
    - EVERY SECTION MUST BE BILINGUAL (CN and EN).
    - "styleDescription" MUST focus on the SPECIFIC TRACK'S musical style, arrangement, and mood, NOT the artist's general career-wide style.
    - Profiles and backgrounds should be concise but informative.
    - DO NOT assume identities. If an artist's background is obscure, stick to what is factually known about the release itself.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            songName: { type: Type.STRING },
            artistName: { type: Type.STRING },
            album: { type: Type.STRING },
            releaseYear: { type: Type.STRING },
            artistOverviewCN: { type: Type.STRING },
            artistOverviewEN: { type: Type.STRING },
            trackBackgroundCN: { type: Type.STRING },
            trackBackgroundEN: { type: Type.STRING },
            styleDescriptionCN: { type: Type.STRING, description: "Detailed musical style, arrangement and mood of the SPECIFIC TRACK searched." },
            styleDescriptionEN: { type: Type.STRING, description: "English counterpart for the track's specific style." },
            summaryCN: { type: Type.STRING },
            summaryEN: { type: Type.STRING },
          },
          required: [
            "songName", "artistName", "artistOverviewCN", "artistOverviewEN", 
            "trackBackgroundCN", "trackBackgroundEN", "styleDescriptionCN", 
            "styleDescriptionEN", "summaryCN", "summaryEN"
          ],
        }
      }
    });

    if (!result.text) {
      throw new Error("The AI model returned an empty response.");
    }

    const data = JSON.parse(result.text) as MusicInfo;
    return data;
  } catch (error) {
    console.error("Gemini Service Error:", error);
    if (error instanceof Error && error.message.includes("429")) {
      throw new Error("The service is currently busy (Rate Limit). Please wait a moment and try again.");
    }
    throw new Error("Failed to retrieve music information. Please check your query or try again later.");
  }
}
