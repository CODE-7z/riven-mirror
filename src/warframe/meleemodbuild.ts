import { RivenMod, ModBuild, NormalMod, MeleeWeapon, NormalModDatabase, Enemy, Arcane } from "@/warframe";
import { hAccMul, hAccSum } from "@/warframe/util";

export enum MeleeCompareMode {
  TotalDamage,  // 平砍DPH
  SlideDamage,  // 滑砍DPH
  TotalDamagePS,// 平砍DPS
  SlideDamagePS,// 滑砍DPS
}
export interface MeleeModBuildOptions {
  compareMode?: MeleeCompareMode
  comboLevel?: number
  allowElementTypes?: string[]
  isUseFury?: boolean
  isUseStrike?: boolean
  extraBaseDamage?: number
  extraOverall?: number
  arcanes?: Arcane[]
  target?: Enemy
}

export class MeleeModBuild extends ModBuild {
  weapon: MeleeWeapon
  // 属性增幅器
  private _rangeMul = 1;
  private _chargeMulMul = 1;
  private _chargeEffMul = 1;
  private _comboDurationAdd = 0;
  private _slideCritChanceAdd = 0;
  private _execDmgMul = 1;
  private _comboCritChanceMul = 0;
  private _comboProcChanceMul = 0;
  private _stealthDamageMul = 0;
  private _finalSpeedMul = 1;

  /** 范围增幅倍率 */
  get rangeMul() { return this._rangeMul; }
  /** 导引倍率增幅倍率 */
  get chargeMulMul() { return this._chargeMulMul; }
  /** 导引效率增幅倍率 */
  get chargeEffMul() { return this._chargeEffMul; }
  /** 连击时间增值 */
  get comboDurationAdd() { return this._comboDurationAdd; }
  /** 滑行暴击增值 */
  get slideCritChanceAdd() { return this._slideCritChanceAdd; }
  /** 处决伤害增幅倍率 */
  get execDmgMul() { return this._execDmgMul < 0 ? 0 : this._execDmgMul; }
  /** 连击数增加暴击率 */
  get comboCritChanceMul() { return this.weapon.tags.includes("Exalted") ? 0 : this._comboCritChanceMul; }
  /** 连击数增加触发率 */
  get comboProcChanceMul() { return this.weapon.tags.includes("Exalted") ? 0 : this._comboProcChanceMul; }
  /** 偷袭伤害 */
  get stealthDamageMul() { return this._stealthDamageMul < 0 ? 0 : this._stealthDamageMul; }
  /** 最终攻速(狂战士) */
  get finalSpeedMul() { return this._finalSpeedMul; }

  // 额外参数
  /** 异况触发量 */
  statusCount = 2;

  constructor(weapon: MeleeWeapon = null, riven: RivenMod = null, options: MeleeModBuildOptions = null) {
    super(riven);
    if (this.weapon = weapon) {
      this.avaliableMods = NormalModDatabase.filter(v => this.weapon.tags.concat([this.rivenWeapon.id]).includes(v.type));
    }
    if (options) {
      this.options = options;
    }
  }

  set options(options: MeleeModBuildOptions) {
    this.compareMode = typeof options.compareMode !== "undefined" ? options.compareMode : this.compareMode;
    this.comboLevel = typeof options.comboLevel !== "undefined" ? options.comboLevel : this.comboLevel;
    this.allowElementTypes = typeof options.allowElementTypes !== "undefined" ? options.allowElementTypes : this.allowElementTypes;
    this.extraBaseDamage = typeof options.extraBaseDamage !== "undefined" ? options.extraBaseDamage : this.extraBaseDamage;
    this.extraOverall = typeof options.extraOverall !== "undefined" ? options.extraOverall : this.extraOverall;
    this.arcanes = typeof options.arcanes !== "undefined" ? options.arcanes : this.arcanes;
    this.target = typeof options.target !== "undefined" ? options.target : this.target;
  }

  get options(): MeleeModBuildOptions {
    return {
      compareMode: this.compareMode,
      comboLevel: this.comboLevel,
      allowElementTypes: this.allowElementTypes,
      extraBaseDamage: this.extraBaseDamage,
      extraOverall: this.extraOverall,
      arcanes: this.arcanes,
      target: this.target,
    };
  }

  /**
   * 生成伤害时间线
   *
   * @param {number} [timeLimit=10]
   * @returns {EnemyTimelineState[]} 敌人时间线
   * @memberof GunModBuild
   */
  getTimeline(timeLimit = 10) {
    // TODO
    return [];
  }

  // ### 计算属性 ###

