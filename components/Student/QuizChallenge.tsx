
import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../../types';
import { X, CheckCircle, AlertCircle, ChevronRight, Trophy } from 'lucide-react';

interface QuizChallengeProps {
  title: string;
  questions: QuizQuestion[];
  onComplete: () => void;
  onCancel: () => void;
}

const QuizChallenge: React.FC<QuizChallengeProps> = ({ title, questions, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [npcMessage, setNpcMessage] = useState("歡迎來到知識殿堂，勇者！只有答對這些問題，才能獲得通往下一關的通行證！");

  const currentQuestion = questions[currentStep];

  const handleOptionSelect = (idx: number) => {
    if (isWrong) return;
    setSelectedOption(idx);
    
    if (idx === currentQuestion.answerIndex) {
      setNpcMessage("太出色了！這題難不倒你。");
      setTimeout(() => {
        if (currentStep < questions.length - 1) {
          setCurrentStep(prev => prev + 1);
          setSelectedOption(null);
          setNpcMessage("下一題考驗來了，準備好了嗎？");
        } else {
          setIsFinished(true);
          setNpcMessage("恭喜！你已經通過了所有的考驗，這是你的通行證！");
        }
      }, 1500);
    } else {
      setIsWrong(true);
      setNpcMessage("哎呀，看來你需要回去再讀讀 NotebookLM 的重點筆記喔！");
      setTimeout(() => {
        setIsWrong(false);
        setSelectedOption(null);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#f4ece1] rounded-[3rem] border-[12px] border-[#8b4513] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative">
        
        {/* Parchment Texture Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] pointer-events-none" />

        <div className="p-6 bg-[#8b4513] text-[#f4ece1] flex justify-between items-center border-b-4 border-[#5d2e0d]">
          <h2 className="text-xl font-game flex items-center gap-2">
            <Trophy className="w-6 h-6" /> {title} - 冒險者挑戰
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-8 flex flex-col md:flex-row gap-8 overflow-y-auto relative">
          
          {/* NPC Section */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-[#8b4513] flex items-center justify-center text-6xl shadow-xl floating">
              🦉
            </div>
            <div className="mt-4 bg-white p-4 rounded-2xl border-2 border-[#8b4513] relative after:content-[''] after:absolute after:-top-2 after:left-1/2 after:-translate-x-1/2 after:border-l-8 after:border-r-8 after:border-b-8 after:border-transparent after:border-b-white">
              <p className="text-sm font-bold text-[#5d2e0d] leading-relaxed text-center">
                {npcMessage}
              </p>
            </div>
          </div>

          {/* Question Section */}
          <div className="flex-1">
            {!isFinished ? (
              <div className="space-y-6">
                <div className="bg-white/50 p-6 rounded-3xl border-2 border-[#d2b48c] shadow-inner">
                  <span className="text-xs font-bold text-[#8b4513] uppercase tracking-widest">問題 {currentStep + 1} / {questions.length}</span>
                  <h3 className="text-2xl font-bold text-[#5d2e0d] mt-2 leading-tight">
                    {currentQuestion.question}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={selectedOption !== null}
                      className={`group p-5 rounded-2xl border-4 text-left font-bold transition-all flex items-center justify-between ${
                        selectedOption === idx
                          ? idx === currentQuestion.answerIndex
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : 'bg-red-100 border-red-500 text-red-700 shake'
                          : 'bg-white border-[#d2b48c] hover:border-[#8b4513] text-[#8b4513]'
                      }`}
                    >
                      <span className="flex-1">{opt}</span>
                      {selectedOption === idx && (
                        idx === currentQuestion.answerIndex ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-6">
                <div className="text-8xl animate-bounce">📜</div>
                <h3 className="text-3xl font-game text-[#5d2e0d]">考驗通過！</h3>
                <p className="text-[#8b4513] font-bold">你展現了驚人的智慧，這枚金幣是你應得的獎勵。</p>
                <button 
                  onClick={onComplete}
                  className="w-full py-4 bg-[#8b4513] hover:bg-[#5d2e0d] text-white rounded-2xl font-game text-2xl shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  領取通行證 <ChevronRight className="w-8 h-8" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-[#d2b48c]/30 border-t border-[#d2b48c] text-center">
          <p className="text-[10px] text-[#8b4513] font-bold uppercase tracking-[0.2em]">智慧學院官方認證考卷</p>
        </div>
      </div>
    </div>
  );
};

export default QuizChallenge;
