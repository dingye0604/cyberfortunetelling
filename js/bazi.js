// ========== 八字排盘引擎 ==========

// 日柱基准表：每年 1 月 1 日的六十甲子索引（0=甲子）
// 已知 1900-01-01 = 甲戌 = 索引 10
(function() {
  var base = [];
  var current = 10;
  for (var y = 1900; y <= 2100; y++) {
    base[y - 1900] = current;
    current = (current + (isLeapYear(y) ? 366 : 365)) % 60;
  }
  globalThis.DAY_BASE = base;
})();

function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function dayOfYear(y, m, d) {
  var days = [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var offset = d;
  for (var i = 0; i < m - 1; i++) offset += days[i];
  return offset;
}

// 太阳月索引：日期落在哪个节气区间（0=寅月 ... 11=丑月）
function getSolarMonthIndex(month, day) {
  var inputVal = month < 2 ? (month + 12) * 100 + day : month * 100 + day;
  var jqVals = [];
  for (var i = 0; i < JIE_QI_APPROX.length; i++) {
    var j = JIE_QI_APPROX[i];
    jqVals[i] = j.month < 2 ? (j.month + 12) * 100 + j.day : j.month * 100 + j.day;
  }
  if (inputVal < jqVals[0]) return 11;
  for (var i = 11; i >= 0; i--) {
    if (inputVal >= jqVals[i]) return i;
  }
  return 0;
}

// 年柱
function calcYearPillar(year, month, day) {
  // 立春（2月4日）前用上年
  if (month < 2 || (month === 2 && day < 4)) year--;
  var ganzhiIndex = ((year - 4) % 60 + 60) % 60;
  return {
    ganIndex: ganzhiIndex % 10,
    zhiIndex: ganzhiIndex % 12,
    ganzhiIndex: ganzhiIndex,
  };
}

// 月柱（五虎遁）
function calcMonthPillar(month, day, yearGanIndex) {
  var solMonth = getSolarMonthIndex(month, day);
  // 五虎遁：年干→正月天干
  var startGan = (yearGanIndex * 2 + 2) % 10;
  var ganIndex = (startGan + solMonth) % 10;
  var zhiIndex = (2 + solMonth) % 12;
  return {
    ganIndex: ganIndex,
    zhiIndex: zhiIndex,
    ganzhiIndex: getGanzhiIndex(ganIndex, zhiIndex),
  };
}

// 日柱
function calcDayPillar(year, month, day) {
  var base = DAY_BASE[year - 1900];
  var offset = dayOfYear(year, month, day) - 1;
  var ganzhiIndex = (base + offset) % 60;
  return {
    ganIndex: ganzhiIndex % 10,
    zhiIndex: ganzhiIndex % 12,
    ganzhiIndex: ganzhiIndex,
  };
}

// 时柱（五鼠遁）
function calcHourPillar(shiChenIndex, dayGanIndex) {
  // 五鼠遁：日干→子时天干
  var ziGan = (dayGanIndex * 2) % 10;
  var ganIndex = (ziGan + shiChenIndex) % 10;
  var zhiIndex = shiChenIndex;
  return {
    ganIndex: ganIndex,
    zhiIndex: zhiIndex,
    ganzhiIndex: getGanzhiIndex(ganIndex, zhiIndex),
  };
}

// 根据天干地支索引求六十甲子索引（O(6) 闭式）
function getGanzhiIndex(ganIndex, zhiIndex) {
  for (var k = 0; k < 6; k++) {
    var p = ganIndex + 10 * k;
    if (p % 12 === zhiIndex) return p;
  }
  return -1;
}

// 八字推算入口
// year/month/day: 公历日期
// shiChenIndex: -1=未知, 0-11=子时到亥时
function calcBaZi(year, month, day, shiChenIndex) {
  var yearPillar = calcYearPillar(year, month, day);
  var monthPillar = calcMonthPillar(month, day, yearPillar.ganIndex);
  var dayPillar = calcDayPillar(year, month, day);
  var hourPillar = null;
  if (shiChenIndex >= 0) {
    hourPillar = calcHourPillar(shiChenIndex, dayPillar.ganIndex);
  }
  return {
    year: {
      gan: TIAN_GAN[yearPillar.ganIndex],
      zhi: DI_ZHI[yearPillar.zhiIndex],
      nayin: LIU_SHI_JIA_ZI[yearPillar.ganzhiIndex],
    },
    month: {
      gan: TIAN_GAN[monthPillar.ganIndex],
      zhi: DI_ZHI[monthPillar.zhiIndex],
      nayin: LIU_SHI_JIA_ZI[monthPillar.ganzhiIndex],
    },
    day: {
      gan: TIAN_GAN[dayPillar.ganIndex],
      zhi: DI_ZHI[dayPillar.zhiIndex],
      nayin: LIU_SHI_JIA_ZI[dayPillar.ganzhiIndex],
    },
    hour: hourPillar ? {
      gan: TIAN_GAN[hourPillar.ganIndex],
      zhi: DI_ZHI[hourPillar.zhiIndex],
      nayin: LIU_SHI_JIA_ZI[hourPillar.ganzhiIndex],
    } : null,
  };
}
