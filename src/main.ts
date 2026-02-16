
import './style.css';
import {
  type GameState,
  createInitialState,
  saveState,
  updateHP,
  setMaxHP,
  updateSpellSlot,
  setSpellSlotTotal,
  setSpellLevels
} from './game';

const app = document.querySelector<HTMLDivElement>('#app')!;
let state: GameState = createInitialState();

function render() {
  app.innerHTML = `
    <h1>DND Companion</h1>
    <button id="configure-top" class="top-config-btn">Configure</button>
    <div class="hp-section">
      <h2>HP</h2>
      <div>
        <button id="hp-minus">-</button>
        <span id="hp-display">${state.hp.current} / ${state.hp.max}</span>
        <button id="hp-plus">+</button>
      </div>
    </div>
    <div class="spell-section">
      <h2>Spell Slots</h2>
      <table class="spell-table">
        <thead><tr><th>Level</th><th>Total</th><th>Used</th><th>Actions</th></tr></thead>
        <tbody>
          ${state.spells.totals.map((total:number, i:number) => `
            <tr>
              <td>${i+1}</td>
              <td>${total}</td>
              <td><span class="slot-used" id="used-${i}">${state.spells.used[i]}</span></td>
              <td>
                <button class="slot-minus" data-level="${i}">-</button>
                <button class="slot-plus" data-level="${i}">+</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="config-section" style="display:none"></div>
  `;

  // HP controls
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

  // Spell slot controls
  document.querySelectorAll('.slot-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const level = Number((btn as HTMLElement).dataset.level);
      state = updateSpellSlot(state, level, -1);
      saveState(state);
      render();
    });
  });
  document.querySelectorAll('.slot-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const level = Number((btn as HTMLElement).dataset.level);
      state = updateSpellSlot(state, level, 1);
      saveState(state);
      render();
    });
  });
  // No slot-total inputs to handle anymore

  // Top configure button
  document.getElementById('configure-top')!.onclick = () => {
    const section = document.querySelector('.config-section') as HTMLElement;
    let configState = { ...state };

    function renderConfig() {
      section.innerHTML = `
        <h3>Configure Companion</h3>
        <label>Max HP: <input type="number" min="1" value="${configState.hp.max}" id="max-hp-input" /></label>
        <label>Spell Levels: <input type="number" min="1" max="9" value="${configState.spells.totals.length}" id="levels-input" /></label>
        <div>
          <h4>Spell Slot Totals</h4>
          ${configState.spells.totals.map((total:number, i:number) => `
            <label>Level ${i+1}: <input type="number" min="0" value="${total}" class="config-slot-total" data-level="${i}" /></label>
          `).join('')}
        </div>
        <button id="save-config">Save</button>
        <button id="close-config">Close</button>
      `;

      // Handle slot total changes
      section.querySelectorAll('.config-slot-total').forEach(input => {
        input.addEventListener('change', () => {
          const level = Number((input as HTMLElement).dataset.level);
          configState = setSpellSlotTotal(configState, level, Number((input as HTMLInputElement).value));
        });
      });
      // Handle max HP change
      document.getElementById('max-hp-input')!.addEventListener('change', (e) => {
        configState = setMaxHP(configState, Number((e.target as HTMLInputElement).value));
        renderConfig();
      });
      // Handle spell levels change
      document.getElementById('levels-input')!.addEventListener('change', (e) => {
        configState = setSpellLevels(configState, Number((e.target as HTMLInputElement).value));
        renderConfig();
      });
      document.getElementById('save-config')!.onclick = () => {
        state = configState;
        saveState(state);
        section.style.display = 'none';
        render();
      };
      document.getElementById('close-config')!.onclick = () => {
        section.style.display = 'none';
      };
    }

    section.style.display = 'block';
    renderConfig();
  };
}

render();
