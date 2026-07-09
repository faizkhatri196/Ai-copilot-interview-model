import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini as fallback
let aiFallback = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiFallback = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.error('Failed to initialize Gemini fallback:', err);
  }
}

/**
 * Helper function to query Groq API.
 * Uses native fetch and enforces JSON mode.
 */
const queryGroq = async (prompt, systemMessage = "You are an expert technical interviewer.") => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables.");
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) {
    throw new Error('Groq returned an empty response.');
  }

  return data.choices[0].message.content;
};

/**
 * Helper to query Gemini API.
 */
const queryGeminiFallback = async (prompt) => {
  if (!aiFallback) {
    throw new Error("Gemini fallback is not configured.");
  }
  const response = await aiFallback.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
  return response.text;
};

export const generateInterviewQuestions = async (role, difficulty) => {
  const prompt = `You are an expert technical interviewer. Generate 5 interview questions for a ${difficulty} level ${role} position. 
  Return ONLY a valid JSON object with a "questions" key containing the array of questions.
  Format exactly like this:
  {
    "questions": [
      {
        "questionText": "The question here",
        "category": "e.g., React, Node, System Design, DSA"
      }
    ]
  }`;

  try {
    console.log(`Generating questions using Groq for role: ${role}, difficulty: ${difficulty}...`);
    const text = await queryGroq(prompt, "You are an expert technical interviewer. You must respond with a JSON object containing a 'questions' array.");
    const parsed = JSON.parse(text);
    
    if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
      return parsed.questions;
    } else if (parsed && Array.isArray(parsed)) {
      return parsed;
    } else if (parsed && typeof parsed === 'object') {
      // Find any array property inside the parsed object
      for (const key in parsed) {
        if (Array.isArray(parsed[key])) {
          return parsed[key];
        }
      }
    }
    throw new Error("Could not extract questions array from response.");
  } catch (groqError) {
    console.warn('Groq query failed or returned invalid format, trying Gemini fallback...', groqError);
    try {
      const text = await queryGeminiFallback(prompt);
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions;
      } else if (parsed && Array.isArray(parsed)) {
        return parsed;
      } else if (parsed && typeof parsed === 'object') {
        for (const key in parsed) {
          if (Array.isArray(parsed[key])) {
            return parsed[key];
          }
        }
      }
      return parsed;
    } catch (geminiError) {
      console.error('All AI providers failed:', geminiError);
      throw new Error(`Failed to generate interview questions: ${geminiError.message}`);
    }
  }
};

export const evaluateAnswer = async (question, answer, role) => {
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

  try {
    console.log(`Evaluating answer using Groq for role: ${role}...`);
    const text = await queryGroq(prompt, "You are an expert technical interviewer evaluating an answer. You must respond with a JSON object.");
    return JSON.parse(text);
  } catch (groqError) {
    console.warn('Groq query failed or key missing, trying Gemini fallback...', groqError);
    try {
      const text = await queryGeminiFallback(prompt);
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (geminiError) {
      console.error('All AI providers failed:', geminiError);
      throw new Error(`Failed to evaluate answer: ${geminiError.message}`);
    }
  }
};

