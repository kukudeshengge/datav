import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreComparisonModal from './StoreComparisonModal';

export default function FloatingMenu() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const handleNavigate = (path) => {
    if (path === '/store-comparison') {
      setShowModal(true);
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        {/* 菜单项 */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleNavigate('/store-comparison')}
            className="bg-white text-slate-700 px-4 py-2 rounded-full shadow-lg border border-slate-100 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            门店对比
          </button>
          <button
            onClick={() => handleNavigate('/data-overview')}
            className="bg-white text-slate-700 px-4 py-2 rounded-full shadow-lg border border-slate-100 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            数据概览
          </button>
          <button
            onClick={() => handleNavigate('/rank')}
            className="bg-white text-slate-700 px-4 py-2 rounded-full shadow-lg border border-slate-100 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            排行榜
          </button>
        </div>
      </div>

      <StoreComparisonModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
