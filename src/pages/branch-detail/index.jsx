import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

export default function BranchDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const provinceName = searchParams.get('province') || '分公司';
  
  const [dmaStore, setDmaStore] = useState('全部门店');
  const [dmaTimeRange, setDmaTimeRange] = useState('month');
  const [penetrationTimeRange, setPenetrationTimeRange] = useState('month');
  const [penetrationStore, setPenetrationStore] = useState('全部门店');

  // 模拟门店列表
  const stores = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => `${provinceName}门店${i + 1}`);
  }, [provinceName]);

  const dmaStores = ['全部门店', ...stores];

  const dmaTimeRanges = [
    { label: '日', value: 'day' },
    { label: '周', value: 'week' },
    { label: '月', value: 'month' },
    { label: '年', value: 'year' }
  ];

  // 模拟数据生成
  const data = useMemo(() => {
    // 1. 年费签约进度数据 (汇总)
    const totalTarget = 2000;
    const signed = Math.floor(totalTarget * (0.6 + Math.random() * 0.2)); // 60-80% completion
    const pending = totalTarget - signed;
    const rate = ((signed / totalTarget) * 100).toFixed(1);

    // 2. DMA 资源消耗数据
    let dmaXAxis = [];
    let smsData = [];
    let callData = [];
    
    let count = 7;
    if (dmaTimeRange === 'day') {
      count = 12; // 每2小时
      dmaXAxis = Array.from({ length: count }, (_, i) => `${i * 2}:00`);
    } else if (dmaTimeRange === 'week') {
      count = 7;
      dmaXAxis = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    } else if (dmaTimeRange === 'month') {
      count = 10; // 每3天
      dmaXAxis = Array.from({ length: count }, (_, i) => `${i * 3 + 1}日`);
    } else {
      count = 12;
      dmaXAxis = Array.from({ length: count }, (_, i) => `${i + 1}月`);
    }

    const multiplier = dmaStore === '全部门店' ? 5 : 1;

    for (let i = 0; i < count; i++) {
      smsData.push(Math.floor(Math.random() * 500 * multiplier) + 100 * multiplier);
      callData.push(Math.floor(Math.random() * 300 * multiplier) + 50 * multiplier);
    }

    // 3. 渗透率分析数据
    let penXAxis = [];
    let penData = [];
    let penCount = 7;
    
    if (penetrationTimeRange === 'day') {
      penCount = 12;
      penXAxis = Array.from({ length: penCount }, (_, i) => `${i * 2}:00`);
    } else if (penetrationTimeRange === 'week') {
      penCount = 7;
      penXAxis = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    } else if (penetrationTimeRange === 'month') {
      penCount = 10;
      penXAxis = Array.from({ length: penCount }, (_, i) => `${i * 3 + 1}日`);
    } else {
      penCount = 12;
      penXAxis = Array.from({ length: penCount }, (_, i) => `${i + 1}月`);
    }

    const penMultiplier = penetrationStore === '全部门店' ? 1 : 1.2;

    for (let i = 0; i < penCount; i++) {
      // Generate random percentage between 20% and 90%
      let val = Math.floor(Math.random() * 70 * penMultiplier) + 20;
      if (val > 100) val = 95 + Math.random() * 5; // Cap at 100ish
      penData.push(Math.min(100, Math.floor(val)));
    }

    return {
      signing: {
        total: totalTarget,
        signed: signed,
        pending: pending,
        rate: rate
      },
      dma: {
        xAxis: dmaXAxis,
        sms: smsData,
        call: callData
      },
      penetration: {
        xAxis: penXAxis,
        data: penData
      }
    };
  }, [dmaStore, dmaTimeRange, penetrationTimeRange, penetrationStore]);

  // DMA 消耗趋势图 (折线图)
  const getDMAOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' }
      },
      legend: {
        top: 0,
        right: 0,
        data: ['短信消耗', '外呼消耗']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.dma.xAxis,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
        axisLabel: { color: '#64748b' }
      },
      series: [
        {
          name: '短信消耗',
          type: 'line',
          data: data.dma.sms,
          showSymbol: false,
          itemStyle: { color: '#8b5cf6' },
          lineStyle: { width: 3 },
        },
        {
          name: '外呼消耗',
          type: 'line',
          data: data.dma.call,
          showSymbol: false,
          itemStyle: { color: '#f59e0b' },
          lineStyle: { width: 3 },
        }
      ]
    };
  };

  // 渗透率分析图
  const getPenetrationOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: '{b0}<br/>{a0}: {c0}%',
        axisPointer: { type: 'line' }
      },
      legend: {
        top: 0,
        right: 0,
        data: ['渗透率']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.penetration.xAxis,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b' }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
        axisLabel: { 
          color: '#64748b',
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: '渗透率',
          type: 'line',
          data: data.penetration.data,
          showSymbol: true,
          itemStyle: { color: '#10b981' }, // Emerald-500
          lineStyle: { width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.0)' }
            ])
          }
        }
      ]
    };
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
      {/* 头部导航 - 无右侧筛选 */}
      <header className="bg-white shadow-sm px-6 py-4 z-20 flex-none">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{provinceName} - 运营详情</h1>
            <p className="text-xs text-slate-500 mt-0.5">查看该分公司下属门店的签约进度与资源消耗</p>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full">
        
        {/* 1. 年费签约进度 */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
            <h2 className="text-lg font-bold text-slate-800">年费签约进度</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <div className="text-blue-600 text-sm font-medium mb-2">签约目标总数</div>
              <div className="text-2xl font-black text-blue-700">{data.signing.total.toLocaleString()}</div>
              <div className="text-xs text-blue-500/70 mt-2">年度总目标</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
              <div className="text-emerald-600 text-sm font-medium mb-2">已完成签约</div>
              <div className="text-2xl font-black text-emerald-600">{data.signing.signed.toLocaleString()}</div>
              <div className="text-xs text-emerald-500/70 mt-2">
                完成率 <span className="font-bold">{data.signing.rate}%</span>
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
              <div className="text-orange-600 text-sm font-medium mb-2">待签约数量</div>
              <div className="text-2xl font-black text-orange-700">{data.signing.pending.toLocaleString()}</div>
              <div className="text-xs text-orange-500/70 mt-2">需继续努力</div>
            </div>

            <div className="col-span-1 md:col-span-3 mt-2">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-slate-600">总体进度</span>
                <span className="text-emerald-600">{data.signing.rate}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${data.signing.rate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. DMA 资源消耗情况 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
              DMA 资源消耗情况
            </h2>
            
            {/* DMA 专属筛选项 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 门店筛选 */}
              <div className="relative">
                <select
                  value={dmaStore}
                  onChange={(e) => setDmaStore(e.target.value)}
                  className="appearance-none bg-slate-100 border-none text-slate-700 text-sm font-medium rounded-lg py-2 pl-4 pr-10 focus:ring-2 focus:ring-purple-500 cursor-pointer outline-none"
                >
                  {dmaStores.map(store => (
                    <option key={store} value={store}>{store}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              {/* 时间筛选 */}
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {dmaTimeRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setDmaTimeRange(range.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      dmaTimeRange === range.value
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ReactECharts
              option={getDMAOption()}
              style={{ height: '100%', width: '100%' }}
              notMerge={true}
            />
          </div>
        </div>

        {/* 3. 渗透分析模块 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              渗透分析
            </h2>
            
            {/* 渗透分析 专属筛选项 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 门店筛选 */}
              <div className="relative">
                <select
                  value={penetrationStore}
                  onChange={(e) => setPenetrationStore(e.target.value)}
                  className="appearance-none bg-slate-100 border-none text-slate-700 text-sm font-medium rounded-lg py-2 pl-4 pr-10 focus:ring-2 focus:ring-emerald-500 cursor-pointer outline-none"
                >
                  {dmaStores.map(store => (
                    <option key={store} value={store}>{store}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              
              {/* 时间筛选 */}
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {dmaTimeRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setPenetrationTimeRange(range.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      penetrationTimeRange === range.value
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ReactECharts
              option={getPenetrationOption()}
              style={{ height: '100%', width: '100%' }}
              notMerge={true}
            />
          </div>
        </div>

      </main>
    </div>
  );
}
