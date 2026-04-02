# 数据驾驶舱（全 AI 开发）

这是一个基于 React + Vite 的数据驾驶舱/可视化看板 Demo，包含地图分布、数据概览、排行榜、门店对比等典型业务分析场景。

本项目为开源而整理，并且明确声明：**从需求拆解、信息架构、UI/UX 设计、交互细节到代码实现与页面视觉，均由 AI 全流程完成（人类仅提供目标与约束）**。你可以把它理解为“Prompt 驱动的前端可视化项目样板”。

## 功能概览

- 首页（地图）：支持在「省份/分公司」两种地图维度切换，展示签约/渗透率等指标，并提供悬浮提示
- 数据概览：分公司级别的签约完成率、DMA 资源消耗、渗透率等图表，并支持导出图表 PNG
- 排行榜：多维度筛选（维度/周期/指标等），展示 Top 排行，并支持导出图表 PNG
- 门店对比：通过弹窗选择门店后进入对比页，展示两家门店核心指标对比
- 右下角快捷菜单：快速跳转「门店对比 / 数据概览 / 排行榜」

## 路由一览

- `/`：首页（地图）
- `/data-overview`：数据概览
- `/rank`：排行榜
- `/branch-detail`：分公司详情
- `/store-comparison`：门店对比

## 技术栈

- React 18 + Vite
- React Router v6（路由管理）
- ECharts + echarts-for-react（图表与地图可视化）
- Tailwind CSS（快速 UI 组合）
- Less（局部样式补充）

## 本地运行

```bash
npm install
npm run dev
```

构建与预览：

```bash
npm run build
npm run preview
```

## 目录结构（约定）

```text
  src/
  pages/          页面
  components/     组件
  routes/         路由配置
```

## 数据说明

- 当前全部数据为前端 Mock（用于演示交互与可视化形态）
- 地图数据使用项目内置 geojson（示例：省份/分公司区域）


## 1、首页
<img width="2876" height="1504" alt="首页" src="https://github.com/user-attachments/assets/1af13f8b-32d5-4fc3-b357-ada6ec7908ef" />

## 2、排行榜
<img width="2878" height="1504" alt="排行榜" src="https://github.com/user-attachments/assets/ba272ebb-3bbf-4ffe-b275-7c9e92c4c511" />

## 3、分公司详情
<img width="2880" height="2796" alt="分公司详情" src="https://github.com/user-attachments/assets/329ae54b-6b8f-4bc9-aa23-e425e08bf75c" />

## 4、门店对比
<img width="2880" height="4541" alt="门店对比" src="https://github.com/user-attachments/assets/5b5eb11f-eba2-4ae4-b1e8-6e81c1e5a6d9" />

## 5、数据概览
<img width="2880" height="3428" alt="数据概览" src="https://github.com/user-attachments/assets/f99a0ba9-5c90-496c-9789-cf22135891e5" />
