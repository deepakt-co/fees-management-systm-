import { GoogleGenAI } from "@google/genai";
import { Student, FeeStatus } from "../types";
import { calculateStatus } from "./storageService";

export const generateFinancialInsight = async (students: Student[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure the environment.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare anonymous data for analysis (privacy first)
  const analysisData = students.map(s => ({
    fee: s.monthlyFee,
    enrollmentYear: new Date(s.enrollmentDate).getFullYear(),
    status: calculateStatus(s.nextDueDate),
    paymentCount: s.payments.length,
    lastPaymentDate: s.payments.length > 0 ? s.payments[s.payments.length - 1].date : 'Never'
  }));

  const prompt = `
    You are an academic financial advisor. Analyze the following JSON data representing student fees.
    
    Data: ${JSON.stringify(analysisData)}

    Please provide a concise analysis in HTML format (using <ul>, <li>, <strong> tags only, no markdown blocks).
    1. Identify the percentage of overdue payments.
    2. Provide a projected revenue for next month based on active students.
    3. Give 2 actionable suggestions to improve fee collection based on the patterns (e.g. if many new students are overdue vs old students).
    
    Keep the tone professional and encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights at this time. Please check your connection.";
  }
};