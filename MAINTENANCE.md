# 周易命理查询 — 维护手册

## 项目简介

基于周易和中国传统文化的命理查询纯静态网站。4 个页面，无服务器、无数据库、无构建步骤。所有数据硬编码在 JS 中，浏览器端完成全部计算。GitHub Actions 自动部署到 GitHub Pages。

---

## 文件结构

```
/
├── index.html              # 首页（今日宜忌）
├── bazi.html               # 八字排盘
├── marriage.html           # 姻缘推算
├── knowledge.html          # 命理知识说明
├── css/style.css           # 全部样式
├── js/
│   ├── data.js             # 全部静态数据表
│   ├── bazi.js             # 四柱推算引擎
│   ├── wuxing.js           # 五行统计
│   ├── gua.js              # 梅花易数起卦
│   ├── matching.js         # 合婚匹配引擎
│   ├── daily.js            # 每日宜忌推算
│   ├── app.js              # 八字排盘页 UI
│   ├── marriage-app.js     # 姻缘页 UI
│   └── daily-app.js        # 宜忌页 UI
├── .github/workflows/deploy.yml
├── README.md
├── MAINTENANCE.md          # 本手册
└── .claude/CLAUDE.md       # 项目规范
```

### JS 加载顺序

各页面共享基础链 `data.js → bazi.js → wuxing.js`：

| 页面 | 额外加载 |
|------|----------|
| index.html（宜忌） | `daily.js` → `daily-app.js` |
| bazi.html（八字） | `gua.js` → `app.js` |
| marriage.html（姻缘） | `matching.js` → `marriage-app.js` |
| knowledge.html | 无 JS |

---

## 页面概览

| 页面 | 文件 | 功能 |
|------|------|------|
| 首页 | `index.html` | 默认显示今日干支、建除十二神、宜忌、纳音解读。可自定义日期 |
| 八字 | `bazi.html` | 输入生辰 → 四柱八字、五行分析、纳音、梅花易数卦象、命理解读 |
| 姻缘 | `marriage.html` | 两人生辰 → 五维度加权评分（生肖/日柱/五行/纳音）+ 综合等级 |
| 知识 | `knowledge.html` | 八字/五行/纳音/梅花易数/推算原理说明 |

---

## 核心模块说明

### js/data.js — 数据层

| 数据 | 变量名 | 长度 | 说明 |
|------|--------|------|------|
| 天干 | `TIAN_GAN` | 10 | `{name, wuxing, yinyang}` |
| 地支 | `DI_ZHI` | 12 | `{name, wuxing, yinyang, zodiac}` |
| 时辰 | `SHI_CHEN` | 12 | `{name, diZhiIndex, period}` |
| 六十甲子纳音 | `LIU_SHI_JIA_ZI` | 60 | `{name, reading}` —— 白话解读 |
| 节气近似 | `JIE_QI_APPROX` | 12 | `{month, day}` —— ±1天误差 |
| 八卦 | `BA_GUA` | 8 | `{name, symbol, binary}` |
| 六十四卦 | `GUA_64` | 64 | `{name, trigrams, meaning, reading}` |
| 八卦数字映射 | `GUA_NUM_MAP` | 8 | 梅花易数余数→八卦索引 |
| 地支六合 | `ZHI_LIU_HE` | 6 | 子丑/寅亥/卯戌/辰酉/巳申/午未 |
| 地支三合 | `ZHI_SAN_HE` | 4 | 申子辰/亥卯未/寅午戌/巳酉丑 |
| 地支六冲 | `ZHI_LIU_CHONG` | 6 | 子午/丑未/寅申/卯酉/辰戌/巳亥 |
| 地支六害 | `ZHI_LIU_HAI` | 6 | 子未/丑午/寅巳/卯辰/申亥/酉戌 |
| 天干五合 | `GAN_WU_HE` | 5 | 甲己/乙庚/丙辛/丁壬/戊癸 |
| 天干相克映射 | `GAN_XIANG_KE_MAP` | 10 | 索引→被克者索引 |
| 建除十二神 | `JIAN_CHU` | 12 | 建除满平定执破危成收开闭 |
| 建除宜忌 | `JIAN_CHU_YI_JI` | 12 | 每神 `{yi: [], ji: []}` |
| 五行颜色 | `WUXING_COLORS` | 5 | CSS类名和色值 |

### js/bazi.js — 四柱引擎

**日柱基准表 `DAY_BASE`**：
- 范围 1900–2100，IIFE 构建，201 个数字
- 1900-01-01 = 甲戌 = 索引 10
- 递推：`(base + daysInYear) % 60`，闰年 366 天

**核心函数**（详见源码）：
- `calcBaZi(year, month, day, shiChenIndex)` → 八字结果对象
- `calcYearPillar(year, month, day)` → 立春分界
- `calcMonthPillar(month, day, yearGanIndex)` → 五虎遁
- `calcDayPillar(year, month, day)` → 查表+偏移
- `calcHourPillar(shiChenIndex, dayGanIndex)` → 五鼠遁
- `getGanzhiIndex(ganIndex, zhiIndex)` → O(6) 闭式
- `getSolarMonthIndex(month, day)` → 节气区间

### js/wuxing.js — 五行分析

