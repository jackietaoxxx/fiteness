
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, DailyPlan, MacroGoals, Exercise, MealLog, WorkoutSession } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Constants for models
const TEXT_MODEL = 'gemini-2.5-flash';

export const generateDailyPlan = async (
  profile: UserProfile,
  recentLogs: any
): Promise<DailyPlan> => {
  
  const today = new Date().toISOString().split('T')[0];

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      date: { type: Type.STRING },
      reasoning: { type: Type.STRING },
      workoutName: { type: Type.STRING },
      workoutFocus: { type: Type.STRING },
      nutritionTarget: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
        },
        required: ["calories", "protein", "carbs", "fats"]
      },
      exercises: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            sets: { type: Type.NUMBER },
            reps: { type: Type.STRING },
            weight: { type: Type.NUMBER },
            completed: { type: Type.BOOLEAN },
          },
          required: ["name", "sets", "reps", "weight", "completed"]
        }
      }
    },
    required: ["date", "reasoning", "workoutName", "workoutFocus", "nutritionTarget", "exercises"]
  };

  const prompt = `
    Act as an elite fitness coach (FitCoach AI).
    User Profile: ${JSON.stringify(profile)}
    Recent Logs (Meals, Workouts, Weight History): ${JSON.stringify(recentLogs)}
    Current Date: ${today}

    Analyze the user's weight trend from the logs.
    If weight is stalling on a cut, reduce calories slightly.
    If weight is dropping too fast on a bulk, increase calories.
    
    Generate a specific workout and nutrition plan for TODAY.
    
    IMPORTANT: Respond in Simplified Chinese (简体中文).
    Provide a "reasoning" string explaining why you chose this plan based on their *specific* data changes (e.g. "你昨天的体重下降了0.5kg，所以我们要保持热量...").
    The "workoutName", "workoutFocus", and exercise "name" should also be in Chinese.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert personal trainer and nutritionist. Always speak in Simplified Chinese.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as DailyPlan;
  } catch (error) {
    console.error("AI Plan Generation Error:", error);
    // Fallback plan if AI fails
    return {
      date: today,
      reasoning: "AI服务暂时不可用。这是为您准备的基础维护计划。",
      workoutName: "全身恢复训练",
      workoutFocus: "综合体能",
      nutritionTarget: { calories: 2000, protein: 150, carbs: 200, fats: 65 },
      exercises: [
        { name: "自重深蹲", sets: 3, reps: "12-15", weight: 0, completed: false },
        { name: "俯卧撑", sets: 3, reps: "10-12", weight: 0, completed: false },
      ]
    };
  }
};

export const analyzeTextFood = async (
  foodText: string, 
  profile: UserProfile,
  todayMeals: MealLog[],
  weightTrend: any[]
): Promise<{ meal: Partial<MealLog>, feedback: string }> => {
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      meal: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
        },
        required: ["name", "calories", "protein", "carbs", "fats"]
      },
      feedback: { type: Type.STRING }
    },
    required: ["meal", "feedback"]
  };

  const prompt = `
    Analyze this food input: "${foodText}".
    
    Context:
    - Goal: ${profile.goal}
    - Today's previous meals: ${JSON.stringify(todayMeals)}
    - Recent weight trend: ${JSON.stringify(weightTrend.slice(-5))}
    
    1. Estimate the macros for this specific entry.
    2. Provide "feedback" (max 2 sentences) in Simplified Chinese (简体中文). Tell the user if they are overeating, what macro they are missing today, or if this fits their goal perfectly based on their weight trend and previous meals today.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Text Food Analysis Error:", error);
    return { 
      meal: { name: "未知食物", calories: 0, protein: 0, carbs: 0, fats: 0 },
      feedback: "无法分析该食物，请重试。"
    };
  }
};

export const analyzeWorkout = async (
  text: string,
  profile: UserProfile,
  history: WorkoutSession[]
): Promise<{ exercises: Exercise[], feedback: string, workoutName: string }> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      workoutName: { type: Type.STRING },
      feedback: { type: Type.STRING },
      exercises: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            sets: { type: Type.NUMBER },
            reps: { type: Type.STRING },
            weight: { type: Type.NUMBER },
            completed: { type: Type.BOOLEAN },
          },
          required: ["name", "sets", "reps", "weight", "completed"]
        }
      }
    },
    required: ["workoutName", "feedback", "exercises"]
  };

  // Get last 3 workouts for context
  const recentWorkouts = history.slice(-3);

  const prompt = `
    Analyze this workout log input: "${text}".
    
    User Profile: ${JSON.stringify(profile)}
    Recent Workout History: ${JSON.stringify(recentWorkouts)}

    Tasks:
    1. Extract the exercises, sets, reps, and weight. If weight is not specified, put 0.
    2. Identify the main focus/name of this workout (e.g. "胸肌训练", "腿部训练").
    3. Provide "feedback" in Simplified Chinese. 
       - Compare their weights/volume to previous sessions if matches exist.
       - Comment on their volume/intensity based on their profile goal (${profile.goal}).
       - Keep it encouraging but analytical (max 3 sentences).
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      exercises: result.exercises || [],
      feedback: result.feedback || "训练已记录。",
      workoutName: result.workoutName || "训练"
    };
  } catch (error) {
    console.error("Workout Analysis Error:", error);
    return {
      exercises: [],
      feedback: "无法解析训练内容，请重试。",
      workoutName: "未知训练"
    };
  }
};
