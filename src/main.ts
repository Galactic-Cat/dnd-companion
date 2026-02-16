import './style.css';
import {
  type GameState,
  createInitialState,
  saveState,
  updateHP,
  setMaxHP,
  castSpell,
  regainSpell,
  setSpellSlotTotal,
  setSpellLevels,
  type SlotGroup // Import this if you want explicit typing in maps, optional
} from './game';

const app = document.querySelector<HTMLDivElement>('#app')!;
let state: GameState = createInitialState();

function render() {
  app.innerHTML = `
    <div class="container">
      <h1>DND Companion</h1>
      <button id="configure-top" class="top-config-btn">Configure</button>
      
      <div class="hp-section">
        <h2>HP</h2>
        <div class="hp-controls">
          <button id="hp-minus">-</button>
          <span id="hp-display">${state.hp.current} / ${state.hp.max}</span>
          <button id="hp-plus">+</button>
        </div>
      </div>

      <div class="spell-section">
        <h2>Spell Slots</h2>
        <table class="spell-table">
          <thead>
            <tr>
              <th>Lvl</th>
              <th>Total</th>
              <th>Used</th>
              <th>Cast / Regain</th>
            </tr>
          </thead>
          <tbody>
            ${state.spells.levels.map((slot: SlotGroup, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${slot.total}</td>
                <td>
                  <span class="slot-used ${slot.used >= slot.total ? 'depleted' : ''}">
                    ${slot.used}
                  </span>
                </td>
                <td>
                  <button class="slot-btn slot-minus" data-level="${i}" ${slot.used <= 0 ? 'disabled' : ''}>Regain</button>
                  <button class="slot-btn slot-plus" data-level="${i}" ${slot.used >= slot.total ? 'disabled' : ''}>Cast</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="config-section" style="display:none">
        <div class="config-content">
          <h3>Configure Character</h3>
          
          <div class="config-row">
            <label>Max HP:</label>
            <input type="number" min="1" value="${state.hp.max}" id="max-hp-input" />
          </div>

          <div class="config-row">
            <label>Spell Levels:</label>
            <input type="number" min="1" max="9" value="${state.spells.levels.length}" id="levels-input" />
          </div>

          <h4>Spell Slot Totals</h4>
          <div class="config-slots-grid">
            ${state.spells.levels.map((slot, i) => `
              <div class="config-slot-item">
                <label>Lvl ${i + 1}</label>
                <input type="number" min="0" value="${slot.total}" class="config-slot-total" data-level="${i}" />
              </div>
            `).join('')}
          </div>

          <div class="config-actions">
            <button id="save-config" class="primary">Save & Close</button>
            <button id="close-config">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // --- Event Listeners ---

  // HP Controls
  document.getElementById('hp-minus')!.onclick = () => {
    state = updateHP(state, -1);
    saveState(state);
    render();
  };
  document.getElementById('hp-plus')!.onclick = () => {
    state = updateHP(state, 1);
    saveState(state);
    render();
  };

  document.querySelectorAll('.slot-minus').forEach(btn => {
    (btn as HTMLButtonElement).onclick = () => {
      const level = Number((btn as HTMLElement).dataset.level);
      state = regainSpell(state, level);
      saveState(state);
      render();
    };
  });

  document.querySelectorAll('.slot-plus').forEach(btn => {
    (btn as HTMLButtonElement).onclick = () => {
      const level = Number((btn as HTMLElement).dataset.level);
      state = castSpell(state, level);
      saveState(state);
      render();
    };
  });

  document.getElementById('configure-top')!.onclick = () => {
    const section = document.querySelector('.config-section') as HTMLElement;
    section.style.display = 'flex';
  };

  const hpInput = document.getElementById('max-hp-input') as HTMLInputElement;
  hpInput.onchange = () => {
    state = setMaxHP(state, Number(hpInput.value));
    render(); 
    (document.querySelector('.config-section') as HTMLElement).style.display = 'flex';
  };

  const levelsInput = document.getElementById('levels-input') as HTMLInputElement;
  levelsInput.onchange = () => {
    state = setSpellLevels(state, Number(levelsInput.value));
    render();
    (document.querySelector('.config-section') as HTMLElement).style.display = 'flex';
  };

  document.querySelectorAll('.config-slot-total').forEach(input => {
    (input as HTMLInputElement).onchange = () => {
      const level = Number((input as HTMLElement).dataset.level);
      const val = Number((input as HTMLInputElement).value);
      state = setSpellSlotTotal(state, level, val);
      render();
      (document.querySelector('.config-section') as HTMLElement).style.display = 'flex';
    };
  });

  document.getElementById('save-config')!.onclick = () => {
    saveState(state);
    const section = document.querySelector('.config-section') as HTMLElement;
    section.style.display = 'none';
  };
}

render();