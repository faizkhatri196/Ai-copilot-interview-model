import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateInterviewQuestions = async (role, difficulty) => {
  try {
    const prompt = `You are an expert technical interviewer. Generate 5 interview questions for a ${difficulty} level ${role} position. 
    Return ONLY a valid JSON array of objects. Do not include markdown formatting or backticks.
    Format each object exactly like this:
    [
      {
        "questionText": "The question here",
        "category": "e.g., React, Node, System Design, DSA"
      }
    ]`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
    });
    
    const text = response.text;
    // Clean up response if it contains markdown JSON blocks
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('AI Error (generate questions):', error);
    throw new Error(`Failed to generate interview questions: ${error.message}`);
  }
};

export const evaluateAnswer = async (question, answer, role) => {
  try {
    const prompt = `You are an expert technical interviewer evaluating an answer for a ${role} position.
    Question: "${question}"
    Candidate's Answer: "${answer}"
    
    Evaluate the candidate's answer based on Correctness, Clarity, and Technical Depth.
    Provide a score out of 100.
    Return ONLY a valid JSON object. Do not include markdown formatting or backticks.
    Format exactly like this:
    {
      "score": 85,
      "feedback": "Overall feedback on what was good and what was missing.",
      "correctness": "Feedback specifically on factual correctness.",
      "clarity": "Feedback on how clearly the answer was communicated."
    }`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
    });
    
    const text = response.text;
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('AI Error (evaluate answer):', error);
    throw new Error('Failed to evaluate answer');
  }
};
