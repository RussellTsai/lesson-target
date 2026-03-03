
import React, { useState, useRef } from 'react';
import { Subject, AppState, Task, QuizQuestion, CharacterType, Reward } from '../../types';
import { SUBJECT_INFO } from '../../constants';
import { Calendar, PieChart, CheckSquare, Plus, Save, Trash2, Edit2, X, AlertCircle, BookOpen, ExternalLink, HelpCircle, ListPlus, Users, UserPlus, Download, ShieldCheck, ShoppingBag, Gift, Star, Tag, Image as ImageIcon, Upload, Map as MapIcon } from 'lucide-react';

interface ParentDashboardProps {
  state: AppState;
  onUpdateConfig: (examDate: string, weights: Record<Subject, number>) => void;
  onUpdateTasks: (tasks: Task[]) => void;
  onUpdateRewards: (rewards: Reward[]) => void;
  onUpdateSubjectIcons: (icons: Record<string, string>) => void;
  onAddProfile: (name: string, character: CharacterType) => void;
  onDeleteProfile: (id: string) => void;
  onManualSave: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ state, onUpdateConfig, onUpdateTasks, onUpdateRewards, onUpdateSubjectIcons, onAddProfile, onDeleteProfile, onManualSave }) => {
  const [examDate, setExamDate] = useState(state.examDate);
  const [weights, setWeights] = useState(state.subjectWeights);
  const [isConfigSaved, setIsConfigSaved] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizInput, setQuizInput] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserChar, setNewUserChar] = useState<CharacterType>('boy');

  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
  const [editingReward, setEditingReward] = useState<Partial<Reward> | null>(null);
  
  const subjectIconInputRef = useRef<HTMLInputElement>(null);
  const [currentIconTarget, setCurrentIconTarget] = useState<Subject | null>(null);

  const handleWeightChange = (subject: Subject, val: string) => {
    const num = Math.max(0, parseInt(val) || 0);
    setWeights(prev => ({ ...prev, [subject]: num }));
  };

  const handleSaveConfig = () => {
    onUpdateConfig(examDate, weights);
    setIsConfigSaved(true);
    setTimeout(() => setIsConfigSaved(false), 2000);
  };

  const handleSubjectIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentIconTarget) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newIcons = { ...state.subjectIcons, [currentIconTarget]: reader.result as string };
        onUpdateSubjectIcons(newIcons);
        setCurrentIconTarget(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerIconUpload = (s: Subject) => {
    setCurrentIconTarget(s);
    subjectIconInputRef.current?.click();
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTasks(state.tasks.filter(t => t.id !== id));
  };

  const handleDeleteReward = (id: string) => {
    onUpdateRewards(state.rewards.filter(r => r.id !== id));
  };

  const parseQuizInput = (input: string): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    const blocks = input.split(/Q:/i).filter(b => b.trim() !== "");
    
    blocks.forEach(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l !== "");
      const questionText = lines[0];
      let options: string[] = [];
      let answerIndex = 0;

      lines.forEach(line => {
        if (line.toLowerCase().startsWith('options:')) {
          options = line.substring(8).split(',').map(o => o.trim());
        } else if (line.toLowerCase().startsWith('ans:')) {
          answerIndex = (parseInt(line.substring(4).trim()) || 1) - 1;
        }
      });

      if (questionText && options.length > 0) {
        questions.push({ question: questionText, options, answerIndex });
      }
    });
    return questions;
  };

  const handleSaveTask = () => {
    if (!editingTask || !editingTask.title?.trim()) {
      alert("冒險任務必須有標題喔！");
      return;
    }

    let parsedQuestions: QuizQuestion[] | undefined = undefined;
    if (isQuizMode) {
      parsedQuestions = parseQuizInput(quizInput);
      if (parsedQuestions.length === 0) {
        alert("無法解析測驗內容，請確認格式：\nQ: 題目\nOptions: 選項1,選項2...\nAns: 序號");
        return;
      }
    }

    const newTask: Task = {
      id: editingTask.id || 'task_' + Date.now(),
      subject: editingTask.subject || Subject.CHINESE,
      title: editingTask.title || "",
      description: editingTask.description || "",
      rewardCoins: editingTask.rewardCoins || 10,
      isCompleted: editingTask.isCompleted || false,
      isQuizTask: isQuizMode,
      questions: parsedQuestions
    };

    const updatedTasks = state.tasks.some(t => t.id === newTask.id)
      ? state.tasks.map(t => t.id === newTask.id ? newTask : t)
      : [...state.tasks, newTask];
    
    onUpdateTasks(updatedTasks);
    setEditingTask(null);
  };

  const handleSaveReward = () => {
    if (!editingReward || !editingReward.name?.trim()) {
      alert("請輸入獎勵名稱！");
      return;
    }

    const newReward: Reward = {
      id: editingReward.id || 'reward_' + Date.now(),
      name: editingReward.name || "",
      cost: editingReward.cost || 100,
      type: editingReward.type || 'privilege',
      icon: editingReward.icon || "🎁"
    };

    const updatedRewards = state.rewards.some(r => r.id === newReward.id)
      ? state.rewards.map(r => r.id === newReward.id ? newReward : r)
      : [...state.rewards, newReward];
    
    onUpdateRewards(updatedRewards);
    setEditingReward(null);
  };

  const openAddTaskForSubject = (s: Subject) => {
    setEditingTask({ id: 'task_' + Date.now(), subject: s, title: '', description: '', isCompleted: false, rewardCoins: 10 });
    setIsQuizMode(false);
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        
        {/* Global Action Bar */}
        <div className="flex justify-between items-center bg-blue-600 p-6 rounded-[2rem] shadow-xl text-white">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8" />
            <h2 className="text-xl font-bold">家長核心控制台</h2>
          </div>
          <button 
            onClick={onManualSave}
            className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-all active:scale-95 shadow-lg"
          >
            <Download className="w-5 h-5" /> 儲存紀錄與匯出
          </button>
        </div>

        {/* 主題園區場景管理 (新增功能) */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-8 border-b pb-4">
            <MapIcon className="w-8 h-8 text-emerald-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">主題園區場景管理</h2>
              <p className="text-xs text-gray-400 font-bold mt-1">自定義國語、數學等科目的「地圖建築物」外觀</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <input type="file" ref={subjectIconInputRef} className="hidden" accept="image/*" onChange={handleSubjectIconUpload} />
            {Object.values(Subject).map(s => (
              <div key={s} className="flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={() => triggerIconUpload(s)}>
                  <div className={`w-32 h-24 rounded-2xl border-4 overflow-hidden shadow-lg transition-all group-hover:scale-105 ${(SUBJECT_INFO as any)[s].borderColor}`}>
                    <img 
                      src={state.subjectIcons[s] || (SUBJECT_INFO as any)[s].islandImg} 
                      alt={s} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                    <Upload className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <span className="font-bold text-gray-700">{(SUBJECT_INFO as any)[s].name}</span>
                  <div className="text-[10px] text-gray-400 font-bold">{s}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* User Management */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-indigo-500" />
                <h2 className="text-2xl font-bold text-gray-800">勇者成員管理</h2>
              </div>
              <button onClick={() => setShowAddUser(true)} className="bg-indigo-500 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all"><UserPlus className="w-5 h-5" /> 新增成員</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.profiles.map(p => (
                <div key={p.id} className="p-4 border-2 border-gray-100 rounded-3xl flex items-center justify-between hover:border-indigo-200 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="text-4xl bg-gray-50 p-2 rounded-2xl">{p.character === 'boy' ? '👦' : '👧'}</div>
                      <div>
                        <div className="font-bold text-gray-800">{p.name}</div>
                        <div className="text-xs text-gray-400 font-bold">金幣: {p.coins} | 已完成: {p.completedTasks.length}</div>
                      </div>
                   </div>
                   <button onClick={() => onDeleteProfile(p.id)} className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
           </div>
        </section>

        {/* Reward Management Section */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
           <div className="flex justify-between items-center mb-8 border-b pb-4 border-pink-50">
              <div className="flex items-center gap-3">
                <Gift className="w-8 h-8 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-800">勇者兌換商店管理</h2>
              </div>
              <button onClick={() => setEditingReward({ id: '', name: '', cost: 100, type: 'privilege', icon: '🎁' })} className="bg-pink-500 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-pink-600 transition-all shadow-lg"><Plus className="w-5 h-5" /> 新增商品</button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.rewards.map(r => (
                  <div key={r.id} className="p-4 border-2 border-gray-100 rounded-3xl flex items-center justify-between hover:border-pink-200 transition-all bg-white shadow-sm group">
                     <div className="flex items-center gap-4">
                        <div className="text-4xl bg-pink-50 w-16 h-16 flex items-center justify-center rounded-2xl">{r.icon}</div>
                        <div>
                          <div className="font-bold text-gray-800">{r.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold">⭐ {r.cost}</span>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">{r.type === 'privilege' ? '特權' : r.type === 'virtual' ? '虛擬' : '實體'}</span>
                          </div>
                        </div>
                     </div>
                     <div className="flex gap-1">
                        <button onClick={() => setEditingReward(r)} className="p-2 text-pink-500 hover:bg-pink-50 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                        <button onClick={() => handleDeleteReward(r.id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                     </div>
                  </div>
                ))}
           </div>
        </section>

        {/* Timeline & Subject Weights */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
           <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <Calendar className="w-8 h-8 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-800">冒險時程與科目分配</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">終極戰鬥日 (月考/期末考)</label>
                    <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold"/>
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2"><PieChart className="w-4 h-4" /> 科目權重與快速新增</h3>
                 <div className="space-y-2">
                    {Object.values(Subject).map(s => (
                      <div key={s} className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex items-center gap-4">
                         <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 block">{s} 權重</label>
                            <input type="number" value={weights[s] || 0} onChange={e => handleWeightChange(s, e.target.value)} className="w-full bg-transparent outline-none font-bold text-gray-700 text-lg"/>
                         </div>
                         <button onClick={() => openAddTaskForSubject(s)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-xl flex items-center gap-1 text-xs font-bold transition-colors"><Plus className="w-4 h-4" /> 新任務</button>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <button onClick={handleSaveConfig} className={`mt-10 w-full py-5 rounded-2xl font-bold text-white transition-all shadow-lg ${isConfigSaved ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}>
             {isConfigSaved ? '時程設定已儲存！' : '儲存冒險時程設定'}
           </button>
        </section>

        {/* Task Management Section */}
        <section className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><CheckSquare className="w-6 h-6 text-green-500" /> 任務清單管理</h2>
           </div>
           <div className="space-y-4">
              {state.tasks.map(t => (
                  <div key={t.id} className="p-4 border rounded-2xl flex justify-between items-center group transition-all hover:border-blue-200 bg-white shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">{t.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-500">{t.subject}</span>
                            {t.isQuizTask && <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-bold">智慧測驗</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{t.description || "無描述"}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => setEditingTask(t)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteTask(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                     </div>
                  </div>
                ))}
           </div>
        </section>
      </div>

      {/* Edit Quest Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl border-8 border-blue-400 animate-in zoom-in duration-200">
            <div className="p-8 bg-blue-50 border-b-4 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-blue-900">{state.tasks.some(t => t.id === editingTask.id) ? '修改冒險任務' : '建立新任務'}</h3>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{editingTask.subject} 分類</p>
              </div>
              <button onClick={() => setEditingTask(null)}><X className="w-8 h-8 text-gray-400 hover:text-gray-600" /></button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">任務標題</label>
                  <input value={editingTask.title || ""} onChange={e => setEditingTask({...editingTask, title: e.target.value})} placeholder="任務名稱..." className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-blue-200 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">完成獎勵 (⭐ 金幣)</label>
                  <input type="number" value={editingTask.rewardCoins || 0} onChange={e => setEditingTask({...editingTask, rewardCoins: parseInt(e.target.value) || 0})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-blue-200 outline-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl border-2 border-amber-100">
                <input type="checkbox" id="quizMode" checked={isQuizMode} onChange={e => setIsQuizMode(e.target.checked)} className="w-5 h-5 accent-amber-600" />
                <label htmlFor="quizMode" className="font-bold text-amber-900 flex items-center gap-1 cursor-pointer">啟用智慧測驗模式 (NotebookLM 支援) <HelpCircle className="w-3 h-3 opacity-50" /></label>
              </div>

              {isQuizMode ? (
                <div>
                  <label className="text-xs font-bold text-amber-600 block mb-2">貼入測驗格式 (Q: 題目, Options: A,B,C,D, Ans: 1)</label>
                  <textarea value={quizInput} onChange={e => setQuizInput(e.target.value)} placeholder="Q: 誰發現了引力？&#10;Options: 愛因斯坦, 牛頓, 伽利略, 達爾文&#10;Ans: 2" className="w-full p-6 bg-gray-50 rounded-2xl h-48 font-mono text-xs leading-relaxed focus:bg-white border-2 border-transparent focus:border-amber-200 transition-all outline-none" />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">任務詳情描述</label>
                  <textarea value={editingTask.description || ""} onChange={e => setEditingTask({...editingTask, description: e.target.value})} placeholder="描述這項冒險的具體內容..." className="w-full p-4 bg-gray-50 rounded-2xl h-24 focus:bg-white border-2 border-transparent focus:border-blue-200 transition-all outline-none" />
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 flex gap-4">
              <button onClick={() => setEditingTask(null)} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600">取消</button>
              <button onClick={handleSaveTask} className="flex-[2] py-4 px-10 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95">儲存任務變更</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reward Modal */}
      {editingReward && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl border-8 border-pink-400 animate-in zoom-in duration-200">
            <div className="p-8 bg-pink-50 border-b-4 border-pink-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-pink-900">{editingReward.id ? '修改商店商品' : '上架新商品'}</h3>
                <p className="text-xs font-bold text-pink-400 uppercase tracking-widest">獎勵內容設定</p>
              </div>
              <button onClick={() => setEditingReward(null)}><X className="w-8 h-8 text-gray-400 hover:text-gray-600" /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-400 block mb-1">商品圖示 (Emoji)</label>
                  <input value={editingReward.icon || "🎁"} onChange={e => setEditingReward({...editingReward, icon: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-pink-200 text-center text-2xl outline-none" />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-400 block mb-1">商品類別</label>
                  <select value={editingReward.type || 'privilege'} onChange={e => setEditingReward({...editingReward, type: e.target.value as any})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-pink-200 outline-none">
                    <option value="privilege">特殊權利</option>
                    <option value="virtual">虛擬寶物</option>
                    <option value="physical">實體獎勵</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">商品名稱</label>
                <input value={editingReward.name || ""} onChange={e => setEditingReward({...editingReward, name: e.target.value})} placeholder="例如：看電視30分鐘..." className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-pink-200 outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">兌換所需金幣 (⭐)</label>
                <div className="relative">
                  <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                  <input type="number" value={editingReward.cost || 0} onChange={e => setEditingReward({...editingReward, cost: parseInt(e.target.value) || 0})} className="w-full p-4 pl-12 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-pink-200 outline-none" />
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex gap-4">
              <button onClick={() => setEditingReward(null)} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600">取消</button>
              <button onClick={handleSaveReward} className="flex-[2] py-4 px-10 bg-pink-600 text-white font-bold rounded-2xl shadow-xl hover:bg-pink-700 transition-all active:scale-95">儲存商品設定</button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 w-full max-md shadow-2xl border-8 border-indigo-100 animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">新增冒險成員</h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2">成員姓名</label>
                <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="輸入勇者名稱..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2">選擇角色</label>
                <div className="flex gap-4">
                  <button onClick={() => setNewUserChar('boy')} className={`flex-1 p-4 rounded-2xl border-4 ${newUserChar === 'boy' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100'}`}>👦 男勇者</button>
                  <button onClick={() => setNewUserChar('girl')} className={`flex-1 p-4 rounded-2xl border-4 ${newUserChar === 'girl' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100'}`}>👧 女勇者</button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddUser(false)} className="flex-1 py-4 font-bold text-gray-400">取消</button>
                <button onClick={() => { if (newUserName.trim()) { onAddProfile(newUserName, newUserChar); setNewUserName(""); setShowAddUser(false); } }} className="flex-2 py-4 px-8 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl">完成新增</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
