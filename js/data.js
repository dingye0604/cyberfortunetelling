// ========== 天干 ==========
const TIAN_GAN = [
  { name: '甲', wuxing: '木', yinyang: '阳' },
  { name: '乙', wuxing: '木', yinyang: '阴' },
  { name: '丙', wuxing: '火', yinyang: '阳' },
  { name: '丁', wuxing: '火', yinyang: '阴' },
  { name: '戊', wuxing: '土', yinyang: '阳' },
  { name: '己', wuxing: '土', yinyang: '阴' },
  { name: '庚', wuxing: '金', yinyang: '阳' },
  { name: '辛', wuxing: '金', yinyang: '阴' },
  { name: '壬', wuxing: '水', yinyang: '阳' },
  { name: '癸', wuxing: '水', yinyang: '阴' },
];

// ========== 地支 ==========
const DI_ZHI = [
  { name: '子', wuxing: '水', yinyang: '阳', zodiac: '鼠' },
  { name: '丑', wuxing: '土', yinyang: '阴', zodiac: '牛' },
  { name: '寅', wuxing: '木', yinyang: '阳', zodiac: '虎' },
  { name: '卯', wuxing: '木', yinyang: '阴', zodiac: '兔' },
  { name: '辰', wuxing: '土', yinyang: '阳', zodiac: '龙' },
  { name: '巳', wuxing: '火', yinyang: '阴', zodiac: '蛇' },
  { name: '午', wuxing: '火', yinyang: '阳', zodiac: '马' },
  { name: '未', wuxing: '土', yinyang: '阴', zodiac: '羊' },
  { name: '申', wuxing: '金', yinyang: '阳', zodiac: '猴' },
  { name: '酉', wuxing: '金', yinyang: '阴', zodiac: '鸡' },
  { name: '戌', wuxing: '土', yinyang: '阳', zodiac: '狗' },
  { name: '亥', wuxing: '水', yinyang: '阴', zodiac: '猪' },
];

// ========== 时辰 ==========
const SHI_CHEN = [
  { name: '子时', diZhiIndex: 0, period: '23:00-00:59' },
  { name: '丑时', diZhiIndex: 1, period: '01:00-02:59' },
  { name: '寅时', diZhiIndex: 2, period: '03:00-04:59' },
  { name: '卯时', diZhiIndex: 3, period: '05:00-06:59' },
  { name: '辰时', diZhiIndex: 4, period: '07:00-08:59' },
  { name: '巳时', diZhiIndex: 5, period: '09:00-10:59' },
  { name: '午时', diZhiIndex: 6, period: '11:00-12:59' },
  { name: '未时', diZhiIndex: 7, period: '13:00-14:59' },
  { name: '申时', diZhiIndex: 8, period: '15:00-16:59' },
  { name: '酉时', diZhiIndex: 9, period: '17:00-18:59' },
  { name: '戌时', diZhiIndex: 10, period: '19:00-20:59' },
  { name: '亥时', diZhiIndex: 11, period: '21:00-22:59' },
];

// ========== 六十甲子纳音表 ==========
// 索引即六十甲子位置（0=甲子, 59=癸亥）
const LIU_SHI_JIA_ZI = [
  '海中金', '海中金', '炉中火', '炉中火', '大林木', '大林木',
  '路旁土', '路旁土', '剑锋金', '剑锋金', '山头火', '山头火',
  '涧下水', '涧下水', '城头土', '城头土', '白蜡金', '白蜡金',
  '杨柳木', '杨柳木', '泉中水', '泉中水', '屋上土', '屋上土',
  '霹雳火', '霹雳火', '松柏木', '松柏木', '长流水', '长流水',
  '沙中金', '沙中金', '山下火', '山下火', '平地木', '平地木',
  '壁上土', '壁上土', '金箔金', '金箔金', '覆灯火', '覆灯火',
  '天河水', '天河水', '大驿土', '大驿土', '钗钏金', '钗钏金',
  '桑柘木', '桑柘木', '大溪水', '大溪水', '沙中土', '沙中土',
  '天上火', '天上火', '石榴木', '石榴木', '大海水', '大海水',
];

// ========== 节气近似表 ==========
// 月柱分界节气（节），近似日期 ±1 天
// 索引 0=寅月(立春) ... 11=丑月(小寒)
const JIE_QI_APPROX = [
  { month: 2,  day: 4 },   // 立春
  { month: 3,  day: 6 },   // 惊蛰
  { month: 4,  day: 5 },   // 清明
  { month: 5,  day: 6 },   // 立夏
  { month: 6,  day: 6 },   // 芒种
  { month: 7,  day: 7 },   // 小暑
  { month: 8,  day: 7 },   // 立秋
  { month: 9,  day: 8 },   // 白露
  { month: 10, day: 8 },   // 寒露
  { month: 11, day: 7 },   // 立冬
  { month: 12, day: 7 },   // 大雪
  { month: 1,  day: 6 },   // 小寒
];

