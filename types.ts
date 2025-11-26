
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum Goal {
  CUT = 'Lose Fat',
  BULK = 'Build Muscle',
  RECOMP = 'Recomposition'
}

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  gender: Gender;
  goal: Goal;
  bodyFat?: number; // percentage
  weeklyTrainingDays: number;
  injuries: string;
  onboarded: boolean;
}

export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealLog {
  id: string;
  name: string;
  timestamp: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  imageUrl?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight: number; // kg
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
  completed: boolean;
  duration?: number; // minutes
  feedback?: string; // AI analysis of the session
}

export interface DailyPlan {
  date: string;
  reasoning: string; // AI's explanation for today's plan
  nutritionTarget: MacroGoals;
  workoutName: string;
  workoutFocus: string;
  exercises: Exercise[];
}

export interface AppState {
  profile: UserProfile;
  todayPlan: DailyPlan | null;
  logs: {
    meals: MealLog[];
    workouts: WorkoutSession[];
    weightHistory: { date: string; weight: number }[];
  };
}
