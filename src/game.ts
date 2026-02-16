import { SpellSlots, type SpellLevel } from './game/spellslots';
import type { State } from './game/state'

import { Health } from './game/health';

const DEFAULT_SLOTS: SpellLevel[] = [
  { total: 4, used: 0 }, { total: 3, used: 0 },
];

export class Game {
  private _state: State

  public get state(): State {
    return this._state
  }

  public constructor(state: State) {
    this._state = state
  }

  public cast(level: number) {
    this._state.spellSlots = this._state.spellSlots.cast(level)
  }

  public damage(delta: number): void {
    this._state.health = this._state.health.decrease(delta)
  }

  public heal(delta: number): void {
    this._state.health = this._state.health.increase(delta)
  }

  public regainSpellSlot(level: number): void {
    this._state.spellSlots = this._state.spellSlots.regain(level)
  }

  public save(): void {
    localStorage.setItem('currentHealth', this.state.health.current.toString())
    localStorage.setItem('maximumHealth', this.state.health.maximum.toString())
    localStorage.setItem('spellSlots', JSON.stringify(this.state.spellSlots.levels))
  }

  public setMaximumHealth(value: number): void {
    this._state.health = this._state.health.setMaximum(value)
  }

  public setSpellLevels(levels: number): void {
    this._state.spellSlots = this._state.spellSlots.setLevels(levels)
  }

  public setTotalSpellSlots(level: number, total: number): void {
    this._state.spellSlots = this._state.spellSlots.setTotal(level, total)
  }

  public static createInitial(): Game {
    const health = new Health(
      Number(localStorage.getItem('currentHealth')) || 40,
      Number(localStorage.getItem('maximumHealth')) || 40,
    )
    
    let spellSlots: SpellSlots

    try {
      const stored = localStorage.getItem('spellSlots')

      if (stored) {
        spellSlots = new SpellSlots(JSON.parse(stored))
      }
    } catch (e) {
      console.warn('Failed to parse stored spell slots, reverting to default', e)
    } finally {
      spellSlots ??= new SpellSlots(DEFAULT_SLOTS)
    }

    return new Game({
      health,
      spellSlots,
    })
  }
}
