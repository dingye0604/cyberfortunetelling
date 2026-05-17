// ========== 姻缘页面 UI ==========

(function() {
  'use strict';

  var dom = {};
  var openDropdown = null;

  function init() {
    dom.form = document.getElementById('marriageForm');
    dom.year1 = document.getElementById('year1');
    dom.month1 = document.getElementById('month1');
    dom.day1 = document.getElementById('day1');
    dom.hour1 = document.getElementById('hour1');
    dom.year2 = document.getElementById('year2');
    dom.month2 = document.getElementById('month2');
    dom.day2 = document.getElementById('day2');
    dom.hour2 = document.getElementById('hour2');
    dom.results = document.getElementById('results');
    dom.dualPillars = document.getElementById('dualPillars');
    dom.scoreBlock = document.getElementById('scoreBlock');
    dom.detailsBlock = document.getElementById('detailsBlock');

    populateSels();
    setDefaults();
    wrapAllSelects();

    dom.month1.addEventListener('change', function() { refreshPersonDay(dom.year1, dom.month1, dom.day1); });
    dom.month2.addEventListener('change', function() { refreshPersonDay(dom.year2, dom.month2, dom.day2); });
    dom.form.addEventListener('submit', onSubmit);
    document.addEventListener('click', onDocClick);
  }

  function populateSels() {
    // 年份
    [dom.year1, dom.year2].forEach(function(sel) {
      for (var y = 1900; y <= 2100; y++) {
        var opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y + ' 年';
        sel.appendChild(opt);
      }
    });
    // 日期
    refreshPersonDay(dom.year1, dom.month1, dom.day1);
    refreshPersonDay(dom.year2, dom.month2, dom.day2);
    // 时辰
    [dom.hour1, dom.hour2].forEach(function(sel) {
      var opt = document.createElement('option');
      opt.value = '-1';
      opt.textContent = '未知';
      sel.appendChild(opt);
      for (var i = 0; i < SHI_CHEN.length; i++) {
        opt = document.createElement('option');
        opt.value = i;
        opt.textContent = SHI_CHEN[i].name + '（' + SHI_CHEN[i].period + '）';
        sel.appendChild(opt);
      }
    });
  }

  function refreshPersonDay(yearSel, monthSel, daySel) {
    var y = parseInt(yearSel.value);
    var m = parseInt(monthSel.value);
    var maxD = daysInMonth(y, m);
    var cur = parseInt(daySel.value) || 1;
    if (cur > maxD) cur = maxD;
    daySel.innerHTML = '';
    for (var d = 1; d <= maxD; d++) {
      var opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d + ' 日';
      daySel.appendChild(opt);
    }
    daySel.value = cur;
    daySel.dispatchEvent(new Event('change'));
    rebuildCustomSelect(daySel);
  }

  function setDefaults() {
    var now = new Date();
    var y = Math.min(now.getFullYear(), 2100);
    var m = now.getMonth() + 1;
    var d = Math.min(now.getDate(), 28);
    [dom.year1, dom.year2].forEach(function(s) { s.value = y; });
    [dom.month1, dom.month2].forEach(function(s) { s.value = m; });
    refreshPersonDay(dom.year1, dom.month1, dom.day1);
    refreshPersonDay(dom.year2, dom.month2, dom.day2);
    dom.day1.value = d;
    dom.day2.value = d;
    syncAllCustomSelects([dom.year1,dom.month1,dom.day1,dom.hour1,dom.year2,dom.month2,dom.day2,dom.hour2]);
  }

  // ===== 自定义下拉 =====
  function wrapAllSelects() {
    [dom.year1,dom.month1,dom.day1,dom.hour1,dom.year2,dom.month2,dom.day2,dom.hour2].forEach(function(sel) {
      wrapSelect(sel);
    });
  }

  function wrapSelect(selectEl) {
    var parent = selectEl.parentNode;
    var wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    wrapper.dataset.target = selectEl.id;
    var trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.textContent = getSelectLabel(selectEl);
    var options = document.createElement('div');
    options.className = 'custom-select-options';
    buildOptions(selectEl, options);
    wrapper.appendChild(trigger);
    wrapper.appendChild(options);
    parent.insertBefore(wrapper, selectEl);
    trigger.addEventListener('click', function(e) { e.stopPropagation(); toggleDropdown(wrapper); });
    selectEl.addEventListener('change', function() {
      trigger.textContent = getSelectLabel(selectEl);
      markSelected(options, selectEl.value);
    });
  }

  function buildOptions(selectEl, container) {
    container.innerHTML = '';
    var opts = selectEl.options;
    for (var i = 0; i < opts.length; i++) {
      var div = document.createElement('div');
      div.className = 'custom-select-option';
      div.dataset.value = opts[i].value;
      div.textContent = opts[i].textContent;
      if (opts[i].value === selectEl.value) div.classList.add('selected');
      div.addEventListener('click', function(e) {
        e.stopPropagation();
        var wrapper = this.closest('.custom-select');
        var target = document.getElementById(wrapper.dataset.target);
        target.value = this.dataset.value;
        target.dispatchEvent(new Event('change'));
        closeDropdown(wrapper);
      });
      container.appendChild(div);
    }
  }

  function rebuildCustomSelect(selectEl) {
    var wrapper = selectEl.previousElementSibling;
    if (!wrapper || !wrapper.classList.contains('custom-select')) return;
    var trigger = wrapper.querySelector('.custom-select-trigger');
    var options = wrapper.querySelector('.custom-select-options');
    buildOptions(selectEl, options);
    trigger.textContent = getSelectLabel(selectEl);
  }

  function getSelectLabel(selectEl) {
    var opt = selectEl.options[selectEl.selectedIndex];
    return opt ? opt.textContent : '';
  }

  function markSelected(container, value) {
    var items = container.querySelectorAll('.custom-select-option');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('selected', items[i].dataset.value === value);
    }
  }

  function toggleDropdown(wrapper) {
    if (wrapper.classList.contains('open')) { closeDropdown(wrapper); return; }
    if (openDropdown) closeDropdown(openDropdown);
    wrapper.classList.add('open');
    openDropdown = wrapper;
    var sel = wrapper.querySelector('.custom-select-option.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }

  function closeDropdown(wrapper) {
    wrapper.classList.remove('open');
    if (openDropdown === wrapper) openDropdown = null;
  }

  function syncAllCustomSelects(selList) {
    selList.forEach(function(sel) {
      var wrapper = sel.previousElementSibling;
      if (!wrapper || !wrapper.classList.contains('custom-select')) return;
      wrapper.querySelector('.custom-select-trigger').textContent = getSelectLabel(sel);
      markSelected(wrapper.querySelector('.custom-select-options'), sel.value);
    });
  }

  function onDocClick(e) {
    if (openDropdown && !openDropdown.contains(e.target)) closeDropdown(openDropdown);
  }

  // ===== 提交 =====
  function onSubmit(e) {
    e.preventDefault();
    var y1 = parseInt(dom.year1.value), m1 = parseInt(dom.month1.value), d1 = parseInt(dom.day1.value), h1 = parseInt(dom.hour1.value);
    var y2 = parseInt(dom.year2.value), m2 = parseInt(dom.month2.value), d2 = parseInt(dom.day2.value), h2 = parseInt(dom.hour2.value);
    if (isNaN(y1)||isNaN(m1)||isNaN(d1)||isNaN(y2)||isNaN(m2)||isNaN(d2)) return;

    var b1 = calcBaZi(y1, m1, d1, h1);
    var b2 = calcBaZi(y2, m2, d2, h2);
    var wx1 = analyzeWuxing([b1.year, b1.month, b1.day, b1.hour]);
    var wx2 = analyzeWuxing([b2.year, b2.month, b2.day, b2.hour]);
    var result = calcMarriageCompatibility(b1, b2, wx1, wx2);

    renderAll(b1, b2, wx1, wx2, result);
    dom.results.classList.remove('hidden');
    dom.results.scrollIntoView({ behavior: 'smooth' });
  }

  // ===== 渲染 =====
  function wxC(wx) { return WUXING_COLORS[wx] ? WUXING_COLORS[wx].css : ''; }

  function renderAll(b1, b2, wx1, wx2, result) {
    renderDualPillars(b1, b2);
    renderScore(result);
    renderDetails(result);
  }

  function renderDualPillars(b1, b2) {
    var html = '';
    html += '<div class="pillar-row">' + buildPersonCol(b1, '你') + '</div>';
    html += '<div class="pillar-row">' + buildPersonCol(b2, '对方') + '</div>';
    dom.dualPillars.innerHTML = html;
  }

  function buildPersonCol(bazi, label) {
    var labels = ['年柱', '月柱', '日柱', '时柱'];
    var items = [bazi.year, bazi.month, bazi.day, bazi.hour];
    var html = '';
    html += '<div style="text-align:center;font-size:0.8rem;color:var(--ink-light);margin-bottom:0.5rem;letter-spacing:0.08em;">' + label + '</div>';
    html += '<div class="pillars" style="grid-template-columns:1fr 1fr;gap:0.3rem;">';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      html += '<div class="pillar-card" style="padding:0.6rem 0.2rem;">';
      html += '<div class="pillar-label">' + labels[i] + '</div>';
      if (item) {
        html += '<div class="pillar-gan ' + wxC(item.gan.wuxing) + '" style="font-size:1.8rem;">' + item.gan.name + '</div>';
        html += '<div class="pillar-zhi ' + wxC(item.zhi.wuxing) + '" style="font-size:1.8rem;">' + item.zhi.name + '</div>';
      } else {
        html += '<div class="pillar-hour-unknown" style="font-size:1.4rem;">—</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderScore(result) {
    var html = '';
    html += '<div class="score-badge">';
    html += '<div class="score-circle"><span class="grade">' + result.grade + '</span></div>';
    html += '</div>';
    html += '<p class="score-summary">' + result.summary + '</p>';
    dom.scoreBlock.innerHTML = html;
  }

  function renderDetails(result) {
    var d = result.details;
    var html = '';

    html += buildDetail('生肖年柱', d.zodiac.score, d.zodiac.text);
    html += buildDetail('日柱关系', d.day.score, d.day.text);
    html += buildDetail('五行互补', d.wuxing.score, d.wuxing.text);
    html += buildDetail('纳音和合', d.nayin.score, d.nayin.text);

    dom.detailsBlock.innerHTML = html;
  }

  function buildDetail(label, score, text) {
    return '<div class="detail-item">' +
      '<div class="detail-header">' +
        '<span class="detail-label">' + label + '</span>' +
        '<span class="detail-score">' + score + ' 分</span>' +
      '</div>' +
      '<div class="detail-text">' + text + '</div>' +
    '</div>';
  }

  function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
