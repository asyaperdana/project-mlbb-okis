let allHeroes = [];
const tierContainer = document.querySelector('.tier-container');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('heroSearch');
const modal = document.getElementById('heroModal');
const closeModalBtn = document.querySelector('.close-modal');

// --- Load Data ---
async function loadHeroData() {
    try {
        const response = await fetch('hero_data.json');
        const data = await response.json();

        // Flatten hero data from role-based structure to flat array
        allHeroes = [];
        for (const [role, heroes] of Object.entries(data.heroes)) {
            heroes.forEach(hero => {
                allHeroes.push({ ...hero, role });
            });
        }

        renderTierList();
    } catch (error) {
        console.error('Error loading hero data:', error);
        tierContainer.innerHTML = '<p style="text-align:center; color: var(--tier-s);">Failed to load hero data. Please refresh.</p>';
    }
}

// --- Render Logic ---
function renderTierList(filterRole = 'all', searchQuery = '') {
    tierContainer.innerHTML = '';
    const tiers = ['S', 'A', 'B', 'C'];
    let hasResults = false;

    tiers.forEach(tier => {
        // Filter by Tier, Role, and Search Query
        let filteredHeroes = allHeroes.filter(hero => {
            const matchesTier = hero.tier === tier;
            const matchesRole = filterRole === 'all' || hero.role === filterRole;
            const matchesSearch = hero.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTier && matchesRole && matchesSearch;
        });

        if (filteredHeroes.length > 0) {
            hasResults = true;
            const row = document.createElement('div');
            row.className = 'tier-row';

            // Create Tier Label
            const label = document.createElement('div');
            label.className = `tier-label tier-${tier.toLowerCase()}`;
            label.textContent = tier;

            // Create Heroes Container
            const heroesDiv = document.createElement('div');
            heroesDiv.className = 'tier-heroes';

            filteredHeroes.forEach(hero => {
                const card = document.createElement('div');
                card.className = 'hero-card';
                card.onclick = () => openModal(hero); // Add click event for modal
                card.innerHTML = `
                    <img src="${hero.image}" alt="${hero.name}" loading="lazy">
                    <div class="hero-tooltip">${hero.name} - ${hero.role}</div>
                `;
                heroesDiv.appendChild(card);
            });

            row.appendChild(label);
            row.appendChild(heroesDiv);
            tierContainer.appendChild(row);
        }
    });

    if (!hasResults) {
        tierContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <h3>No heroes found</h3>
                <p>Try adjusting your search or filter.</p>
            </div>`;
    }
}

// --- Filter Events ---
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        const search = searchInput.value;
        renderTierList(filter, search);
    });
});

// --- Search Events ---
searchInput.addEventListener('input', (e) => {
    const activeBtn = document.querySelector('.filter-btn.active');
    const filter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
    renderTierList(filter, e.target.value);
});

// --- Modal Logic ---
function openModal(hero) {
    document.getElementById('modalHeroImage').src = hero.image;
    document.getElementById('modalHeroName').textContent = hero.name;
    document.getElementById('modalHeroRole').textContent = hero.role;

    const tierBadge = document.getElementById('modalHeroTier');
    tierBadge.textContent = hero.tier;
    tierBadge.className = `modal-tier-badge tier-${hero.tier.toLowerCase()}`;

    // Random Stats Generator (Simulation for now)
    const winRate = (50 + Math.random() * 10).toFixed(1) + '%';
    const pickRate = (Math.random() * 5).toFixed(1) + '%';
    const banRate = (Math.random() * 60).toFixed(1) + '%';

    document.querySelectorAll('.stat-value')[0].textContent = winRate;
    document.querySelectorAll('.stat-value')[1].textContent = pickRate;
    document.querySelectorAll('.stat-value')[2].textContent = banRate;

    // Custom description based on tier
    const desc = document.querySelector('.modal-desc');
    if (hero.tier === 'S') {
        desc.textContent = `${hero.name} is currently a top-tier pick in the meta. Dominant laning phase and high teamfight impact make them a priority ban or pick.`;
    } else if (hero.tier === 'A') {
        desc.textContent = `A strong choice for ${hero.role} players. ${hero.name} works well in most compositions but requires good mechanics to shine.`;
    } else if (hero.tier === 'B') {
        desc.textContent = `${hero.name} is a situational pick. Can be very strong as a counter-pick but struggles against current meta top-tiers.`;
    } else {
        desc.textContent = `${hero.name} is struggling in the current patch. Recommend playing only if you are an expert (OTP) with this hero.`;
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

closeModalBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    }
});

// --- Smooth Scroll ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// --- Init ---
loadHeroData();
