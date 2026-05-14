# 周易命理查询 — 维护手册

## 项目简介

纯静态八字排盘网页，基于周易和中国传统文化。输入公历出生日期（年/月/日/时辰），输出四柱八字、五行分析、纳音、梅花易数卦象。

**技术约束**：无服务器、无数据库、无构建步骤。所有数据硬编码在 JS 中，浏览器端完成全部计算。

**部署**：GitHub Actions 自动部署到 GitHub Pages。

---

## 文件结构

```
/
├── index.html              # 首页（表单 + 结果展示）
├── knowledge.html          # 命理知识说明页
├── css/style.css           # 全部样式（毛玻璃、动画、响应式）
├── js/
│   ├── data.js             # 全部静态数据表
│   ├── bazi.js             # 四柱推算引擎
│   ├── wuxing.js           # 五行统计
│   ├── gua.js              # 梅花易数起卦
│   └── app.js              # UI 绑定、自定义下拉、渲染
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions 部署配置
├── README.md               # 项目简介
├── MAINTENANCE.md          # 本手册
└── .claude/CLAUDE.md       # 项目规范
```

JS 加载顺序（必须遵守依赖关系）：
```
data.js → bazi.js → wuxing.js → gua.js → app.js
```

---

## 核心模块说明

### js/data.js — 数据层

所有查询表集中于此，修改前务必核对数据来源。

| 数据 | 变量名 | 说明 |
|------|--------|------|
| 天干 | `TIAN_GAN` | 10条，含五行、阴阳属性 |
| 地支 | `DI_ZHI` | 12条，含五行、阴阳、生肖 |
| 时辰 | `SHI_CHEN` | 12条，含对应地支索引、时间段 |
| 六十甲子纳音 | `LIU_SHI_JIA_ZI` | **60条对象**，`{name, reading}`，索引即六十甲子位置 |
| 节气近似 | `JIE_QI_APPROX` | 12条月柱分界节气，固定日期（±1天误差） |
| 八卦 | `BA_GUA` | 8条，含名称、符号、3位二进制 |
| 六十四卦 | `GUA_64` | **64条对象**，`{name, trigrams, meaning, reading}` |
| 八卦数字映射 | `GUA_NUM_MAP` | 梅花易数余数→八卦索引映射 |
| 五行颜色 | `WUXING_COLORS` | 五行对应 CSS 类名和色值 |

**纳音与卦象的 `reading` 字段**：白话解读，面向普通用户。修改时注意保持语气一致——不做宿命论断言，而是给出生活化的建议和启发。

### js/bazi.js — 四柱引擎

**日柱基准表 `DAY_BASE`**：
- 范围 1900–2100，共 201 个数字
- 每个数字是该年 1 月 1 日的六十甲子索引（0=甲子）
- 已知 1900-01-01 = 甲戌 = 索引 10
- 递推公式：`当年天数 % 60`，闰年 366 天，平年 365 天

**年柱**：立春（2/4）前用上年，立春后用本年。`(year-4)%60` 得干支索引。

**月柱（五虎遁）**：
1. 根据日期确定太阳月索引（落在哪个节气区间）
2. 年干推算月干起始：`startGan = (年干*2+2)%10`
3. 月干 = `(startGan + 太阳月索引)%10`
4. 月支 = `(2 + 太阳月索引)%12`（寅=2）

**日柱**：`DAY_BASE[year-1900] + dayOfYear(year,month,day) - 1`，对 60 取模。

**时柱（五鼠遁）**：
- 子时天干 = `(日干*2)%10`
- 时干 = `(子时天干 + 时辰索引)%10`
- 时支 = 时辰索引

**六十甲子索引查找**：`getGanzhiIndex(gan, zhi)` 通过 `gan + 10*k` 递增（k=0..5），检查 `%12===zhi`，最多 6 次迭代。

### js/wuxing.js — 五行分析

`analyzeWuxing(pillars)`：遍历四柱（时柱可能为 null），统计 8 个字的五行分布，返回 `{counts, totalN, dayMaster, maxWx, minWx}`。

### js/gua.js — 梅花易数

