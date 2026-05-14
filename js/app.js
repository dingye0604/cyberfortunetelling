// ========== UI 绑定 ==========

(function() {
  'use strict';

  var dom = {};

  function init() {
    dom.form = document.getElementById('baziForm');
    dom.yearSel = document.getElementById('year');
    dom.monthSel = document.getElementById('month');
    dom.daySel = document.getElementById('day');
    dom.hourSel = document.getElementById('hour');
    dom.results = document.getElementById('results');
    dom.pillars = document.getElementById('pillars');
    dom.reading = document.getElementById('reading');
    dom.wuxing = document.getElementById('wuxing');
    dom.nayin = document.getElementById('nayin');
    dom.zodiac = document.getElementById('zodiac');
    dom.gua = document.getElementById('gua');
    dom.guaBlock = document.getElementById('guaBlock');

    populateYears();
    populateDays();
    populateHours();
    setDefaultDate();

    dom.yearSel.addEventListener('change', refreshDays);
    dom.monthSel.addEventListener('change', refreshDays);
    dom.form.addEventListener('submit', onSubmit);
  }

  function populateYears() {
    for (var y = 1900; y <= 2100; y++) {
      var opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y + ' 年';
      dom.yearSel.appendChild(opt);
    }
  }

  function populateDays() {
    refreshDays();
  }

  function refreshDays() {
    var y = parseInt(dom.yearSel.value);
    var m = parseInt(dom.monthSel.value);
    var maxDay = daysInMonth(y, m);
    var currentVal = dom.daySel.value;

    dom.daySel.innerHTML = '';
    for (var d = 1; d <= maxDay; d++) {
      var opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d + ' 日';
      dom.daySel.appendChild(opt);
    }
    if (currentVal && parseInt(currentVal) <= maxDay) {
      dom.daySel.value = currentVal;
    }
  }

  function daysInMonth(y, m) {
    return new Date(y, m, 0).getDate();
  }

  function populateHours() {
    var opt = document.createElement('option');
    opt.value = '-1';
    opt.textContent = '未知';
    dom.hourSel.appendChild(opt);

    for (var i = 0; i < SHI_CHEN.length; i++) {
      var sc = SHI_CHEN[i];
      opt = document.createElement('option');
      opt.value = i;
      opt.textContent = sc.name + '（' + sc.period + '）';
      dom.hourSel.appendChild(opt);
    }
  }

  function setDefaultDate() {
    var now = new Date();
    dom.yearSel.value = Math.min(now.getFullYear(), 2100);
    dom.monthSel.value = now.getMonth() + 1;
    refreshDays();
    dom.daySel.value = Math.min(now.getDate(), daysInMonth(now.getFullYear(), now.getMonth() + 1));
  }

  function onSubmit(e) {
    e.preventDefault();

    var year = parseInt(dom.yearSel.value);
    var month = parseInt(dom.monthSel.value);
    var day = parseInt(dom.daySel.value);
    var hour = parseInt(dom.hourSel.value);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return;

    var bazi = calcBaZi(year, month, day, hour);
    var pillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
    var wuxing = analyzeWuxing(pillars);
    var gua = calcGua(year, month, day, hour);

    renderAll(bazi, wuxing, gua);
    dom.results.classList.remove('hidden');
    dom.results.scrollIntoView({ behavior: 'smooth' });
  }

  function wuxingClass(wx) { return WUXING_COLORS[wx] ? WUXING_COLORS[wx].css : ''; }
  function barClass(wx) { return WUXING_COLORS[wx] ? WUXING_COLORS[wx].bar : ''; }
  function yaoText(n) { return ['', '初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][n] || n + '爻'; }

  function renderAll(bazi, wuxing, gua) {
    renderPillars(bazi);
    renderReading(bazi, wuxing);
    renderWuxing(wuxing);
    renderNayin(bazi);
    renderZodiac(bazi);
    renderGua(gua);
  }

  // -------- 八字 --------
  function renderPillars(bazi) {
    var labels = ['年柱', '月柱', '日柱', '时柱'];
    var items = [bazi.year, bazi.month, bazi.day, bazi.hour];
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      html += '<div class="pillar-card">';
      html += '<div class="pillar-label">' + labels[i] + '</div>';
      if (item) {
        html += '<div class="pillar-gan ' + wuxingClass(item.gan.wuxing) + '">' + item.gan.name + '</div>';
        html += '<div class="pillar-zhi ' + wuxingClass(item.zhi.wuxing) + '">' + item.zhi.name + '</div>';
      } else {
        html += '<div class="pillar-hour-unknown">—</div>';
      }
      html += '</div>';
    }
    dom.pillars.innerHTML = html;
  }

  // -------- 命理解读 --------
  function renderReading(bazi, wx) {
    var dayMaster = bazi.day.gan;
    var dmElement = dayMaster.wuxing;

    // 计算支持/消耗力量
    var supporting = 0, draining = 0, same = 0;
    var pillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
    for (var i = 0; i < pillars.length; i++) {
      var p = pillars[i];
      if (!p) continue;
      var ganWx = p.gan.wuxing;
      var zhiWx = p.zhi.wuxing;
      var r1 = elementRelation(ganWx, dmElement);
      var r2 = elementRelation(zhiWx, dmElement);
      if (r1 === '生') supporting++; else if (r1 === '克' || r1 === '泄') draining++; else same++;
      if (r2 === '生') supporting++; else if (r2 === '克' || r2 === '泄') draining++; else same++;
    }

    var strength = supporting >= draining ? '偏旺' : '偏弱';
    var html = '<div class="reading-content">';

    // 日主分析
    html += '<p class="reading-lead">日主为 <strong class="' + wuxingClass(dmElement) + '">' + dayMaster.name + dmElement + '</strong>，命格' + strength + '。</p>';

    // 性格简述
    html += '<p>' + getPersonality(dmElement, strength) + '</p>';

    // 五行分析
    html += '<p>八字中';
    if (wx.maxWx.length > 0) html += '<strong>' + wx.maxWx.join('、') + '</strong>最旺';
    if (wx.minWx[0] !== wx.maxWx[0]) html += '，<strong>' + wx.minWx.join('、') + '</strong>最弱';
    html += '。</p>';

    // 建议
    html += '<p>' + getAdvice(dmElement, strength, wx) + '</p>';

    // 纳音总论
    var nayinItems = [bazi.year, bazi.month, bazi.day];
    if (bazi.hour) nayinItems.push(bazi.hour);
    html += '<div class="reading-nayin">';
    for (var i = 0; i < nayinItems.length; i++) {
      var p = nayinItems[i];
      html += '<div class="reading-nayin-item">';
      html += '<span class="reading-nayin-name">' + ['年','月','日','时'][i] + '柱 ' + p.nayin + '</span>';
      html += '<span class="reading-nayin-text">' + p.nayinReading + '</span>';
      html += '</div>';
    }
    html += '</div>';

    html += '</div>';
    dom.reading.innerHTML = html;
  }

  // 五行生克关系
  function elementRelation(from, to) {
    if (from === to) return '同';
    var sheng = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
    var ke = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
    if (sheng[from] === to) return '生';
    if (ke[from] === to) return '克';
    // 泄：to生from，即from泄to
    if (sheng[to] === from) return '泄';
    return '同';
  }

  function getPersonality(element, strength) {
    var map = {
      '木': {
        '偏旺': '木旺则仁，性格温厚善良，有包容心和领导力。但过旺则容易固执己见、优柔寡断。',
        '偏弱': '木弱需水滋养，性格温和谦逊，善于倾听。建议多亲近自然，培养自信和主见。'
      },
      '火': {
        '偏旺': '火旺则礼，性格热情开朗，善于表达。但过旺则容易急躁冲动，需防情绪失控。',
        '偏弱': '火弱需木生助，性格内敛安静，思虑周全。建议多参与社交，敢于表达自己的想法。'
      },
      '土': {
        '偏旺': '土旺则信，性格稳重踏实，值得信赖。但过旺则容易固执保守，缺乏变通。',
        '偏弱': '土弱需火生助，性格灵活多变，适应力强。建议培养定力，做事要有始有终。'
      },
      '金': {
        '偏旺': '金旺则义，性格刚毅果断，讲义气。但过旺则容易冷酷严苛，缺乏温情。',
        '偏弱': '金弱需土生助，性格温和圆融，善于协调。建议培养决断力，该出手时要果断。'
      },
      '水': {
        '偏旺': '水旺则智，性格聪明灵活，善于变通。但过旺则容易多变不定，缺乏定性。',
        '偏弱': '水弱需金生助，性格踏实稳重，做事认真。建议多学习新知识，开阔眼界。'
      },
    };
    return (map[element] && map[element][strength]) || '';
  }

  function getAdvice(element, strength, wx) {
    var advices = {
      '木': '木主仁，宜从事教育、文化、环保、医疗等需要仁心和耐心的行业。',
      '火': '火主礼，宜从事传媒、演艺、餐饮、能源等需要热情和表达力的行业。',
      '土': '土主信，宜从事房地产、农业、金融、管理等需要稳重和诚信的行业。',
      '金': '金主义，宜从事金融、法律、机械、珠宝等需要决断力和精确度的行业。',
      '水': '水主智，宜从事贸易、物流、旅游、咨询等需要灵活和智慧的行业。',
    };
    var base = advices[element] || '';

    // 根据五行缺失补充建议
    var missing = [];
    for (var k in wx.counts) {
      if (wx.counts[k] === 0) missing.push(k);
    }
    if (missing.length > 0) {
      base += ' 五行缺' + missing.join('、') + '，建议在生活中多接触相关元素——';
      var elementTips = {
        '木': '多亲近绿植、木质家具，穿绿色衣物。',
        '火': '多晒太阳、使用暖光灯，穿红色衣物。',
        '土': '多接触大地、陶瓷器皿，穿黄色衣物。',
        '金': '多佩戴金属饰品、使用金属器具，穿白色衣物。',
        '水': '多靠近水源、养鱼，穿黑色或蓝色衣物。',
      };
      for (var i = 0; i < missing.length; i++) {
        base += elementTips[missing[i]];
      }
    }
    return base;
  }

  // -------- 五行 --------
  function renderWuxing(wx) {
    var order = ['木', '火', '土', '金', '水'];
    var maxVal = 1;
    for (var k in wx.counts) { if (wx.counts[k] > maxVal) maxVal = wx.counts[k]; }

    var html = '<div class="wuxing-chart">';
    for (var i = 0; i < order.length; i++) {
      var name = order[i];
      var cnt = wx.counts[name];
      var pct = Math.round(cnt / maxVal * 100);
      html += '<div class="wuxing-row">';
      html += '<div class="label ' + wuxingClass(name) + '">' + name + '</div>';
      html += '<div class="bar-bg"><div class="bar-fill ' + barClass(name) + '" style="width:' + pct + '%"></div></div>';
      html += '<div class="count">' + cnt + '</div>';
      html += '</div>';
    }
    html += '</div>';

    if (wx.dayMaster) {
      html += '<div class="wuxing-summary">';
      html += '日主 <strong class="' + wuxingClass(wx.dayMaster.wuxing) + '">' + wx.dayMaster.name + wx.dayMaster.wuxing + '</strong>';
      html += '，偏旺 <strong>' + wx.maxWx.join('、') + '</strong>';
      if (wx.minWx[0] !== wx.maxWx[0]) html += '，偏弱 <strong>' + wx.minWx.join('、') + '</strong>';
      html += '</div>';
    }
    dom.wuxing.innerHTML = html;
  }

  // -------- 纳音 --------
  function renderNayin(bazi) {
    var items = [
      ['年柱', bazi.year.nayin],
      ['月柱', bazi.month.nayin],
      ['日柱', bazi.day.nayin],
      ['时柱', bazi.hour ? bazi.hour.nayin : '—'],
    ];
    var html = '<div class="nayin-list">';
    for (var i = 0; i < items.length; i++) {
      html += '<div class="nayin-item"><span class="pillar-tag">' + items[i][0] + '</span><span class="value">' + items[i][1] + '</span></div>';
    }
    html += '</div>';
    dom.nayin.innerHTML = html;
  }

  // -------- 生肖 --------
  function renderZodiac(bazi) {
    dom.zodiac.innerHTML = '<div class="zodiac-display">属' + bazi.year.zhi.zodiac + '</div>';
  }

  // -------- 卦象 --------
  function renderGua(gua) {
    if (!gua) {
      dom.guaBlock.classList.add('hidden');
      return;
    }
    dom.guaBlock.classList.remove('hidden');

    var html = '';

    html += '<div class="gua-header">';
    html += '<div class="gua-main-symbol">' + gua.upperTrigram.symbol + gua.lowerTrigram.symbol + '</div>';
    html += '<div class="gua-main-name">' + gua.originalGua.name + '</div>';
    html += '</div>';

    html += '<div class="gua-reading">' + gua.originalGua.reading + '</div>';

    if (gua.changedGua.name !== gua.originalGua.name) {
      html += '<div class="gua-derived">';
      html += '<div class="gua-derived-symbol">' + gua.changedUpperTrigram.symbol + gua.changedLowerTrigram.symbol + '</div>';
      html += '<div class="gua-derived-name">' + gua.changedGua.name + '</div>';
      html += '</div>';
      html += '<div class="gua-derived-reading">' + gua.changedGua.reading + '</div>';
    } else {
      html += '<div class="gua-derived" style="border-top:0;padding-top:0.5rem;">';
      html += '<div class="gua-derived-symbol" style="font-size:1rem;">本卦与变卦相同</div>';
      html += '</div>';
    }

    html += '<div class="gua-meta">动爻 <span>' + yaoText(gua.movingYao) + '</span></div>';

    dom.gua.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
