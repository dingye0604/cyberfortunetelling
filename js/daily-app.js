// ========== 每日宜忌 UI ==========

(function() {
  'use strict';

  var customDate, dateTrigger, datePanel;
  var dateTitle, ganzhiEl, nayinBadge, jianchuBadge, yiList, jiList, nayinInfo;
  var dpYear, dpMonth, dpDay;
  var openDropdown = null;

  function init() {
    customDate = document.getElementById('customDate');
    dateTrigger = document.getElementById('dateTrigger');
    datePanel = document.getElementById('datePanel');
    dateTitle = document.getElementById('dateTitle');
    ganzhiEl = document.getElementById('ganzhi');
    nayinBadge = document.getElementById('nayinBadge');
    jianchuBadge = document.getElementById('jianchuBadge');
    yiList = document.getElementById('yiList');
    jiList = document.getElementById('jiList');
    nayinInfo = document.getElementById('nayinInfo');
    dpYear = document.getElementById('dpYear');
    dpMonth = document.getElementById('dpMonth');
    dpDay = document.getElementById('dpDay');

    // 填充年份
    for (var y = 1900; y <= 2100; y++) {
      var opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y + '年';
      dpYear.appendChild(opt);
    }

    // 初始日期
    var today = new Date();
    dpYear.value = today.getFullYear();
    dpMonth.value = today.getMonth() + 1;
    refreshDays();
    dpDay.value = today.getDate();

    // 自定义下拉包裹
    wrapSelect(dpYear);
    wrapSelect(dpMonth);
    wrapSelect(dpDay);

    syncTrigger(today);
    updateDateTitle(today);
    render(today);

    // 事件
    dateTrigger.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleDatePanel();
    });
    dpYear.addEventListener('change', function() { onPickerChange(); });
    dpMonth.addEventListener('change', function() { onPickerChange(); });
    dpDay.addEventListener('change', function() { onPickerChange(); });
    document.addEventListener('click', onDocClick);
  }

  function onPickerChange() {
    refreshDays();
    var d = getPickerDate();
    syncTrigger(d);
    updateDateTitle(d);
    render(d);
  }

  function refreshDays() {
    var y = parseInt(dpYear.value);
    var m = parseInt(dpMonth.value);
    var maxD = daysInMonth(y, m);
    var cur = parseInt(dpDay.value) || 1;
    if (cur > maxD) cur = maxD;
    dpDay.innerHTML = '';
    for (var d = 1; d <= maxD; d++) {
      var opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d + '日';
      dpDay.appendChild(opt);
    }
    dpDay.value = cur;
    dpDay.dispatchEvent(new Event('change'));
    rebuildCustomSelect(dpDay);
  }

  function getPickerDate() {
    return new Date(parseInt(dpYear.value), parseInt(dpMonth.value) - 1, parseInt(dpDay.value), 12, 0, 0);
  }

  function syncTrigger(d) {
    var w = ['日','一','二','三','四','五','六'];
    dateTrigger.textContent = d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日 星期' + w[d.getDay()];
  }

  function updateDateTitle(d) {
    dateTitle.textContent = d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日';
  }

  function toggleDatePanel() {
    if (customDate.classList.contains('open')) {
      customDate.classList.remove('open');
    } else {
      customDate.classList.add('open');
    }
  }

  function onDocClick(e) {
    if (!customDate.contains(e.target)) {
      customDate.classList.remove('open');
    }
    if (openDropdown && !openDropdown.contains(e.target)) {
      closeDropdown(openDropdown);
    }
  }

  // ===== 自定义下拉（复用模式） =====
  function wrapSelect(selectEl) {
    var parent = selectEl.parentNode;
    var wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    wrapper.dataset.target = selectEl.id;
    var trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.textContent = getSelLabel(selectEl);
    var options = document.createElement('div');
    options.className = 'custom-select-options';
    buildOptions(selectEl, options);
    wrapper.appendChild(trigger);
    wrapper.appendChild(options);
    parent.insertBefore(wrapper, selectEl);
    trigger.addEventListener('click', function(e) { e.stopPropagation(); toggleDropdown(wrapper); });
    selectEl.addEventListener('change', function() {
      trigger.textContent = getSelLabel(selectEl);
      markSelOptions(options, selectEl.value);
    });
  }

  function buildOptions(selectEl, container) {
    container.innerHTML = '';
    for (var i = 0; i < selectEl.options.length; i++) {
      var opt = selectEl.options[i];
      var div = document.createElement('div');
      div.className = 'custom-select-option';
      div.dataset.value = opt.value;
      div.textContent = opt.textContent;
      if (opt.value === selectEl.value) div.classList.add('selected');
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
    trigger.textContent = getSelLabel(selectEl);
  }

  function getSelLabel(sel) {
    var opt = sel.options[sel.selectedIndex];
    return opt ? opt.textContent : '';
  }

  function markSelOptions(container, value) {
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

  function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }

  // ===== 渲染 =====
  function render(d) {
    var daily = calcDaily(d);
    ganzhiEl.textContent = daily.fullGanzhi;
    nayinBadge.textContent = '日纳音：' + daily.nayin + '　生肖：属' + daily.zodiac;
    jianchuBadge.textContent = daily.jianChu.name + '日';

    yiList.innerHTML = '';
    for (var i = 0; i < daily.yi.length; i++) {
      var tag = document.createElement('span');
      tag.className = 'yi-tag';
      tag.textContent = daily.yi[i];
      yiList.appendChild(tag);
    }

    jiList.innerHTML = '';
    for (var j = 0; j < daily.ji.length; j++) {
      var tag2 = document.createElement('span');
      tag2.className = 'ji-tag';
      tag2.textContent = daily.ji[j];
      jiList.appendChild(tag2);
    }

    nayinInfo.innerHTML = '<div style="text-align:center;">' +
      '<div style="font-size:1.1rem;color:var(--ink);margin-bottom:0.5rem;">' + daily.nayin + '</div>' +
      '<p style="font-size:0.9rem;color:var(--ink-soft);line-height:1.75;">' + daily.nayinReading + '</p>' +
      '</div>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
