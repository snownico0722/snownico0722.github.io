/* 工作幸福度计算机 v2.1。多层公式模型,>1 快乐 <1 不快乐。逐字搬魔法师的表。 */
window.__WORK__ = {
  title: "工作幸福度计算机",
  intro: "魔法师当年算自己那份工作值不值,做的一张表。\n填下面这些 —— 工资、房租、加班、同事、通勤……它把你的班,折算成一个数。\n大于 1,这班上得快乐;小于 1,你早该知道了。",
  // 分组 → 字段 [key, 标签, 默认值, 类型/选项]
  groups: [
    { name: "钱", fields: [
      ["salary", "税后月工资(元)", 11000, "num"],
      ["welfare", "可量化福利/月(健身房、公积金、零食…)", 0, "num"],
      ["mealPrice", "一顿盒饭均价(元)", 30, "num"],
      ["mealSub", "公司餐补/月(元)", 0, "num"],
      ["rent", "你摊到的月租金(元)", 2000, "num"],
      ["houseSub", "公司房补/月(元)", 0, "num"],
    ] },
    { name: "时间(单位:小时)", fields: [
      ["workHour", "正常上班时长/天", 8, "num"],
      ["restHour", "上班中能休息的时长/天", 1, "num"],
      ["fishHour", "摸鱼时长/天", 2, "num"],
      ["otWeekday", "工作日日均加班", 2, "num"],
      ["otWeekend", "周末加班(每周总和÷2)", 5, "num"],
      ["commute", "单程通勤时间", 0.6, "num"],
    ] },
    { name: "通勤方式", fields: [
      ["commuteType", "怎么上班", 0.1, "sel", [
        ["打车 / 开车", 0.1],
        ["步行 / 骑车(对健康有益)", 0.2],
        ["公共交通", 0],
        ["拥挤的公共交通 / 晕车", -0.15],
      ]],
    ] },
    { name: "压力 & 环境(1-5 星)", fields: [
      ["stress", "主观压力(越高越累)", 3, "star"],
      ["friendly", "同事友好星级", 3, "star"],
      ["coop", "同事合作星级", 3, "star"],
      ["health", "工作健康度(久坐看屏、椅子差就低)", 2, "star"],
      ["fun", "工作乐趣度", 3, "star"],
    ] },
    { name: "城市行情(元/月)", fields: [
      ["cityAvg", "你所在城市平均工资", 15000, "num"],
      ["cityMid", "你所在城市工资中位数", 8000, "num"],
    ] },
  ],
};

/* 逐层公式,全部照搬表里的单元格 */
window.__WORK__.compute = function (v) {
  const meal = v.mealPrice * 3 * 30 * 1.5 - v.mealSub;          // 饮食开销
  const live = v.rent * 1.1 + 400 - v.houseSub;                 // 居住开销
  const remain = v.salary - meal - live + v.welfare;            // 月剩余工资
  const workLen = v.restHour / 1.5 + v.workHour - 0.3 * v.fishHour; // 工作时长
  const otDaily = (v.otWeekday * 5 + v.otWeekend * 1.5) / 5;    // 日均加班
  const commuteTotal = v.commute * 2;                           // 通勤总时间
  const coef = workLen / 8 + otDaily / 5 + (commuteTotal * (1 - v.commuteType) - 0.8) / 2; // 工作系数
  const subjP = (1 + v.stress) / 4;                             // 主观压力项
  const objP = v.workHour ? ((v.workHour - v.fishHour) / v.workHour - 0.75) / 1.1 : 0; // 客观压力
  const otMonth = 22 * v.otWeekday + v.otWeekend * 8;
  const otCoef = (Math.sqrt(otMonth - 10 > 0 ? otMonth - 10 : otMonth) - 2) / 8; // 月加班系数
  const busy = 0.4 + subjP + objP + otCoef;                    // 忙碌度
  const env = 0.5 + (v.friendly + v.coop + v.health * 2 + v.fun) / 25; // 环境舒适度
  const cityCoef = (v.cityAvg ? v.salary / v.cityAvg * 0.4 : 0) + (v.cityMid ? v.salary / v.cityMid * 0.6 : 0); // 城市收入系数
  let total = 0;
  if (coef && busy) total = remain / 6000 / coef / busy * 1.3 * 1.5 * env * cityCoef;
  return { total: total, remain: remain, coef: coef, busy: busy, env: env, cityCoef: cityCoef };
};

