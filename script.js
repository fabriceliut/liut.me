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

// 3. Menu Mobile Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        menu.classList.add('flex');
        document.body.classList.add('overflow-hidden-body');
    } else {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
        document.body.classList.remove('overflow-hidden-body');
    }
}

// 4. Navigation Mobile
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function mobileNavClick(event, sectionId) {
    event.preventDefault();
    toggleMobileMenu();

    const homeView = document.getElementById('view-home');
    if (homeView.classList.contains('hidden-view')) {
        showView('home');
    }

    setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
    }, 150);
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
