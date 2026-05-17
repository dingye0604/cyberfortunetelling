# 周易命理查询工具

基于周易和中国传统文化的命理查询静态网页。纯前端，无后端无数据库。

## 约束

- **纯静态**：没有服务器、数据库、后端 API、构建步骤
- **数据全员硬编码**：所有查询表（天干地支、纳音六十甲子、节气、六十四卦、建除宜忌、合婚匹配）直接写在 JS 中
- **GitHub Pages 部署**：推送到 GitHub 即可发布，GitHub Actions 自动部署

## 页面结构

| 页面 | 文件 | 功能 |
|------|------|------|
| 首页（今日宜忌） | `index.html` | 显示今日干支、建除十二神、宜忌、纳音 |
| 八字排盘 | `bazi.html` | 输入生辰，排四柱八字、五行、纳音、卦象、命理解读 |
| 姻缘推算 | `marriage.html` | 双人合婚，五维度加权评分 |
| 命理知识 | `knowledge.html` | 八字/五行/纳音/梅花易数/推算原理说明 |

## 目录结构

```
/
├── index.html          # 首页（今日宜忌）
├── bazi.html           # 八字排盘
├── marriage.html       # 姻缘推算
├── knowledge.html      # 命理知识说明
├── css/
│   └── style.css       # 全部样式（毛玻璃、动画、响应式、iOS R角）
├── js/
│   ├── data.js         # 全部静态数据：天干地支/纳音/节气/八卦/六十四卦/建除宜忌/合婚匹配
│   ├── bazi.js         # 八字排盘引擎：年柱(立春)/月柱(五虎遁)/日柱(查表)/时柱(五鼠遁)
│   ├── wuxing.js       # 五行分析：八字五行计数/强弱判断
│   ├── gua.js          # 梅花易数起卦：数字起卦/变卦计算
│   ├── matching.js     # 合婚匹配引擎：五维度加权评分
│   ├── daily.js        # 每日宜忌推算：建除十二神/宜忌
│   ├── app.js          # 八字排盘 UI：表单/自定义下拉/渲染
│   ├── marriage-app.js # 姻缘页 UI：双人表单/自定义下拉/渲染
│   └── daily-app.js    # 宜忌页 UI：自定义日期选择器/渲染
├── MAINTENANCE.md      # 维护手册
└── README.md
```

JS 加载顺序必须遵守依赖关系。各页面共用 `data.js → bazi.js → wuxing.js` 基础链：

- `index.html`: data → bazi → wuxing → daily → daily-app
- `bazi.html`: data → bazi → wuxing → gua → app
- `marriage.html`: data → bazi → wuxing → matching → marriage-app

## 前端设计规范

### 颜色体系
- 暖纸底色：`var(--paper)` = `#f5f0e8`，body 和导航栏共用，PC/移动端一致
- 墨色文字：`var(--ink)` = `#1a1714`
- 朱砂红：`var(--vermilion)` = `#c23a2b`（按钮、active 链接、动爻）

### 毛玻璃效果
- **必要性**：`backdrop-filter: blur()` 在纯色背景上看不出效果，body/父容器必须有层次
- `.form-section`：`blur(24px)` + `rgba(255,255,255,0.45)`，`z-index: 100`
- `.custom-select-trigger`：`blur(12px)` + `rgba(255,255,255,0.45)`
- 下拉面板（`.custom-select-options` / `.custom-date-panel`）：`blur(10px)` + `rgba(255,255,252,0.97)`，`z-index: 9999`
- 结果卡片（`.result-block`）：`blur(20px)` + `rgba(255,255,255,0.5)`

### 自定义下拉组件
- 原生 `<select>` 被 CSS 隐藏（`opacity:0; pointer-events:none; z-index:-1`），保留用于表单数据
- `wrapSelect(selectEl)` 为每个原生 select 创建毛玻璃自定义 UI
- 日期选择器：自定义年/月/日三列下拉面板，不使用系统日历

### R 角规范
- PC 端：表单卡片 24px，结果卡片 20px，下拉/按钮 16px
- 手机端（≤600px）：表单卡片 32px，结果卡片 26px，下拉/按钮 20px（iOS 连续曲率风格）

### 层叠上下文
- `.form-section`：`position: relative; z-index: 100`（表单卡片及其下拉面板浮于结果区之上）
- `.results-section`：`position: relative; z-index: 0`（明确低于表单区）
- 所有下拉面板 `z-index: 9999`（在 form-section 层叠上下文内）

## 工程纪律

- **改完必验**：用 `npx serve .` 本地预览确认功能正常
- **数据先行**：所有推算规则必须配原始参考数据，不写空对空的逻辑
- **日柱查表精度**：日柱用基准表（每年 1 月 1 日的日干支）+ 60 天周期推算，覆盖 1900-2100 年
- **节气近似**：节气边界用固定日期近似表（偏差 ±1 天可接受）
- **提交前格式化**：HTML/CSS/JS 保持整洁，无调试日志
- **层级问题**：`backdrop-filter` 会创建独立层叠上下文，下拉面板必须给父容器设置显式 `z-index` 确保不被后续 DOM 元素覆盖

## 本地预览

```bash
npx serve .
```

## 部署

推送到 GitHub 即可，GitHub Pages 设置为 `main` 分支 `/` 目录，使用 GitHub Actions 自动部署。

## 维护

详见 `MAINTENANCE.md`，包含各模块算法详解、设计决策、常见问题。
