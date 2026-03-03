
import React, { useState, useEffect } from 'react';
import { Map as MapIcon, ShoppingBag, Trophy, ShieldCheck, Users, Plus, Save } from 'lucide-react';
import { Subject, AppState, UserRole, CharacterType, Task, UserProfile, Reward } from './types';
import { INITIAL_REWARDS } from './constants';
import LearningMap from './components/Student/LearningMap';
import ParentDashboard from './components/Parent/Dashboard';
import RewardPlaza from './components/Reward/RewardPlaza';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('student');
  const [view, setView] = useState<'map' | 'shop' | 'parent' | 'select_user'>('select_user');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('grade5_adventure_state_v4');
    if (saved) return JSON.parse(saved);
    
    return {
      activeProfileId: null,
      profiles: [],
      parentPassword: '', 
      examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subjectWeights: {
        [Subject.CHINESE]: 20,
        [Subject.MATH]: 30,
        [Subject.ENGLISH]: 20,
        [Subject.SCIENCE]: 15,
        [Subject.SOCIAL]: 10,
        [Subject.BOSS]: 5
      },
      tasks: [
        { id: 'c1', subject: Subject.CHINESE, title: '成語大冒險', description: '背誦第三課的五個成語', isCompleted: false, rewardCoins: 10 },
        { id: 'm1', subject: Subject.MATH, title: '數字之巔', description: '完成數學講義第15頁', isCompleted: false, rewardCoins: 20 },
        { id: 'e1', subject: Subject.ENGLISH, title: '聽力風暴', description: '聽完第三單元CD並跟讀', isCompleted: false, rewardCoins: 15 },
        { id: 's1', subject: Subject.SCIENCE, title: '光影魔法', description: '畫出光學反射示意圖', isCompleted: false, rewardCoins: 10 },
        { id: 'so1', subject: Subject.SOCIAL, title: '古城巡禮', description: '閱讀清代移民背景故事', isCompleted: false, rewardCoins: 10 },
        { id: 'b1', subject: Subject.BOSS, title: '期末巨獸挑戰', description: '模擬考總複習卷 A 卷', isCompleted: false, rewardCoins: 50 },
      ],
      rewards: INITIAL_REWARDS,
      subjectIcons: {} // 初始為空，將使用 constants 中的預設圖
    };
  });

  useEffect(() => {
    localStorage.setItem('grade5_adventure_state_v4', JSON.stringify(state));
  }, [state]);

  const activeProfile = state.profiles.find(p => p.id === state.activeProfileId) || null;

  const handleParentSwitch = () => {
    if (role === 'student') {
      setRole('parent');
      setView('parent');
    } else {
      setRole('student');
      setView(state.activeProfileId ? 'map' : 'select_user');
    }
  };

  const selectProfile = (id: string) => {
    setState(prev => ({ ...prev, activeProfileId: id }));
    setView('map');
  };

  const addProfile = (name: string, character: CharacterType) => {
    const newProfile: UserProfile = {
      id: 'user_' + Date.now(),
      name,
      character,
      coins: 100,
      completedTasks: [],
      claimedTaskRewards: [],
      history: []
    };
    setState(prev => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
      activeProfileId: prev.activeProfileId || newProfile.id
    }));
  };

  const updateActiveProfile = (updater: (p: UserProfile) => UserProfile) => {
    setState(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.id === prev.activeProfileId ? updater(p) : p)
    }));
  };

  const completeTask = (taskId: string) => {
    updateActiveProfile(p => ({
      ...p,
      completedTasks: [...p.completedTasks, taskId]
    }));
  };

  const claimReward = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    updateActiveProfile(p => {
      if (p.claimedTaskRewards.includes(taskId)) return p;
      return {
        ...p,
        coins: p.coins + task.rewardCoins,
        claimedTaskRewards: [...p.claimedTaskRewards, taskId],
        history: [...p.history, { date: new Date().toISOString(), taskId: `CLAIM_${taskId}` }]
      };
    });
  };

  const resetTask = (taskId: string) => {
    updateActiveProfile(p => ({
      ...p,
      completedTasks: p.completedTasks.filter(id => id !== taskId)
    }));
  };

  const buyReward = (rewardId: string) => {
    const reward = state.rewards.find(r => r.id === rewardId);
    if (!reward || !activeProfile || activeProfile.coins < reward.cost) return;
    
    updateActiveProfile(p => ({
      ...p,
      coins: p.coins - reward.cost,
      history: [...p.history, { date: new Date().toISOString(), taskId: `PURCHASE_${rewardId}` }]
    }));
  };

  const handleSpin = (rewardId: string) => {
    if (!activeProfile || activeProfile.coins < 50) return;
    updateActiveProfile(p => ({
      ...p,
      coins: p.coins - 50,
      history: [...p.history, { date: new Date().toISOString(), taskId: `SPIN_WIN_${rewardId}` }]
    }));
  };

  const updateConfig = (newExamDate: string, weights: Record<Subject, number>) => {
    setState(prev => ({ ...prev, examDate: newExamDate, subjectWeights: weights }));
  };

  const updateTasks = (newTasks: Task[]) => {
    setState(prev => ({ ...prev, tasks: newTasks }));
  };

  const updateRewards = (newRewards: Reward[]) => {
    setState(prev => ({ ...prev, rewards: newRewards }));
  };

  const updateSubjectIcons = (newIcons: Record<string, string>) => {
    setState(prev => ({ ...prev, subjectIcons: newIcons }));
  };

  const manualSave = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grade5_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    alert("進度已手動存檔並匯出 JSON！");
  };

  const daysRemaining = Math.max(0, Math.ceil((new Date(state.examDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 3600 * 24)));

  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto shadow-2xl bg-white relative overflow-hidden">
      <header className="bg-gradient-to-b from-yellow-300 to-yellow-500 p-4 flex justify-between items-center shadow-md z-50 border-b-4 border-yellow-600">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-inner border-2 border-yellow-600">
            <Trophy className="text-yellow-600 w-6 h-6" />
          </div>
          <h1 className="font-game text-xl text-yellow-900 md:text-2xl drop-shadow-sm">
            {activeProfile ? `${activeProfile.name}的學力闖關` : "五年級學力闖關"}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {role === 'student' && activeProfile && (
            <div className="bg-white/40 px-3 py-1 rounded-full flex items-center gap-2 border border-white/60">
              <span className="text-xl">⭐</span>
              <span className="font-bold text-yellow-950 font-game">{activeProfile.coins}</span>
            </div>
          )}
          <button 
            onClick={handleParentSwitch}
            className="flex items-center gap-1 text-xs md:text-sm bg-yellow-900 text-white px-4 py-2 rounded-xl border-b-4 border-yellow-950 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all font-game"
          >
            <ShieldCheck className="w-4 h-4" />
            {role === 'student' ? '家長設定' : '回到冒險'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {view === 'select_user' && (
          <div className="h-full bg-blue-50 flex flex-col items-center justify-center p-8">
            <h2 className="text-3xl font-game text-blue-900 mb-8 flex items-center gap-3">
              <Users className="w-10 h-10" /> 選擇冒險者
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
              {state.profiles.map(p => (
                <button 
                  key={p.id}
                  onClick={() => selectProfile(p.id)}
                  className="bg-white p-8 rounded-[3rem] border-8 border-white hover:border-yellow-400 shadow-xl transition-all hover:scale-105 group"
                >
                  <div className="text-8xl mb-4 group-hover:scale-110 transition-transform">
                    {p.character === 'boy' ? '👦' : '👧'}
                  </div>
                  <div className="font-game text-2xl text-blue-900">{p.name}</div>
                  <div className="mt-2 text-sm text-gray-400 font-bold">⭐ {p.coins} 金幣</div>
                </button>
              ))}
              <button 
                onClick={() => { setRole('parent'); setView('parent'); }}
                className="bg-dashed border-4 border-dashed border-gray-300 p-8 rounded-[3rem] flex flex-col items-center justify-center hover:bg-white hover:border-blue-400 transition-all text-gray-400 hover:text-blue-500"
              >
                <Plus className="w-12 h-12 mb-2" />
                <div className="font-game text-xl">新增勇者</div>
              </button>
            </div>
          </div>
        )}

        {view === 'map' && activeProfile && (
          <LearningMap 
            state={{
              ...state,
              studentName: activeProfile.name,
              character: activeProfile.character,
              coins: activeProfile.coins,
              completedTasks: activeProfile.completedTasks,
              claimedTaskRewards: activeProfile.claimedTaskRewards,
              history: activeProfile.history
            }} 
            onCompleteTask={completeTask}
            onClaimReward={claimReward}
            onResetTask={resetTask}
            onUpdateProfile={(name, character) => updateActiveProfile(p => ({ ...p, name, character }))}
          />
        )}
        {view === 'shop' && activeProfile && (
          <RewardPlaza 
            coins={activeProfile.coins} 
            rewards={state.rewards} 
            history={activeProfile.history}
            onBuy={buyReward}
            onSpin={handleSpin} 
          />
        )}
        {view === 'parent' && (
          <ParentDashboard 
            state={state} 
            onUpdateConfig={updateConfig}
            onUpdateTasks={updateTasks}
            onUpdateRewards={updateRewards}
            onUpdateSubjectIcons={updateSubjectIcons}
            onAddProfile={addProfile}
            onDeleteProfile={(id) => setState(prev => ({ ...prev, profiles: prev.profiles.filter(p => p.id !== id), activeProfileId: prev.activeProfileId === id ? null : prev.activeProfileId }))}
            onManualSave={manualSave}
          />
        )}
      </main>

      {role === 'student' && activeProfile && view !== 'select_user' && (
        <nav className="bg-white border-t-4 border-gray-100 p-2 flex justify-around items-center h-20 z-50">
          <button 
            onClick={() => setView('select_user')}
            className="flex flex-col items-center p-3 text-gray-400"
          >
            <Users className="w-7 h-7" />
            <span className="text-xs mt-1 font-game">切換勇者</span>
          </button>
          <button 
            onClick={() => setView('map')}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all ${view === 'map' ? 'text-blue-600 bg-blue-50 border-2 border-blue-200 shadow-inner' : 'text-gray-400'}`}
          >
            <MapIcon className="w-7 h-7" />
            <span className="text-xs mt-1 font-game">冒險地圖</span>
          </button>
          <button 
            onClick={() => setView('shop')}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all ${view === 'shop' ? 'text-pink-600 bg-pink-50 border-2 border-pink-200 shadow-inner' : 'text-gray-400'}`}
          >
            <ShoppingBag className="w-7 h-7" />
            <span className="text-xs mt-1 font-game">獎勵廣場</span>
          </button>
        </nav>
      )}

      {role === 'student' && view === 'map' && (
        <div className="absolute top-24 right-4 z-40 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-2xl border-4 border-yellow-400 flex flex-col items-center w-28">
            <span className="text-[10px] font-bold text-gray-500">倒數計時</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-game text-red-500 animate-pulse">
                {daysRemaining}
              </span>
              <span className="text-sm font-game text-red-500">天</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
