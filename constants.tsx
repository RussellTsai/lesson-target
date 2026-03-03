
import React from 'react';
import { Book, Divide, Languages, Microscope, Landmark, Flame } from 'lucide-react';
import { Subject } from './types';

export const SUBJECT_INFO = {
  [Subject.CHINESE]: {
    name: '語文綠洲',
    icon: <Book className="w-8 h-8 text-green-600" />,
    color: 'bg-green-100',
    borderColor: 'border-green-400',
    islandImg: 'https://picsum.photos/seed/oasis/400/300'
  },
  [Subject.MATH]: {
    name: '數學高山',
    icon: <Divide className="w-8 h-8 text-blue-600" />,
    color: 'bg-blue-100',
    borderColor: 'border-blue-400',
    islandImg: 'https://picsum.photos/seed/mountain/400/300'
  },
  [Subject.ENGLISH]: {
    name: '英文探險島',
    icon: <Languages className="w-8 h-8 text-purple-600" />,
    color: 'bg-purple-100',
    borderColor: 'border-purple-400',
    islandImg: 'https://picsum.photos/seed/island/400/300'
  },
  [Subject.SCIENCE]: {
    name: '科學實驗室',
    icon: <Microscope className="w-8 h-8 text-yellow-600" />,
    color: 'bg-yellow-100',
    borderColor: 'border-yellow-400',
    islandImg: 'https://picsum.photos/seed/lab/400/300'
  },
  [Subject.SOCIAL]: {
    name: '文化古城',
    icon: <Landmark className="w-8 h-8 text-orange-600" />,
    color: 'bg-orange-100',
    borderColor: 'border-orange-400',
    islandImg: 'https://picsum.photos/seed/castle/400/300'
  },
  [Subject.BOSS]: {
    name: '終極火山口',
    icon: <Flame className="w-8 h-8 text-red-600" />,
    color: 'bg-red-100',
    borderColor: 'border-red-600',
    islandImg: 'https://images.unsplash.com/photo-1518116242533-7057635ee3b5?auto=format&fit=crop&q=80&w=400&h=300'
  }
};

export const INITIAL_REWARDS = [
  { id: '1', name: '多看30分鐘電視', cost: 100, type: 'privilege', icon: '📺' },
  { id: '2', name: '免做家事券', cost: 200, type: 'privilege', icon: '🧹' },
  { id: '3', name: '選擇晚餐主食', cost: 150, type: 'privilege', icon: '🍕' },
  { id: '4', name: 'Ｑ版探險帽', cost: 50, type: 'virtual', icon: '🤠' },
  { id: '5', name: '文具禮包', cost: 300, type: 'physical', icon: '✏️' },
];
