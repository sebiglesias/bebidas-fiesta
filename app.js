// Calculadora de Bebidas, Alcohol e Hielo para Fiestas y Eventos
// Fórmulas de catering gastronómico profesional

const PRESETS = {
  previa: {
    name: 'Previa / Cumpleaños con Amigos (20p)',
    drinkers: 20,
    nonDrinkers: 3,
    hours: 5,
    climate: 'summer',
    categories: { beer: true, wine: false, spirits: true, champagne: false, soda: true, ice: true }
  },
  casamiento: {
    name: 'Casamiento / Fiesta de 15 (100p)',
    drinkers: 80,
    nonDrinkers: 20,
    hours: 8,
    climate: 'summer',
    categories: { beer: true, wine: true, spirits: true, champagne: true, soda: true, ice: true }
  },
  asado: {
    name: 'Asado Tradicional (15p)',
    drinkers: 12,
    nonDrinkers: 3,
    hours: 6,
    climate: 'winter',
    categories: { beer: true, wine: true, spirits: true, champagne: false, soda: true, ice: true }
  },
  familiar: {
    name: 'Cena Familiar / Brindis (15p)',
    drinkers: 10,
    nonDrinkers: 5,
    hours: 4,
    climate: 'winter',
    categories: { beer: false, wine: true, spirits: false, champagne: true, soda: true, ice: true }
  }
};

let state = {
  drinkers: 20,
  nonDrinkers: 4,
  hours: 5,
  climate: 'summer', // 'summer' or 'winter'
  categories: {
    beer: true,
    wine: true,
    spirits: true,
    champagne: false,
    soda: true,
    ice: true
  }
};

