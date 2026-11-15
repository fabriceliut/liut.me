// Évite que le navigateur recalcule/restaure une position de scroll pendant
// un retour inter-page : le retour doit rester déterministe et instantané.
if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
}

// 1. Gestion de la Date Automatique
const currentYear = new Date().getFullYear();
document.querySelectorAll('.year-auto').forEach(el => {
    el.textContent = currentYear;
});

// 2. Navigation Simple
function showView(viewName) {
    document.querySelectorAll('main').forEach(el => {
        if (!el.classList.contains('hidden-view')) {
            el.classList.add('hidden-view');
        }
    });

    const targetView = document.getElementById('view-' + viewName);
    if (targetView) {
        targetView.classList.remove('hidden-view');
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    const navMenuHome = document.getElementById('nav-menu-home');
    const navBtnBack = document.getElementById('nav-btn-back');
    const navBtnCta = document.getElementById('nav-btn-cta');

    if (viewName === 'home') {
        if (navMenuHome) navMenuHome.style.removeProperty('display');
        if (navBtnCta) navBtnCta.style.removeProperty('display');
        if (navBtnBack) navBtnBack.style.display = 'none';
    } else {
        if (navMenuHome) navMenuHome.style.display = 'none';
        if (navBtnCta) navBtnCta.style.display = 'none';
        if (navBtnBack) navBtnBack.style.display = 'flex';
    }
}

// Retour à l'accueil : utilise l'historique quand on vient réellement de l'accueil.
// Le navigateur peut alors restaurer la page depuis le BFCache, sans nouveau chargement.
function returnToHome(event) {
    const referrer = document.referrer;
    let cameFromHome = false;
    try {
        const referrerUrl = new URL(referrer);
        cameFromHome = referrerUrl.origin === window.location.origin
            && (referrerUrl.pathname === '/' || referrerUrl.pathname === '/index.html');
    } catch (_) {
        cameFromHome = false;
    }
    if (cameFromHome && window.history.length > 1) {
        event.preventDefault();
        window.history.back();
        return false;
    }
    return true;
}

// Retour en haut de l'accueil : pas de rechargement, juste un scroll maîtrisé.
function scrollToTop(event) {
    const homeView = document.getElementById('view-home');
    if (!homeView || homeView.classList.contains('hidden-view')) return;
    event.preventDefault();
    window.history.replaceState({}, '', window.location.pathname + window.location.search);
    window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
}

// 3. Menu Mobile Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const toggle = document.getElementById('mobile-menu-toggle');
    const menuIcon = document.getElementById('menu-icon-svg');
    if (!menu) return;
    const opening = menu.hidden;
    if (opening) {
        menu.hidden = false;
        document.documentElement.classList.add('menu-open');
        menu.setAttribute('aria-hidden', 'false');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Fermer le menu');
        }
        if (menuIcon) {
            menuIcon.innerHTML = '<line x1="5" x2="19" y1="5" y2="19"/><line x1="19" x2="5" y1="5" y2="19"/>';
        }
        requestAnimationFrame(() => menu.querySelector('a, button')?.focus());
    } else {
        menu.hidden = true;
        menu.setAttribute('aria-hidden', 'true');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Ouvrir le menu');
        }
        if (menuIcon) {
            menuIcon.innerHTML = '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>';
        }
        requestAnimationFrame(() => {
            if (menu.hidden) {
                document.documentElement.classList.remove('menu-open');
                toggle?.focus({ preventScroll: true });
            }
        });
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !document.getElementById('mobile-menu')?.hidden) {
        toggleMobileMenu();
    }
});

