/* ============================================================
   DEVCRAFT — MAIN JAVASCRIPT
   ============================================================ */

'use strict';

/* ── HERO CANVAS PARTICLES ─────────────────────────────────── */
(function initCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() { this.reset(true); }

        reset(random = false) {
            this.x  = Math.random() * canvas.width;
            this.y  = random ? Math.random() * canvas.height : Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.45;
            this.vy = (Math.random() - 0.5) * 0.45;
            this.r  = Math.random() * 1.8 + 0.4;
            this.o  = Math.random() * 0.45 + 0.08;
            this.c  = Math.random() > 0.5 ? '108,99,255' : '0,212,255';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.c},${this.o})`;
            ctx.fill();
        }
    }

    function connect() {
        const MAX_DIST = 130;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < MAX_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(108,99,255,${(1 - d / MAX_DIST) * 0.14})`;
                    ctx.lineWidth   = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function init() {
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 90);
        particles   = Array.from({ length: count }, () => new Particle());
    }

    let raf;
    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        connect();
        raf = requestAnimationFrame(loop);
    }

    resize();
    init();
    loop();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); init(); }, 200);
    });

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else loop();
    });
})();

/* ── CURSOR GLOW ────────────────────────────────────────────── */
(function initCursorGlow() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const glow = Object.assign(document.createElement('div'), {
        style: `
            position:fixed; width:480px; height:480px; border-radius:50%;
            pointer-events:none; z-index:1;
            background:radial-gradient(circle,rgba(108,99,255,0.055) 0%,transparent 65%);
            transform:translate(-50%,-50%); top:0; left:0;
            transition:opacity .4s;
        `
    });
    document.body.prepend(glow);

    let mx = 0, my = 0, gx = 0, gy = 0;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function animGlow() {
        gx += (mx - gx) * 0.08;
        gy += (my - gy) * 0.08;
        glow.style.left = gx + 'px';
        glow.style.top  = gy + 'px';
        requestAnimationFrame(animGlow);
    })();
})();

/* ── NAVBAR ─────────────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
});

mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
    });
});

/* ── SMOOTH SCROLL ──────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - 76,
            behavior: 'smooth'
        });
    });
});

/* ── SCROLL FADE-IN (Intersection Observer) ─────────────────── */
(function initFadeIn() {
    const els = document.querySelectorAll('.fade-in');
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            // Stagger siblings inside the same grid/row
            const siblings = [...entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)')];
            const idx      = siblings.indexOf(entry.target);
            const delay    = Math.min(idx * 90, 360);

            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);

            io.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => io.observe(el));
})();

/* ── PARALLAX HERO ──────────────────────────────────────────── */
(function initParallax() {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (ticking) return;
        requestAnimationFrame(() => {
            const s = window.scrollY;
            if (s < window.innerHeight) {
                heroContent.style.transform = `translateY(${s * 0.28}px)`;
                heroContent.style.opacity   = `${Math.max(0, 1 - s / (window.innerHeight * 0.7))}`;
            }
            ticking = false;
        });
        ticking = true;
    }, { passive: true });
})();

/* ── COUNTER ANIMATION ──────────────────────────────────────── */
(function initCounters() {
    const statsEl = document.querySelector('.hero-stats');
    if (!statsEl) return;

    function animateNum(el, target, suffix, duration = 1800) {
        const start = performance.now();
        (function step(now) {
            const p   = Math.min((now - start) / duration, 1);
            const val = Math.floor(p * p * target); // ease-in curve
            el.textContent = val + suffix;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target + suffix;
        })(start);
    }

    const io = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        statsEl.querySelectorAll('.stat-number').forEach(el => {
            animateNum(el, +el.dataset.target, el.dataset.suffix || '');
        });
        io.disconnect();
    }, { threshold: 0.6 });

    io.observe(statsEl);
})();

/* ── PORTFOLIO FILTER ───────────────────────────────────────── */
(function initFilter() {
    const btns  = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item');
    if (!btns.length) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            items.forEach((item, i) => {
                const match = filter === 'all' || item.dataset.category === filter;

                if (match) {
                    item.style.display   = '';
                    item.style.opacity   = '0';
                    item.style.transform = 'scale(0.92)';
                    setTimeout(() => {
                        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        item.style.opacity    = '1';
                        item.style.transform  = 'scale(1)';
                    }, 30 + i * 50);
                } else {
                    item.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                    item.style.opacity    = '0';
                    item.style.transform  = 'scale(0.88)';
                    setTimeout(() => { item.style.display = 'none'; }, 280);
                }
            });
        });
    });
})();

