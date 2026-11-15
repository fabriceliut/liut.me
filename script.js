// Évite que le navigateur recalcule/restaure une position de scroll pendant
// un retour inter-page : le retour doit rester déterministe et instantané.
if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Gestion de la Date Automatique
const currentYear = new Date().getFullYear();
document.querySelectorAll('.year-auto').forEach(el => {
    el.textContent = currentYear;
});

// 2. Retour à l'accueil : utilise l'historique quand on vient réellement de l'accueil.
// Le navigateur peut alors restaurer la page depuis le BFCache, sans nouveau chargement.
function returnToHome(event) {
    let cameFromHome = false;
    try {
        const referrerUrl = new URL(document.referrer);
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
    if (!document.getElementById('view-home')) return;
    event.preventDefault();
    window.history.replaceState({}, '', window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

// 3. Menu Mobile Toggle
const MENU_ICON_OPEN = '<line x1="5" x2="19" y1="5" y2="19"/><line x1="19" x2="5" y1="5" y2="19"/>';
const MENU_ICON_CLOSED = '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>';

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const toggle = document.getElementById('mobile-menu-toggle');
    const menuIcon = document.getElementById('menu-icon-svg');
    if (!menu) return;
    const opening = menu.hidden;
    menu.hidden = !opening;
    menu.setAttribute('aria-hidden', opening ? 'false' : 'true');
    if (toggle) {
        toggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
        toggle.setAttribute('aria-label', opening ? 'Fermer le menu' : 'Ouvrir le menu');
    }
    if (menuIcon) menuIcon.innerHTML = opening ? MENU_ICON_OPEN : MENU_ICON_CLOSED;

    if (opening) {
        document.documentElement.classList.add('menu-open');
        requestAnimationFrame(() => menu.querySelector('a, button')?.focus());
    } else {
        requestAnimationFrame(() => {
            if (menu.hidden) {
                document.documentElement.classList.remove('menu-open');
                toggle?.focus({ preventScroll: true });
            }
        });
    }
}

document.addEventListener('keydown', (event) => {
    const menu = document.getElementById('mobile-menu');
    if (!menu || menu.hidden) return;
    if (event.key === 'Escape') {
        toggleMobileMenu();
        return;
    }
    // Garde le focus clavier dans le menu (bouton de fermeture + liens)
    if (event.key === 'Tab') {
        const toggle = document.getElementById('mobile-menu-toggle');
        const focusables = [toggle, ...menu.querySelectorAll('a, button')].filter(Boolean);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});

// 4. Navigation Mobile
function mobileNavClick(event, sectionId) {
    event.preventDefault();
    toggleMobileMenu();
    const element = document.getElementById(sectionId);
    if (element) {
        window.history.pushState({}, '', `#${sectionId}`);
        requestAnimationFrame(() => {
            element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }
}

// 5. Effet de Scroll sur Navbar (throttlé via requestAnimationFrame)
(function () {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const update = () => {
        if (window.scrollY > 20) {
            // Fond opaque : évite un backdrop-filter coûteux, navbar lisible.
            nav.classList.add('bg-[#0B0C0E]/95', 'border-[#2E3138]', 'py-3');
            nav.classList.remove('py-6', 'border-transparent');
        } else {
            nav.classList.remove('bg-[#0B0C0E]/95', 'border-[#2E3138]', 'py-3');
            nav.classList.add('py-6', 'border-transparent');
        }
    };
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { update(); ticking = false; });
    }, { passive: true });
    // Arrivée directe sur une ancre (#offres…) : état correct dès le chargement
    update();
})();

// 6. ScoreCards : compteurs animés + reveal au scroll (respecte reduced-motion)
// La vraie valeur est écrite dans le HTML ; l'animation repart de 0 uniquement si JS tourne.
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

// 8. Logos clients : monogramme de secours si une image ne charge pas
(function () {
    const logos = document.querySelectorAll('img[data-logo]');
    if (!logos.length) return;
    const toFallback = (img) => {
        if (img.dataset.fb === '1') return;
        img.dataset.fb = '1';
        const pill = img.closest('span');
        const label = pill ? (pill.textContent || '').trim() : '';
        const mono = document.createElement('span');
        mono.className = 'logo-fallback';
        mono.textContent = label ? label[0].toUpperCase() : '•';
        mono.setAttribute('aria-hidden', 'true');
        img.replaceWith(mono);
    };
    logos.forEach((img) => {
        img.addEventListener('error', () => toFallback(img), { once: true });
        if (img.complete && img.naturalWidth === 0) toFallback(img);
    });
})();

// 9. Ebook EPUB : téléchargement local, avec la page source en repli
(function () {
    const links = document.querySelectorAll('.js-ebook-download');
    links.forEach((link) => link.addEventListener('click', async (event) => {
        event.preventDefault();
        if (link.getAttribute('aria-busy') === 'true') return;
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
            const binary = Uint8Array.from(atob(chunks.join('')), (char) => char.charCodeAt(0));
            const blobUrl = URL.createObjectURL(new Blob([binary], { type: manifest.type }));
            const download = document.createElement('a');
            download.href = blobUrl;
            download.download = manifest.filename;
            document.body.appendChild(download);
            download.click();
            download.remove();
            // Laisse le temps au navigateur de démarrer le téléchargement
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            link.innerHTML = 'Ebook téléchargé <span aria-hidden="true">✓</span>';
        } catch (error) {
            link.innerHTML = original;
            window.open(fallback, '_blank', 'noopener,noreferrer');
        } finally {
            link.removeAttribute('aria-busy');
        }
    }));
})();

// 10. Scrollspy nav : surligne la section active (index éditorial)
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