// 4. Navigation Mobile
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function mobileNavClick(event, sectionId) {
    event.preventDefault();
    toggleMobileMenu();

    const homeView = document.getElementById('view-home');
    if (homeView?.classList.contains('hidden-view')) {
        showView('home');
    }

    const element = document.getElementById(sectionId);
    if (element) {
        window.history.pushState({}, '', `#${sectionId}`);
        requestAnimationFrame(() => {
            element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }
}

// 5. Effet de Scroll sur Navbar (throttlé via requestAnimationFrame)
let scrollTicking = false;
window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
        const nav = document.getElementById('navbar');
        if (window.scrollY > 20) {
            nav.classList.add('bg-[#0B0C0E]/80', 'backdrop-blur-md', 'border-[#2E3138]');
            nav.classList.remove('py-6', 'border-transparent');
            nav.classList.add('py-3');
        } else {
            nav.classList.remove('bg-[#0B0C0E]/80', 'backdrop-blur-md', 'border-[#2E3138]', 'py-3');
            nav.classList.add('py-6', 'border-transparent');
        }
        scrollTicking = false;
    });
}, { passive: true });

// 6. ScoreCards : compteurs animés + reveal au scroll (respecte reduced-motion)
(function () {
    const cards = document.querySelectorAll('.scorecard');
    if (!cards.length) return;

    const run = (card) => {
        card.classList.add('in-view');
        const target = card.dataset.count;
        const el = card.querySelector('.sc-value .num');
        if (!target || !el) return;
        const end = parseInt(target, 10);
        if (prefersReducedMotion) { el.textContent = end.toLocaleString('fr-FR'); return; }
        const dur = 1200, t0 = performance.now();
        const tick = (now) => {
            const p = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(end * eased).toLocaleString('fr-FR');
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) { cards.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
        });
    }, { threshold: 0.4 });
    cards.forEach((c) => io.observe(c));
})();

// 7. Accordéons : sync aria-expanded (a11y)
document.querySelectorAll('details').forEach((d) => {
    const s = d.querySelector('summary');
    if (!s) return;
    s.setAttribute('aria-expanded', d.open ? 'true' : 'false');
    d.addEventListener('toggle', () => s.setAttribute('aria-expanded', d.open ? 'true' : 'false'));
});

// 8. Logos clients : garantit l'affichage (monogramme de secours si favicon KO)
(function () {
    const logos = document.querySelectorAll('img[src*="s2/favicons"]');
    if (!logos.length) return;
    const toFallback = (img) => {
        if (img.dataset.fb === '1') return;
        img.dataset.fb = '1';
        const pill = img.closest('span');
        const label = pill ? (pill.textContent || '').trim() : '';
        const letter = label ? label[0].toUpperCase() : '•';
        const mono = document.createElement('span');
        mono.className = 'logo-fallback';
        mono.textContent = letter;
        mono.setAttribute('aria-hidden', 'true');
        img.replaceWith(mono);
    };
    logos.forEach((img) => {
        img.addEventListener('error', () => toFallback(img), { once: true });
        // Image déjà en échec avant l'attache du handler (script deferred)
        if (img.complete && img.naturalWidth === 0) toFallback(img);
    });
})();

