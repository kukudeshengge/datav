import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';
import './index.less';

const MOCK_STORES = [
  { id: '1', name: '北京朝阳门店' },
  { id: '2', name: '上海静安门店' },
  { id: '3', name: '广州天河门店' },
  { id: '4', name: '深圳南山门店' },
  { id: '5', name: '杭州西湖门店' },
];

const COMPARISON_PERIODS = ['近一周', '近1月', '近3月', '近6月', '近1年'];

const generateData = (type) => {
  switch (type) {
    case '周':
    case '近一周':
      return ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => ({
        time: day,
        value: Math.floor(Math.random() * 100) + 20
      }));
    case '月':
    case '近1月':
      return Array.from({ length: 15 }, (_, i) => ({
        time: `${i * 2 + 1}日`,
        value: Math.floor(Math.random() * 100) + 20
      }));
    case '近3月':
      return Array.from({ length: 12 }, (_, i) => ({
        time: `第${i + 1}周`,
        value: Math.floor(Math.random() * 100) + 20
      }));
    case '近6月':
      return Array.from({ length: 6 }, (_, i) => ({
        time: `${i + 1}月`,
        value: Math.floor(Math.random() * 100) + 20
      }));
    case '年':
    case '近1年':
      return Array.from({ length: 12 }, (_, i) => ({
        time: `${i + 1}月`,
        value: Math.floor(Math.random() * 100) + 20
      }));
    case '近3年':
      return Array.from({ length: 12 }, (_, i) => ({
        time: `Q${(i % 4) + 1}`,
        value: Math.floor(Math.random() * 100) + 20
      }));
    case '日':
    default:
      return Array.from({ length: 12 }, (_, i) => ({
        time: `${i * 2}:00`,
        value: Math.floor(Math.random() * 100) + 20,
      }));
  }
};

const generateConversionData = (type) => {
  const data = generateData(type);
  return data.map(item => ({
    ...item,
    value: Math.floor(Math.random() * 40) + 10 // 10% - 50%
  }));
};

const generatePenetrationData = (type) => {
  const data = generateData(type);
  return data.map(item => ({
    ...item,
    value: Math.floor(Math.random() * 60) + 20 // 20% - 80%
  }));
};

// Generate mock growth stats for DMA comparison
const generateDMAStats = () => {
  const valA = Math.floor(Math.random() * 20) + 1;
  const valB = Math.floor(Math.random() * 20) + 1;
  return {
    storeA: { value: `+${valA}%`, raw: valA },
    storeB: { value: `+${valB}%`, raw: valB },
    winner: valA > valB ? 'A' : (valB > valA ? 'B' : null)
  };
};

