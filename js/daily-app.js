// ========== 每日宜忌 UI ==========

(function() {
  'use strict';

  var pickDate, dateTrigger, dateTitle;
  var ganzhiEl, nayinBadge, jianchuBadge, yiList, jiList, nayinInfo;

  function init() {
    pickDate = document.getElementById('pickDate');
    dateTrigger = document.getElementById('dateTrigger');
    dateTitle = document.getElementById('dateTitle');
    ganzhiEl = document.getElementById('ganzhi');
    nayinBadge = document.getElementById('nayinBadge');
    jianchuBadge = document.getElementById('jianchuBadge');
    yiList = document.getElementById('yiList');
    jiList = document.getElementById('jiList');
    nayinInfo = document.getElementById('nayinInfo');

    var today = new Date();
    pickDate.value = fmtDate(today);
    pickDate.max = fmtDate(addDays(today, 30));
    pickDate.min = fmtDate(addDays(today, -30));
    dateTrigger.textContent = triggerText(today);
    updateDateTitle(today);

    render(today);

    pickDate.addEventListener('change', function() {
      var d = new Date(pickDate.value + 'T12:00:00');
      dateTrigger.textContent = triggerText(d);
      updateDateTitle(d);
      render(d);
    });
  }

  function triggerText(d) {
    var week = ['日', '一', '二', '三', '四', '五', '六'];
    return d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日 星期' + week[d.getDay()];
  }

  function fmtDate(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function addDays(d, n) {
    var r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }

  function updateDateTitle(d) {
    dateTitle.textContent = triggerText(d);
  }

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
