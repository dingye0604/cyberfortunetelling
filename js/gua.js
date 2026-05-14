// ========== 梅花易数 ==========

// 预计算八卦 binary 数组，避免每次 calcGua 重建
var BA_GUA_BINARIES = (function() {
  var arr = [];
  for (var i = 0; i < BA_GUA.length; i++) arr[i] = BA_GUA[i].binary;
  return arr;
})();

// 梅花易数数字起卦
function calcGua(year, month, day, shiChenIndex) {
  if (shiChenIndex < 0) return null;

  var hourNum = shiChenIndex + 1;
  var total = year + month + day;

  var upperIdx = GUA_NUM_MAP[total % 8];
  var lowerIdx = GUA_NUM_MAP[(total + hourNum) % 8];

  var movingYao = (total + hourNum) % 6;
  if (movingYao === 0) movingYao = 6;

  var originalGua = GUA_64[upperIdx * 8 + lowerIdx];

  // 翻转动爻所在之爻（0=初, 1=二, 2=三，在下卦；3=四, 4=五, 5=上，在上卦）
  var newUpper = upperIdx, newLower = lowerIdx;
  if (movingYao <= 3) {
    var flipped = BA_GUA[lowerIdx].binary ^ (1 << (movingYao - 1));
    newLower = BA_GUA_BINARIES.indexOf(flipped);
  } else {
    var flipped = BA_GUA[upperIdx].binary ^ (1 << (movingYao - 4));
    newUpper = BA_GUA_BINARIES.indexOf(flipped);
  }

  var changedGua = GUA_64[newUpper * 8 + newLower];

  return {
    originalGua: originalGua,
    changedGua: changedGua,
    movingYao: movingYao,
    upperTrigram: BA_GUA[upperIdx],
    lowerTrigram: BA_GUA[lowerIdx],
    changedUpperTrigram: BA_GUA[newUpper],
    changedLowerTrigram: BA_GUA[newLower],
  };
}