function calculateDrinks() {
  const drinkers = parseInt(state.drinkers, 10) || 0;
  const nonDrinkers = parseInt(state.nonDrinkers, 10) || 0;
  const totalGuests = drinkers + nonDrinkers;

  // Duration factor: 3h -> 0.75, 5h -> 1.0, 8h -> 1.45
  let durationFactor = 1.0;
  if (state.hours <= 3) durationFactor = 0.75;
  else if (state.hours >= 8) durationFactor = 1.45;
  else if (state.hours >= 6) durationFactor = 1.2;

  // Climate factor
  const isSummer = state.climate === 'summer';
  const beerClimate = isSummer ? 1.25 : 0.85;
  const wineClimate = isSummer ? 0.8 : 1.3;
  const iceClimate = isSummer ? 1.35 : 0.9;
  const waterClimate = isSummer ? 1.25 : 1.0;

  // Active categories count among alcoholic options to distribute preferences
  let activeAlcoholCount = 0;
  if (state.categories.beer) activeAlcoholCount++;
  if (state.categories.wine) activeAlcoholCount++;
  if (state.categories.spirits) activeAlcoholCount++;

  // Variety share modifier: if party has only beer, they drink 100% beer; if all 3, they drink ~40% beer, ~30% wine, ~30% spirits
  let beerShare = 0.45;
  let wineShare = 0.35;
  let spiritsShare = 0.35;

  if (activeAlcoholCount === 1) {
    beerShare = 1.0;
    wineShare = 0.85;
    spiritsShare = 0.85;
  } else if (activeAlcoholCount === 2) {
    beerShare = 0.65;
    wineShare = 0.55;
    spiritsShare = 0.55;
  }

  // 1. BEER:
  // Base: ~1.4 Litros per drinker in 5h
  let beerLitres = 0;
  let beerCans = 0;
  if (state.categories.beer && drinkers > 0) {
    beerLitres = drinkers * 1.4 * durationFactor * beerClimate * beerShare;
    beerCans = Math.ceil(beerLitres / 0.473); // latas de 473ml
  }

  // 2. WINE (Tinto y Blanco 750ml):
  // Base: 1 botella cada 2 personas en cena
  let wineBottles = 0;
  if (state.categories.wine && drinkers > 0) {
    wineBottles = Math.ceil((drinkers * 0.5) * durationFactor * wineClimate * wineShare);
  }

  // 3. SPIRITS (Fernet, Gin, Vodka):
  // 1 botella cada 5 bebedores en 5h
  let spiritsBottles = 0;
  let colaBottles = 0; // Botellas de Coca 2.25L para fernet/tragos
  let tonicBottles = 0; // Botellas tónica 1.5L
  if (state.categories.spirits && drinkers > 0) {
    spiritsBottles = Math.ceil((drinkers / 4.5) * durationFactor * spiritsShare);
    // Para Fernet y tragos largos: 2.25L Coca-Cola cada 750ml fernet
    colaBottles = Math.ceil(spiritsBottles * 1.2);
    tonicBottles = Math.ceil(spiritsBottles * 0.8);
  }

  // 4. CHAMPAGNE / BRINDIS (750ml):
  // 1 botella rinde 6 copas
  let champagneBottles = 0;
  if (state.categories.champagne && totalGuests > 0) {
    champagneBottles = Math.ceil(totalGuests / 5.5);
  }

  // 5. GASEOSAS Y AGUAS (Non-drinkers + hydration):
  let sodaBottles2L = 0;
  let waterBottles2L = 0;
  if (state.categories.soda && totalGuests > 0) {
    // Non-drinkers consume 1.2L per person
    // Drinkers consume 0.5L water/soda for hydration
    const totalNonAlcLitres = (nonDrinkers * 1.2 + drinkers * 0.5) * durationFactor * waterClimate;
    sodaBottles2L = Math.ceil((totalNonAlcLitres * 0.6) / 2.0) + colaBottles;
    waterBottles2L = Math.ceil((totalNonAlcLitres * 0.4) / 2.0);
  }

  // 6. ICE (Bolsas de 4 kg):
  // Tragos en vaso (~0.4kg/p) + enfriar latas y botellas en bacha/frapera (~0.8kg/p)
  let iceKg = 0;
  let iceBags = 0;
  if (state.categories.ice && totalGuests > 0) {
    iceKg = totalGuests * 1.1 * durationFactor * iceClimate;
    iceBags = Math.ceil(iceKg / 4.0);
  }

  // Total estimated beverage litres
  const totalLitres = (beerCans * 0.473) + (wineBottles * 0.75) + (spiritsBottles * 0.75) +
                      (champagneBottles * 0.75) + (sodaBottles2L * 2.0) + (waterBottles2L * 2.0);

  return {
    totalGuests,
    drinkers,
    nonDrinkers,
    beerCans,
    beerLitres: beerCans * 0.473,
    wineBottles,
    spiritsBottles,
    colaBottles,
    champagneBottles,
    sodaBottles2L,
    waterBottles2L,
    iceBags,
    iceKg: iceBags * 4,
    totalLitres
  };
}

