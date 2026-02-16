import './style.css';
import { Game } from './game';
import type { SpellLevel } from './game/spellslots';

const app = document.querySelector<HTMLDivElement>('#app')!;
const game: Game = Game.createInitial();

function render() {
  app.innerHTML = `
    <div class="container">
      <h1>DND Companion</h1>
      <button id="configure-top" class="top-config-btn">Configure</button>
      
      <div class="hp-section">
        <h2>HP</h2>
        <div class="hp-controls">
          <button id="hp-minus">-</button>
          <span id="hp-display">${game.state.health.current} / ${game.state.health.maximum}</span>
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
            ${game.state.spellSlots.levels.map((level: SpellLevel, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${level.total}</td>
                <td>
                  <span class="slot-used ${level.used >= level.total ? 'depleted' : ''}">
                    ${level.used}
                  </span>
                </td>
                <td>
                  <button class="slot-btn slot-minus" data-level="${i + 1}" ${level.used <= 0 ? 'disabled' : ''}>Regain</button>
                  <button class="slot-btn slot-plus" data-level="${i + 1}" ${level.used >= level.total ? 'disabled' : ''}>Cast</button>
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
            <input type="number" min="1" value="${game.state.health.maximum}" id="max-hp-input" />
          </div>

          <div class="config-row">
            <label>Spell Levels:</label>
            <input type="number" min="1" max="9" value="${game.state.spellSlots.levels.length}" id="levels-input" />
          </div>

          <h4>Spell Slot Totals</h4>
          <div class="config-slots-grid">
            ${game.state.spellSlots.levels.map((level, i) => `
              <div class="config-slot-item">
                <label>Lvl ${i + 1}</label>
                <input type="number" min="0" value="${level.total}" class="config-slot-total" data-level="${i}" />
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
    game.damage(1)
    game.save();
    render();
  };

  document.getElementById('hp-plus')!.onclick = () => {
    game.heal(1);
    game.save();
    render();
  };

  document.querySelectorAll('.slot-minus').forEach(btn => {
    (btn as HTMLButtonElement).onclick = () => {
      const level = Number((btn as HTMLElement).dataset.level);
      
      game.regainSpellSlot(level);
      game.save();
      render();
    };
  });

  document.querySelectorAll('.slot-plus').forEach(btn => {
    (btn as HTMLButtonElement).onclick = () => {
      const level = Number((btn as HTMLElement).dataset.level);

      game.cast(level);
      game.save();
      render();
    };
  });

  document.getElementById('configure-top')!.onclick = () => {
    const section = document.querySelector('.config-section') as HTMLElement;

    section.style.display = 'flex';
  };

  const maximumHealthInput = document.getElementById('max-hp-input') as HTMLInputElement;

  maximumHealthInput.onchange = () => {
    game.setMaximumHealth(Number(maximumHealthInput.value))
    render();

    (document.querySelector('.config-section') as HTMLElement).style.display = 'flex';
  };

  const levelsInput = document.getElementById('levels-input') as HTMLInputElement;

  levelsInput.onchange = () => {
    game.setSpellLevels(Number(levelsInput.value));
    render();

    (document.querySelector('.config-section') as HTMLElement).style.display = 'flex';
  };

  document.querySelectorAll('.config-slot-total').forEach(input => {
    (input as HTMLInputElement).onchange = () => {
      const level = Number((input as HTMLElement).dataset.level);
      const value = Number((input as HTMLInputElement).value);

      game.setTotalSpellSlots(level, value);
      render();

      (document.querySelector('.config-section') as HTMLElement).style.display = 'flex';
    };
  });

  document.getElementById('save-config')!.onclick = () => {
    game.save();

    const section = document.querySelector('.config-section') as HTMLElement;
    section.style.display = 'none';
  };
}

render();