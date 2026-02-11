import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StoreComparisonModal({ isOpen, onClose }) {
  const [storeA, setStoreA] = useState('');
  const [storeB, setStoreB] = useState('');
  const navigate = useNavigate();

  // 模拟门店数据
  const stores = [
    { id: '1', name: '北京朝阳门店' },
    { id: '2', name: '上海静安门店' },
    { id: '3', name: '广州天河门店' },
    { id: '4', name: '深圳南山门店' },
    { id: '5', name: '杭州西湖门店' },
  ];

  const handleConfirmComparison = () => {
    if (!storeA || !storeB) {
      alert('请选择两个门店进行对比');
      return;
    }
    navigate(`/store-comparison?storeA=${encodeURIComponent(storeA)}&storeB=${encodeURIComponent(storeB)}`);
    setStoreA('');
    setStoreB('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">选择对比门店</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">门店 A</label>
            <div className="relative">
              <select 
                value={storeA}
                onChange={(e) => setStoreA(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 pr-8 outline-none transition-all cursor-pointer hover:border-blue-400"
              >
                <option value="">请选择门店 A</option>
                {stores.filter(s => s.id !== storeB).map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">门店 B</label>
            <div className="relative">
              <select 
                value={storeB}
                onChange={(e) => setStoreB(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 pr-8 outline-none transition-all cursor-pointer hover:border-red-400"
              >
                <option value="">请选择门店 B</option>
                {stores.filter(s => s.id !== storeA).map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleConfirmComparison}
            disabled={!storeA || !storeB}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium shadow-sm transition-all ${
              !storeA || !storeB 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
            }`}
          >
            开始对比
          </button>
        </div>
      </div>
    </div>
  );
}
