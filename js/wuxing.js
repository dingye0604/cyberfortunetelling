// ========== 五行分析 ==========

// 分析八字五行分布
// pillars: 柱数组（每柱含 { gan, zhi }，hour 可为 null）
function analyzeWuxing(pillars) {
  var counts = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  var totalN = 0;

  for (var i = 0; i < pillars.length; i++) {
    var p = pillars[i];
    if (!p) continue;
    counts[p.gan.wuxing]++;
    counts[p.zhi.wuxing]++;
    totalN += 2;
  }

  var dayMaster = pillars[2] ? pillars[2].gan : null;

  var maxCount = 0, minCount = 999;
  var maxWx = [], minWx = [];
  for (var wx in counts) {
    if (counts[wx] > maxCount) { maxCount = counts[wx]; maxWx = [wx]; }
    else if (counts[wx] === maxCount) maxWx.push(wx);
    if (counts[wx] < minCount) { minCount = counts[wx]; minWx = [wx]; }
    else if (counts[wx] === minCount) minWx.push(wx);
  }

  return {
    counts: counts,
    totalN: totalN,
    dayMaster: dayMaster,
    maxWx: maxWx,
    minWx: minWx,
  };
}
