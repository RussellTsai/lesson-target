import React, { useState } from 'react';
import { Reward } from '../../types';
import { ShoppingBag, Star, RefreshCcw, Gift, Package, X, Trash2 } from 'lucide-react';

interface RewardPlazaProps {
  coins: number;
  rewards: Reward[];
  history: { date: string; taskId: string }[];
  onBuy: (id: string) => void;
  onSpin: (rewardId: string) => void;
}

const RewardPlaza: React.FC<RewardPlazaProps> = ({ coins, rewards, history, onBuy, onSpin }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [showInventory, setShowInventory] = useState(false);

  const handleSpin = () => {
    if (coins < 50 || isSpinning) return;

    setIsSpinning(true);
    setSpinResult(null);

    const luckyReward = rewards[Math.floor(Math.random() * rewards.length)];

    setTimeout(() => {
      setSpinResult(luckyReward.name);
      setIsSpinning(false);
      onSpin(luckyReward.id);
    }, 2000);
  };

  // 計算已擁有物品及數量
  const inventoryItems = history
    .filter(h => h.taskId.startsWith('PURCHASE_') || h.taskId.startsWith('SPIN_WIN_'))
    .reduce((acc, curr) => {
      const id = curr.taskId.replace('PURCHASE_', '').replace('SPIN_WIN_', '');
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const inventoryList = Object.entries(inventoryItems).map(([id, count]) => {
    const reward = rewards.find(r => r.id === id);
    return { ...reward, count };
  }).filter(item => item.id); // 過濾掉找不到對應資訊的獎勵

  return (
    <div className="h-full bg-pink-50 overflow-y-auto p-4 md:p-8 relative">
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        
        {/* Inventory Toggle Button */}
        <div className="flex justify-end">
          <button 
            onClick={() => setShowInventory(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-game shadow-lg hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
          >
            <Package className="w-6 h-6" />
            {/* Fix: Explicitly type reduce parameters to resolve unknown type error */}
            勇者行囊 ({Object.values(inventoryItems).reduce((a: number, b: number) => a + b, 0)})
          </button>
        </div>

        {/* Lucky Spin Section */}
        <section className="bg-white rounded-3xl p-6 shadow-xl border-4 border-pink-200 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <RefreshCcw className="w-8 h-8 text-pink-500" />
            <h2 className="text-2xl font-game text-gray-800">幸運冒險轉盤</h2>
          </div>
          <p className="text-gray-500 mb-6 font-medium">消耗 <span className="text-pink-600 font-bold">50 金幣</span>，隨機抽出一項超值大獎！</p>
          
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div className={`w-full h-full rounded-full border-8 border-pink-100 flex items-center justify-center shadow-inner overflow-hidden transition-transform ${isSpinning ? 'animate-spin' : ''}`}>
               <div className="grid grid-cols-2 w-full h-full">
                  <div className="bg-red-400" />
                  <div className="bg-blue-400" />
                  <div className="bg-green-400" />
                  <div className="bg-yellow-400" />
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-pink-400 flex items-center justify-center z-10">
                 <span className="text-xl">🎁</span>
               </div>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-pink-600 z-20" />
          </div>

          {spinResult && !isSpinning && (
            <div className="mb-6 animate-bounce bg-green-100 text-green-700 px-6 py-2 rounded-full inline-block font-bold border-2 border-green-200">
              🎊 恭喜獲得：{spinResult}！
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={handleSpin}
              disabled={isSpinning || coins < 50}
              className={`px-8 py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                isSpinning || coins < 50 ? 'bg-gray-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 hover:-translate-y-1 shadow-pink-200'
              }`}
            >
              {isSpinning ? '冒險獎勵抽取中...' : '立即抽獎 (消耗 50 ⭐)'}
            </button>
            {coins < 50 && !isSpinning && (
              <p className="text-xs text-red-400 font-bold">金幣不足，快去完成任務領取吧！</p>
            )}
          </div>
        </section>

        {/* Store Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag className="w-8 h-8 text-purple-500" />
            <h2 className="text-2xl font-game text-gray-800">勇者兌換商店</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-white rounded-3xl p-5 shadow-md border-4 border-transparent hover:border-purple-200 transition-all flex flex-col group relative overflow-hidden">
                <div className="text-5xl mb-4 text-center bg-gray-50 rounded-2xl py-8 group-hover:scale-110 transition-transform">
                  {reward.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">{reward.name}</h3>
                <span className={`text-[10px] px-3 py-1 rounded-full inline-block w-fit mb-4 font-bold uppercase tracking-wider ${
                  reward.type === 'privilege' ? 'bg-orange-100 text-orange-600' : 
                  reward.type === 'virtual' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}>
                  {reward.type === 'privilege' ? '特殊權利' : reward.type === 'virtual' ? '虛擬寶物' : '實體獎勵'}
                </span>
                
                <button 
                  onClick={() => onBuy(reward.id)}
                  disabled={coins < reward.cost}
                  className={`mt-auto w-full py-3 rounded-2xl font-game font-bold transition-all flex items-center justify-center gap-1 text-lg ${
                    coins >= reward.cost ? 'bg-purple-600 text-white shadow-[0_4px_0_rgb(107,33,168)] hover:bg-purple-700 active:translate-y-1 active:shadow-none' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" /> {reward.cost} 兌換
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Inventory Modal */}
      {showInventory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-8 border-indigo-400 flex flex-col max-h-[85vh]">
            <div className="p-8 bg-indigo-50 border-b-4 border-indigo-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Package className="w-10 h-10 text-indigo-600" />
                <div>
                  <h3 className="text-3xl font-game text-indigo-900">勇者行囊</h3>
                  <p className="text-sm font-bold text-indigo-400 uppercase tracking-[0.2em]">已收集的冒險寶藏</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInventory(false)}
                className="p-3 hover:bg-indigo-100 rounded-full transition-colors"
              >
                <X className="w-10 h-10 text-indigo-900" />
              </button>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto space-y-4 bg-gray-50/30">
              {inventoryList.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-8xl opacity-20 mb-6 grayscale">📦</div>
                  <p className="text-2xl font-game text-gray-400">行囊空空如也...<br/>快去兌換心儀的獎勵吧！</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inventoryList.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-[2rem] border-2 border-indigo-50 flex items-center gap-4 shadow-sm group hover:border-indigo-200 transition-all">
                      <div className="text-5xl bg-indigo-50/50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-indigo-900 text-lg leading-tight">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            數量: {item.count}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            item.type === 'privilege' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {item.type === 'privilege' ? '特殊權利' : '實體獎項'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 bg-indigo-50/50 text-center">
              <p className="text-indigo-400 text-xs font-bold italic">「每一份努力，都值得被珍藏在行囊中。」</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardPlaza;