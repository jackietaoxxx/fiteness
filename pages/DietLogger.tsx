import React, { useState } from 'react';
import { Check, Send, Brain } from 'lucide-react';
import { analyzeTextFood } from '../services/geminiService';
import Button from '../components/Button';
import { MealLog, UserProfile, AppState } from '../types';

interface DietLoggerProps {
  onLogMeal: (meal: MealLog) => void;
  userProfile: UserProfile;
  todayMeals: MealLog[];
  weightHistory: AppState['logs']['weightHistory'];
}

const DietLogger: React.FC<DietLoggerProps> = ({ onLogMeal, userProfile, todayMeals, weightHistory }) => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ meal: Partial<MealLog>, feedback: string } | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeTextFood(inputText, userProfile, todayMeals, weightHistory);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleSave = () => {
    if (analysisResult?.meal) {
      const meal: MealLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        name: analysisResult.meal.name || 'Unnamed Meal',
        calories: analysisResult.meal.calories || 0,
        protein: analysisResult.meal.protein || 0,
        carbs: analysisResult.meal.carbs || 0,
        fats: analysisResult.meal.fats || 0,
      };
      onLogMeal(meal);
      // Reset
      setInputText('');
      setAnalysisResult(null);
    }
  };

  return (
    <div className="p-4 min-h-full flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-6">记录饮食</h1>

      <div className="flex-1 flex flex-col gap-6">
        
        {/* Input Section */}
        <div className="bg-card border border-slate-700 rounded-2xl p-4">
          <label className="text-sm text-slate-400 mb-2 block">这顿吃了什么？</label>
          <textarea
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-32"
            placeholder="例如：2个煮鸡蛋，1片全麦吐司，一杯黑咖啡..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="mt-4">
            <Button onClick={handleAnalyze} isLoading={isAnalyzing} disabled={!inputText.trim()}>
               <Send size={18} className="inline mr-2" /> AI 智能分析
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {analysisResult && (
          <div className="animate-fadeIn space-y-4">
            {/* AI Feedback Bubble */}
            <div className="bg-gradient-to-r from-indigo-900/50 to-slate-800 border border-indigo-500/30 p-4 rounded-xl relative">
               <div className="flex items-start gap-3">
                 <div className="bg-indigo-500/20 p-2 rounded-full">
                    <Brain size={20} className="text-indigo-400" />
                 </div>
                 <div>
                    <h3 className="text-indigo-200 font-bold text-sm mb-1">教练点评</h3>
                    <p className="text-slate-200 text-sm leading-relaxed">"{analysisResult.feedback}"</p>
                 </div>
               </div>
            </div>

            {/* Macro Details */}
            <div className="bg-card border border-slate-700 rounded-2xl p-5">
              <div className="mb-4">
                 <label className="text-xs text-slate-500 uppercase font-bold">食物名称</label>
                 <input 
                   type="text" 
                   value={analysisResult.meal.name || ''} 
                   onChange={(e) => setAnalysisResult({...analysisResult, meal: {...analysisResult.meal, name: e.target.value}})}
                   className="w-full bg-transparent text-xl font-bold text-white border-b border-slate-700 focus:border-primary outline-none py-1"
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span className="block text-xs text-slate-400">热量</span>
                    <span className="text-xl font-bold text-white">{analysisResult.meal.calories}</span>
                 </div>
                 <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span className="block text-xs text-slate-400">蛋白质</span>
                    <span className="text-xl font-bold text-emerald-400">{analysisResult.meal.protein}g</span>
                 </div>
                 <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span className="block text-xs text-slate-400">碳水</span>
                    <span className="text-xl font-bold text-blue-400">{analysisResult.meal.carbs}g</span>
                 </div>
                 <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span className="block text-xs text-slate-400">脂肪</span>
                    <span className="text-xl font-bold text-yellow-400">{analysisResult.meal.fats}g</span>
                 </div>
              </div>

              <Button onClick={handleSave} className="mt-6" variant="primary">
                 <Check size={20} className="inline mr-2" /> 确认并记录
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietLogger;