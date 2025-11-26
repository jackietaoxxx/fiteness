import React, { useState } from 'react';
import { UserProfile, Gender, Goal } from '../types';
import Button from '../components/Button';
import { ChevronRight, Ruler, Weight, Calendar } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: 25,
    height: 175,
    weight: 70,
    gender: Gender.MALE,
    goal: Goal.CUT,
    weeklyTrainingDays: 4,
    injuries: 'None',
    onboarded: true
  });

  const handleNext = () => setStep(p => p + 1);

  const handleSubmit = () => {
    if (formData.name && formData.weight && formData.height) {
      onComplete(formData as UserProfile);
    }
  };

  const getGoalLabel = (g: Goal) => {
    switch(g) {
      case Goal.CUT: return '减脂 (Lose Fat)';
      case Goal.BULK: return '增肌 (Build Muscle)';
      case Goal.RECOMP: return '塑形 (Recomposition)';
      default: return g;
    }
  };

  const getGenderLabel = (g: Gender) => {
    switch(g) {
        case Gender.MALE: return '男 (Male)';
        case Gender.FEMALE: return '女 (Female)';
        case Gender.OTHER: return '其他 (Other)';
        default: return g;
    }
  }

  return (
    <div className="min-h-screen bg-dark p-6 flex flex-col justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          FitCoach AI
        </h1>
        <p className="text-slate-400">你的智能健身私教</p>
      </div>

      <div className="bg-card p-6 rounded-2xl border border-slate-700 shadow-xl">
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-white mb-4">让我们了解你</h2>
            
            <div>
              <label className="text-sm text-slate-400 mb-1 block">昵称</label>
              <input
                type="text"
                className="w-full bg-dark border border-slate-600 rounded-lg p-3 text-white focus:border-primary outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入你的昵称"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">性别</label>
                <select
                  className="w-full bg-dark border border-slate-600 rounded-lg p-3 text-white outline-none"
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                >
                  {Object.values(Gender).map(g => <option key={g} value={g}>{getGenderLabel(g)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">年龄</label>
                <input
                  type="number"
                  className="w-full bg-dark border border-slate-600 rounded-lg p-3 text-white outline-none"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                />
              </div>
            </div>

            <Button onClick={handleNext} disabled={!formData.name}>下一步 <ChevronRight size={18} className="inline" /></Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-white mb-4">身体数据</h2>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-slate-400 mb-1 block flex items-center gap-1"><Ruler size={14}/> 身高 (cm)</label>
                <input
                  type="number"
                  className="w-full bg-dark border border-slate-600 rounded-lg p-3 text-white outline-none"
                  value={formData.height}
                  onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-slate-400 mb-1 block flex items-center gap-1"><Weight size={14}/> 体重 (kg)</label>
                <input
                  type="number"
                  className="w-full bg-dark border border-slate-600 rounded-lg p-3 text-white outline-none"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
               <label className="text-sm text-slate-400 mb-1 block">体脂率 % (预估)</label>
                <input
                  type="number"
                  className="w-full bg-dark border border-slate-600 rounded-lg p-3 text-white outline-none"
                  value={formData.bodyFat || 15}
                  onChange={e => setFormData({ ...formData, bodyFat: Number(e.target.value) })}
                />
            </div>

            <Button onClick={handleNext}>下一步 <ChevronRight size={18} className="inline" /></Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-white mb-4">你的目标</h2>
            
            <div className="space-y-2">
              {Object.values(Goal).map(g => (
                <button
                  key={g}
                  onClick={() => setFormData({ ...formData, goal: g })}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    formData.goal === g 
                      ? 'border-primary bg-primary/10 text-white' 
                      : 'border-slate-700 bg-dark text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="font-bold">{getGoalLabel(g)}</div>
                </button>
              ))}
            </div>

            <div className="mt-4">
               <label className="text-sm text-slate-400 mb-1 block flex items-center gap-1"><Calendar size={14}/> 每周训练天数</label>
               <input 
                 type="range" 
                 min="1" 
                 max="7" 
                 value={formData.weeklyTrainingDays}
                 onChange={e => setFormData({...formData, weeklyTrainingDays: Number(e.target.value)})}
                 className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
               />
               <div className="text-center text-primary font-bold mt-1">{formData.weeklyTrainingDays} 天</div>
            </div>

            <Button onClick={handleSubmit} className="mt-6">开启旅程</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;