function updateUI() {
  const r = calculateDrinks();

  // Hero metrics
  const heroLitres = document.getElementById('hero-litres');
  const heroIce = document.getElementById('hero-ice');
  if (heroLitres) heroLitres.textContent = Math.round(r.totalLitres) + ' L';
  if (heroIce) heroIce.textContent = r.iceBags + ' bolsas';

  // Shopping list cards
  const cardBeer = document.getElementById('card-beer');
  const cardWine = document.getElementById('card-wine');
  const cardSpirits = document.getElementById('card-spirits');
  const cardChampagne = document.getElementById('card-champagne');
  const cardSoda = document.getElementById('card-soda');
  const cardWater = document.getElementById('card-water');
  const cardIce = document.getElementById('card-ice');

  const valBeer = document.getElementById('val-beer');
  const valWine = document.getElementById('val-wine');
  const valSpirits = document.getElementById('val-spirits');
  const valChampagne = document.getElementById('val-champagne');
  const valSoda = document.getElementById('val-soda');
  const valWater = document.getElementById('val-water');
  const valIce = document.getElementById('val-ice');

  if (cardBeer) cardBeer.style.display = state.categories.beer ? 'flex' : 'none';
  if (cardWine) cardWine.style.display = state.categories.wine ? 'flex' : 'none';
  if (cardSpirits) cardSpirits.style.display = state.categories.spirits ? 'flex' : 'none';
  if (cardChampagne) cardChampagne.style.display = state.categories.champagne ? 'flex' : 'none';
  if (cardSoda) cardSoda.style.display = state.categories.soda ? 'flex' : 'none';
  if (cardWater) cardWater.style.display = state.categories.soda ? 'flex' : 'none';
  if (cardIce) cardIce.style.display = state.categories.ice ? 'flex' : 'none';

  if (valBeer) valBeer.textContent = `${r.beerCans} latas (${r.beerLitres.toFixed(1)}L)`;
  if (valWine) valWine.textContent = `${r.wineBottles} botellas`;
  if (valSpirits) valSpirits.textContent = `${r.spiritsBottles} botellas (750ml)`;
  if (valChampagne) valChampagne.textContent = `${r.champagneBottles} botellas`;
  if (valSoda) valSoda.textContent = `${r.sodaBottles2L} botellas (2L)`;
  if (valWater) valWater.textContent = `${r.waterBottles2L} botellas (2L)`;
  if (valIce) valIce.textContent = `${r.iceBags} bolsas de 4kg (${r.iceKg}kg)`;

  // Sticky Mobile Bar
  const stickyLitres = document.getElementById('sticky-litres');
  const stickyIce = document.getElementById('sticky-ice');
  if (stickyLitres) stickyLitres.textContent = Math.round(r.totalLitres) + ' Litros';
  if (stickyIce) stickyIce.textContent = `${r.iceBags} bolsas hielo (${r.totalGuests} pers)`;

  saveState();
}

function applyPreset(presetKey) {
  const p = PRESETS[presetKey];
  if (!p) return;

  state.drinkers = p.drinkers;
  state.nonDrinkers = p.nonDrinkers;
  state.hours = p.hours;
  state.climate = p.climate;
  state.categories = Object.assign({}, p.categories);

  const drinkersInput = document.getElementById('input-drinkers');
  const nonDrinkersInput = document.getElementById('input-nondrinkers');
  if (drinkersInput) drinkersInput.value = p.drinkers;
  if (nonDrinkersInput) nonDrinkersInput.value = p.nonDrinkers;

  document.querySelectorAll('.btn-hours').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.getAttribute('data-hours'), 10) === p.hours);
  });

  document.querySelectorAll('.btn-climate').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-climate') === p.climate);
  });

  // Checkboxes
  Object.keys(p.categories).forEach(cat => {
    const chk = document.getElementById(`chk-${cat}`);
    if (chk) chk.checked = p.categories[cat];
  });

  updateUI();
}

