// ========== 每日宜忌推算 ==========

function calcDaily(date) {
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  var d = date.getDate();
  var h = date.getHours();
  var shiChen = Math.floor(((h + 1) % 24) / 2); // 0-11

  var bazi = calcBaZi(y, m, d, shiChen);

  // 月地支索引
  var solarMonth = getSolarMonthIndex(m, d);
  var monthZhiIdx = (2 + solarMonth) % 12;

  // 日地支索引
  var dayZhiIdx = DI_ZHI.indexOf(bazi.day.zhi);

  // 建除
  var jcIdx = (dayZhiIdx - monthZhiIdx + 12) % 12;
  var jcName = JIAN_CHU[jcIdx];
  var yi = JIAN_CHU_YI_JI[jcIdx].yi;
  var ji = JIAN_CHU_YI_JI[jcIdx].ji;

  // 日纳音
  var nayin = bazi.day.nayin;
  var nayinReading = bazi.day.nayinReading;

  // 生肖
  var zodiac = bazi.year.zhi.zodiac;

  // 日干支
  var ganzhi = bazi.day.gan.name + bazi.day.zhi.name;

  // 完整干支
  var fullGanzhi = bazi.year.gan.name + bazi.year.zhi.name + '年 '
    + bazi.month.gan.name + bazi.month.zhi.name + '月 '
    + bazi.day.gan.name + bazi.day.zhi.name + '日 '
    + (bazi.hour ? bazi.hour.gan.name + bazi.hour.zhi.name + '时' : '');

  return {
    date: { year: y, month: m, day: d, hour: h },
    ganzhi: ganzhi,
    fullGanzhi: fullGanzhi,
    jianChu: { name: jcName, index: jcIdx },
    yi: yi,
    ji: ji,
    nayin: nayin,
    nayinReading: nayinReading,
    zodiac: zodiac,
    yearPillar: bazi.year,
    dayGan: bazi.day.gan,
    dayZhi: bazi.day.zhi,
  };
}