  /** 连击倍率 */
  get comboMul() {
    if (this.weapon.id === "Venka Prime")
      return this.comboLevel * 0.75 + 1;
    else
      return this.comboLevel * 0.5 + 1;
  }
  /** 连击数增加暴击率 */
  get comboCritChance() { return this.comboMul > 1 ? 1 + this.comboMul * this.comboCritChanceMul : 1; }
  /** 连击数增加触发率 */
  get comboProcChance() { return this.comboMul > 1 ? this.comboMul * this.comboProcChanceMul : 0; }
  /** [overwrite] 暴击率 */
  get critChance() { return hAccMul(hAccSum(hAccMul(this.weapon.critChance, this.critChanceMul), this.critChanceAdd), this.comboCritChance); }
  /** 滑行暴击率 */
  get slideCritDamage() {
    return hAccSum(hAccMul(this.weapon.critChance, this.critChanceMul), this.critChanceAdd, this.slideCritChanceAdd) * this.comboCritChance
  }
  /** [overwrite] 触发几率 */
  get procChance() {
    let s = this.weapon.status * (this.procChanceMul + this.comboProcChance);
    return s > 1 ? 1 : s < 0 ? 0 : s;
  }
  /** [overwrite] 真实触发几率 */
  get realProcChance() { return this.procChance; }
  /** [overwrite] 攻速增幅倍率 */
  get fireRate() {
    let fr = hAccMul(this.weapon.fireRate, this.fireRateMul, this.finalSpeedMul);
    // 攻速下限
    return fr < 0.05 ? 0.05 : fr;
  }
  /** 滑行平均暴击区增幅倍率 */
  get slideCritDamageMul() { return this.calcCritDamage(this.slideCritDamage, this.critMul); }
  /** [overwrite] 总伤增幅倍率 */
  get totalDamageMul() { return hAccMul(this.panelDamageMul, this.critDamageMul, this.overallMul, this.comboMul); }
  /** [overwrite] 总伤害 */
  get totalDamage() { return hAccMul(this.originalDamage, this.totalDamageMul); }
  /** 每秒总伤害 */
  get totalDamagePS() { return hAccMul(this.totalDamage, this.fireRate); }
  /** [overwrite] 原总伤害 */
  get oriTotalDamage() { return hAccMul(this.originalDamage, this.oriCritDamageMul); }
  /** 原每秒总伤害 */
  get oriTotalDamagePS() { return hAccMul(this.oriTotalDamage, this.weapon.fireRate); }
  /** 滑行攻击伤害增幅倍率 */
  get slideDamageMul() { return hAccMul(this.panelDamageMul, this.slideCritDamageMul, this.overallMul, this.comboMul); }
  /** 原滑行攻击伤害 */
  get oriSlideDamage() { return hAccMul(this.weapon.slideDmg, this.oriCritDamageMul); }
  /** 滑行攻击伤害 */
  get slideDamage() { return hAccMul(this.weapon.slideDmg, this.slideDamageMul); }
  /** 原每秒滑行攻击伤害 */
  get oriSlideDamagePS() { return hAccMul(this.oriSlideDamage, this.weapon.fireRate); }
  /** 每秒滑行攻击伤害 */
  get slideDamagePS() { return hAccMul(this.slideDamage, this.fireRate); }
  /** 面板滑行伤害 */
  get panelSlideDamage() { return hAccMul(this.weapon.slideDmg, this.panelDamageMul); }
  /** [overwrite] 用于比较的伤害 */
  get compareDamage() {
    switch (this.compareMode) {
      case MeleeCompareMode.TotalDamage: return this.totalDamage;
      case MeleeCompareMode.SlideDamage: return this.slideDamage;
      default: case MeleeCompareMode.TotalDamagePS: return this.totalDamagePS;
      case MeleeCompareMode.SlideDamagePS: return this.slideDamagePS;
    }
  }

  // ### 基类方法 ###

  /**
   * [overwrite] 计算暴击伤害 (近战偷袭)
   * @param m 暴击率
   * @param n 暴击倍率
   * @param p 爆头几率 [=0]
   * @param v 爆头倍率 [=2]
   * @param s 偷袭倍率 [=0]
   */
  calcCritDamage(m: number, n: number, p = 0, v = 2, s = 0) {
    if (v != 2)
      return ((1 + (1 - v) * p) * (hAccMul(m, n - 1) + 1) + m * n * p * v) / (p + 1) + s;
    if (p != 0)
      return hAccMul(m, n - 1) + 1 + 2 * m * n * p / (p + 1) + s;
    return hAccMul(m, n - 1) + s + 1;
  }

  /** [overwrite] 检测当前MOD是否可用 */
  isValidMod(mod: NormalMod) {
    if (!super.isValidMod(mod))
      return false;
    if ("sacrificialPressure" === mod.id && this._mods.some(v => v.id === "primedPressurePoint")
      || "primedPressurePoint" === mod.id && this._mods.some(v => v.id === "sacrificialPressure"))
      return false;
    return true;
  }

  /** [overwrite] 重置所有属性增幅器 */
  reset() {
    super.reset();
    this._rangeMul = 1;
    this._chargeMulMul = 1;
    this._chargeEffMul = 1;
    this._comboDurationAdd = 0;
    this._slideCritChanceAdd = 0;
    this._execDmgMul = 1;
    this._comboCritChanceMul = 0;
    this._comboProcChanceMul = 0;
    this._stealthDamageMul = 0;
    this._finalSpeedMul = 1;
  }

  /**
   * [overwrite] 应用通用属性
   * @param mod MOD
   * @param pName 属性id或名称
   * @param pValue 属性值
   */
  applyProp(mod: NormalMod | Arcane, pName: string, pValue: number) {
    switch (pName) {
      case 'K': /* 近战伤害 baseDmg */ this._baseDamageMul += pValue; break;
      case 'T': /* 攻击范围 range */ this._rangeMul += pValue; break;
      case 'J': /* 攻击速度 attackSpeed */ this._fireRateMul += pValue; break;
      case 'B': /* 导引伤害 chargeMul */ this._chargeMulMul += pValue; break;
      case 'U': /* 导引效率 chargeEff */ this._chargeEffMul += pValue; break;
      case 'N': /* 连击持续时间 comboDuration */ this._comboDurationAdd += pValue; break;
      case 'E': /* 滑行攻击造成暴击几率 slideCritChance */ this._slideCritChanceAdd += pValue; break;
      case 'X': /* 处决伤害 execDmg */ this._execDmgMul += pValue; break;
      case '连击数增加暴击率': this._comboCritChanceMul += pValue; break;
      case '连击数增加触发率': this._comboProcChanceMul += pValue; break;
      case '偷袭伤害': this._stealthDamageMul += pValue; break;
      case '最终攻速': this._finalSpeedMul = hAccMul(this._finalSpeedMul, 1 + pValue); break;
      default:
        super.applyProp(mod, pName, pValue); break;
    }
  }
}
