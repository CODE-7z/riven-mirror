/**
 * 赋能
 */
export interface Buff {
  id: string;
  name: string;
  /** 生效目标 */
  type: string;
  /** 属性 [属性名称, 数值] */
  props?: [string, number][];
  /** 随强度变化的属性 [属性名称, 数值, 受强度影响关系] */
  dynamicProps?: [string, number, number][];
  /** 叠加效果 */
  multiLayer?: MultiLayer;
  /** 参数 */
  parms?: [string, string];
}

export interface MultiLayer {
  /** 最大层数 */
  maxStack: number;
  stackableProps?: [string, number][];
  unstackableProps?: [string, number][][];
}

// 牛/龙/易融/电盾/主教/猫叫/踩线/各种集团1附加元素/女枪1技能/DJ
// 还有技能武器吃强度 武器外观
export const BuffList: Buff[] = [
  // 加法基伤类

  {
    id: "B",
    name: "ballisticBattery", // 女枪1 弹道蓄能 (加数值)
    type: "武器",
    dynamicProps: [["伤害数值", 0.5, 1]],
    parms: ["power", "%"],
  }, {
    id: "G",
    name: "shootingGallery", // 女枪2 靶场
    type: "武器",
    dynamicProps: [["伤害", 0.5, 1]],
    parms: ["power", "%"],
  }, {
    id: "A",
    name: "vexArmor", // 龙3 怨怒护甲
    type: "武器",
    dynamicProps: [["伤害", 2.75, 1]],
    parms: ["power", "%"],
  }, {
    id: "m",
    name: "metamorphosis",  // 扶她1 昼夜交替
    type: "武器",
    dynamicProps: [["伤害", 0.25, 1]],
    parms: ["power", "%"],
  }, {
    id: "E",
    name: "eclipse",   // 小丑3 黯然失色
    type: "武器",
    dynamicProps: [["伤害", 2, 1]],
    parms: ["power", "%"],
  },
  // 乘法总伤类
  {
    id: "R",
    name: "roar", // 牛吼
    type: "全域",
    dynamicProps: [["最终伤害", 0.5, 1]],
    parms: ["power", "%"],
  }, {
    id: "M",
    name: "voidStrike", // M蹲 虚空重击
    type: "武器",
    dynamicProps: [["最终伤害", 0.12, 1]],
    parms: ["time", "s"],
  }, {
    id: "N",
    name: "molecularPrime", // nova4 分子填充
    type: "全域",
    props: [["最终伤害", 1]],
  },
  // 附加元素类
  {
    id: "f",
    name: "fireballFrenzy", // 火鸡集团1 狂热火球 火焰伤害
    type: "武器",
    dynamicProps: [["4", 1, 1]],
    parms: ["power", "%"],
  }, {
    id: "2",
    name: "flashAccelerant", // 火鸡集团2 闪耀助燃 火焰伤害
    type: "武器",
    dynamicProps: [["4", 0.5, 1]],
    parms: ["power", "%"],
  }, {
    id: "F",
    name: "freezeForce", // 冰男集团1 寒冰之力 冰冻伤害
    type: "武器",
    dynamicProps: [["5", 1, 1]],
    parms: ["power", "%"],
  }, {
    id: "S",
    name: "shockTrooper", // 电男集团1 电击奇兵 电击伤害
    type: "武器",
    dynamicProps: [["7", 1, 1]],
    parms: ["power", "%"],
  }, {
    id: "O",
    name: "smiteInfusion",   // 奶爸集团1 惩击洗礼 辐射伤害
    type: "武器",
    dynamicProps: [["辐射伤害", 1, 1]],
    parms: ["power", "%"],
  }, {
    id: "D",
    name: "venomDose",   // 毒妈集团1 猛毒附加 腐蚀伤害
    type: "武器",
    dynamicProps: [["腐蚀伤害", 1, 1]],
    parms: ["power", "%"],
  },
  // 复合类
  {
    id: "V",
    name: "electricShield", // 电盾
    type: "远程武器",
    props: [["乘算暴伤", 1]],
    multiLayer: {
      maxStack: 6,
      stackableProps: [["7", 0.5]],
    },
  }, {
    id: "e",
    name: "fireBlast", // 火圈
    type: "远程武器",
    multiLayer: {
      maxStack: 6,
      stackableProps: [["4", 0.5]],
    },
  }, {
    id: "I",
    name: "empoweredQuiver", // 弓妹集团1踩线
    type: "武器",
    dynamicProps: [["乘算暴伤", 1, 1]],
  }, {
    id: "H",
    name: "covenant", // 主教4 庇佑圣约
    type: "武器",
    props: [["加法暴击", 0.5], ["爆头暴击", 1.5]],
  }, {
    id: "L",
    name: "异融",
    type: "远程武器",
    props: [["乘算暴伤", 0.25], ["加法暴击", 0.25], ["最终伤害", -0.333]],
    multiLayer: {
      maxStack: 3,
      unstackableProps: [
        [["7", 1]],
        [["7", 3.666]],
        [["7", 5]],
      ],
    },
  },
];
