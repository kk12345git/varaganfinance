// ============================================================
// VARAGAN FINANCE PVT LTD — Main JavaScript
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar scroll effect ──────────────────────────────────
  const navbar = document.getElementById('navbar');
  const trustBarH = 36;

  window.addEventListener('scroll', () => {
    if (window.scrollY > trustBarH) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ── Mobile Menu ───────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:4999;cursor:pointer;';
  document.body.appendChild(overlay);

  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    navLinks.classList.add('active');
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    hamburger.querySelector('i').className = 'fas fa-times';
  }

  function closeMenu() {
    menuOpen = false;
    navLinks.classList.remove('active');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    hamburger.querySelector('i').className = 'fas fa-bars';
  }

  if (hamburger) {
    hamburger.addEventListener('click', e => {
      e.stopPropagation();
      menuOpen ? closeMenu() : openMenu();
    });
  }

  overlay.addEventListener('click', closeMenu);

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => setTimeout(closeMenu, 80));
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 768) closeMenu(); });

  // ── Reveal on scroll ──────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObs.observe(el));

  // ── EMI Calculator ────────────────────────────────────────
  const calcAmount  = document.getElementById('calcAmount');
  const calcRate    = document.getElementById('calcRate');
  const calcTenure  = document.getElementById('calcTenure');
  const calcEMI     = document.getElementById('calcEMI');
  const calcInterest= document.getElementById('calcInterest');
  const calcTotal   = document.getElementById('calcTotal');

  function formatINR(n) {
    if (n >= 10000000) return '₹' + (n/10000000).toFixed(1) + ' Cr';
    if (n >= 100000)  return '₹' + (n/100000).toFixed(1) + ' L';
    if (n >= 1000)    return '₹' + (n/1000).toFixed(0) + 'K';
    return '₹' + n;
  }

  function formatFull(n) {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  function calcEMIval() {
    const P = parseInt(calcAmount?.value || 500000);
    const r = parseFloat(calcRate?.value || 12) / 12 / 100;
    const n = parseInt(calcTenure?.value || 60);

    const emi = (P * r * Math.pow(1+r, n)) / (Math.pow(1+r, n) - 1);
    const total = emi * n;
    const interest = total - P;

    if (calcEMI)      calcEMI.textContent = formatFull(emi);
    if (calcInterest) calcInterest.textContent = formatFull(interest);
    if (calcTotal)    calcTotal.textContent = formatFull(total);

    // Update Chart
    const interestPercent = (interest / total) * 100;
    const interestArc = document.getElementById('interestArc');
    const interestLabel = document.getElementById('interestPercent');
    
    if (interestArc) {
      // SVG stroke-dasharray logic: dash, gap
      // Total circumference is 100 based on my path
      interestArc.style.strokeDasharray = `${interestPercent}, 100`;
    }
    if (interestLabel) {
      interestLabel.textContent = Math.round(interestPercent) + '%';
    }

    // Update display labels
    const av = document.getElementById('calcAmountVal');
    const rv = document.getElementById('calcRateVal');
    const tv = document.getElementById('calcTenureVal');
    if (av) av.textContent = formatINR(P);
    if (rv) rv.textContent = parseFloat(calcRate?.value||12) + '%';
    if (tv) {
      const months = parseInt(calcTenure?.value||60);
      tv.textContent = months < 12 ? months + ' Months' : (months/12) + ' Years';
    }
  }

  if (calcAmount)  calcAmount.addEventListener('input', calcEMIval);
  if (calcRate)    calcRate.addEventListener('input', calcEMIval);
  if (calcTenure)  calcTenure.addEventListener('input', calcEMIval);
  calcEMIval(); // Initial calc

  // ── Quick Eligibility Check ───────────────────────────────
  window.checkEligibility = function() {
    const btn = document.querySelector('.btn-check');
    const OriginalText = btn.innerHTML;
    const type    = document.getElementById('loanType')?.value;
    const amount  = parseInt(document.getElementById('loanAmount')?.value || 0);
    const income  = parseInt(document.getElementById('monthlyIncome')?.value || 0);
    const mobile  = document.getElementById('mobile')?.value || '';
    const result  = document.getElementById('eligibilityResult');

    if (!result || !btn) return;

    if (!type || !amount || !income || mobile.length < 10) {
      result.style.display = 'block';
      result.className = 'eligibility-result ineligible';
      result.innerHTML = '⚠️ Please fill all fields correctly.';
      return;
    }

    // Processing State
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    result.style.display = 'none';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = OriginalText;

      // Simple eligibility logic — 40% EMI rule
      const r = 0.01; // 12% approx
      const n = 60;
      const maxEMI = income * 0.4;
      const requiredEMI = (amount * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);

      result.style.display = 'block';
      result.style.animation = 'fade-up 0.5s ease-out';
      
      if (requiredEMI <= maxEMI) {
        result.className = 'eligibility-result eligible';
        result.innerHTML = `✅ <strong>Great news!</strong> You are likely eligible for a loan of ₹${amount.toLocaleString('en-IN')}. <br><a href="apply.html?amount=${amount}&type=${type}" class="btn-primary-sm" style="margin-top:1rem;display:inline-block;padding:.4rem 1rem;font-size:.8rem;border-radius:6px;background:var(--navy);color:#fff;">Finalize Application <i class="fas fa-arrow-right"></i></a>`;
      } else {
        const maxLoan = Math.round(maxEMI * (Math.pow(1+r,n)-1) / (r * Math.pow(1+r,n)) / 1000) * 1000;
        result.className = 'eligibility-result ineligible';
        result.innerHTML = `ℹ️ Based on your income, you may be eligible for up to <strong>₹${maxLoan.toLocaleString('en-IN')}</strong>. <br><a href="contact.html" style="color:var(--navy);font-weight:700;">Talk to our team</a> for options.`;
      }
    }, 1500);
  };

  // ── FAQ Accordion ─────────────────────────────────────────
  window.toggleFaq = function(btn) {
    const answer = btn.nextElementSibling;
    const allBtns = document.querySelectorAll('.faq-q');
    const allAns  = document.querySelectorAll('.faq-a');

    allBtns.forEach(b => b.classList.remove('open'));
    allAns.forEach(a => a.classList.remove('show'));

    if (!answer.classList.contains('show')) {
      btn.classList.add('open');
      answer.classList.add('show');
    }
  };

  // ── Active nav link ───────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // ── Animate numbers on scroll ─────────────────────────────
  function animateNumber(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const numEls = document.querySelectorAll('[data-target]');
  const numObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateNumber(e.target);
        numObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  numEls.forEach(el => numObs.observe(el));

  console.log('✅ Varagan Finance — Website Loaded');
});
