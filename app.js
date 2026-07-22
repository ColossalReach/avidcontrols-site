/* ============================================================
   AVIDCONTROLS — app.js
   Nav, scroll reveal, mobile menu, form pre-fill, form submit
   ============================================================ */

(function () {
  'use strict';

  // ── NAVBAR SCROLL ────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    // Always start scrolled (opaque) — prevents flash on load
    navbar.classList.add('scrolled');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      }
    }, { passive: true });
  }

  // ── MOBILE MENU ──────────────────────────────────────────
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  // ── SCROLL REVEAL ────────────────────────────────────────
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
    revealObserver.observe(el);
  });

  // ── SYSTEM CARD CTA — pre-fill form select ────────────────
  document.querySelectorAll('[data-system]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const systemName = btn.dataset.system;
      const selects = document.querySelectorAll('#system, #b-bundle');
      selects.forEach((sel) => {
        const opt = Array.from(sel.options).find(o =>
          o.value === systemName || o.text.includes(systemName)
        );
        if (opt) sel.value = opt.value;
      });
    });
  });

  // ── FORM SUBMIT HANDLING ─────────────────────────────────
  function setupForm(formId, submitBtnId, btnLabelId) {
    const form = document.getElementById(formId);
    const submitBtn = document.getElementById(submitBtnId);
    const btnLabel = document.getElementById(btnLabelId);

    if (!form || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic validation
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = 'var(--clr-error)';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) {
        const firstInvalid = form.querySelector('[required]:invalid, [style*="error"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Disable button, show loading state
      submitBtn.disabled = true;
      if (btnLabel) btnLabel.textContent = 'Sending…';
      submitBtn.style.opacity = '0.7';

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          // Show success state
          const formContainer = form.closest('.quote-form');
          if (formContainer) {
            formContainer.innerHTML = `
              <div class="form-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <h3>Pricing Request Sent</h3>
                <p>We'll respond within 2 business hours with integrator pricing, availability, and estimated ship date.</p>
                <p style="font-size:0.825rem;color:var(--clr-text-3);margin-top:0.5rem;">Check your inbox at <strong style="color:var(--clr-text-2);">${formData.get('email') || 'your email'}</strong></p>
              </div>
            `;
          }
        } else {
          throw new Error('Form submission failed');
        }
      } catch (err) {
        // Fallback — let them call or email
        submitBtn.disabled = false;
        if (btnLabel) btnLabel.textContent = 'Try Again or Call Us';
        submitBtn.style.opacity = '1';
        submitBtn.style.background = 'var(--clr-error)';
        submitBtn.style.borderColor = 'var(--clr-error)';

        setTimeout(() => {
          if (btnLabel) btnLabel.textContent = 'Send Pricing Request';
          submitBtn.style.background = '';
          submitBtn.style.borderColor = '';
        }, 4000);
      }
    });
  }

  setupForm('quote-form', 'submit-btn', 'btn-label');
  setupForm('bundle-quote-form', 'b-submit-btn', 'b-btn-label');

  // ── SMOOTH SCROLL for in-page anchor links ────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH = navbar ? navbar.offsetHeight : 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── COUNTER ANIMATION for stats ──────────────────────────
  function animateCounter(el) {
    const text = el.textContent.trim();
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num === 0) return;

    const suffix = text.replace(/[0-9.]/g, '');
    const duration = 1200;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * num * 10) / 10;
      el.textContent = (Number.isInteger(num) ? Math.round(current) : current) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-val, .hero-stat-val').forEach(el => {
    // Only animate numeric stats
    if (/\d/.test(el.textContent) && !/Teams|Zoom|ASAP|AEC|VLAN|IEM|Cloud|UPS|Remote|Multi|Sched/.test(el.textContent)) {
      statObserver.observe(el);
    }
  });

})();
