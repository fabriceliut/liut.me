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
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, 150);
}

// 5. Effet de Scroll sur Navbar
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 20) {
        nav.classList.add('bg-[#0B0C0E]/80', 'backdrop-blur-md', 'border-[#2E3138]');
        nav.classList.remove('py-6', 'border-transparent');
        nav.classList.add('py-3');
    } else {
        nav.classList.remove('bg-[#0B0C0E]/80', 'backdrop-blur-md', 'border-[#2E3138]', 'py-3');
        nav.classList.add('py-6', 'border-transparent');
    }
});
