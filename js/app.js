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
      html += '，五行偏旺 <strong>' + wx.maxWx.join('、') + '</strong>';
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

    // 本卦：大幅符号 + 名称 + 解读
    html += '<div class="gua-header">';
    html += '<div class="gua-main-symbol">' + gua.upperTrigram.symbol + gua.lowerTrigram.symbol + '</div>';
    html += '<div class="gua-main-name">' + gua.originalGua.name + '</div>';
    html += '</div>';

    html += '<div class="gua-reading">' + gua.originalGua.reading + '</div>';

    // 变卦：紧凑显示
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
