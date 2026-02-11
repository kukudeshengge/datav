import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

export default function Rank() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  
  // 筛选状态
  const [rankType, setRankType] = useState('branch'); // branch (分公司排行), branch-store (分公司下门店排行), all-store (全部门店排行)
  const [selectedBranch, setSelectedBranch] = useState('华北分公司');
  const [period, setPeriod] = useState('month'); // day, week, month, year
  const [metric, setMetric] = useState('count'); // count (签约数量), progress (签约进度), dma (DMA资源消耗), penetration (渗透率)

  const BRANCHES = ['华北分公司', '华南分公司', '华中分公司', '西南分公司', '华东分公司', '西北分公司'];

  // 这里的 data 已经是根据 rankType/metric 生成并排序好的全量数据
  const processedData = useMemo(() => {
    let result = [];
    
    if (rankType === 'branch') {
      // 分公司排行
      result = BRANCHES.map((name, index) => {
        let val;
         if (metric === 'count') val = Math.floor(Math.random() * 10000) + 5000;
         else if (metric === 'progress') val = Math.floor(Math.random() * 40) + 60; // 60-100%
         else if (metric === 'penetration') val = Math.floor(Math.random() * 50) + 30; // 30-80%
         else val = Math.floor(Math.random() * 500000) + 100000;
         
         return {
           id: `b-${index}`,
           name: name,
           branch: name,
           value: val,
           trend: Math.random() > 0.5 ? 'up' : 'down',
           trendValue: (Math.random() * 10).toFixed(1)
         };
      });
    } else if (rankType === 'branch-store') {
      // 分公司下门店排行
      result = Array.from({ length: 20 }).map((_, index) => {
        let val;
        if (metric === 'count') val = Math.floor(Math.random() * 500) + 10;
        else if (metric === 'progress') val = Math.floor(Math.random() * 100);
        else if (metric === 'penetration') val = Math.floor(Math.random() * 90) + 5;
        else val = Math.floor(Math.random() * 10000) + 1000;
        
        return {
          id: `bs-${index}`,
          name: `${selectedBranch} - ${Math.floor(Math.random() * 100)}号门店`,
          branch: selectedBranch,
          value: val,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          trendValue: (Math.random() * 20).toFixed(1)
        };
      });
    } else {
       // 全部门店排行
       result = Array.from({ length: 50 }).map((_, index) => {
         const branchName = BRANCHES[Math.floor(Math.random() * BRANCHES.length)];
         let val;
         if (metric === 'count') val = Math.floor(Math.random() * 500) + 10;
         else if (metric === 'progress') val = Math.floor(Math.random() * 100);
         else if (metric === 'penetration') val = Math.floor(Math.random() * 90) + 5;
         else val = Math.floor(Math.random() * 10000) + 1000;
         
         return {
           id: `s-${index}`,
           name: `${branchName} - ${Math.floor(Math.random() * 100)}号门店`,
           branch: branchName,
           value: val,
           trend: Math.random() > 0.5 ? 'up' : 'down',
           trendValue: (Math.random() * 20).toFixed(1)
         };
       });
    }
    
    // 默认降序
    return result.sort((a, b) => b.value - a.value);
  }, [rankType, selectedBranch, metric, period]);

  const top10Data = processedData.slice(0, 10);

  // 图表配置
  const getChartOption = () => {
    // 颜色映射
    const colors = metric === 'count' 
      ? '#3b82f6' // Blue (Solid for highlighting)
      : metric === 'progress' 
        ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#10b981' }, { offset: 1, color: '#059669' }]) // Green Gradient
        : metric === 'penetration'
          ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#8b5cf6' }, { offset: 1, color: '#6d28d9' }]) // Purple Gradient
        : '#f59e0b'; // Amber (Solid for highlighting)

    return {
      grid: {
        top: 20,
        right: 40,
        bottom: 20,
        left: 20, // 减小左侧边距
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      xAxis: {
        type: 'value',
        show: false, // 隐藏 X 轴
        splitLine: { show: false }
      },
      yAxis: {
        type: 'category',
        data: top10Data.map(item => item.name).reverse(), // ECharts 默认从下往上画，所以要反转
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#64748b',
          width: 110,
          overflow: 'truncate', // 名字太长截断
          formatter: (value) => value
        }
      },
      series: [
        {
          name: metric === 'count' ? '签约数量' : metric === 'progress' ? '签约进度' : metric === 'penetration' ? '渗透率' : '资源消耗',
          type: 'bar',
          data: top10Data.map(item => item.value).reverse(),
          barWidth: 16,
          itemStyle: {
            color: colors,
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params) => {
              if (metric === 'progress' || metric === 'penetration') return params.value + '%';
              if (metric === 'dma') return '¥' + params.value.toLocaleString();
              return params.value;
            },
            color: '#64748b',
            fontSize: 12
          },
          showBackground: metric === 'progress' || metric === 'penetration',
          backgroundStyle: {
            color: '#f1f5f9',
            borderRadius: [0, 4, 4, 0]
          }
        }
      ]
    };
  };

  const handleChartExport = () => {
    if (!chartRef.current) return;
    
    const echartsInstance = chartRef.current.getEchartsInstance();
    const base64 = echartsInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });

    const link = document.createElement('a');
    link.href = base64;
    link.download = `Top10排行榜.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden fixed top-0 left-0">
      {/* 头部导航与筛选 */}
      <header className="bg-white shadow-sm px-6 py-4 z-20 flex-none">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">排行榜</h1>
            <p className="text-xs text-slate-500 mt-0.5">各项业务指标排行统计</p>
          </div>
        </div>
      </header>

      <div className="flex-none px-6 pt-6 z-10">
        {/* 筛选控制器 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* 维度选择 */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setRankType('branch')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${rankType === 'branch' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                分公司排行
              </button>
              <button
                onClick={() => setRankType('branch-store')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${rankType === 'branch-store' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                分公司下门店
              </button>
              <button
                onClick={() => setRankType('all-store')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${rankType === 'all-store' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                全部门店排行
              </button>
            </div>

            {/* 分公司选择 (仅在分公司下门店模式显示) */}
            {rankType === 'branch-store' && (
              <div className="relative animate-fadeIn">
                 <select 
                   value={selectedBranch}
                   onChange={(e) => setSelectedBranch(e.target.value)}
                   className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block py-1.5 pl-3 pr-8 outline-none transition-all cursor-pointer hover:border-blue-400 font-medium shadow-sm"
                 >
                   {BRANCHES.map(b => (
                     <option key={b} value={b}>{b}</option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                   <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                     <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                   </svg>
                 </div>
              </div>
            )}

            <div className="w-px h-6 bg-slate-200"></div>

            {/* 指标选择 (签约数量/进度/DMA) */}
             <div className="relative">
               <select 
                 value={metric}
                 onChange={(e) => setMetric(e.target.value)}
                 className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block py-2 pl-3 pr-10 outline-none transition-all cursor-pointer hover:border-blue-400 font-medium"
               >
                 <option value="count">签约数量</option>
                 <option value="progress">签约进度</option>
                 <option value="penetration">渗透率</option>
                 <option value="dma">DMA资源消耗</option>
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                 <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                   <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                 </svg>
               </div>
             </div>

             <div className="w-px h-6 bg-slate-200"></div>

            {/* 周期筛选 */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['day', 'week', 'month', 'year'].map(k => (
                <button
                  key={k}
                  onClick={() => setPeriod(k)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === k ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {k === 'day' ? '日' : k === 'week' ? '周' : k === 'month' ? '月' : '年'}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 内容区域：左图右表 */}
      <div className="flex-1 p-6 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 左侧：Top 10 图表 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
             <h2 className="font-bold text-slate-800 flex items-center gap-2">
               <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
               Top 10 排行榜
             </h2>
             <button
                onClick={handleChartExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                导出图表
              </button>
          </div>
          <div className="flex-1 min-h-[300px]">
             <ReactECharts 
               ref={chartRef}
               option={getChartOption()} 
               style={{ height: '100%', width: '100%' }}
               notMerge={true}
             />
          </div>
        </div>

        {/* 右侧：完整数据列表 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
           <div className="p-4 border-b border-slate-100">
             <h2 className="font-bold text-slate-800 flex items-center gap-2">
               <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
               全部数据列表
             </h2>
           </div>
           
           <div className="grid grid-cols-12 gap-2 p-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 flex-none">
            <div className="col-span-2 text-center">排名</div>
            <div className="col-span-4">{rankType === 'branch' ? '分公司名称' : '门店名称'}</div>
            <div className="col-span-3 text-right">
              {metric === 'count' ? '签约数 (份)' : metric === 'progress' ? '进度 (%)' : metric === 'penetration' ? '渗透率 (%)' : '消耗 (元)'}
            </div>
            <div className="col-span-3 text-right">环比</div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {processedData.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-slate-50 transition-colors group">
                <div className="col-span-2 flex justify-center">
                  <span className={`flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
                    index < 3 
                      ? index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-700'
                      : 'text-slate-400 bg-slate-50'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                <div className="col-span-4 text-sm font-medium text-slate-700 truncate" title={item.name}>
                  {item.name}
                </div>
                <div className="col-span-3 text-right font-mono text-sm font-medium text-slate-700">
                  {metric === 'dma' ? '¥' : ''}{item.value.toLocaleString()}{metric === 'progress' || metric === 'penetration' ? '%' : ''}
                </div>
                <div className={`col-span-3 text-right text-xs font-medium ${item.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {item.trend === 'up' ? '↑' : '↓'} {item.trendValue}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