`analyzeWuxing(pillars)`：返回 `{counts, totalN, dayMaster, maxWx, minWx}`

### js/gua.js — 梅花易数

`calcGua(year, month, day, shiChenIndex)` → `{originalGua, changedGua, movingYao, upperTrigram, lowerTrigram, changedUpperTrigram, changedLowerTrigram}`

### js/matching.js — 合婚引擎

`calcMarriageCompatibility(bazi1, bazi2, wx1, wx2)` → `{totalScore, grade, summary, details: {zodiac, day, wuxing, nayin}}`

评分权重：生肖/年柱 25 + 日柱 30 + 五行 25 + 纳音 20 = 100 分。
等级：上上(90+) / 上等(78+) / 中上(62+) / 中等(48+) / 一般(<48)

### js/daily.js — 宜忌引擎

`calcDaily(date)` → `{date, ganzhi, fullGanzhi, jianChu, yi, ji, nayin, nayinReading, zodiac, yearPillar, dayGan, dayZhi}`

建除公式：`建除索引 = (日支索引 - 月支索引 + 12) % 12`

### 自定义下拉组件

三个 UI 文件（`app.js`, `marriage-app.js`, `daily-app.js`）各自内联了自定义下拉逻辑，模式相同：

1. 原生 `<select class="native-select">` 被 CSS 隐藏（`opacity:0; pointer-events:none; z-index:-1`）
2. `wrapSelect(selectEl)` 创建 `<div class="custom-select">` 包裹
3. `.custom-select-trigger`：毛玻璃样式显示当前值
4. `.custom-select-options`：绝对定位毛玻璃下拉列表，`z-index: 9999`
5. 点击 option → 设置原生 select → dispatch `change` 事件 → 关闭
6. 点击外部 → 关闭所有打开的下拉

### 日期选择器（宜忌页）

不使用系统日历，改为自定义年/月/日三列下拉面板：
- `.custom-date-trigger`：毛玻璃显示当前日期
- `.custom-date-panel`：展开显示年/月/日三个自定义 select
- 面板 `z-index: 9999`，`blur(10px)`，`rgba(255,255,252,0.97)`

---

## 前端设计决策

### 颜色体系
- 暖纸底色：`var(--paper)` = `#f5f0e8` —— body 和导航栏共用
- 墨色文字：`var(--ink)` = `#1a1714`
- 朱砂红：`var(--vermilion)` = `#c23a2b`（按钮、active 链接、动爻）

### 毛玻璃参数
| 元素 | blur | 背景透明度 | z-index |
|------|------|-----------|---------|
| `.form-section` | 24px | 0.45 | **100** |
| `.result-block` | 20px | 0.5 | 自动 |
| `.custom-select-trigger` | 12px | 0.45 | 自动 |
| `.custom-select-options` | 10px | 0.97 | **9999** |
| `.custom-date-panel` | 10px | 0.97 | **9999** |

**关键规则**：`backdrop-filter` 会创建独立层叠上下文。下拉面板的父容器（`.form-section`）必须设 `z-index: 100`，结果区（`.results-section`）设 `z-index: 0`，才能保证下拉不被后续 DOM 元素覆盖。

### R 角
- PC 端：表单 24px，结果 20px，按钮/下拉 16px
- 手机端（≤600px）：表单 32px，结果 26px，按钮/下拉 20px

---

## 部署

- 触发：`push` 到 `master`
- 工作流：`.github/workflows/deploy.yml`（`actions/deploy-pages`）
- Pages Settings：Source → **GitHub Actions**
- 地址：`https://dingye0604.github.io/cyberfortunetelling/`

---

## 本地预览

```bash
npx serve .
```

---

## 常见问题

**Q：日期面板被下方卡片遮挡？**
A：检查 `.form-section` 是否有 `position: relative; z-index: 100`，`.results-section` 是否有 `position: relative; z-index: 0`。`backdrop-filter` 创建独立层叠上下文，必须显式声明父子层级。

**Q：毛玻璃效果看不到？**
A：毛玻璃 = 半透明背景 + `backdrop-filter: blur()` + **背景有层次**。纯色背景无效。

**Q：出生在节气边界，排盘不准？**
A：固定节气日期 ±1 天误差，属静态网页技术限制。

**Q：时辰未知？**
A：选"未知"，时柱为 null，五行按 6 字统计，卦象区域隐藏。

**Q：日柱基准表范围？**
A：1900–2100 年。超出需扩展 `DAY_BASE` 和年份下拉框。

**Q：如何修改卦象/纳音解读？**
A：编辑 `data.js` 中 `GUA_64[].reading` 或 `LIU_SHI_JIA_ZI[].reading`。保持语气：启发性、非宿命论、贴近现代生活。

**Q：如何修改合婚评分权重？**
A：编辑 `matching.js` 中各 `analyze*` 函数的加减分值。

**Q：如何修改宜忌内容？**
A：编辑 `data.js` 中 `JIAN_CHU_YI_JI` 对象的 `yi` 和 `ji` 数组。

**Q：导航栏链接改坏了？**
A：全站导航统一为 `首页 | 排盘 | 姻缘 | 命理知识`，`index.html` 是首页（宜忌），`bazi.html` 是排盘页。

---

*最后更新：2026-05-18*
