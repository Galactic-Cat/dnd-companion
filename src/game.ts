export class HitPoints {
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

export type SlotGroup = {
  readonly total: number;
  readonly used: number;
};

export class SpellSlots {
  readonly levels: ReadonlyArray<SlotGroup>;

  constructor(levels: SlotGroup[]) {
    this.levels = levels.map((slot) => ({
      total: Math.max(0, slot.total),
      used: Math.max(0, Math.min(slot.total, slot.used)),
    }));
  }

  cast(levelIdx: number): SpellSlots {
    return this.adjustUsed(levelIdx, 1);
  }

  regain(levelIdx: number): SpellSlots {
    return this.adjustUsed(levelIdx, -1);
  }

  adjust(levelIdx: number, delta: number): SpellSlots {
    return this.adjustUsed(levelIdx, delta);
  }

  setTotal(levelIdx: number, total: number): SpellSlots {
    if (levelIdx < 0) return this;
    
    const newLevels = this.padLevels(Math.max(this.levels.length, levelIdx + 1));
    
    newLevels[levelIdx] = { ...newLevels[levelIdx], total };
    
    return new SpellSlots(newLevels);
  }

  setLevels(count: number): SpellSlots {
    return new SpellSlots(this.padLevels(count).slice(0, count));
  }

  private adjustUsed(levelIdx: number, delta: number): SpellSlots {
    if (levelIdx < 0 || levelIdx >= this.levels.length) return this;

    const newLevels = [...this.levels];
    const current = newLevels[levelIdx];

    newLevels[levelIdx] = {
      ...current,
      used: current.used + delta, 
      // Note: The constructor will clamp this value automatically
    };

    return new SpellSlots(newLevels);
  }

  private padLevels(count: number): SlotGroup[] {
    const newLevels = [...this.levels];
    while (newLevels.length < count) {
      newLevels.push({ total: 0, used: 0 });
    }
    return newLevels;
  }
}

export type GameState = {
  hp: HitPoints;
  spells: SpellSlots;
};

const DEFAULT_SLOTS: SlotGroup[] = [
  { total: 4, used: 0 }, { total: 3, used: 0 },
];

export function createInitialState(): GameState {
  const maxHP = Number(localStorage.getItem('maxHP')) || 40;
  const currentHP = Number(localStorage.getItem('currentHP')) || maxHP;

  let spellSlots = DEFAULT_SLOTS;

  try {
    const stored = localStorage.getItem('spellSlots');
    if (stored) {
      spellSlots = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load spell slots, reverting to default', e);
  }

  return {
    hp: new HitPoints(currentHP, maxHP),
    spells: new SpellSlots(spellSlots),
  };
}

export function saveState(state: GameState) {
  localStorage.setItem('maxHP', String(state.hp.max));
  localStorage.setItem('currentHP', String(state.hp.current));
  localStorage.setItem('spellSlots', JSON.stringify(state.spells.levels));
}

export function updateHP(state: GameState, delta: number): GameState {
  return { ...state, hp: state.hp.adjust(delta) };
}

export function setMaxHP(state: GameState, maxHP: number): GameState {
  return { ...state, hp: state.hp.setMax(maxHP) };
}

export function castSpell(state: GameState, level: number): GameState {
  return { ...state, spells: state.spells.cast(level) };
}

export function regainSpell(state: GameState, level: number): GameState {
    return { ...state, spells: state.spells.regain(level) };
}

export function setSpellSlotTotal(state: GameState, level: number, total: number): GameState {
  return { ...state, spells: state.spells.setTotal(level, total) };
}

export function setSpellLevels(state: GameState, levels: number): GameState {
  return { ...state, spells: state.spells.setLevels(levels) };
}