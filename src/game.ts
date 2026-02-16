export type GameState = {
  maxHP: number;
  currentHP: number;
  spellSlots: number[];
  usedSlots: number[];
};

export function createInitialState(): GameState {
  const maxHP = Number(localStorage.getItem('maxHP')) || 40;
  const currentHP = Number(localStorage.getItem('currentHP')) || maxHP;
  const spellSlots = JSON.parse(localStorage.getItem('spellSlots') || '[4,3,3,3,1,0,0,0,0]');
  const usedSlots = JSON.parse(localStorage.getItem('usedSlots') || '[0,0,0,0,0,0,0,0,0]');
  return { maxHP, currentHP, spellSlots, usedSlots };
}

export function saveState(state: GameState) {
  localStorage.setItem('maxHP', String(state.maxHP));
  localStorage.setItem('currentHP', String(state.currentHP));
  localStorage.setItem('spellSlots', JSON.stringify(state.spellSlots));
  localStorage.setItem('usedSlots', JSON.stringify(state.usedSlots));
}

export function updateHP(state: GameState, delta: number): GameState {
  const newHP = Math.max(0, Math.min(state.maxHP, state.currentHP + delta));
  return { ...state, currentHP: newHP };
}

export function setMaxHP(state: GameState, maxHP: number): GameState {
  const newCurrentHP = Math.min(state.currentHP, maxHP);
  return { ...state, maxHP, currentHP: newCurrentHP };
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
