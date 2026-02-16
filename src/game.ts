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

export type GameState = {
  hp: HitPoints;
  spellSlots: number[];
  usedSlots: number[];
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

  return { hp, spellSlots, usedSlots };
}

export function saveState(state: GameState) {
  localStorage.setItem('maxHP', String(state.hp.max));
  localStorage.setItem('currentHP', String(state.hp.current));
  localStorage.setItem('spellSlots', JSON.stringify(state.spellSlots));
  localStorage.setItem('usedSlots', JSON.stringify(state.usedSlots));
}

export function updateHP(state: GameState, delta: number): GameState {
  return { ...state, hp: state.hp.adjust(delta) };
}

export function setMaxHP(state: GameState, maxHP: number): GameState {
  return { ...state, hp: state.hp.setMax(maxHP) };
}

export function updateSpellSlot(state: GameState, level: number, delta: number): GameState {
  const used = state.usedSlots.slice();
  used[level] = Math.max(0, Math.min(state.spellSlots[level], used[level] + delta));
  return { ...state, usedSlots: used };
}

export function setSpellSlotTotal(state: GameState, level: number, total: number): GameState {
  const slots = state.spellSlots.slice();
  slots[level] = total;
  const used = state.usedSlots.slice();
  if (used[level] > total) used[level] = total;
  return { ...state, spellSlots: slots, usedSlots: used };
}

export function setSpellLevels(state: GameState, levels: number): GameState {
  const slots = state.spellSlots.slice(0, levels);
  const used = state.usedSlots.slice(0, levels);
  while (slots.length < levels) slots.push(0);
  while (used.length < levels) used.push(0);
  return { ...state, spellSlots: slots, usedSlots: used };
}