function shareShoppingList() {
  const r = calculateDrinks();
  const climateStr = state.climate === 'summer' ? '☀️ Verano / Cálido' : '❄️ Invierno / Templado';

  let text = `🍻 Lista de Compra de Bebidas para Fiesta\n`;
  text += `---------------------------------\n`;
  text += `👥 Invitados: ${r.totalGuests} personas (${r.drinkers} toman alcohol, ${r.nonDrinkers} sin alcohol)\n`;
  text += `⏱️ Duración: ${state.hours} horas | Clima: ${climateStr}\n`;
  text += `📦 Total estimado: ~${Math.round(r.totalLitres)} Litros\n\n`;
  text += `🛒 Para comprar en Distribuidora / Supermercado:\n`;

  if (state.categories.beer) text += `• Cerveza: ${r.beerCans} latas de 473ml (o ~${Math.ceil(r.beerCans / 24)} packs de 24)\n`;
  if (state.categories.wine) text += `• Vino (Tinto/Blanco): ${r.wineBottles} botellas de 750ml\n`;
  if (state.categories.spirits) text += `• Destilados / Fernet / Gin: ${r.spiritsBottles} botellas de 750ml\n`;
  if (state.categories.champagne) text += `• Champán / Espumante brindis: ${r.champagneBottles} botellas\n`;
  if (state.categories.soda) {
    text += `• Gaseosas (Cola/Lima): ${r.sodaBottles2L} botellas de 2L\n`;
    text += `• Agua mineral / Soda: ${r.waterBottles2L} botellas de 2L\n`;
  }
  if (state.categories.ice) text += `• Hielo rolito: ${r.iceBags} bolsas de 4kg (${r.iceKg} kg)\n`;

  text += `\nCalculado en: https://sebiglesias.com.ar/bebidas-fiesta/`;

  if (navigator.share) {
    navigator.share({
      title: 'Lista de Bebidas para Fiesta',
      text: text,
      url: 'https://sebiglesias.com.ar/bebidas-fiesta/'
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const shareBtn = document.getElementById('btn-share');
      if (shareBtn) {
        const orig = shareBtn.innerHTML;
        shareBtn.innerHTML = '✓ ¡Copiado al portapapeles!';
        setTimeout(() => shareBtn.innerHTML = orig, 2500);
      }
    });
  }
}

function saveState() {
  try {
    localStorage.setItem('bebidas_fiesta_state', JSON.stringify(state));
  } catch (e) {}
}

function loadState() {
  try {
    const saved = localStorage.getItem('bebidas_fiesta_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      state = Object.assign(state, parsed);
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  loadState();

  const drinkersInput = document.getElementById('input-drinkers');
  const nonDrinkersInput = document.getElementById('input-nondrinkers');

  if (drinkersInput) {
    drinkersInput.value = state.drinkers;
    drinkersInput.addEventListener('input', (e) => {
      state.drinkers = parseInt(e.target.value, 10) || 0;
      updateUI();
    });
  }

  if (nonDrinkersInput) {
    nonDrinkersInput.value = state.nonDrinkers;
    nonDrinkersInput.addEventListener('input', (e) => {
      state.nonDrinkers = parseInt(e.target.value, 10) || 0;
      updateUI();
    });
  }

  // Hours buttons
  document.querySelectorAll('.btn-hours').forEach(btn => {
    if (parseInt(btn.getAttribute('data-hours'), 10) === state.hours) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-hours').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.hours = parseInt(btn.getAttribute('data-hours'), 10) || 5;
      updateUI();
    });
  });

  // Climate buttons
  document.querySelectorAll('.btn-climate').forEach(btn => {
    if (btn.getAttribute('data-climate') === state.climate) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-climate').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.climate = btn.getAttribute('data-climate');
      updateUI();
    });
  });

  // Checkboxes
  ['beer', 'wine', 'spirits', 'champagne', 'soda', 'ice'].forEach(cat => {
    const chk = document.getElementById(`chk-${cat}`);
    if (chk) {
      chk.checked = !!state.categories[cat];
      chk.addEventListener('change', (e) => {
        state.categories[cat] = e.target.checked;
        updateUI();
      });
    }
  });

  // Presets
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      applyPreset(chip.getAttribute('data-preset'));
    });
  });

  // Buttons
  const shareBtn = document.getElementById('btn-share');
  if (shareBtn) shareBtn.addEventListener('click', shareShoppingList);

  const printBtn = document.getElementById('btn-print');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  const stickyBtn = document.getElementById('sticky-share-btn');
  if (stickyBtn) stickyBtn.addEventListener('click', shareShoppingList);

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeBtn.textContent = currentTheme === 'light' ? '🌙' : '☀️';

    themeBtn.addEventListener('click', () => {
      const now = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', now);
      localStorage.setItem('theme', now);
      themeBtn.textContent = now === 'light' ? '🌙' : '☀️';
    });
  }

  updateUI();

  // Register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
