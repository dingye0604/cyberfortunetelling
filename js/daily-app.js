// ========== 每日宜忌 UI ==========

(function() {
  'use strict';

  var pickDate, dateTitle, ganzhiEl, nayinBadge, jianchuBadge;
  var yiList, jiList, nayinInfo;

  function init() {
    pickDate = document.getElementById('pickDate');
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
    updateDateTitle(today);

    render(today);

    pickDate.addEventListener('change', function() {
      var d = new Date(pickDate.value + 'T12:00:00');
      updateDateTitle(d);
      render(d);
    });
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
    var weekNames = ['日', '一', '二', '三', '四', '五', '六'];
    dateTitle.textContent = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日' + ' 星期' + weekNames[d.getDay()];
  }

  function render(d) {
    var daily = calcDaily(d);

    // 干支
    ganzhiEl.textContent = daily.fullGanzhi;

    // 纳音标
    nayinBadge.textContent = '日纳音：' + daily.nayin + '　生肖：属' + daily.zodiac;

    // 建除
    jianchuBadge.textContent = daily.jianChu.name + '日';

    // 宜
    yiList.innerHTML = '';
    for (var i = 0; i < daily.yi.length; i++) {
      var tag = document.createElement('span');
      tag.className = 'yi-tag';
      tag.textContent = daily.yi[i];
      yiList.appendChild(tag);
    }

    // 忌
    jiList.innerHTML = '';
    for (var j = 0; j < daily.ji.length; j++) {
      var tag2 = document.createElement('span');
      tag2.className = 'ji-tag';
      tag2.textContent = daily.ji[j];
      jiList.appendChild(tag2);
    }

    // 纳音解读
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
