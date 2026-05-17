// ========== 合婚匹配引擎 ==========

// 检查地支是否在给定列表中（列表每项是 [a,b] 无序对）
function zhiInList(z, list) {
  for (var i = 0; i < list.length; i++) {
    if (list[i][0] === z || list[i][1] === z) return i;
  }
  return -1;
}

// 检查两地支是否在同一对中
function zhiPairInList(z1, z2, list) {
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    if (item.length === 3) {
      var found1 = -1, found2 = -1;
      for (var j = 0; j < 3; j++) {
        if (item[j] === z1) found1 = j;
        if (item[j] === z2) found2 = j;
      }
      if (found1 >= 0 && found2 >= 0) return i;
    } else if (item.length === 2) {
      if ((item[0] === z1 && item[1] === z2) || (item[0] === z2 && item[1] === z1)) return i;
    }
  }
  return -1;
}

// 天干五合检查
function ganInWuHe(g, list) {
  for (var i = 0; i < list.length; i++) {
    if (list[i][0] === g || list[i][1] === g) return i;
  }
  return -1;
}

function ganPairInWuHe(g1, g2) {
  for (var i = 0; i < GAN_WU_HE.length; i++) {
    if ((GAN_WU_HE[i][0] === g1 && GAN_WU_HE[i][1] === g2) ||
        (GAN_WU_HE[i][0] === g2 && GAN_WU_HE[i][1] === g1)) return true;
  }
  return false;
}

// 纳音五行提取
function nayinWuXing(nayinName) {
  var lastChar = nayinName.charAt(nayinName.length - 1);
  var wxMap = { '金': '金', '木': '木', '水': '水', '火': '火', '土': '土' };
  return wxMap[lastChar] || '';
}

// ===== 主入口 =====
function calcMarriageCompatibility(bazi1, bazi2, wx1, wx2) {
  // 四个维度
  var zodiacRes = analyzeZodiac(bazi1, bazi2);
  var dayRes = analyzeDay(bazi1, bazi2);
  var wxRes = analyzeWuxingComplement(wx1, wx2);
  var nayinRes = analyzeNayin(bazi1, bazi2);

  var totalScore = zodiacRes.score + dayRes.score + wxRes.score + nayinRes.score;
  var grade = scoreToGrade(totalScore);
  var summary = makeSummary(grade, zodiacRes, dayRes, wxRes);

  return {
    totalScore: totalScore,
    grade: grade,
    summary: summary,
    details: {
      zodiac: zodiacRes,
      day: dayRes,
      wuxing: wxRes,
      nayin: nayinRes,
    },
  };
}

function scoreToGrade(s) {
  if (s >= 90) return '上上';
  if (s >= 78) return '上等';
  if (s >= 62) return '中上';
  if (s >= 48) return '中等';
  return '一般';
}

function makeSummary(grade, zodiac, day, wx) {
  var map = {
    '上上': '两人八字高度契合，天生一对。生肖相合、日柱有情、五行互补，是天作之合。',
    '上等': '两人八字颇为相合，良缘佳配。彼此能在关键处成全对方，是值得珍惜的缘分。',
    '中上': '两人八字有多处和谐，也有个别小摩擦。以诚相待、互相包容，仍可相敬相爱，白头偕老。',
    '中等': '两人八字有合有克，需要更多磨合。缘分虽有波折，但只要用心经营，仍有可为。',
    '一般': '两人八字多处不合，相处起来需要更多的包容和智慧。珍惜眼前人，缘分在于经营而非命定。',
  };
  return map[grade] || map['中等'];
}

// ===== 1. 生肖/年柱（25分）=====
function analyzeZodiac(bazi1, bazi2) {
  var z1 = bazi1.year.zhi; // DI_ZHI object
  var z2 = bazi2.year.zhi;
  var g1 = bazi1.year.gan;
  var g2 = bazi2.year.gan;
  var score = 13; // 基础分
  var parts = [];

  var z1Idx = DI_ZHI.indexOf(z1);
  var z2Idx = DI_ZHI.indexOf(z2);
  var g1Idx = TIAN_GAN.indexOf(g1);
  var g2Idx = TIAN_GAN.indexOf(g2);

  // 地支关系
  if (zhiPairInList(z1Idx, z2Idx, ZHI_LIU_HE) >= 0) {
    score += 8; parts.push('生肖六合' + z1.zodiac + z2.zodiac + '，最宜婚配');
  } else if (zhiPairInList(z1Idx, z2Idx, ZHI_SAN_HE) >= 0) {
    score += 5; parts.push('生肖三合，互为助力');
  } else if (zhiPairInList(z1Idx, z2Idx, ZHI_LIU_CHONG) >= 0) {
    score -= 6; parts.push('生肖六冲（' + z1.zodiac + z2.zodiac + '相冲），易有矛盾');
  } else if (zhiPairInList(z1Idx, z2Idx, ZHI_LIU_HAI) >= 0) {
    score -= 4; parts.push('生肖六害，需多包容');
  } else {
    parts.push('生肖无特殊冲合');
  }

  // 天干关系
  if (ganPairInWuHe(g1Idx, g2Idx)) {
    score += 3; parts.push('年干五合，有缘有份');
  } else if (GAN_XIANG_KE_MAP[g1Idx] === g2Idx || GAN_XIANG_KE_MAP[g2Idx] === g1Idx) {
    score -= 2; parts.push('年干相克，需互相体谅');
  }

  // 纳音五行
  var n1wx = nayinWuXing(bazi1.year.nayin);
  var n2wx = nayinWuXing(bazi2.year.nayin);
  if (n1wx && n2wx && n1wx === n2wx) {
    score += 1; parts.push('年柱纳音五行相同');
  }

  score = Math.max(5, Math.min(25, score));
  return { score: score, text: parts.join('；'), animals: z1.zodiac + '与' + z2.zodiac };
}