export default function StoreComparison() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const conversionChartRef = useRef(null);
  const conversionChartInstance = useRef(null);
  const penetrationChartRef = useRef(null);
  const penetrationChartInstance = useRef(null);

  const [storeA, setStoreA] = useState(searchParams.get('storeA') || MOCK_STORES[0].id);
  const [storeB, setStoreB] = useState(searchParams.get('storeB') || MOCK_STORES[1].id);
  const [dmaTimeFilter, setDmaTimeFilter] = useState('近一周');
  // Store stats for each period: { [period]: { storeA: ..., storeB: ..., winner: ... } }
  const [allDmaStats, setAllDmaStats] = useState({});
  const [conversionTimeFilter, setConversionTimeFilter] = useState('近一周');
  const [allConversionStats, setAllConversionStats] = useState({});
  const [penetrationTimeFilter, setPenetrationTimeFilter] = useState('近一周');
  const [allPenetrationStats, setAllPenetrationStats] = useState({});

  // Memoize data generation to prevent random updates on re-renders
  const [chartData, setChartData] = useState({
    dma: { A: [], B: [] },
    conversion: { A: [], B: [] },
    penetration: { A: [], B: [] }
  });

  // Conversion filter effect
  useEffect(() => {
    setChartData(prev => ({
      ...prev,
      conversion: { A: generateConversionData(conversionTimeFilter), B: generateConversionData(conversionTimeFilter) }
    }));
  }, [conversionTimeFilter]);

  // Penetration filter effect
  useEffect(() => {
    setChartData(prev => ({
      ...prev,
      penetration: { A: generatePenetrationData(penetrationTimeFilter), B: generatePenetrationData(penetrationTimeFilter) }
    }));
  }, [penetrationTimeFilter]);

  // DMA specific filter effect
  useEffect(() => {
    setChartData(prev => ({
      ...prev,
      dma: { A: generateData(dmaTimeFilter), B: generateData(dmaTimeFilter) }
    }));
  }, [dmaTimeFilter]);

  // Generate comparison stats for all periods on mount or store change
  useEffect(() => {
    const stats = {};
    const convStats = {};
    const penStats = {};
    COMPARISON_PERIODS.forEach(period => {
      stats[period] = generateDMAStats();
      convStats[period] = generateDMAStats(); // Reuse mock generation for simplicity
      penStats[period] = generateDMAStats();
    });
    setAllDmaStats(stats);
    setAllConversionStats(convStats);
    setAllPenetrationStats(penStats);
  }, [storeA, storeB]);

  // Sync state with URL params
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('storeA', storeA);
    newParams.set('storeB', storeB);
    setSearchParams(newParams);
  }, [storeA, storeB, setSearchParams, searchParams]);

  const handleStoreAChange = (e) => {
    setStoreA(e.target.value);
  };

  const handleStoreBChange = (e) => {
    setStoreB(e.target.value);
  };

  // Chart 1: DMA Resource Consumption (Grouped Bar)
  useEffect(() => {
    if (!chartRef.current) return;
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const { A: dataA, B: dataB } = chartData.dma;
    const storeNameA = MOCK_STORES.find(s => s.id === storeA)?.name || storeA;
    const storeNameB = MOCK_STORES.find(s => s.id === storeB)?.name || storeB;

    const option = {
      // title removed to use React component title
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          let result = `<div class="font-bold mb-1 text-slate-700">${params[0].name}</div>`;
          params.forEach((item, index) => {
            const color = index === 0 ? '#3b82f6' : '#ef4444';
            result += `<div class="flex items-center justify-between gap-4 text-xs">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full" style="background-color: ${color}"></span>
                ${item.seriesName}
              </span>
              <span class="font-mono font-bold">${item.value}</span>
            </div>`;
          });
          return result;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#f1f5f9',
        padding: 12,
        textStyle: { color: '#1e293b' }
      },
      legend: {
        data: [storeNameA, storeNameB],
        right: 10,
        top: 0,
        icon: 'circle',
        itemGap: 20
      },
      grid: {
        left: '2%',
        right: '2%',
        bottom: '5%',
        top: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dataA.map(item => item.time),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', marginTop: 10 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        axisLabel: { color: '#64748b' }
      },
      series: [
        {
          name: storeNameA,
          type: 'bar',
          color: '#3b82f6',
          data: dataA.map(item => item.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#60a5fa' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          barMaxWidth: 16
        },
        {
          name: storeNameB,
          type: 'bar',
          color: '#ef4444',
          data: dataB.map(item => item.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ef4444' },
              { offset: 1, color: '#f87171' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          barMaxWidth: 16
        }
      ]
    };

    chartInstance.current.setOption(option);
  }, [storeA, storeB, chartData.dma]);

  // Chart 2: Penetration Rate
  useEffect(() => {
    if (!penetrationChartRef.current) return;

    if (!penetrationChartInstance.current) {
      penetrationChartInstance.current = echarts.init(penetrationChartRef.current);
    }

    const { A: dataA, B: dataB } = chartData.penetration;
    const storeNameA = MOCK_STORES.find(s => s.id === storeA)?.name || storeA;
    const storeNameB = MOCK_STORES.find(s => s.id === storeB)?.name || storeB;

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          let result = `<div class="font-bold mb-1 text-slate-700">${params[0].name}</div>`;
          params.forEach((item, index) => {
            const color = index === 0 ? '#3b82f6' : '#ef4444';
            result += `<div class="flex items-center justify-between gap-4 text-xs">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full" style="background-color: ${color}"></span>
                ${item.seriesName}
              </span>
              <span class="font-mono font-bold">${item.value}%</span>
            </div>`;
          });
          return result;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#f1f5f9',
        padding: 12,
        textStyle: { color: '#1e293b' }
      },
      legend: {
        data: [
          { name: storeNameA, itemStyle: { color: '#3b82f6' } },
          { name: storeNameB, itemStyle: { color: '#ef4444' } }
        ],
        right: 10,
        top: 0,
        icon: 'circle',
        itemGap: 20
      },
      grid: {
        left: '2%',
        right: '2%',
        bottom: '5%',
        top: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dataA.map(item => item.time),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', marginTop: 10 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%', color: '#64748b' },
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
      },
      series: [
        {
          name: storeNameA,
          type: 'line',
          showSymbol: false,
          data: dataA.map(item => item.value),
          lineStyle: { width: 3, color: '#3b82f6' },
          itemStyle: { color: '#3b82f6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }
            ])
          },
          emphasis: { focus: 'series' }
        },
        {
          name: storeNameB,
          type: 'line',
          showSymbol: false,
          data: dataB.map(item => item.value),
          lineStyle: { width: 3, color: '#ef4444' },
          itemStyle: { color: '#ef4444' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(239, 68, 68, 0.2)' },
              { offset: 1, color: 'rgba(239, 68, 68, 0.0)' }
            ])
          },
          emphasis: { focus: 'series' }
        }
      ]
    };

    penetrationChartInstance.current.setOption(option);
  }, [storeA, storeB, chartData.penetration]);

  // Chart 3: Conversion Rate (Smooth Area Line)
  useEffect(() => {
    if (!conversionChartRef.current) return;

    if (!conversionChartInstance.current) {
      conversionChartInstance.current = echarts.init(conversionChartRef.current);
    }

    const { A: dataA, B: dataB } = chartData.conversion;
    const storeNameA = MOCK_STORES.find(s => s.id === storeA)?.name || storeA;
    const storeNameB = MOCK_STORES.find(s => s.id === storeB)?.name || storeB;

    const option = {
      // title removed
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          let result = `<div class="font-bold mb-1 text-slate-700">${params[0].name}</div>`;
          params.forEach((item, index) => {
            const color = index === 0 ? '#3b82f6' : '#ef4444';
            result += `<div class="flex items-center justify-between gap-4 text-xs">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full" style="background-color: ${color}"></span>
                ${item.seriesName}
              </span>
              <span class="font-mono font-bold">${item.value}%</span>
            </div>`;
          });
          return result;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#f1f5f9',
        padding: 12,
        textStyle: { color: '#1e293b' }
      },
      legend: {
        data: [
          { name: storeNameA, itemStyle: { color: '#3b82f6' } },
          { name: storeNameB, itemStyle: { color: '#ef4444' } }
        ],
        right: 10,
        top: 0,
        icon: 'circle',
        itemGap: 20
      },
      grid: {
        left: '2%',
        right: '2%',
        bottom: '5%',
        top: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dataA.map(item => item.time),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', marginTop: 10 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%', color: '#64748b' },
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
      },
      series: [
        {
          name: storeNameA,
          type: 'line',
          showSymbol: false,
          data: dataA.map(item => item.value),
          lineStyle: { width: 3, color: '#3b82f6' },
          itemStyle: { color: '#3b82f6' },
          emphasis: { focus: 'series' }
        },
        {
          name: storeNameB,
          type: 'line',
          showSymbol: false,
          data: dataB.map(item => item.value),
          lineStyle: { width: 3, color: '#ef4444' },
          itemStyle: { color: '#ef4444' },
          emphasis: { focus: 'series' }
        }
      ]
    };

    conversionChartInstance.current.setOption(option);
  }, [storeA, storeB, chartData.conversion]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize();
      conversionChartInstance.current?.resize();
      penetrationChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleChartExport = (instanceRef, filename) => {
    if (!instanceRef.current) return;
    
    const base64 = instanceRef.current.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });

    const link = document.createElement('a');
    link.href = base64;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const storeNameA = MOCK_STORES.find(s => s.id === storeA)?.name || '门店A';
  const storeNameB = MOCK_STORES.find(s => s.id === storeB)?.name || '门店B';

  return (
    <div className="store-comparison-page h-screen w-screen bg-slate-50/50 flex flex-col overflow-hidden">
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm px-6 py-4 z-20 flex-none flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-slate-200/60">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <button 
            onClick={() => navigate('/')} 
            className="group p-2 -ml-2 rounded-full hover:bg-slate-100 transition-all duration-200"
            title="返回"
          >
            <svg className="text-slate-500 group-hover:text-slate-700 transition-colors" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">门店对比分析</h1>
            <p className="text-xs text-slate-500 hidden sm:block mt-0.5">多维度运营数据实时监控</p>
          </div>
        </div>

        {/* 筛选控制栏 */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
          {/* 门店选择 */}
          <div className="flex items-center gap-0 bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
            {/* Store A */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-blue-50">A</div>
              <select
                value={storeA}
                onChange={handleStoreAChange}
                className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none w-32 cursor-pointer py-1"
              >
                {MOCK_STORES.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>

            <div className="px-2">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[10px] font-black text-slate-400 italic">VS</span>
            </div>

            {/* Store B */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs ring-2 ring-red-50">B</div>
              <select
                value={storeB}
                onChange={handleStoreBChange}
                className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none w-32 cursor-pointer py-1"
              >
                {MOCK_STORES.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* 内容区域 */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          
          {/* 图表 1: DMA 资源消耗 */}
          <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col hover:shadow-[0_4px_20px_-3px_rgba(0,0,0,0.1)] transition-shadow duration-300">
            <div className="px-6 py-4 bg-slate-50/30 flex flex-col gap-4">
              {/* Header Top: Title & Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  <h3 className="text-base font-bold text-slate-800">DMA 资源消耗对比</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleChartExport(chartInstance, 'DMA资源消耗对比')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    导出图表
                  </button>
                  {/* DMA Local Filter */}
                  <div className="flex bg-slate-100 rounded-lg p-1 gap-1 overflow-x-auto max-w-full">
                    {COMPARISON_PERIODS.map(filter => (
                      <button
                        key={filter}
                        onClick={() => setDmaTimeFilter(filter)}
                        className={`px-2.5 py-1 text-[10px] sm:text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                          dmaTimeFilter === filter 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full relative p-4 h-[450px] shrink-0">
              <div ref={chartRef} className="absolute inset-0" />
            </div>

            {/* Growth Comparison Footer */}
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-3 bg-orange-400 rounded-full"></div>
                <h4 className="text-sm font-bold text-slate-700">环比增长趋势对比</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {COMPARISON_PERIODS.map(period => {
                  const stats = allDmaStats[period];
                  if (!stats) return null;
                  return (
                    <div key={period} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-2">
                      <div className="text-xs font-bold text-slate-500">{period}</div>
                      <div className="flex flex-col gap-1.5">
                        {/* Store A */}
                        <div className={`flex items-center justify-between px-2 py-1 rounded-md ${stats.winner === 'A' ? 'bg-orange-50 border border-orange-100' : 'bg-white'}`}>
                          <span className="text-[10px] text-slate-500 truncate max-w-[60px]" title={storeNameA}>{storeNameA}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-blue-600">{stats.storeA.value}</span>
                            {stats.winner === 'A' && <span className="text-[9px] font-bold text-orange-500 bg-orange-100 px-1 rounded">优</span>}
                          </div>
                        </div>
                        {/* Store B */}
                        <div className={`flex items-center justify-between px-2 py-1 rounded-md ${stats.winner === 'B' ? 'bg-orange-50 border border-orange-100' : 'bg-white'}`}>
                          <span className="text-[10px] text-slate-500 truncate max-w-[60px]" title={storeNameB}>{storeNameB}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-red-600">{stats.storeB.value}</span>
                            {stats.winner === 'B' && <span className="text-[9px] font-bold text-orange-500 bg-orange-100 px-1 rounded">优</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 图表 2: 渗透率对比 */}
          <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col hover:shadow-[0_4px_20px_-3px_rgba(0,0,0,0.1)] transition-shadow duration-300">
             <div className="px-6 py-4 bg-slate-50/30 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-base font-bold text-slate-800">渗透率趋势对比</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleChartExport(penetrationChartInstance, '渗透率趋势对比')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    导出图表
                  </button>
                  {/* Penetration Local Filter */}
                  <div className="flex bg-slate-100 rounded-lg p-1 gap-1 overflow-x-auto max-w-full">
                    {COMPARISON_PERIODS.map(filter => (
                      <button
                        key={filter}
                        onClick={() => setPenetrationTimeFilter(filter)}
                        className={`px-2.5 py-1 text-[10px] sm:text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                          penetrationTimeFilter === filter 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full relative p-4 h-[450px] shrink-0">
              <div ref={penetrationChartRef} className="absolute inset-0" />
            </div>

            {/* Growth Comparison Footer */}
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-3 bg-orange-400 rounded-full"></div>
                <h4 className="text-sm font-bold text-slate-700">环比增长趋势对比</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {COMPARISON_PERIODS.map(period => {
                  const stats = allPenetrationStats[period];
                  if (!stats) return null;
                  return (
                    <div key={period} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-2">
                      <div className="text-xs font-bold text-slate-500">{period}</div>
                      <div className="flex flex-col gap-1.5">
                        {/* Store A */}
                        <div className={`flex items-center justify-between px-2 py-1 rounded-md ${stats.winner === 'A' ? 'bg-orange-50 border border-orange-100' : 'bg-white'}`}>
                          <span className="text-[10px] text-slate-500 truncate max-w-[60px]" title={storeNameA}>{storeNameA}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-blue-600">{stats.storeA.value}</span>
                            {stats.winner === 'A' && <span className="text-[9px] font-bold text-orange-500 bg-orange-100 px-1 rounded">优</span>}
                          </div>
                        </div>
                        {/* Store B */}
                        <div className={`flex items-center justify-between px-2 py-1 rounded-md ${stats.winner === 'B' ? 'bg-orange-50 border border-orange-100' : 'bg-white'}`}>
                          <span className="text-[10px] text-slate-500 truncate max-w-[60px]" title={storeNameB}>{storeNameB}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-red-600">{stats.storeB.value}</span>
                            {stats.winner === 'B' && <span className="text-[9px] font-bold text-orange-500 bg-orange-100 px-1 rounded">优</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 图表 3: 转化率 */}
          <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col hover:shadow-[0_4px_20px_-3px_rgba(0,0,0,0.1)] transition-shadow duration-300">
             <div className="px-6 py-4 bg-slate-50/30 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                  <h3 className="text-base font-bold text-slate-800">全链路转化率趋势</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleChartExport(conversionChartInstance, '全链路转化率趋势')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    导出图表
                  </button>
                  {/* Conversion Local Filter */}
                  <div className="flex bg-slate-100 rounded-lg p-1 gap-1 overflow-x-auto max-w-full">
                    {COMPARISON_PERIODS.map(filter => (
                      <button
                        key={filter}
                        onClick={() => setConversionTimeFilter(filter)}
                        className={`px-2.5 py-1 text-[10px] sm:text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                          conversionTimeFilter === filter 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full relative p-4 h-[450px] shrink-0">
              <div ref={conversionChartRef} className="absolute inset-0" />
            </div>

            {/* Growth Comparison Footer */}
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-3 bg-orange-400 rounded-full"></div>
                <h4 className="text-sm font-bold text-slate-700">环比增长趋势对比</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {COMPARISON_PERIODS.map(period => {
                  const stats = allConversionStats[period];
                  if (!stats) return null;
                  return (
                    <div key={period} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-2">
                      <div className="text-xs font-bold text-slate-500">{period}</div>
                      <div className="flex flex-col gap-1.5">
                        {/* Store A */}
                        <div className={`flex items-center justify-between px-2 py-1 rounded-md ${stats.winner === 'A' ? 'bg-orange-50 border border-orange-100' : 'bg-white'}`}>
                          <span className="text-[10px] text-slate-500 truncate max-w-[60px]" title={storeNameA}>{storeNameA}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-blue-600">{stats.storeA.value}</span>
                            {stats.winner === 'A' && <span className="text-[9px] font-bold text-orange-500 bg-orange-100 px-1 rounded">优</span>}
                          </div>
                        </div>
                        {/* Store B */}
                        <div className={`flex items-center justify-between px-2 py-1 rounded-md ${stats.winner === 'B' ? 'bg-orange-50 border border-orange-100' : 'bg-white'}`}>
                          <span className="text-[10px] text-slate-500 truncate max-w-[60px]" title={storeNameB}>{storeNameB}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-red-600">{stats.storeB.value}</span>
                            {stats.winner === 'B' && <span className="text-[9px] font-bold text-orange-500 bg-orange-100 px-1 rounded">优</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
