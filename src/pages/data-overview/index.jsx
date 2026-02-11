  import React, { useMemo, useState, useRef } from 'react';
  import { useNavigate } from 'react-router-dom';
  import ReactECharts from 'echarts-for-react';
  import * as echarts from 'echarts';

  export default function DataOverview() {
    const navigate = useNavigate();
    const signingChartRef = useRef(null);
    const dmaChartRef = useRef(null);
    const penetrationChartRef = useRef(null);

  const branches = ['华北分公司', '华东分公司', '华南分公司', '华中分公司', '西南分公司'];

  const [signingPeriod, setSigningPeriod] = useState('month');
  const [dmaPeriod, setDmaPeriod] = useState('month');
  const [penetrationPeriod, setPenetrationPeriod] = useState('month');

  const getPeriodFrac = (p) => {
    if (p === 'day') return 1 / 365;
    if (p === 'week') return 7 / 365;
    if (p === 'month') return 30 / 365;
    return 1; // year
  };

  const signingData = useMemo(() => {
    const frac = getPeriodFrac(signingPeriod);
    const branchData = branches.map(branchName => {
      const multiplier = 0.5 + Math.random();
      const annualTotal = Math.floor(2000 * multiplier);
      const annualSigned = Math.floor(annualTotal * (0.6 + Math.random() * 0.3));
      const signed = Math.max(0, Math.floor(annualSigned * frac));
      const pending = annualTotal - signed;
      return {
        name: branchName,
        signing: { total: annualTotal, signed, pending, rate: ((signed / annualTotal) * 100).toFixed(1) }
      };
    });
    const summary = branchData.reduce((acc, curr) => ({
      signing: {
        total: acc.signing.total + curr.signing.total,
        signed: acc.signing.signed + curr.signing.signed,
        pending: acc.signing.pending + curr.signing.pending
      }
    }), { signing: { total: 0, signed: 0, pending: 0 } });
    summary.signing.rate = ((summary.signing.signed / summary.signing.total) * 100).toFixed(1);
    return { branches: branchData, summary };
  }, [signingPeriod]);

  const dmaData = useMemo(() => {
    const frac = getPeriodFrac(dmaPeriod);
    const branchData = branches.map(branchName => {
      const multiplier = 0.5 + Math.random();
      const annualSms = Math.floor(Math.random() * 5000 * multiplier) + 2000;
      const annualCall = Math.floor(Math.random() * 3000 * multiplier) + 1000;
      const sms = Math.max(0, Math.floor(annualSms * frac));
      const call = Math.max(0, Math.floor(annualCall * frac));
      return {
        name: branchName,
        dma: { sms, call, total: sms + call }
      };
    });
    const summary = branchData.reduce((acc, curr) => ({
      dma: {
        sms: acc.dma.sms + curr.dma.sms,
        call: acc.dma.call + curr.dma.call,
        total: acc.dma.total + curr.dma.total
      }
    }), { dma: { sms: 0, call: 0, total: 0 } });
    return { branches: branchData, summary };
  }, [dmaPeriod]);

  // Added Penetration Data
  const penetrationData = useMemo(() => {
    // 模拟不同时间周期的波动
    const multiplier = penetrationPeriod === 'day' ? 0.9 : 
                       penetrationPeriod === 'week' ? 0.95 : 
                       penetrationPeriod === 'month' ? 1 : 1.05;
                       
    const branchData = branches.map(branchName => {
      const baseRate = 0.3 + Math.random() * 0.5; // 30% - 80%
      const finalRate = Math.min(0.95, baseRate * multiplier);
      const total = 50000; // 假设区域总客户数
      const covered = Math.floor(total * finalRate);
      
      return {
        name: branchName,
        penetration: {
          rate: (finalRate * 100).toFixed(1),
          covered,
          total
        }
      };
    });

    const summary = branchData.reduce((acc, curr) => ({
      covered: acc.covered + curr.penetration.covered,
      total: acc.total + curr.penetration.total
    }), { covered: 0, total: 0 });
    
    summary.rate = ((summary.covered / summary.total) * 100).toFixed(1);

    return { branches: branchData, summary };
  }, [penetrationPeriod]);

  // 导出图表工具函数
  const handleChartExport = (chartRef, filename) => {
    if (!chartRef.current) return;
    
    const echartsInstance = chartRef.current.getEchartsInstance();
    const base64 = echartsInstance.getDataURL({
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

  const getSigningOption = () => {
    const names = signingData.branches.map(b => b.name);
    const rates = signingData.branches.map(b => Number(b.signing.rate));
    return {
      grid: { left: '3%', right: '4%', bottom: '8%', top: '10%', containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const idx = params[0]?.dataIndex ?? 0;
          const b = signingData.branches[idx];
          return `${b.name}<br/>完成率：${b.signing.rate}%<br/>已签约：${b.signing.signed.toLocaleString()}<br/>待签约：${b.signing.pending.toLocaleString()}`;
        }
      },
      xAxis: {
        type: 'value', min: 0, max: 100,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', formatter: '{value}%'}
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b' }
      },
      series: [
        {
          name: '完成率',
          type: 'bar',
          data: rates,
          barWidth: 18,
          showBackground: true,
          backgroundStyle: { color: '#f1f5f9', borderRadius: [0, 8, 8, 0] },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#059669' }
            ]),
            borderRadius: [0, 8, 8, 0]
          },
          label: { show: true, position: 'right', formatter: ({ value }) => `${value}%`, color: '#334155', fontSize: 12 }
        }
      ]
    };
  };


  // 2. 分公司 DMA 资源消耗对比图 (分组柱状图)
  const getDMAOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
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
        data: dmaData.branches.map(b => b.name),
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
          type: 'bar',
          data: dmaData.branches.map(b => b.dma.sms),
          itemStyle: { 
            color: '#3b82f6',
            borderRadius: [4, 4, 0, 0]
           },
          barMaxWidth: 30
        },
        {
          name: '外呼消耗',
          type: 'bar',
          data: dmaData.branches.map(b => b.dma.call),
          itemStyle: { 
            color: '#f59e0b',
            borderRadius: [4, 4, 0, 0]
          },
          barMaxWidth: 30
        }
      ]
    };
  };

  // Added Penetration Option
  const getPenetrationOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const idx = params[0]?.dataIndex ?? 0;
          const b = penetrationData.branches[idx];
          return `${b.name}<br/>渗透率：${b.penetration.rate}%<br/>覆盖数：${b.penetration.covered.toLocaleString()}`;
        }
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
        data: penetrationData.branches.map(b => b.name),
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b' }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', formatter: '{value}%' }
      },
      series: [
        {
          name: '渗透率',
          type: 'bar',
          data: penetrationData.branches.map(b => b.penetration.rate),
          barMaxWidth: 40,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#8b5cf6' },
              { offset: 1, color: '#6d28d9' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          label: { show: true, position: 'top', formatter: ({ value }) => `${value}%`, color: '#64748b', fontSize: 12 }
        }
      ]
    };
  };




  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
      {/* 头部导航 - 无筛选 */}
      <header className="bg-white shadow-sm px-6 py-4 z-20 flex-none">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">数据概览</h1>
            <p className="text-xs text-slate-500 mt-0.5">全国各分公司运营数据汇总</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
        
        {/* 第一部分：年费签约进度 (分公司对比) */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
              <h2 className="text-lg font-bold text-slate-800">各分公司年费签约进度</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleChartExport(signingChartRef, '签约进度图表')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                导出图表
              </button>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['day', 'week', 'month', 'year'].map(k => (
                  <button
                    key={k}
                    onClick={() => setSigningPeriod(k)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${signingPeriod === k ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {k === 'day' ? '日' : k === 'week' ? '周' : k === 'month' ? '月' : '年'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左侧：汇总核心指标 */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="text-blue-600 text-sm font-medium mb-2">签约目标总数</div>
                <div className="text-2xl font-black text-blue-700">{signingData.summary.signing.total.toLocaleString()}</div>
                <div className="text-xs text-blue-500/70 mt-2">全国总目标</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                <div className="text-emerald-600 text-sm font-medium mb-2">已完成签约</div>
                <div className="text-2xl font-black text-emerald-600">{signingData.summary.signing.signed.toLocaleString()}</div>
                <div className="text-xs text-emerald-500/70 mt-2">
                  总完成率 <span className="font-bold">{signingData.summary.signing.rate}%</span>
                </div>
              </div>
              <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                <div className="text-orange-600 text-sm font-medium mb-2">待签约数量</div>
                <div className="text-2xl font-black text-orange-700">{signingData.summary.signing.pending.toLocaleString()}</div>
                <div className="text-xs text-orange-500/70 mt-2">需继续努力</div>
              </div>
            </div>

            {/* 右侧：各分公司进度（图表） */}
            <div className="lg:col-span-3 h-[400px]">
              <ReactECharts ref={signingChartRef} option={getSigningOption()} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </section>

        {/* 第二部分：DMA资源消耗情况 (分公司对比) */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
              <h2 className="text-lg font-bold text-slate-800">各分公司 DMA 资源消耗</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleChartExport(dmaChartRef, 'DMA资源消耗图表')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                导出图表
              </button>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['day', 'week', 'month', 'year'].map(k => (
                  <button
                    key={k}
                    onClick={() => setDmaPeriod(k)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${dmaPeriod === k ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {k === 'day' ? '日' : k === 'week' ? '周' : k === 'month' ? '月' : '年'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左侧：消耗统计 */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex-1">
                <div className="text-blue-600 text-sm font-medium mb-2">短信消耗总量</div>
                <div className="text-2xl font-black text-blue-700">{dmaData.summary.dma.sms.toLocaleString()}</div>
                <div className="text-xs text-blue-500/70 mt-1">条</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 flex-1">
                <div className="text-amber-600 text-sm font-medium mb-2">外呼消耗总量</div>
                <div className="text-2xl font-black text-amber-700">{dmaData.summary.dma.call.toLocaleString()}</div>
                <div className="text-xs text-amber-500/70 mt-1">分钟</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="text-slate-500 text-sm font-medium mb-2">总资源消耗</div>
                <div className="text-2xl font-black text-slate-800">{dmaData.summary.dma.total.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-1">综合统计</div>
              </div>
            </div>

            {/* 右侧：分公司对比图 */}
            <div className="lg:col-span-3 h-[400px]">
              <ReactECharts ref={dmaChartRef} option={getDMAOption()} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </section>

        {/* 第三部分：区域渗透分析 (分公司对比) */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
              <h2 className="text-lg font-bold text-slate-800">各分公司区域渗透分析</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleChartExport(penetrationChartRef, '渗透率分析图表')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                导出图表
              </button>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['day', 'week', 'month', 'year'].map(k => (
                  <button
                    key={k}
                    onClick={() => setPenetrationPeriod(k)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${penetrationPeriod === k ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {k === 'day' ? '日' : k === 'week' ? '周' : k === 'month' ? '月' : '年'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左侧：渗透统计 */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-purple-50 rounded-xl p-5 border border-purple-100 flex-1">
                <div className="text-purple-600 text-sm font-medium mb-2">平均渗透率</div>
                <div className="text-2xl font-black text-purple-700">{penetrationData.summary.rate}%</div>
                <div className="text-xs text-purple-500/70 mt-1">全国平均水平</div>
              </div>
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex-1">
                <div className="text-indigo-600 text-sm font-medium mb-2">总覆盖客户数</div>
                <div className="text-2xl font-black text-indigo-700">{penetrationData.summary.covered.toLocaleString()}</div>
                <div className="text-xs text-indigo-500/70 mt-1">人</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="text-slate-500 text-sm font-medium mb-2">潜在客户总量</div>
                <div className="text-2xl font-black text-slate-800">{penetrationData.summary.total.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-1">全国汇总</div>
              </div>
            </div>

            {/* 右侧：分公司对比图 */}
            <div className="lg:col-span-3 h-[400px]">
              <ReactECharts ref={penetrationChartRef} option={getPenetrationOption()} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </section>




      </main>
    </div>
  );
}