// 9. Offres : parcours clair, de l'entrée à l'accélération
(function () {
    const section = document.getElementById('offres');
    const grid = section && section.querySelector('.grid');
    if (!section || !grid) return;
    const title = section.querySelector('h2');
    const intro = section.querySelector('h2 + p');
    if (title) title.textContent = 'Des offres pour chaque moment du parcours';
    if (intro) intro.textContent = 'Commencer par faire place nette, puis voir, structurer, piloter ou accélérer — dans l’ordre qui correspond à votre situation.';
    const offers = [
        ['01', 'OFFRE D’ENTRÉE', 'Faire place nette', 'Trouver ce qui freine le plus le travail et mettre un premier changement en pratique avec vos équipes.', 'https://offres.liut.me/place-nette'],
        ['02', 'VOIR', 'Diagnostic Flux & Leviers', 'Cartographier les flux, chiffrer les leviers et décider quoi structurer en premier.', 'https://offres.liut.me/diagnostic'],
        ['03', 'STRUCTURER', 'Programme Entreprises', 'Rendre l’organisation lisible, aligner les rôles et faire tenir les flux dans la durée.', 'https://offres.liut.me/entreprises'],
        ['04', 'PILOTER', 'Cockpit Dirigeant', 'Récupérer de la hauteur, une vue d’ensemble et du temps pour décider plutôt que rattraper.', 'https://offres.liut.me/entrepreneurs'],
        ['05', 'ACCÉLÉRER', 'Intégration IA', 'Intégrer l’IA dans vos flux existants pour gagner du temps sans ajouter de complexité.', 'https://offres.liut.me/ia'],
    ];
    grid.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5';
    grid.innerHTML = offers.map(([index, kicker, name, description, href], i) => `
        <a href="${href}" target="_blank" rel="noopener noreferrer" class="group relative bg-[#141518]/80 backdrop-blur-md border ${i === 0 ? 'border-[#7568FF]/70' : 'border-[#2E3138]'} rounded-2xl p-6 transition-all duration-300 hover:border-[#7568FF]/60 hover:-translate-y-1 flex flex-col">
            <div class="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#7568FF]/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div class="relative z-10 flex flex-col h-full">
                <div class="flex items-center justify-between mb-6">
                    <span class="font-mono text-[11px] text-[#7568FF] tracking-[.12em]">${index}</span>
                    <span class="text-[#2E3138] group-hover:text-[#7568FF] transition-colors text-lg" aria-hidden="true">↗</span>
                </div>
                <div class="font-mono text-[10px] tracking-[.1em] text-[#8A8F98] mb-3">${kicker}</div>
                <h3 class="text-[#EEEEF0] font-display font-bold text-lg leading-tight mb-3">${name}</h3>
                <p class="text-[14px] text-[#8A8F98] leading-relaxed text-balance mt-auto">${description}</p>
            </div>
        </a>`).join('');
})();

// 9. Livres : ressource éditoriale mise en avant
(function () {
    if (document.getElementById('livres')) return;
    const ressources = document.getElementById('ressources');
    if (!ressources) return;

    const section = `
        <section id="livres" class="books-section relative overflow-hidden border-t border-[#2E3138]" aria-labelledby="books-title">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(117,104,255,0.12),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(117,104,255,0.06),transparent_28%)] pointer-events-none" aria-hidden="true"></div>
            <div class="max-w-6xl mx-auto px-6 py-24 md:py-32 relative z-10">
                <div class="books-intro max-w-3xl mb-12 md:mb-16">
                    <div class="sec-eyebrow"><span>/// Livres</span><span class="num">05</span></div>
                    <h2 id="books-title" class="text-3xl md:text-5xl font-display font-semibold tracking-tight text-[#EEEEF0] text-balance">Des idées à emporter. Des pratiques à essayer.</h2>
                    <p class="mt-5 text-[#8A8F98] text-[16px] md:text-lg leading-relaxed max-w-2xl text-balance">Deux livres pour déplacer le regard, poser de meilleures questions et faire circuler l'action — sans perdre la singularité de celles et ceux qui la portent.</p>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <article class="book-card book-card--archipel group">
                        <div class="book-card-media">
                            <img src="assets/books/archipel.svg" alt="Couverture du livre Le livre des archipels, par Fabrice Liut" width="500" height="746" loading="lazy" decoding="async">
                            <div class="book-card-index" aria-hidden="true">01 / 02</div>
                        </div>
                        <div class="book-card-body">
                            <div class="book-card-kicker">GUIDEBOOK · COOPÉRATION</div>
                            <h3 class="book-card-title">Le livre des archipels</h3>
                            <p class="book-card-hook">Comment agir ensemble sans demander à chacun de devenir semblable aux autres&nbsp;? Un guide concret pour relier des personnes et des organisations, puis choisir un prochain pas réaliste.</p>
                            <div class="book-card-footer">
                                <span class="book-card-meta">PDF · EPUB disponibles</span>
                                <a href="https://app.notion.com/p/f728a3eb1aab4be6901775713018e7dc" target="_blank" rel="noopener noreferrer" class="book-card-cta js-ebook-download" data-ebook-manifest="assets/books/archipel-ebook/manifest.json" title="Télécharger l’ebook au format EPUB">Télécharger l’ebook <span aria-hidden="true">↓</span></a>
                            </div>
                        </div>
                    </article>
                    <article class="book-card book-card--playbook group">
                        <div class="book-card-media">
                            <img src="assets/books/playbook.svg?v=20261114-menu-books" alt="Couverture du livre L’art de poser les questions qui transforment votre business, par Fabrice Liut" width="500" height="746" loading="lazy" decoding="async">
                            <div class="book-card-index" aria-hidden="true">02 / 02</div>
                        </div>
                        <div class="book-card-body">
                            <div class="book-card-kicker">PLAYBOOK · DÉCISION</div>
                            <h3 class="book-card-title">L’art de poser les questions qui transforment votre business</h3>
                            <p class="book-card-hook">Clarifier une vision, trouver le vrai problème, mieux décider&nbsp;: une pratique de questionnement stratégique, de la méthode socratique aux «&nbsp;5 Pourquoi&nbsp;».</p>
                            <div class="book-card-footer">
                                <span class="book-card-meta">Lecture libre sur Notion</span>
                                <a href="https://app.notion.com/p/1bc1422a981281c2ab9cfb30e3585ffe" target="_blank" rel="noopener noreferrer" class="book-card-cta">Lire le playbook <span aria-hidden="true">↗</span></a>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>`;
    ressources.insertAdjacentHTML('afterend', section);

    const addLink = (menu) => {
        const anchor = menu && menu.querySelector('a[href="#ressources"]');
        if (!anchor) return;
        const link = anchor.cloneNode(true);
        link.href = '#livres';
        link.textContent = 'Livres';
        link.classList.remove('nav-active');
        if (menu.id === 'mobile-menu') {
            link.setAttribute('onclick', "mobileNavClick(event, 'livres')");
            link.className = 'text-[#EEEEF0] font-display font-medium text-xl py-2 border-b border-[#2E3138]/50 cursor-pointer';
        }
        anchor.parentNode.insertBefore(link, anchor.nextSibling);
    };
    addLink(document.getElementById('nav-menu-home'));
    addLink(document.getElementById('mobile-menu'));
})();

