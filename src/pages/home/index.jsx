import React, { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import areaData from './area.json';
import companyData from './company.json';

// Mock data generator
const generateMockData = (features) => {
  const data = {};
  let totalSignedTarget = 0;
  let totalSignedCurrent = 0;
  
  // Penetration is an average rate
  let totalPenetrationTargetAcc = 0;
  let totalPenetrationCurrentAcc = 0;

  features.forEach(feature => {
    const name = feature.properties.name;
    
    // Signed Quantity Data
    const signedTarget = Math.floor(Math.random() * 5000) + 1000;
    const signedCurrent = Math.floor(signedTarget * (Math.random() * 0.6 + 0.3)); // 30-90% completion
    const signedPending = signedTarget - signedCurrent;

    // Penetration Rate Data (0.0 to 1.0)
    const penetrationTarget = parseFloat((Math.random() * 0.2 + 0.7).toFixed(2)); // 0.7 - 0.9
    const penetrationCurrent = parseFloat((penetrationTarget * (Math.random() * 0.5 + 0.4)).toFixed(2)); // 40-90% of target

    data[name] = {
      signed: {
        target: signedTarget,
        current: signedCurrent,
        pending: signedPending
      },
      penetration: {
        target: penetrationTarget,
        current: penetrationCurrent
      }
    };

    totalSignedTarget += signedTarget;
    totalSignedCurrent += signedCurrent;
    totalPenetrationTargetAcc += penetrationTarget;
    totalPenetrationCurrentAcc += penetrationCurrent;
  });

  const count = features.length || 1;
  
  return {
    regionData: data,
    totals: {
      signed: {
        target: totalSignedTarget,
        current: totalSignedCurrent,
        pending: totalSignedTarget - totalSignedCurrent
      },
      penetration: {
        target: (totalPenetrationTargetAcc / count).toFixed(2),
        current: (totalPenetrationCurrentAcc / count).toFixed(2)
      }
    }
  };
};

const HomePage = () => {
  const [metricType, setMetricType] = useState('signed'); // 'signed' | 'penetration'
  const [mapType, setMapType] = useState('company'); // 'province' | 'company'
  const [chartOption, setChartOption] = useState({});
  
  // Memoize data to prevent regeneration on every render unless mapType changes
  const { currentGeoJson, mockData } = useMemo(() => {
    const geoJson = mapType === 'province' ? areaData : companyData;
    const { regionData, totals } = generateMockData(geoJson.features);
    return { currentGeoJson: geoJson, mockData: { regionData, totals } };
  }, [mapType]);

  // Register map when mapType changes
  useEffect(() => {
    echarts.registerMap(mapType, currentGeoJson);
  }, [mapType, currentGeoJson]);

  // Update chart option
  useEffect(() => {
    const dataForMap = currentGeoJson.features.map(feature => {
      const name = feature.properties.name;
      const displayName = feature.properties.area || name; // Use area name if available (for company.json)
      const data = mockData.regionData[name];
      let value;
      
      if (metricType === 'signed') {
        value = data?.signed.current || 0;
      } else {
        value = data?.penetration.current || 0;
      }

      return {
        name: name,
        displayName: displayName, 
        value: value,
        ...data // pass full data for tooltip
      };
    });

    // Calculate max value for visualMap
    const values = dataForMap.map(d => d.value);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    
    // Define color palettes - Apple "Refined & Layered" Aesthetic
    // Using sophisticated, slightly muted but premium tones for better hierarchy.
    
    // Signed: Deep Navy -> Ocean Blue -> Soft Azure
    const signedColors = ['rgba(255, 255, 255, 0.05)', '#2C5697', '#4A90E2']; 
    // Penetration: Deep Graphite -> Muted Gold -> Soft Sand (Less vivid, more elegant)
    const penetrationColors = ['rgba(255, 255, 255, 0.05)', '#8B7355', '#C5A059']; 
    
    // Create 3 ranges for "Low", "Medium", "High"
    const rangeStep = (maxVal - minVal) / 3;

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(28, 28, 30, 0.85)', // iOS Dark Mode System Background (Elevated)
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        padding: [12, 16],
        borderRadius: 16,
        textStyle: {
          color: '#F2F2F7', // System Gray 6
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        },
        extraCssText: 'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);',
        formatter: (params) => {
          if (!params.data) return params.name;
          const { displayName, signed, penetration } = params.data;
          
          if (metricType === 'signed') {
            return `
              <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #fff;">${displayName}</div>
              <div style="color: #8E8E93; font-size: 12px; margin-bottom: 4px;">签约进度</div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px;">
                <span style="font-size: 12px; color: #8E8E93;">目标</span>
                <span style="font-family: SF Pro Display, -apple-system; font-weight: 500; color: #fff;">${signed.target.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-size: 12px; color: #8E8E93;">当前</span>
                <span style="font-family: SF Pro Display, -apple-system; font-weight: 600; color: #007AFF;">${signed.current.toLocaleString()}</span>
              </div>
            `;
          } else {
            return `
              <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #fff;">${displayName}</div>
              <div style="color: #8E8E93; font-size: 12px; margin-bottom: 4px;">渗透率</div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px;">
                <span style="font-size: 12px; color: #8E8E93;">目标</span>
                <span style="font-family: SF Pro Display, -apple-system; font-weight: 500; color: #fff;">${(penetration.target * 100).toFixed(1)}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-size: 12px; color: #8E8E93;">当前</span>
                <span style="font-family: SF Pro Display, -apple-system; font-weight: 600; color: #FF9F0A;">${(penetration.current * 100).toFixed(1)}%</span>
              </div>
            `;
          }
        }
      },
      visualMap: {
        min: minVal,
        max: maxVal,
        left: 20, // Moved to left
        bottom: 20, 
        // right: '20', // Removed right alignment
        type: 'piecewise', 
        splitNumber: 3,
        pieces: [
          { min: minVal + 2 * rangeStep, label: 'High' },
          { min: minVal + rangeStep, max: minVal + 2 * rangeStep, label: 'Medium' },
          { max: minVal + rangeStep, label: 'Low' }
        ],
        inRange: {
          color: metricType === 'signed' ? signedColors : penetrationColors
        },
        textStyle: {
          color: '#8E8E93', // System Gray
          fontFamily: '-apple-system, sans-serif'
        },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 8,
        backgroundColor: 'rgba(28, 28, 30, 0.6)',
        padding: 16,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderRadius: 12 // Rounded corners for legend
      },
      geo: {
        map: mapType,
        roam: false, // Disable zoom/pan as requested
        scaleLimit: { min: 1, max: 5 },
        layoutCenter: ['50%', '50%'], 
        layoutSize: '125%', // Increased from 100% to 125% to eliminate whitespace
        label: {
          show: true,
          color: 'rgba(255, 255, 255, 0.8)', // Slightly brighter text
          fontSize: 11,
          fontFamily: '-apple-system, sans-serif'
        },
        itemStyle: {
          areaColor: '#1C1C1E', // System Gray 6 (Dark Background) - solid base for regions
          borderColor: 'rgba(255, 255, 255, 0.2)', // More defined stroke
          borderWidth: 0.8,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          shadowBlur: 20
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 13,
            fontWeight: '600'
          },
          itemStyle: {
            areaColor: metricType === 'signed' ? '#5856D6' : '#FF2D55', // Indigo / Pink
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 25,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      },
      graphic: [
        {
          type: 'group',
          right: 30,
          bottom: 30,
          width: 54,
          height: 72,
          bounding: 'raw',
          children: [
            // 边框
            {
              type: 'rect',
              z: 100,
              left: 0,
              top: 0,
              shape: {
                width: 54,
                height: 72
              },
              style: {
                fill: 'rgba(28, 28, 30, 0.6)',
                stroke: 'rgba(255, 255, 255, 0.2)',
                lineWidth: 1
              }
            },
            // 标题
            {
              type: 'text',
              z: 101,
              left: 'center',
              bottom: 4,
              style: {
                text: '南海诸岛',
                fill: '#8E8E93',
                font: '10px sans-serif'
              }
            },
            // 替代的简化示意图 (使用 text 暂时代替 path，避免 pathData 解析错误)
            {
              type: 'text',
              z: 101,
              left: 'center',
              top: 20,
              style: {
                text: ':::', 
                fill: '#8E8E93',
                font: '20px sans-serif'
              }
            }
          ]
        }
      ],
      series: [
        {
          name: metricType === 'signed' ? '签约数量' : '渗透率',
          type: 'map',
          geoIndex: 0,
          data: dataForMap,
          select: {
             disabled: true // Disable selection click behavior
          }
        }
      ]
    };

    setChartOption(option);
  }, [metricType, mapType, currentGeoJson, mockData]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-blue-500/30 flex">
      {/* Background Layer - Apple Style "Deep Space" Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black pointer-events-none z-0"></div>
      
      {/* Left Sidebar Panel */}
      <div className="w-[360px] h-full flex flex-col p-8 z-20 backdrop-blur-2xl bg-white/5 border-r border-white/10 relative shadow-[10px_0_30px_rgba(0,0,0,0.3)]">
        
        {/* Header - Moved to Sidebar */}
        <header className="mb-8 text-left relative">
          <h1 className="text-3xl font-medium tracking-tight text-white/95">
            数据驾驶舱
          </h1>
          {/* Subtitle / Breadcrumb style */}
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-400">
            <span>Home</span>
            <span className="text-gray-600">/</span>
            <span>Dashboard</span>
          </div>
        </header>

        {/* Sidebar Content (Stats & Controls) */}
        <div className="flex flex-col gap-6 flex-1 pb-10">
            
            {/* Map Controls - iOS Segmented Control Style */}
            <div className="p-1 rounded-lg flex bg-white/10 border border-white/5 w-full shadow-inner">
                  <button
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      mapType === 'company' 
                        ? 'bg-white/20 text-white shadow-sm' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                    onClick={() => setMapType('company')}
                  >
                    分公司展示
                  </button>
                  <button
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      mapType === 'province' 
                        ? 'bg-white/20 text-white shadow-sm' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                    onClick={() => setMapType('province')}
                  >
                    省市区展示
                  </button>
                </div>

            {/* Signed Quantity Stats */}
            <div 
              className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 border ${
                metricType === 'signed' 
                  ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_8px_32px_rgba(0,122,255,0.15)]' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
              onClick={() => setMetricType('signed')}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className={`text-lg font-medium ${metricType === 'signed' ? 'text-blue-400' : 'text-gray-200'}`}>总签约数量</h2>
                   <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Total Signed</p>
                </div>
                <div className={`w-2 h-2 rounded-full mt-2 ${metricType === 'signed' ? 'bg-blue-500 shadow-[0_0_8px_#007aff]' : 'bg-gray-600'}`}></div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                  <span className="text-sm text-gray-400">Target</span>
                  <span className="text-lg font-medium font-mono text-white/90">{mockData.totals.signed.target.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                  <span className="text-sm text-gray-400">Current</span>
                  <span className="text-2xl font-semibold font-mono text-white">{mockData.totals.signed.current.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm text-gray-400">Pending</span>
                  <span className="text-lg font-medium font-mono text-orange-400">{mockData.totals.signed.pending.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Penetration Stats */}
            <div 
              className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 border ${
                metricType === 'penetration' 
                  ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_8px_32px_rgba(255,159,10,0.15)]' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
              onClick={() => setMetricType('penetration')}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className={`text-lg font-medium ${metricType === 'penetration' ? 'text-amber-400' : 'text-gray-200'}`}>总渗透率</h2>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Penetration Rate</p>
                </div>
                <div className={`w-2 h-2 rounded-full mt-2 ${metricType === 'penetration' ? 'bg-amber-500 shadow-[0_0_8px_#ff9f0a]' : 'bg-gray-600'}`}></div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                  <span className="text-sm text-gray-400">Target</span>
                  <span className="text-lg font-medium font-mono text-white/90">{(mockData.totals.penetration.target * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm text-gray-400">Current</span>
                  <span className="text-2xl font-semibold font-mono text-amber-400">{(mockData.totals.penetration.current * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
        </div>
         
         {/* Footer info (Optional) - Removed */}
       </div>
 
       {/* Right Content Area - Map */}
      <div className="flex-1 relative z-10 h-full">
         <ReactECharts
           key={mapType}
           option={chartOption}
           style={{ height: '100%', width: '100%' }}
           opts={{ renderer: 'canvas' }}
         />
      </div>
    </div>
  );
};

export default HomePage;