// ===== 2. 日柱（30分）=====
function analyzeDay(bazi1, bazi2) {
  var dg1 = bazi1.day.gan;
  var dg2 = bazi2.day.gan;
  var dz1 = bazi1.day.zhi;
  var dz2 = bazi2.day.zhi;
  var score = 15;
  var parts = [];

  var g1Idx = TIAN_GAN.indexOf(dg1);
  var g2Idx = TIAN_GAN.indexOf(dg2);
  var z1Idx = DI_ZHI.indexOf(dz1);
  var z2Idx = DI_ZHI.indexOf(dz2);

  // 日干五合
  if (ganPairInWuHe(g1Idx, g2Idx)) {
    score += 10; parts.push('日干五合，心有灵犀，情感深厚');
  } else {
    // 日干生克 — 相生为佳
    var sheng = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
    if (sheng[dg1.wuxing] === dg2.wuxing) {
      score += 6; parts.push(dg1.name + '生' + dg2.name + '，你更愿付出');
    } else if (sheng[dg2.wuxing] === dg1.wuxing) {
      score += 6; parts.push(dg2.name + '生' + dg1.name + '，对方更愿付出');
    } else if (dg1.wuxing === dg2.wuxing) {
      score += 3; parts.push('日干五行相同，性格相近');
    } else {
      score += 0; parts.push('日干无合无生，感情需要更多培养');
    }
  }

  // 日支关系
  if (zhiPairInList(z1Idx, z2Idx, ZHI_LIU_HE) >= 0) {
    score += 5; parts.push('日支六合，生活融洽');
  } else if (zhiPairInList(z1Idx, z2Idx, ZHI_SAN_HE) >= 0) {
    score += 3; parts.push('日支三合，彼此支持');
  } else if (zhiPairInList(z1Idx, z2Idx, ZHI_LIU_CHONG) >= 0) {
    score -= 5; parts.push('日支相冲，日常易有小摩擦');
  } else if (zhiPairInList(z1Idx, z2Idx, ZHI_LIU_HAI) >= 0) {
    score -= 3; parts.push('日支相害，需注意相处细节');
  }

  score = Math.max(5, Math.min(30, score));
  return { score: score, text: parts.join('；') };
}

// ===== 3. 五行互补（25分）=====
function analyzeWuxingComplement(wx1, wx2) {
  var score = 12;
  var parts = [];
  var order = ['木', '火', '土', '金', '水'];
  var sheng = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };

  // 检查互补：一方缺的五行另一方是否充足
  var complement = 0;
  for (var i = 0; i < order.length; i++) {
    var wx = order[i];
    if (wx1.counts[wx] === 0 && wx2.counts[wx] >= 2) {
      complement++;
      parts.push('对方补你所缺的' + wx);
    }
    if (wx2.counts[wx] === 0 && wx1.counts[wx] >= 2) {
      complement++;
      parts.push('你补对方所缺的' + wx);
    }
  }

  if (complement >= 2) {
    score += 10;
  } else if (complement === 1) {
    score += 6;
  } else {
    score += 1;
    parts.push('五行互补不明显，各自独立');
  }

  // 日主关系
  var dm1 = wx1.dayMaster;
  var dm2 = wx2.dayMaster;
  if (dm1 && dm2) {
    if (sheng[dm1.wuxing] === dm2.wuxing) {
      score += 3; parts.push('日主五行' + dm1.wuxing + '生' + dm2.wuxing + '，你能滋养对方');
    } else if (sheng[dm2.wuxing] === dm1.wuxing) {
      score += 3; parts.push('日主五行' + dm2.wuxing + '生' + dm1.wuxing + '，对方能滋养你');
    }
  }

  score = Math.max(5, Math.min(25, score));
  return { score: score, text: parts.join('；'), complementCount: complement };
}

// ===== 4. 纳音（20分）=====
function analyzeNayin(bazi1, bazi2) {
  var score = 10;
  var parts = [];
  var pillars = ['year', 'month', 'day', 'hour'];
  var pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  var matchCount = 0;
  for (var i = 0; i < pillars.length; i++) {
    var p1 = bazi1[pillars[i]];
    var p2 = bazi2[pillars[i]];
    if (!p1 || !p2) continue;
    var wx1 = nayinWuXing(p1.nayin);
    var wx2 = nayinWuXing(p2.nayin);
    if (wx1 && wx2 && wx1 === wx2) {
      matchCount++;
      if (i === 0) parts.push(pillarNames[i] + '纳音同为' + wx1);
    }
  }

  if (matchCount >= 2) { score += 8; }
  else if (matchCount === 1) { score += 4; }
  else { score += 0; parts.push('各柱纳音五行各不相同'); }

  score = Math.max(4, Math.min(20, score));
  if (parts.length === 0) parts.push('纳音五行差异较大');
  return { score: score, text: parts.join('；'), matchCount: matchCount };
}