// 11. Ebook EPUB : téléchargement local, avec la page source en repli
(function () {
    const links = document.querySelectorAll('.js-ebook-download');
    if (!links.length) return;
    links.forEach((link) => link.addEventListener('click', async (event) => {
        event.preventDefault();
        const fallback = link.href;
        const original = link.innerHTML;
        link.setAttribute('aria-busy', 'true');
        link.innerHTML = 'Préparation…';
        try {
            const manifestUrl = new URL(link.dataset.ebookManifest, document.baseURI);
            const manifest = await fetch(manifestUrl).then((response) => {
                if (!response.ok) throw new Error('manifest');
                return response.json();
            });
            const chunks = await Promise.all(Array.from({ length: manifest.chunks }, (_, index) =>
                fetch(new URL(`${manifest.prefix}${String(index).padStart(2, '0')}.txt`, manifestUrl)).then((response) => {
                    if (!response.ok) throw new Error('chunk');
                    return response.text();
                })
            ));
            const encoded = chunks.join('');
            const binary = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
            const blobUrl = URL.createObjectURL(new Blob([binary], { type: manifest.type }));
            const download = document.createElement('a');
            download.href = blobUrl;
            download.download = manifest.filename;
            document.body.appendChild(download);
            download.click();
            download.remove();
            URL.revokeObjectURL(blobUrl);
            link.innerHTML = 'Ebook téléchargé <span aria-hidden="true">✓</span>';
        } catch (error) {
            link.removeAttribute('aria-busy');
            link.innerHTML = original;
            window.open(fallback, '_blank', 'noopener,noreferrer');
        }
    }));
})();

// 9. Scrollspy nav : surligne la section active (index éditorial)
(function () {
    const links = Array.from(document.querySelectorAll('#nav-menu-home a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const sections = Array.from(byId.keys())
        .map((id) => document.getElementById(id))
        .filter(Boolean);
    if (!sections.length) return;
    const setActive = (id) => links.forEach((a) => a.classList.toggle('nav-active', a.getAttribute('href') === '#' + id));
    const io = new IntersectionObserver((entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
    }, { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] });
    sections.forEach((s) => io.observe(s));
})();