// ========== 八卦 ==========
// 索引: 0=乾, 1=兑, 2=离, 3=震, 4=巽, 5=坎, 6=艮, 7=坤
// binary: 从下到上三爻的二进制表示（阳=1, 阴=0）
const BA_GUA = [
  { name: '乾', symbol: '☰', binary: 0b111 },
  { name: '兑', symbol: '☱', binary: 0b110 },
  { name: '离', symbol: '☲', binary: 0b101 },
  { name: '震', symbol: '☳', binary: 0b100 },
  { name: '巽', symbol: '☴', binary: 0b011 },
  { name: '坎', symbol: '☵', binary: 0b010 },
  { name: '艮', symbol: '☶', binary: 0b001 },
  { name: '坤', symbol: '☷', binary: 0b000 },
];

// 梅花易数数字→八卦索引映射
// 余数 r → BA_GUA 索引: 1→0(乾), 2→1(兑), 3→2(离), 4→3(震),
//                          5→4(巽), 6→5(坎), 7→6(艮), 0→7(坤)
const GUA_NUM_MAP = [7, 0, 1, 2, 3, 4, 5, 6];

// ========== 六十四卦 ==========
// 索引 = 上卦索引 * 8 + 下卦索引
const GUA_64 = [
  // 上乾 (0)
  { name: '乾为天', trigrams: '上乾下乾', meaning: '天行健，君子以自强不息。' },
  { name: '天泽履', trigrams: '上乾下兑', meaning: '履虎尾，不咥人，亨。' },
  { name: '天火同人', trigrams: '上乾下离', meaning: '与人同者，物必归焉。' },
  { name: '天雷无妄', trigrams: '上乾下震', meaning: '无妄之往，何之矣？天命不佑，行矣哉？' },
  { name: '天风姤', trigrams: '上乾下巽', meaning: '姤，遇也，柔遇刚也。' },
  { name: '天水讼', trigrams: '上乾下坎', meaning: '讼，有孚窒惕，中吉。' },
  { name: '天山遁', trigrams: '上乾下艮', meaning: '遁亨，遁而亨也。' },
  { name: '天地否', trigrams: '上乾下坤', meaning: '否之匪人，不利君子贞。' },

  // 上兑 (1)
  { name: '泽天夬', trigrams: '上兑下乾', meaning: '夬，决也，刚决柔也。' },
  { name: '兑为泽', trigrams: '上兑下兑', meaning: '兑，说也，刚中而柔外。' },
  { name: '泽火革', trigrams: '上兑下离', meaning: '革，水火相息，顺天应人。' },
  { name: '泽雷随', trigrams: '上兑下震', meaning: '随，刚来而下柔，动而说。' },
  { name: '泽风大过', trigrams: '上兑下巽', meaning: '大过，栋桡，本末弱也。' },
  { name: '泽水困', trigrams: '上兑下坎', meaning: '困，刚掩也，险以说。' },
  { name: '泽山咸', trigrams: '上兑下艮', meaning: '咸，感也，柔上而刚下。' },
  { name: '泽地萃', trigrams: '上兑下坤', meaning: '萃，聚也，顺以说。' },

  // 上离 (2)
  { name: '火天大有', trigrams: '上离下乾', meaning: '大有，柔得尊位，大中而上下应之。' },
  { name: '火泽睽', trigrams: '上离下兑', meaning: '睽，火动而上，泽动而下。' },
  { name: '离为火', trigrams: '上离下离', meaning: '离，丽也，明两作。' },
  { name: '火雷噬嗑', trigrams: '上离下震', meaning: '噬嗑，嗑而亨，刚柔分。' },
  { name: '火风鼎', trigrams: '上离下巽', meaning: '鼎，象也，以木巽火，亨饪也。' },
  { name: '火水未济', trigrams: '上离下坎', meaning: '未济，亨，小狐汔济，濡其尾。' },
  { name: '火山旅', trigrams: '上离下艮', meaning: '旅，小亨，旅贞吉。' },
  { name: '火地晋', trigrams: '上离下坤', meaning: '晋，进也，明出地上。' },

  // 上震 (3)
  { name: '雷天大壮', trigrams: '上震下乾', meaning: '大壮，大者壮也，刚以动。' },
  { name: '雷泽归妹', trigrams: '上震下兑', meaning: '归妹，天地之大义也。' },
  { name: '雷火丰', trigrams: '上震下离', meaning: '丰，大也，明以动。' },
  { name: '震为雷', trigrams: '上震下震', meaning: '震，亨，震来虩虩，笑言哑哑。' },
  { name: '雷风恒', trigrams: '上震下巽', meaning: '恒，久也，刚上而柔下。' },
  { name: '雷水解', trigrams: '上震下坎', meaning: '解，险以动，动而免乎险。' },
  { name: '雷山小过', trigrams: '上震下艮', meaning: '小过，小者过而亨也。' },
  { name: '雷地豫', trigrams: '上震下坤', meaning: '豫，刚应而志行，顺以动。' },

  // 上巽 (4)
  { name: '风天小畜', trigrams: '上巽下乾', meaning: '小畜，柔得位而上下应之。' },
  { name: '风泽中孚', trigrams: '上巽下兑', meaning: '中孚，柔在内而刚得中。' },
  { name: '风火家人', trigrams: '上巽下离', meaning: '家人，正家而天下定矣。' },
  { name: '风雷益', trigrams: '上巽下震', meaning: '益，损上益下，民说无疆。' },
  { name: '巽为风', trigrams: '上巽下巽', meaning: '巽，入也，重巽以申命。' },
  { name: '风水涣', trigrams: '上巽下坎', meaning: '涣，散也，刚来而不穷。' },
  { name: '风山渐', trigrams: '上巽下艮', meaning: '渐，女归吉，进得位。' },
  { name: '风地观', trigrams: '上巽下坤', meaning: '观，大观在上，顺而巽。' },

  // 上坎 (5)
  { name: '水天需', trigrams: '上坎下乾', meaning: '需，须也，险在前也。' },
  { name: '水泽节', trigrams: '上坎下兑', meaning: '节，亨，刚柔分而刚得中。' },
  { name: '水火既济', trigrams: '上坎下离', meaning: '既济，亨小，利贞。' },
  { name: '水雷屯', trigrams: '上坎下震', meaning: '屯，刚柔始交而难生。' },
  { name: '水风井', trigrams: '上坎下巽', meaning: '井，改邑不改井，无丧无得。' },
  { name: '坎为水', trigrams: '上坎下坎', meaning: '习坎，重险也，水流而不盈。' },
  { name: '水山蹇', trigrams: '上坎下艮', meaning: '蹇，难也，险在前也。' },
  { name: '水地比', trigrams: '上坎下坤', meaning: '比，吉也，比辅也。' },

  // 上艮 (6)
  { name: '山天大畜', trigrams: '上艮下乾', meaning: '大畜，刚健笃实辉光，日新其德。' },
  { name: '山泽损', trigrams: '上艮下兑', meaning: '损，损下益上，其道上行。' },
  { name: '山火贲', trigrams: '上艮下离', meaning: '贲，亨，柔来而文刚。' },
  { name: '山雷颐', trigrams: '上艮下震', meaning: '颐，养正也，观颐观其所养也。' },
  { name: '山风蛊', trigrams: '上艮下巽', meaning: '蛊，元亨，刚上而柔下。' },
  { name: '山水蒙', trigrams: '上艮下坎', meaning: '蒙，亨，匪我求童蒙，童蒙求我。' },
  { name: '艮为山', trigrams: '上艮下艮', meaning: '艮，止也，时止则止，时行则行。' },
  { name: '山地剥', trigrams: '上艮下坤', meaning: '剥，剥也，柔变刚也。' },

  // 上坤 (7)
  { name: '地天泰', trigrams: '上坤下乾', meaning: '泰，小往大来，吉亨。天地交而万物通。' },
  { name: '地泽临', trigrams: '上坤下兑', meaning: '临，刚浸而长，说而顺。' },
  { name: '地火明夷', trigrams: '上坤下离', meaning: '明夷，明入地中，内文明而外柔顺。' },
  { name: '地雷复', trigrams: '上坤下震', meaning: '复，亨，刚反动而以顺行。' },
  { name: '地风升', trigrams: '上坤下巽', meaning: '升，元亨，用见大人，勿恤。' },
  { name: '地水师', trigrams: '上坤下坎', meaning: '师，众也，贞丈人吉。' },
  { name: '地山谦', trigrams: '上坤下艮', meaning: '谦，亨，天道下济而光明。' },
  { name: '坤为地', trigrams: '上坤下坤', meaning: '坤，元亨，利牝马之贞。厚德载物。' },
];

// ========== 五行颜色映射 ==========
const WUXING_COLORS = {
  '木': { css: 'wuxing-mu', bar: 'bar-mu', hex: '#4a9e4a' },
  '火': { css: 'wuxing-huo', bar: 'bar-huo', hex: '#d9554f' },
  '土': { css: 'wuxing-tu', bar: 'bar-tu', hex: '#c49a3c' },
  '金': { css: 'wuxing-jin', bar: 'bar-jin', hex: '#b8860b' },
  '水': { css: 'wuxing-shui', bar: 'bar-shui', hex: '#4a7fc7' },
};
