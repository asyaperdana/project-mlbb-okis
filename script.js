/**
 * MLBB Meta Tier List - Core Logic
 * Version: 1.1 (2026)
 */

// --- Global State ---
let allHeroes = [];
const TIERS = ['S', 'A', 'B', 'C'];

// --- DOM Elements ---
const tierContainer = document.querySelector('.tier-container');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('heroSearch');
const modal = document.getElementById('heroModal');
const closeModalBtn = document.querySelector('.close-modal');

// --- Initialization ---
async function init() {
    await loadHeroData();
    setupEventListeners();
}

// --- Data Loading ---
async function loadHeroData() {
    try {
        const response = await fetch('hero_data.json');
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // Flatten hero data from role-based structure to a flat array with role attached
        allHeroes = [];
        if (data.heroes) {
            for (const [role, heroes] of Object.entries(data.heroes)) {
                heroes.forEach(hero => {
                    allHeroes.push({ ...hero, role });
                });
            }
        }

        renderTierList();
    } catch (error) {
        console.error('Error loading hero data:', error);
        tierContainer.innerHTML = `
            <div class="error-state" style="text-align:center; padding: 3rem; color: var(--tier-s);">
                <h3>Failed to load hero data</h3>
                <p>Please refresh the page or check your connection.</p>
            </div>`;
    }
}

// --- Core Rendering Logic ---
function renderTierList(filterRole = 'all', searchQuery = '') {
    if (!tierContainer) return;

    tierContainer.innerHTML = '';
    let hasResults = false;
    const query = searchQuery.toLowerCase().trim();

    TIERS.forEach(tier => {
        // Filter logic: Tier matches AND (Role matches OR All) AND Name contains Search
        const filteredHeroes = allHeroes.filter(hero => {
            const matchesTier = hero.tier === tier;
            const matchesRole = filterRole === 'all' || hero.role === filterRole;
            const matchesSearch = hero.name.toLowerCase().includes(query);
            return matchesTier && matchesRole && matchesSearch;
        });

        if (filteredHeroes.length > 0) {
            hasResults = true;
            const tierRow = createTierRow(tier, filteredHeroes);
            tierContainer.appendChild(tierRow);
        }
    });

    if (!hasResults) {
        showNoResults();
    }
}

// --- UI Components ---
function createTierRow(tier, heroes) {
    const row = document.createElement('div');
    row.className = 'tier-row';

    const label = document.createElement('div');
    label.className = `tier-label tier-${tier.toLowerCase()}`;
    label.textContent = tier;

    const heroesList = document.createElement('div');
    heroesList.className = 'tier-heroes';

    heroes.forEach(hero => {
        const card = createHeroCard(hero);
        heroesList.appendChild(card);
    });

    row.appendChild(label);
    row.appendChild(heroesList);
    return row;
}

function createHeroCard(hero) {
    const card = document.createElement('div');
    card.className = 'hero-card';
    card.setAttribute('data-name', hero.name);

    // Accessibility
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${hero.name}`);

    card.innerHTML = `
        <img src="${hero.image}" alt="${hero.name}" loading="lazy">
        <div class="hero-tooltip">${hero.name} <br> <small>${hero.role}</small></div>
    `;

    card.addEventListener('click', () => openHeroModal(hero));
    return card;
}

function showNoResults() {
    tierContainer.innerHTML = `
        <div class="no-results" style="text-align: center; padding: 4rem; color: var(--text-muted);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
            <h3>No heroes found</h3>
            <p>Try adjusting your search query or filter by a different role.</p>
        </div>`;
}

// --- Modal Logic ---
function openHeroModal(hero) {
    if (!modal) return;

    // Update Modal Content
    document.getElementById('modalHeroImage').src = hero.image;
    document.getElementById('modalHeroName').textContent = hero.name;
    document.getElementById('modalHeroRole').textContent = hero.role;

    const tierBadge = document.getElementById('modalHeroTier');
    tierBadge.textContent = hero.tier;
    tierBadge.className = `modal-tier-badge tier-${hero.tier.toLowerCase()}`;

    // Dynamic Stats Simulation
    updateModalStats();

    // Contextual Description
    const desc = document.querySelector('.modal-desc');
    desc.textContent = getHeroDescription(hero);

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function updateModalStats() {
    const stats = [
        (50 + Math.random() * 12).toFixed(1) + '%', // Win Rate
        (Math.random() * 8).toFixed(1) + '%',       // Pick Rate
        (Math.random() * 80).toFixed(1) + '%'      // Ban Rate
    ];

    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach((el, i) => el.textContent = stats[i]);
}

function getHeroDescription(hero) {
    const descMap = {
        'S': `${hero.name} is a high-priority pick in the current Patch 2.1.52. Extremely dominant for the ${hero.role} role.`,
        'A': `${hero.name} is a solid choice for most team compositions. High reliability and impact when played correctly.`,
        'B': `${hero.name} is a situational pick. Works best as a counter-pick or in specific team strategies.`,
        'C': `${hero.name} currently struggles in the competitive meta. Recommend playing only if you are highly proficient.`
    };
    return descMap[hero.tier] || 'No description available for this hero.';
}

function closeHeroModal() {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// --- Event Listeners ---
function setupEventListeners() {
    // Role Filter Buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            const search = searchInput.value;
            renderTierList(filter, search);
        });
    });

    // Search Input
    searchInput.addEventListener('input', (e) => {
        const activeBtn = document.querySelector('.filter-btn.active');
        const filter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
        renderTierList(filter, e.target.value);
    });

    // Modal Close
    closeModalBtn?.addEventListener('click', closeHeroModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeHeroModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) closeHeroModal();
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target?.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// --- Start Application ---
init();
