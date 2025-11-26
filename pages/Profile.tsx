
import React, { useState } from 'react';
import { UserProfile, AppState, Goal, Gender } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Settings, Award, Edit2, Check, X } from 'lucide-react';
import Button from '../components/Button';

interface ProfileProps {
  user: UserProfile;
  weightHistory: AppState['logs']['weightHistory'];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onUpdateWeight: (weight: number) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, weightHistory, onUpdateProfile, onUpdateWeight }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  // Use history or fallback
  const data = weightHistory.length > 0 ? weightHistory : [{ date: 'Today', weight: user.weight }];

  const startEdit = () => {
    setEditForm(user);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const saveEdit = () => {
    onUpdateProfile(editForm);
    if (editForm.weight && editForm.weight !== user.weight) {
        onUpdateWeight(editForm.weight);
    }
    setIsEditing(false);
  };

  const getGoalLabel = (g: Goal) => {
    switch(g) {
      case Goal.CUT: return '减脂';
      case Goal.BULK: return '增肌';
      case Goal.RECOMP: return '塑形';
      default: return g;
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header / Editor */}
      <div className="flex items-start justify-between">
        {isEditing ? (
            <div className="w-full bg-slate-800 p-4 rounded-xl border border-primary space-y-4 animate-fadeIn">
                <h3 className="font-bold text-white mb-2">修改个人档案</h3>
                
                <div>
                    <label className="text-xs text-slate-400">昵称</label>
                    <input 
                        className="w-full bg-dark border border-slate-600 rounded p-2 text-white"
                        value={editForm.name}
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400">年龄</label>
                        <input 
                            type="number"
                            className="w-full bg-dark border border-slate-600 rounded p-2 text-white"
                            value={editForm.age}
                            onChange={e => setEditForm({...editForm, age: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">身高 (cm)</label>
                        <input 
                            type="number"
                            className="w-full bg-dark border border-slate-600 rounded p-2 text-white"
                            value={editForm.height}
                            onChange={e => setEditForm({...editForm, height: Number(e.target.value)})}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400">体重 (kg)</label>
                        <input 
                            type="number"
                            className="w-full bg-dark border border-slate-600 rounded p-2 text-white"
                            value={editForm.weight}
                            onChange={e => setEditForm({...editForm, weight: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">体脂率 (%)</label>
                        <input 
                            type="number"
                            className="w-full bg-dark border border-slate-600 rounded p-2 text-white"
                            value={editForm.bodyFat}
                            onChange={e => setEditForm({...editForm, bodyFat: Number(e.target.value)})}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-slate-400">目标</label>
                    <select 
                        className="w-full bg-dark border border-slate-600 rounded p-2 text-white"
                        value={editForm.goal}
                        onChange={e => setEditForm({...editForm, goal: e.target.value as Goal})}
                    >
                        {Object.values(Goal).map(g => (
                            <option key={g} value={g}>{getGoalLabel(g)}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2 mt-4">
                    <Button onClick={saveEdit} className="py-2 text-sm">保存</Button>
                    <button onClick={cancelEdit} className="px-4 text-slate-400 text-sm">取消</button>
                </div>
            </div>
        ) : (
            <>
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center border-2 border-primary">
                    <User size={32} className="text-slate-400" />
                    </div>
                    <div>
                    <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                    <p className="text-slate-400 text-sm">{getGoalLabel(user.goal)} • {user.age}岁 • {user.height}cm</p>
                    </div>
                </div>
                <button 
                    onClick={startEdit}
                    className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                    <Edit2 size={18} />
                </button>
            </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card p-3 rounded-xl border border-slate-700 text-center">
          <span className="block text-xs text-slate-400 uppercase">体重</span>
          <span className="text-xl font-bold text-white">{user.weight}<span className="text-xs font-normal">kg</span></span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-slate-700 text-center">
          <span className="block text-xs text-slate-400 uppercase">体脂率</span>
          <span className="text-xl font-bold text-white">{user.bodyFat || '-'}%</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-slate-700 text-center">
          <span className="block text-xs text-slate-400 uppercase">周训练</span>
          <span className="text-xl font-bold text-primary">{user.weeklyTrainingDays}天</span>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl border border-slate-700">
        <h3 className="text-white font-bold mb-4">体重趋势</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} 
                itemStyle={{ color: '#10b981' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-2">
         <h3 className="text-white font-bold">成就</h3>
         <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-900/20 border border-yellow-600/30 p-3 rounded-xl flex items-center gap-3">
               <Award className="text-yellow-500" />
               <div>
                  <div className="text-sm font-bold text-yellow-100">早起鸟</div>
                  <div className="text-[10px] text-yellow-500/70">8点前完成5次训练</div>
               </div>
            </div>
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-900/20 border border-blue-600/30 p-3 rounded-xl flex items-center gap-3">
               <Award className="text-blue-500" />
               <div>
                  <div className="text-sm font-bold text-blue-100">营养达人</div>
                  <div className="text-[10px] text-blue-500/70">连续7天达成蛋白质目标</div>
               </div>
            </div>
         </div>
      </div>
      
      <button className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
         <span className="flex items-center gap-3"><Settings size={18} /> 更多设置</span>
      </button>
    </div>
  );
};

export default Profile;