**预计算**：`BA_GUA_BINARIES` 缓存八卦二进制值，避免每次重建数组。

**起卦**：
- 上卦 = `(年+月+日)%8`
- 下卦 = `(年+月+日+时数)%8`
- 动爻 = `(年+月+日+时数)%6`（余0为6）
- 变卦：翻转对应爻位（下卦动爻位 0-2，上卦动爻位 0-2）

### js/app.js — UI 层

**自定义下拉组件**：
- 原生 `<select>` 被 CSS 隐藏（`opacity: 0, pointer-events: none, z-index: -1`）
- `wrapSelect(selectEl)` 在每个原生 select 前插入 `.custom-select` 结构
- `.custom-select-trigger`：显示当前值，毛玻璃样式
- `.custom-select-options`：点击展开，绝对定位，毛玻璃列表
- 点击选项 → 设置原生 select 值 → 触发 `change` 事件 → 关闭列表
- 点击外部 → 关闭所有打开的下拉
- **日选择框**：`refreshDays()` 重建 options 后调用 `rebuildCustomSelect(dom.daySel)` 同步自定义 UI

**命理解读生成**：
- 分析日主强弱（统计生/克/泄力量）
- 根据日主五行和强弱匹配性格描述
- 根据五行缺失给出生活建议
- 展示四柱纳音及白话解读

---

## 前端设计决策

**毛玻璃效果**：
- `body` 使用分层渐变背景（radial + linear），为毛玻璃提供可见的层次
- `.form-section` 和 `.result-block`：`backdrop-filter: blur(20px)` + `rgba(255,255,255,0.5)` 半透明
- 自定义下拉 options：`blur(24px)` + `rgba(255,255,255,0.85)`
- **关键**：毛玻璃必须背景有层次才能看出来，纯色背景下无效

**颜色体系**：
- 暖纸底色：`#f3ece2 → #ede4d8 → #e8ddd0`
- 墨色文字：`#1a1714`
- 朱砂红点缀：`#c23a2b`（按钮、高亮、动爻）
- 金色辅助：`#b8943e`（纳音边框）

**动画**：
- 表单卡片入场：`cardFloat`（上浮 + 微缩放）
- 结果卡片：`revealCard` staggered 淡入（0.05s 间隔）
- 五行柱状图：`width` 过渡 0.6s
- 按钮滑光：hover 时 `::before` 伪元素从左扫到右

---

## 部署

GitHub Actions 工作流（`.github/workflows/deploy.yml`）：
- 触发条件：`push` 到 `master` 分支
- 使用 `actions/deploy-pages` 部署整个仓库根目录

Pages 设置：Settings → Pages → Source 选 **GitHub Actions**

部署后地址：`https://dingye0604.github.io/cyberfortunetelling/`

---

## 常见问题

**Q：出生在节气边界，排盘不准？**
A：本站使用固定节气日期（如立春=2/4），实际节气可能前后浮动 ±1 天。这是静态网页的技术限制，已在页脚标注。

**Q：时辰未知怎么办？**
A：选择"未知"，时柱显示"—"，五行按 6 字统计，卦象区域隐藏。

**Q：日柱基准表覆盖范围？**
A：1900–2100 年。超出此范围需要扩展 `DAY_BASE` 和年份下拉框。

**Q：如何修改卦象解读？**
A：编辑 `js/data.js` 中 `GUA_64` 数组的 `reading` 字段。保持语气：启发性、非宿命论、贴近现代生活。

**Q：如何修改纳音解读？**
A：编辑 `js/data.js` 中 `LIU_SHI_JIA_ZI` 数组的 `reading` 字段。注意每对干支共享同一条纳音（如 甲子、乙丑 都是海中金）。

**Q：自定义下拉为什么不工作？**
A：检查 `wrapSelect()` 是否在 `populateYears/ Days/ Hours` 之后调用。检查 `.form-row` 是否有 `position: relative`。检查 `.native-select` 是否被正确隐藏。

---

## 本地预览

```bash
npx serve .
```

打开浏览器访问 `http://localhost:3000`

---

*手册创建日期：2026-05-15*
