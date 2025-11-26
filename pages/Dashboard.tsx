import React, { useMemo } from 'react';
import { UserProfile, DailyPlan, MealLog } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Flame, Brain, CheckCircle } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  plan: DailyPlan | null;
  todayMeals: MealLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, plan, todayMeals }) => {
  const consumed = useMemo(() => {
    return todayMeals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [todayMeals]);

  const target = plan?.nutritionTarget || { calories: 2500, protein: 180, carbs: 250, fats: 70 };

  const macroData = [
    { name: '蛋白质', value: consumed.protein, total: target.protein, color: '#10b981' },
    { name: '碳水', value: consumed.carbs, total: target.carbs, color: '#3b82f6' },
    { name: '脂肪', value: consumed.fats, total: target.fats, color: '#f59e0b' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-slate-400 text-sm">欢迎回来，</h2>
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
        </div>
        <div className="flex items-center gap-1 text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full">
          <Flame size={16} fill="currentColor" />
          <span className="font-bold text-sm">连续打卡 3 天</span>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-800 p-5 rounded-2xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Brain size={100} />
        </div>
        <div className="flex items-center gap-2 mb-2 text-indigo-300">
          <Brain size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">每日AI教练建议</span>
        </div>
        <p className="text-slate-200 text-sm leading-relaxed relative z-10 italic">
          "{plan?.reasoning || '正在根据您最近的数据生成个性化计划...'}"
        </p>
      </div>

      {/* Calories Ring */}
      <div className="bg-card rounded-2xl p-5 border border-slate-700">
        <h3 className="text-white font-bold mb-4">今日营养</h3>
        <div className="flex items-center justify-between">
          <div className="h-32 w-32 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: consumed.calories }, { value: Math.max(0, target.calories - consumed.calories) }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={55}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#334155" />
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">{Math.round(consumed.calories)}</span>
                <span className="text-[10px] text-slate-400">/ {target.calories} 千卡</span>
             </div>
          </div>
          
          <div className="flex-1 pl-6 space-y-3">
            {macroData.map(m => (
              <div key={m.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{m.name}</span>
                  <span className="text-white font-medium">{Math.round(m.value)} / {m.total}g</span>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ width: `${Math.min(100, (m.value / m.total) * 100)}%`, backgroundColor: m.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Workout */}
      <div className="bg-card rounded-2xl p-5 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">今日训练</h3>
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
            {plan?.workoutFocus || '休息'}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="bg-slate-700 p-3 rounded-xl text-primary">
                <DumbbellIcon />
             </div>
             <div>
                <h4 className="text-white font-bold">{plan?.workoutName || '休息日'}</h4>
                <p className="text-xs text-slate-400">{plan?.exercises?.length || 0} 个动作 • 预计 45 分钟</p>
             </div>
          </div>
          
          {plan?.exercises && plan.exercises.length > 0 && (
             <div className="pt-2 border-t border-slate-700">
               <p className="text-xs text-slate-500 mb-2">下一个动作:</p>
               <div className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle size={14} className="text-slate-600" />
                  {plan.exercises[0].name}
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DumbbellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
)

export default Dashboard;