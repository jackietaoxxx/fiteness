
import React, { useState } from 'react';
import { DailyPlan, WorkoutSession, Exercise, UserProfile } from '../types';
import Button from '../components/Button';
import { Check, Send, Brain, Dumbbell, Activity } from 'lucide-react';
import { analyzeWorkout } from '../services/geminiService';

interface WorkoutLoggerProps {
  plan: DailyPlan | null;
  userProfile: UserProfile;
  workoutHistory: WorkoutSession[];
  onFinish: (session: WorkoutSession) => void;
}

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ userProfile, workoutHistory, onFinish }) => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ 
    exercises: Exercise[], 
    feedback: string, 
    workoutName: string 
  } | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeWorkout(inputText, userProfile, workoutHistory);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleSave = () => {
    if (analysisResult) {
      onFinish({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        name: analysisResult.workoutName,
        exercises: analysisResult.exercises,
        completed: true,
        duration: 60, // Default duration estimation
        feedback: analysisResult.feedback
      });
      // Reset
      setInputText('');
      setAnalysisResult(null);
    }
  };

  return (
    <div className="p-4 min-h-full flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-6">记录训练</h1>

      <div className="flex-1 flex flex-col gap-6">
        
        {/* Input Section */}
        <div className="bg-card border border-slate-700 rounded-2xl p-4">
          <label className="text-sm text-slate-400 mb-2 block">今天练了什么？</label>
          <textarea
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-32"
            placeholder="例如：深蹲 100kg 5x5, 卧推 80kg 3x8..."
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
          <div className="animate-fadeIn space-y-4 pb-20">
            {/* AI Feedback Bubble */}
            <div className="bg-gradient-to-r from-indigo-900/50 to-slate-800 border border-indigo-500/30 p-4 rounded-xl relative">
               <div className="flex items-start gap-3">
                 <div className="bg-indigo-500/20 p-2 rounded-full">
                    <Brain size={20} className="text-indigo-400" />
                 </div>
                 <div>
                    <h3 className="text-indigo-200 font-bold text-sm mb-1">训练点评</h3>
                    <p className="text-slate-200 text-sm leading-relaxed">"{analysisResult.feedback}"</p>
                 </div>
               </div>
            </div>

            {/* Extracted Exercises */}
            <div className="space-y-3">
               <div className="flex justify-between items-end px-1">
                 <h3 className="text-white font-bold text-lg">{analysisResult.workoutName}</h3>
                 <span className="text-xs text-slate-400">提取结果</span>
               </div>
               
               {analysisResult.exercises.map((ex, idx) => (
                 <div key={idx} className="bg-card p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="bg-slate-800 p-2 rounded-lg text-primary">
                          <Dumbbell size={20} />
                       </div>
                       <div>
                          <div className="font-bold text-white">{ex.name}</div>
                          <div className="text-xs text-slate-400">
                             {ex.sets} 组 × {ex.reps} 次
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-xl font-bold text-white font-mono">{ex.weight}</div>
                       <div className="text-[10px] text-slate-500 uppercase">KG</div>
                    </div>
                 </div>
               ))}
            </div>

            <Button onClick={handleSave} className="mt-6" variant="primary">
               <Check size={20} className="inline mr-2" /> 确认并打卡
            </Button>
          </div>
        )}

        {!analysisResult && workoutHistory.length > 0 && (
          <div className="mt-4">
             <h3 className="text-slate-400 text-sm font-bold mb-3 flex items-center gap-2">
                <Activity size={16} /> 最近训练记录
             </h3>
             <div className="space-y-3 opacity-75">
                {workoutHistory.slice(-3).reverse().map(session => (
                  <div key={session.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                     <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                        <span>{session.name}</span>
                     </div>
                     <div className="text-slate-300 text-sm truncate">
                        {session.feedback || '完成训练'}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutLogger;
