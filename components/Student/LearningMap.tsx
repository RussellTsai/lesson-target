
import React, { useState, useMemo } from 'react';
import { Subject, AppState, CharacterType, Task } from '../../types';
import { SUBJECT_INFO } from '../../constants';
import { CheckCircle2, ChevronRight, X, RotateCcw, FastForward, Sparkles, Trees, Cloud, Sun } from 'lucide-react';
import QuizChallenge from './QuizChallenge';

interface LearningMapProps {
  state: any;
  onCompleteTask: (id: string) => void;
  onClaimReward: (id: string) => void;
  onResetTask: (id: string) => void;
  onUpdateProfile: (name: string, character: CharacterType) => void;
}

const LearningMap: React.FC<LearningMapProps> = ({ state, onCompleteTask, onClaimReward, onResetTask, onUpdateProfile }) => {
  const [selectedIsland, setSelectedIsland] = useState<Subject | null>(null);
  const [activeQuizTask, setActiveQuizTask] = useState<Task | null>(null);

  const islands = Object.values(Subject);

  const getProgress = (subject: Subject) => {
    const subjectTasks = state.tasks.filter((t: any) => t.subject === subject);
    if (subjectTasks.length === 0) return 100;
    const completed = subjectTasks.filter((t: any) => state.completedTasks.includes(t.id)).length;
    return Math.round((completed / subjectTasks.length) * 100);
  };

  const handleTaskAction = (task: Task) => {
    if (task.isQuizTask && task.questions && task.questions.length > 0) {
      setActiveQuizTask(task);
    } else {
      onCompleteTask(task.id);
    }
  };

  const handleQuizComplete = () => {
    if (activeQuizTask) {
      onCompleteTask(activeQuizTask.id);
      setActiveQuizTask(null);
    }
  };

  const handleNextLevel = (taskId: string) => {
    onClaimReward(taskId);
    if (!selectedIsland) return;
    const currentIndex = islands.indexOf(selectedIsland);
    const nextIndex = (currentIndex + 1) % islands.length;
    setSelectedIsland(islands[nextIndex]);
  };

  const filteredTasks = useMemo(() => {
    if (!selectedIsland) return [];
    return state.tasks.filter((t: any) => t.subject === selectedIsland);
  }, [selectedIsland, state.tasks]);

  return (
    <div className="h-full relative bg-gradient-to-b from-[#87ceeb] to-[#e0f2fe] overflow-hidden perspective-scene">
      {/* 遠景裝飾 */}
      <div className="absolute top-10 left-10 opacity-20"><Cloud className="w-20 h-20 text-white" /></div>
      <div className="absolute top-20 right-20 opacity-30 animate-pulse"><Sun className="w-24 h-24 text-yellow-300" /></div>
      <div className="absolute top-40 left-1/4 opacity-10"><Cloud className="w-32 h-32 text-white" /></div>

      {activeQuizTask && (
        <QuizChallenge 
          title={activeQuizTask.title}
          questions={activeQuizTask.questions || []}
          onComplete={handleQuizComplete}
          onCancel={() => setActiveQuizTask(null)}
        />
      )}

      <div className="relative w-full h-full p-4 md:p-8 flex items-center justify-center">
        {/* 傾斜的地板 */}
        <div className="relative w-full aspect-[4/3] max-w-5xl rounded-[5rem] overflow-visible shadow-[0_50px_100px_rgba(0,0,0,0.2)] bg-[#aed361] ground-plane border-[16px] border-[#5d2e0d]">
          {/* 地面紋理與路徑 */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-30 pointer-events-none" />
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 800 600">
            <path d="M100 450 C 200 480, 300 350, 400 450 S 600 500, 700 400 S 400 100, 200 150" fill="none" stroke="#f3e8d2" strokeWidth="40" strokeLinecap="round" />
            <path d="M100 450 C 200 480, 300 350, 400 450 S 600 500, 700 400 S 400 100, 200 150" fill="none" stroke="#5d2e0d" strokeWidth="2" strokeDasharray="10 10" />
          </svg>

          {/* 各主題園區建築 */}
          {islands.map((subject, idx) => {
            const info = (SUBJECT_INFO as any)[subject];
            const positions = [
              { bottom: '15%', left: '15%' }, // 國語
              { bottom: '10%', right: '15%' }, // 英文
              { top: '15%', left: '10%' },    // 數學
              { top: '25%', right: '25%' },   // 自然
              { top: '5%', right: '10%' },    // 社會
              { top: '40%', left: '40%' }     // 期末魔王
            ];
            const pos = positions[idx];
            const progress = getProgress(subject);
            const subjectImg = state.subjectIcons[subject] || info.islandImg;

            return (
              <div key={subject} style={pos} className="absolute group z-20">
                {/* 投影陰影 */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-12 shadow-cast" />
                
                {/* 立體廣告牌建築 */}
                <button
                  onClick={() => setSelectedIsland(subject)}
                  className="billboard relative transition-all duration-300 hover:-translate-y-8 active:scale-95 text-center"
                >
                  <div className="relative">
                    {/* 完成光圈 */}
                    {progress === 100 && (
                      <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-40 animate-pulse" />
                    )}
                    
                    {/* 建築物主體 */}
                    <div className={`w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border-[10px] ${info.borderColor} bg-white shadow-2xl floating transition-all group-hover:brightness-110 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]`}>
                      <img src={subjectImg} alt={info.name} className="w-full h-full object-cover" />
                      {/* 玻璃光感遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/40 pointer-events-none" />
                    </div>

                    {/* 進度標籤 */}
                    <div className="absolute -top-6 -right-6 w-16 h-16 bg-white rounded-full border-4 border-blue-500 flex flex-col items-center justify-center shadow-xl z-30 transform group-hover:scale-110 transition-transform">
                       <span className="text-xs font-bold text-blue-400 leading-none">EXP</span>
                       <span className="text-sm font-game text-blue-600 font-bold">{progress}%</span>
                    </div>

                    {/* 園區標語牌 */}
                    <div className={`mt-4 bg-white/95 backdrop-blur-md px-6 py-2 rounded-2xl text-xs font-game text-gray-800 shadow-xl border-2 border-gray-100 flex items-center gap-3 transform group-hover:translate-y-1 transition-transform ${subject === Subject.BOSS ? 'border-red-500 ring-4 ring-red-100' : ''}`}>
                      <span className="text-2xl drop-shadow-md">{info.icon}</span>
                      <div className="text-left">
                        <div className="text-[10px] text-gray-400 font-bold leading-none">{subject}</div>
                        <div className="font-bold text-sm">{info.name}</div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}

          {/* 勇者目前位置裝飾 */}
          <div className="absolute bottom-10 left-10 z-40 p-4 rounded-[2.5rem] bg-white/90 backdrop-blur shadow-2xl border-4 border-yellow-500 flex items-center gap-4 transition-all hover:scale-105">
            <div className="w-16 h-16 bg-blue-100 rounded-full border-4 border-white shadow-inner flex items-center justify-center text-4xl">
              {state.character === 'boy' ? '👦' : '👧'}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">冒險勇者</p>
              <p className="font-game font-bold text-xl text-blue-900 leading-none">{state.studentName}</p>
            </div>
          </div>

          {/* 裝飾性樹木 (呼應圖案風格) */}
          <div className="absolute bottom-20 right-40 opacity-40 billboard"><Trees className="text-green-800 w-12 h-12" /></div>
          <div className="absolute top-1/2 right-10 opacity-30 billboard"><Trees className="text-green-700 w-10 h-10" /></div>
        </div>
      </div>

      {/* 點擊園區後的任務彈窗 */}
      {selectedIsland && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`w-full max-w-xl bg-white rounded-[3.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] border-[12px] ${(SUBJECT_INFO as any)[selectedIsland].borderColor} animate-in zoom-in duration-300`}>
            <div className={`p-8 ${(SUBJECT_INFO as any)[selectedIsland].color} flex justify-between items-center border-b-8 ${(SUBJECT_INFO as any)[selectedIsland].borderColor}`}>
              <div className="flex items-center gap-5">
                <div className="bg-white p-4 rounded-3xl shadow-lg transform -rotate-3">
                  {(SUBJECT_INFO as any)[selectedIsland].icon}
                </div>
                <div>
                  <h2 className="text-3xl font-game text-gray-800">{(SUBJECT_INFO as any)[selectedIsland].name}</h2>
                  <p className="text-sm font-bold opacity-60">探索此園區的學習秘密</p>
                </div>
              </div>
              <button onClick={() => setSelectedIsland(null)} className="p-4 hover:bg-white/50 rounded-full transition-colors"><X className="w-10 h-10 text-gray-800" /></button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[55vh] overflow-y-auto bg-[#fafafa]">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                   <div className="text-6xl mb-4 grayscale opacity-20">📂</div>
                   <p className="text-gray-400 font-game text-xl">目前此園區尚未佈置關卡</p>
                </div>
              ) : (
                filteredTasks.map((task: any) => {
                  const isCompleted = state.completedTasks.includes(task.id);
                  const isClaimed = state.claimedTaskRewards.includes(task.id);
                  return (
                    <div key={task.id} className={`p-6 rounded-[2.5rem] border-4 transition-all relative group ${isCompleted ? 'bg-green-50/50 border-green-200' : 'bg-white border-gray-100 hover:border-yellow-400 hover:shadow-xl'}`}>
                      <div className="flex items-start gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-white transition-colors">
                          <span className="text-4xl">{isCompleted ? '✅' : '📜'}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-xl font-game ${isCompleted ? 'text-green-700 opacity-60' : 'text-gray-800'}`}>{task.title}</h3>
                          <p className={`text-sm mt-1 font-medium leading-relaxed ${isCompleted ? 'text-green-600/50' : 'text-gray-500'}`}>{task.description}</p>
                          <div className="mt-4">
                            <span className="bg-yellow-400 text-yellow-950 px-4 py-1 rounded-full text-xs font-game font-bold shadow-sm border border-yellow-500">
                              ⭐ {task.rewardCoins} 金幣
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {!isCompleted ? (
                            <button onClick={() => handleTaskAction(task)} className="bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl shadow-[0_8px_0_rgb(30,64,175)] hover:shadow-[0_4px_0_rgb(30,64,175)] transition-all active:translate-y-1 active:shadow-none">
                              <ChevronRight className="w-8 h-8" />
                            </button>
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-green-500 border-4 border-white flex items-center justify-center shadow-lg"><CheckCircle2 className="w-10 h-10 text-white" /></div>
                          )}
                        </div>
                      </div>
                      {isCompleted && !isClaimed && (
                        <div className="mt-6 pt-6 border-t border-green-200 grid grid-cols-2 gap-4">
                          <button onClick={() => onResetTask(task.id)} className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-600 font-game py-3 rounded-2xl transition-colors"><RotateCcw className="w-5 h-5" /> 重來</button>
                          <button onClick={() => handleNextLevel(task.id)} className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-game py-3 rounded-2xl shadow-[0_6px_0_rgb(67,56,202)] active:translate-y-1 active:shadow-none transition-all">領獎勵 <FastForward className="w-5 h-5" /></button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">勇者冒險日誌 • 當前園區探險中</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningMap;
