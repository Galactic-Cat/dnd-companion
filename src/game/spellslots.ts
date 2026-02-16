export type SpellLevel = {
  readonly total: number;
  readonly used: number;
}

export class SpellSlots {
  public readonly levels: ReadonlyArray<SpellLevel>

  public constructor(levels: SpellLevel[]) {
    if (levels.length > 9) {
      levels = levels.slice(0, 9)
    }

    this.levels = levels.map((level) => ({
      total: Math.max(0, level.total),
      used: Math.max(0, Math.min(level.total, level.used)),
    }));
  }

  public adjust(level: number, delta: number): SpellSlots {
    if (level <= 0 || level > 9) {
      return this
    }

    return this.adjustUsed(level, delta)
  }

  public cast(level: number): SpellSlots {
    if ((level <= 0 || level > 9)) {
      return this
    }

    return this.adjustUsed(level - 1, 1)
  }

  public regain(level: number): SpellSlots {
    if ((level <= 0 || level > 9)) {
      return this
    }

    return this.adjustUsed(level - 1, -1)
  }

  public setLevels(count: number): SpellSlots {
    return new SpellSlots(this.padLevels(count).slice(0, count))
  }

  public setTotal(level: number, total: number): SpellSlots {
    if (level <= 0 || level > 9) {
      return this
    }

    const newLevels = this.padLevels(Math.max(this.levels.length, level))

    newLevels[level - 1] = { ...newLevels[level - 1], total }

    return new SpellSlots(newLevels)
  }

  private adjustUsed(levelIndex: number, delta: number): SpellSlots {
    if (levelIndex < 0 || levelIndex >= this.levels.length) {
      return this
    }

    const newLevels = [...this.levels]
    const current = newLevels[levelIndex]

    newLevels[levelIndex] = {
      ...current,
      // Note: used is clamped by constructor
      used: current.used + delta
    }

    return new SpellSlots(newLevels)
  }

  private padLevels(count: number): SpellLevel[] {
    const newLevels = [...this.levels]

    while (newLevels.length < count) {
      newLevels.push({ total: 0, used: 0 })
    }

    return newLevels
  }
}