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
    dom.submitBtn = document.getElementById('submitBtn');
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

  // 填充年份（1900-2100）
  function populateYears() {
    for (var y = 1900; y <= 2100; y++) {
      var opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y + '年';
      dom.yearSel.appendChild(opt);
    }
  }

  // 填充日（根据年月动态）
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
      opt.textContent = d + '日';
      dom.daySel.appendChild(opt);
    }
    // 保留之前选择（如果还在有效范围）
    if (currentVal && parseInt(currentVal) <= maxDay) {
      dom.daySel.value = currentVal;
    }
  }

  function daysInMonth(y, m) {
    return new Date(y, m, 0).getDate();
  }

  // 填充时辰
  function populateHours() {
    var opt = document.createElement('option');
    opt.value = '-1';
    opt.textContent = '未知';
    dom.hourSel.appendChild(opt);

    for (var i = 0; i < SHI_CHEN.length; i++) {
      var sc = SHI_CHEN[i];
      opt = document.createElement('option');
      opt.value = i;
      opt.textContent = sc.name + ' (' + sc.period + ')';
      dom.hourSel.appendChild(opt);
    }
  }

  // 默认设为用户出生年份（粗略设为 2000 年左右以便测试）
  function setDefaultDate() {
    var now = new Date();
    dom.yearSel.value = Math.min(now.getFullYear(), 2100);
    dom.monthSel.value = now.getMonth() + 1;
    refreshDays();
    dom.daySel.value = Math.min(now.getDate(), daysInMonth(now.getFullYear(), now.getMonth() + 1));
  }

  // ========== 表单提交 ==========
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

    renderResults(bazi, wuxing, gua);
    dom.results.classList.remove('hidden');
    dom.results.scrollIntoView({ behavior: 'smooth' });
  }

  // ========== 渲染 ==========

  function yaoText(n) {
    var map = ['', '初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
    return map[n] || n + '爻';
  }

  function wuxingClass(wx) {
    return WUXING_COLORS[wx] ? WUXING_COLORS[wx].css : '';
  }

  function barClass(wx) {
    return WUXING_COLORS[wx] ? WUXING_COLORS[wx].bar : '';
  }

  // 八字渲染
  function renderResults(bazi, wuxing, gua) {
    renderPillars(bazi);
    renderWuxing(wuxing);
    renderNayin(bazi);
    renderZodiac(bazi);
    renderGua(gua);
  }

  function renderPillars(bazi) {
    var html = '';
    var labels = ['年柱', '月柱', '日柱', '时柱'];
    var items = [bazi.year, bazi.month, bazi.day, bazi.hour];

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      html += '<div class="pillar-card">';
      html += '<div class="pillar-label">' + labels[i] + '</div>';
      if (item) {
        html += '<div class="pillar-gan ' + wuxingClass(item.gan.wuxing) + '">' + item.gan.name + '</div>';
        html += '<div class="pillar-zhi ' + wuxingClass(item.zhi.wuxing) + '">' + item.zhi.name + '</div>';
      } else {
        html += '<div class="pillar-hour-unknown">未知</div>';
      }
      html += '</div>';
    }
    dom.pillars.innerHTML = html;
  }

  // 五行渲染
  function renderWuxing(wx) {
    var order = ['木', '火', '土', '金', '水'];
    var maxVal = 0;
    for (var k in wx.counts) {
      if (wx.counts[k] > maxVal) maxVal = wx.counts[k];
    }
    if (maxVal === 0) maxVal = 1;

    var html = '<div class="wuxing-chart">';
    for (var i = 0; i < order.length; i++) {
      var wxName = order[i];
      var count = wx.counts[wxName];
      var pct = Math.round(count / maxVal * 100);
      html += '<div class="wuxing-row">';
      html += '<div class="label ' + wuxingClass(wxName) + '">' + wxName + '</div>';
      html += '<div class="bar-bg"><div class="bar-fill ' + barClass(wxName) + '" style="width:' + pct + '%"></div></div>';
      html += '<div class="count">' + count + '/' + wx.totalN + '</div>';
      html += '</div>';
    }
    html += '</div>';

    if (wx.dayMaster) {
      html += '<div class="wuxing-summary" style="margin-top:0.8rem;">';
      html += '日主为 <strong class="' + wuxingClass(wx.dayMaster.wuxing) + '">' + wx.dayMaster.name + wx.dayMaster.wuxing + '</strong>（日柱天干）';
      html += '<br>五行以 <strong>' + wx.maxWx.join('/') + '</strong> 为最旺';
      if (wx.minWx.length > 0) {
        html += '，<strong>' + wx.minWx.join('/') + '</strong> 最弱';
      }
      html += '</div>';
    }

    dom.wuxing.innerHTML = html;
  }

  // 纳音渲染
  function renderNayin(bazi) {
    var html = '';
    html += '<div class="nayin-item"><span class="pillar-tag">年柱</span><span class="value">' + bazi.year.nayin + '</span></div>';
    html += '<div class="nayin-item"><span class="pillar-tag">月柱</span><span class="value">' + bazi.month.nayin + '</span></div>';
    html += '<div class="nayin-item"><span class="pillar-tag">日柱</span><span class="value">' + bazi.day.nayin + '</span></div>';
    if (bazi.hour) {
      html += '<div class="nayin-item"><span class="pillar-tag">时柱</span><span class="value">' + bazi.hour.nayin + '</span></div>';
    }
    dom.nayin.innerHTML = html;
  }

  // 生肖渲染
  function renderZodiac(bazi) {
    dom.zodiac.innerHTML = '<div class="zodiac-display">属' + bazi.year.zhi.zodiac + '</div>';
  }

  // 卦象渲染
  function renderGua(gua) {
    if (!gua) {
      dom.guaBlock.classList.add('hidden');
      return;
    }
    dom.guaBlock.classList.remove('hidden');

    var html = '<div class="gua-cards">';
    html += '<div class="gua-card">';
    html += '<div class="gua-name">' + gua.originalGua.name + '</div>';
    html += '<div class="gua-trigrams">' + gua.upperTrigram.symbol + gua.lowerTrigram.symbol + '</div>';
    html += '<div class="gua-meaning">' + gua.originalGua.meaning + '</div>';
    html += '</div>';
    html += '<div class="gua-card">';
    html += '<div class="gua-name">' + gua.changedGua.name + '</div>';
    html += '<div class="gua-trigrams">' + gua.changedUpperTrigram.symbol + gua.changedLowerTrigram.symbol + '</div>';
    html += '<div class="gua-meaning">' + gua.changedGua.meaning + '</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="gua-yao">动爻：' + yaoText(gua.movingYao) + '</div>';

    dom.gua.innerHTML = html;
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
