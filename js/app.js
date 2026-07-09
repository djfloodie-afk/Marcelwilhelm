/**
 * app.js
 * ---------------------------------------------------------------------------
 * Lädt alle Buchdaten aus data/books.json und rendert daraus die komplette
 * Landingpage: Hero, Buch-Grid, Suche, Genre-Filter und Sortierung.
 *
 * Es muss NIE HTML angefasst werden, um ein neues Buch zu veröffentlichen –
 * siehe README.md.
 * ---------------------------------------------------------------------------
 */

// ---------------------------------------------------------------------------
// Zentraler State: hält die geladenen Bücher und den aktuellen Filterzustand
// ---------------------------------------------------------------------------
/**
 * Feature-Schalter: hier kannst du einzelne Elemente ein-/ausblenden,
 * ohne HTML anfassen zu müssen. Einfach true/false umstellen.
 */
const CONFIG = {
  showSearch: false // Suchfeld in der Steuerleiste ein-/ausblenden
};

// ---------------------------------------------------------------------------
// Zentraler State: hält die geladenen Bücher und den aktuellen Filterzustand
// ---------------------------------------------------------------------------
const state = {
  books: [],
  genre: 'all',
  sort: 'new',
  query: ''
};

// ---------------------------------------------------------------------------
// DOM-Referenzen: einmal einsammeln, statt sie überall neu zu suchen
// ---------------------------------------------------------------------------
const els = {
  grid: document.getElementById('book-grid'),
  empty: document.getElementById('empty-state'),
  search: document.getElementById('search-input'),
  genre: document.getElementById('genre-filter'),
  sort: document.getElementById('sort-select'),
  heroTitle: document.getElementById('hero-title'),
  heroSubtitle: document.getElementById('hero-subtitle'),
  heroCta: document.getElementById('hero-cta'),
  template: document.getElementById('book-card-template'),
  ribbon: document.getElementById('ribbon')
};

init();

/** Startpunkt: Daten laden, dann Seite aufbauen. */
async function init() {
  try {
    const response = await fetch('data/books.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.books = await response.json();
  } catch (error) {
    console.error('books.json konnte nicht geladen werden:', error);
    els.grid.innerHTML = '<p class="empty-state">Die Bücher konnten leider nicht geladen werden.</p>';
    return;
  }

  populateGenreFilter();
  applyFeatureToggles();
  renderHero();
  applyFilters();
  bindEvents();
  initScrollEffects();
}

// ---------------------------------------------------------------------------
// Genre-Filter automatisch aus den vorhandenen Büchern befüllen.
// Neues Genre in books.json -> taucht hier automatisch auf, kein Code nötig.
// ---------------------------------------------------------------------------
function applyFeatureToggles() {
  const searchWrapper = els.search.closest('.control-search');
  if (searchWrapper) {
    searchWrapper.style.display = CONFIG.showSearch ? '' : 'none';
  }
}
function populateGenreFilter() {
  const genres = [...new Set(state.books.map(book => book.genre).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'de')
  );

  genres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    els.genre.appendChild(option);
  });
}

// ---------------------------------------------------------------------------
// Hero: zeigt automatisch das Buch mit "featured": true.
// Gibt es keins, bleibt der Fallback-Text aus dem HTML stehen.
// ---------------------------------------------------------------------------
function renderHero() {
  const featured = state.books.find(book => book.featured);
  if (!featured) return;

  els.heroTitle.innerHTML = `${escapeHtml(featured.title)}<br><span>${escapeHtml(featured.subtitle || '')}</span>`;
  els.heroSubtitle.textContent = featured.description || '';

  if (featured.amazon) {
    els.heroCta.href = featured.amazon;
    els.heroCta.target = '_blank';
    els.heroCta.rel = 'noopener sponsored';
  }
}

