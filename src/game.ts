class HitPoints {
  readonly current: number;
  readonly max: number;

  constructor(current: number, max: number) {
    this.max = Math.max(0, max);
    this.current = Math.max(0, Math.min(this.max, current));
  }

  adjust(delta: number): HitPoints {
    return new HitPoints(this.current + delta, this.max);
  }

  setMax(newMax: number): HitPoints {
    return new HitPoints(this.current, newMax);
  }
}

export class SpellSlots {
  readonly totals: number[];
  readonly used: number[];

  constructor(totals: number[], used: number[]) {
    this.totals = [...totals];
    // Ensure used slots do not exceed totals and are not negative
    this.used = this.totals.map((max, i) => Math.max(0, Math.min(max, used[i] || 0)));
  }

  adjust(level: number, delta: number): SpellSlots {
    if (level < 0 || level >= this.totals.length) return this;
    const newUsed = [...this.used];
    newUsed[level] += delta;
    return new SpellSlots(this.totals, newUsed);
  }

  setTotal(level: number, total: number): SpellSlots {
    if (level < 0) return this;
    const newTotals = [...this.totals];
    while (newTotals.length <= level) newTotals.push(0);
    newTotals[level] = total;
    return new SpellSlots(newTotals, this.used);
  }

  setLevels(count: number): SpellSlots {
    const newTotals = this.totals.slice(0, count);
    const newUsed = this.used.slice(0, count);
    while (newTotals.length < count) newTotals.push(0);
    while (newUsed.length < count) newUsed.push(0);
    return new SpellSlots(newTotals, newUsed);
  }
}

export type GameState = {
  hp: HitPoints;
  spells: SpellSlots;
};

const DEFAULT_SPELL_SLOTS = [4, 3, 3, 3, 1, 0, 0, 0, 0];
const DEFAULT_USED_SLOTS = [0, 0, 0, 0, 0, 0, 0, 0, 0];

export function createInitialState(): GameState {
  const maxHP = Number(localStorage.getItem('maxHP')) || 40;
  const currentHP = Number(localStorage.getItem('currentHP')) || maxHP;
  const hp = new HitPoints(currentHP, maxHP);

  let spellSlots = DEFAULT_SPELL_SLOTS;
  let usedSlots = DEFAULT_USED_SLOTS;

  try {
    const storedSpellSlots = localStorage.getItem('spellSlots');
    const storedUsedSlots = localStorage.getItem('usedSlots');
    if (storedSpellSlots) spellSlots = JSON.parse(storedSpellSlots);
    if (storedUsedSlots) usedSlots = JSON.parse(storedUsedSlots);
  } catch (e) {
    console.error('Failed to load game state from localStorage', e);
  }

  return { hp, spells: new SpellSlots(spellSlots, usedSlots) };
}

export function saveState(state: GameState) {
  localStorage.setItem('maxHP', String(state.hp.max));
  localStorage.setItem('currentHP', String(state.hp.current));
  localStorage.setItem('spellSlots', JSON.stringify(state.spells.totals));
  localStorage.setItem('usedSlots', JSON.stringify(state.spells.used));
}

export function updateHP(state: GameState, delta: number): GameState {
  return { ...state, hp: state.hp.adjust(delta) };
}

export function setMaxHP(state: GameState, maxHP: number): GameState {
  return { ...state, hp: state.hp.setMax(maxHP) };
}

export function updateSpellSlot(state: GameState, level: number, delta: number): GameState {
  return { ...state, spells: state.spells.adjust(level, delta) };
}

export function setSpellSlotTotal(state: GameState, level: number, total: number): GameState {
  return { ...state, spells: state.spells.setTotal(level, total) };
}

export function setSpellLevels(state: GameState, levels: number): GameState {
  return { ...state, spells: state.spells.setLevels(levels) };
}