/* ── TESTIMONIALS SLIDER ────────────────────────────────────── */
(function initSlider() {
    const track  = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsWrap = document.getElementById('sliderDots');
    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    const total = cards.length;
    let current = 0;
    let autoId;

    // Determine slides per view
    function perView() { return window.innerWidth <= 900 ? 1 : 2; }

    // Build dots
    function buildDots() {
        dotsWrap.innerHTML = '';
        const n = Math.ceil(total / perView());
        for (let i = 0; i < n; i++) {
            const d = document.createElement('button');
            d.className = 'dot' + (i === current ? ' active' : '');
            d.setAttribute('aria-label', `Слайд ${i + 1}`);
            d.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(d);
        }
    }

    function goTo(idx) {
        const pv = perView();
        const maxIdx = Math.max(0, Math.ceil(total / pv) - 1);
        current = Math.max(0, Math.min(idx, maxIdx));

        // Pixel offset per visible card
        const cardW = cards[0].offsetWidth + 24; // gap = 1.5rem = 24px
        track.style.transform = `translateX(-${current * cardW * pv}px)`;

        dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    function next() { goTo((current + 1) % Math.ceil(total / perView())); }
    function prev() { goTo(current - 1 < 0 ? Math.ceil(total / perView()) - 1 : current - 1); }

    function startAuto() { autoId = setInterval(next, 5000); }
    function stopAuto()  { clearInterval(autoId); }

    prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
    nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });

    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    // Touch / swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { stopAuto(); diff > 0 ? next() : prev(); startAuto(); }
    }, { passive: true });

    // Keyboard
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { stopAuto(); prev(); startAuto(); }
        if (e.key === 'ArrowRight') { stopAuto(); next(); startAuto(); }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { buildDots(); goTo(0); }, 200);
    });

    buildDots();
    goTo(0);
    startAuto();
})();

/* ── CONTACT FORM ───────────────────────────────────────────── */
(function initForm() {
    const FORMSPREE_URL = 'https://formspree.io/f/mreyrqnn';

    const form    = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    const error   = document.getElementById('formError');
    const btn     = document.getElementById('submitBtn');
    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();

        // Hide previous messages
        success.classList.remove('visible');
        error.classList.remove('visible');

        // Basic validation
        const nameVal  = form.name.value.trim();
        const emailVal = form.email.value.trim();
        if (!nameVal) { shakeField(form.name); return; }
        if (!emailVal) { shakeField(form.email); return; }

        const span = btn.querySelector('span');
        btn.disabled = true;
        span.textContent = 'Изпращане…';

        try {
            const response = await fetch(FORMSPREE_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name:    nameVal,
                    email:   emailVal,
                    service: form.service.value,
                    message: form.message.value.trim()
                })
            });

            if (response.ok) {
                form.reset();
                success.classList.add('visible');
                setTimeout(() => success.classList.remove('visible'), 7000);
            } else {
                error.classList.add('visible');
                setTimeout(() => error.classList.remove('visible'), 6000);
            }
        } catch (_) {
            error.classList.add('visible');
            setTimeout(() => error.classList.remove('visible'), 6000);
        } finally {
            btn.disabled = false;
            span.textContent = 'Изпратете съобщение';
        }
    });

    function shakeField(el) {
        el.style.borderColor = '#f87171';
        el.style.animation   = 'none';
        void el.offsetWidth;
        el.style.animation   = 'shake 0.4s ease';
        setTimeout(() => {
            el.style.borderColor = '';
            el.style.animation   = '';
        }, 600);
    }

    if (!document.getElementById('shakeStyle')) {
        const s = document.createElement('style');
        s.id = 'shakeStyle';
        s.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`;
        document.head.appendChild(s);
    }
})();

/* ── SERVICE CARD GLOW ON HOVER ─────────────────────────────── */
(function initCardGlow() {
    document.querySelectorAll('.service-card, .testimonial-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x    = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
            const y    = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
            card.style.setProperty('--mx', x + '%');
            card.style.setProperty('--my', y + '%');
        });
    });
})();

/* ── ACTIVE NAV LINK ON SCROLL ──────────────────────────────── */
(function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !links.length) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            links.forEach(a => {
                a.style.color = a.getAttribute('href') === '#' + entry.target.id
                    ? 'var(--text)'
                    : '';
            });
        });
    }, { threshold: 0.4 });

    sections.forEach(s => io.observe(s));
})();

console.log('%cDevOrion 🚀', 'color:#6c63ff;font-size:1.4rem;font-weight:700;');
console.log('%cПремиум уеб разработка — hello@devcraft.bg', 'color:#9898b8;font-size:.85rem;');