// ---------------------------------------------------------------------------
// Suche, Filter und Sortierung kombiniert anwenden und Grid neu rendern.
// ---------------------------------------------------------------------------
function applyFilters() {
  let result = [...state.books];

  if (state.genre !== 'all') {
    result = result.filter(book => book.genre === state.genre);
  }

  if (state.query) {
    const q = state.query.toLowerCase();
    result = result.filter(book => book.title.toLowerCase().includes(q));
  }

  result = sortBooks(result, state.sort);
  renderGrid(result);
}

/** Sortiert eine Buchliste nach dem gewählten Modus. */
function sortBooks(list, mode) {
  switch (mode) {
    case 'bestseller':
      return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'az':
      return [...list].sort((a, b) => a.title.localeCompare(b.title, 'de'));
    case 'new':
    default:
      // Reihenfolge in books.json = chronologisch; letzter Eintrag = neuestes Buch.
      return [...list].reverse();
  }
}

// ---------------------------------------------------------------------------
// Grid rendern: für jedes Buch eine Karte aus dem <template> klonen und füllen.
// ---------------------------------------------------------------------------
function renderGrid(list) {
  els.grid.innerHTML = '';
  els.empty.hidden = list.length > 0;

  const fragment = document.createDocumentFragment();

  list.forEach(book => {
    const node = els.template.content.cloneNode(true);

    const card = node.querySelector('.book');
    const img = node.querySelector('.cover img');
    const tag = node.querySelector('.variant-tag');
    const title = node.querySelector('h3');
    const subtitle = node.querySelector('.back-subtitle');
    const description = node.querySelector('.back-description');
    const rating = node.querySelector('.rating');
    const link = node.querySelector('.cta a');

    img.src = book.image;
    img.alt = `Cover: ${book.title}`;
    tag.textContent = book.badge || book.genre || '';
    title.textContent = book.title;
    subtitle.textContent = book.subtitle || '';
    description.textContent = book.description || '';
    rating.textContent = renderStars(book.rating);
    rating.setAttribute('aria-label', `Bewertung: ${book.rating || 0} von 5 Sternen`);
    link.href = book.amazon;

    // Karte per Klick/Tap umblättern (Vorder-/Rückseite)
    card.addEventListener('click', () => card.classList.toggle('flipped'));

    fragment.appendChild(node);
  });

  els.grid.appendChild(fragment);

  // Neu eingefügte Karten für die Scroll-Einblendung registrieren
  els.grid.querySelectorAll('.book').forEach(card => {
    card.classList.add('reveal');
    revealObserver.observe(card);
  });
}

/** Baut die Sternebewertung als Zeichen (kein zusätzliches Icon-Bild nötig). */
function renderStars(rating = 0) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

/** Escaped einfache HTML-Sonderzeichen, bevor Text als innerHTML gesetzt wird. */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// Event-Bindings für Suche, Genre-Filter und Sortierung
// ---------------------------------------------------------------------------
function bindEvents() {
  els.search.addEventListener(
    'input',
    debounce(event => {
      state.query = event.target.value.trim();
      applyFilters();
    }, 150)
  );

  els.genre.addEventListener('change', event => {
    state.genre = event.target.value;
    applyFilters();
  });

  els.sort.addEventListener('change', event => {
    state.sort = event.target.value;
    applyFilters();
  });
}

/** Verzögert die Ausführung von fn, damit die Suche nicht bei jedem Tastendruck läuft. */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ---------------------------------------------------------------------------
// Scroll-Effekte: Lesebändchen-Position + Fade-in-Animation
// ---------------------------------------------------------------------------
let ticking = false;

/** Positioniert das Lesebändchen passend zum Scrollfortschritt der Seite. */
function updateRibbon() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;
  const trackHeight = window.innerHeight - 60;

  els.ribbon.style.top = `${progress * trackHeight}px`;
  ticking = false;
}

/** Blendet Elemente sanft ein, sobald sie in den sichtbaren Bereich scrollen. */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

function initScrollEffects() {
  document.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(updateRibbon);
        ticking = true;
      }
    },
    { passive: true }
  );

  window.addEventListener('resize', updateRibbon);
  updateRibbon();

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}
