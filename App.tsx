
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import DietLogger from './pages/DietLogger';
import WorkoutLogger from './pages/WorkoutLogger';
import Profile from './pages/Profile';
import { AppState, UserProfile, MealLog, WorkoutSession } from './types';
import { generateDailyPlan } from './services/geminiService';

const App: React.FC = () => {
  // --- STATE ---
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('fitcoach_state');
    return saved ? JSON.parse(saved) : {
      profile: { onboarded: false },
      todayPlan: null,
      logs: { meals: [], workouts: [], weightHistory: [] }
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingPlan, setLoadingPlan] = useState(false);

  // --- EFFECTS ---
  
  // Persist state
  useEffect(() => {
    localStorage.setItem('fitcoach_state', JSON.stringify(state));
  }, [state]);

  // Generate Plan on user onboard or new day
  useEffect(() => {
    const initPlan = async () => {
      if (state.profile.onboarded && !state.todayPlan) {
        setLoadingPlan(true);
        const plan = await generateDailyPlan(state.profile, state.logs);
        setState(prev => ({ ...prev, todayPlan: plan }));
        setLoadingPlan(false);
      }
    };
    initPlan();
  }, [state.profile.onboarded]);

  // --- HANDLERS ---

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setLoadingPlan(true);
    // Initial Plan generation
    const initialPlan = await generateDailyPlan(profile, []);
    setState(prev => ({
      ...prev,
      profile,
      todayPlan: initialPlan
    }));
    setLoadingPlan(false);
  };

  const handleLogMeal = (meal: MealLog) => {
    setState(prev => ({
      ...prev,
      logs: { ...prev.logs, meals: [...prev.logs.meals, meal] }
    }));
    // In a real app, this would trigger a recalculation of the remaining macros
    setActiveTab('dashboard');
  };

  const handleFinishWorkout = (session: WorkoutSession) => {
    setState(prev => ({
      ...prev,
      logs: { ...prev.logs, workouts: [...prev.logs.workouts, session] }
    }));
    setActiveTab('dashboard');
  };

  const handleUpdateProfile = (updatedProfile: Partial<UserProfile>) => {
    setState(prev => ({
        ...prev,
        profile: { ...prev.profile, ...updatedProfile }
    }));
  };

  const handleUpdateWeight = (newWeight: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry = { date: today, weight: newWeight };
    
    setState(prev => {
      // Filter out existing entry for today if exists to overwrite it
      const history = prev.logs.weightHistory.filter(h => h.date !== today);
      return {
        ...prev,
        profile: { ...prev.profile, weight: newWeight },
        logs: {
          ...prev.logs,
          weightHistory: [...history, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        }
      };
    });
  };

  // --- RENDER ---

  if (!state.profile.onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (loadingPlan && !state.todayPlan) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse text-lg">AI教练正在为您制定计划...</p>
        <p className="text-slate-500 text-sm mt-2">正在分析代谢 • 计算营养素目标</p>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard 
          user={state.profile} 
          plan={state.todayPlan} 
          todayMeals={state.logs.meals.filter(m => m.timestamp.startsWith(new Date().toISOString().split('T')[0]))}
        />
      )}
      {activeTab === 'diet' && (
        <DietLogger 
          onLogMeal={handleLogMeal} 
          userProfile={state.profile}
          todayMeals={state.logs.meals.filter(m => m.timestamp.startsWith(new Date().toISOString().split('T')[0]))}
          weightHistory={state.logs.weightHistory}
        />
      )}
      {activeTab === 'workout' && (
        <WorkoutLogger 
            plan={state.todayPlan} 
            userProfile={state.profile}
            workoutHistory={state.logs.workouts}
            onFinish={handleFinishWorkout} 
        />
      )}
      {activeTab === 'profile' && (
        <Profile 
          user={state.profile} 
          weightHistory={state.logs.weightHistory} 
          onUpdateWeight={handleUpdateWeight}
          onUpdateProfile={handleUpdateProfile}
        />
      )}
    </Layout>
  );
};

export default App;
