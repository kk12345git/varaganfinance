// ============================================================
// VARAGAN FINANCE PVT LTD — Elite Multi-functional Core Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Premium Loader Logic ──────────────────────────────
  const loader = document.getElementById('loader');
  const loaderProgress = document.getElementById('loaderProgress');
  
  function initLoader() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 100) progress = 100;
      if (loaderProgress) loaderProgress.style.width = progress + '%';
      
      if (progress === 100) {
        clearInterval(interval);
        setTimeout(() => {
          loader.classList.add('hidden');
          // Start other entry animations
          startHeroAnimations();
        }, 400);
      }
    }, 150);
  }
  initLoader();

  // ── 2. Dark/Light Mode Persistence ───────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const currentTheme = localStorage.getItem('vf-theme') || 'dark';

  body.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = body.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('vf-theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  // ── 3. Typewriter Effect for Hero ────────────────────────
  const typewriterEl = document.getElementById('typewriter');
  const phrases = ["Visionary Goals.", "Business Growth.", "Family Dreams.", "Elite Future."];
  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function type() {
    if (!typewriterEl) return;
    const currentPhrase = phrases[phraseIdx];
    
    if (isDeleting) {
      charIdx--;
    } else {
      charIdx++;
    }

    typewriterEl.textContent = currentPhrase.substring(0, charIdx);

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIdx === currentPhrase.length) {
      isDeleting = true;
      typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
  }

  function startHeroAnimations() {
    type();
  }

  // ── 4. Multi-step Form Internal Logic ────────────────────
  window.nextStep = function(step) {
    const activeStep = document.querySelector('.form-step.active');
    const targetStep = document.querySelector(`.form-step[data-step="${step}"]`);
    
    if (step > parseInt(activeStep.dataset.step)) {
      if (!validateStep(activeStep)) return;
    }

    if (step === 3) populateSummary();

    activeStep.classList.remove('active');
    targetStep.classList.add('active');

    // Update Pills
    document.querySelectorAll('.si-pill').forEach(pill => {
      pill.classList.toggle('active', parseInt(pill.dataset.step) <= step);
    });
  };

  function validateStep(stepEl) {
    const inputs = stepEl.querySelectorAll('input[required], select[required]');
    let valid = true;
    inputs.forEach(input => {
      if (!input.value) {
        input.style.borderColor = '#ef4444';
        valid = false;
      } else {
        input.style.borderColor = '';
      }
    });
    return valid;
  }

  function populateSummary() {
    const summary = document.getElementById('reviewSummary');
    if (!summary) return;
    
    const data = {
      'Name': document.getElementById('afFirst').value + ' ' + document.getElementById('afLast').value,
      'Email': document.getElementById('afEmail').value || 'Not provided',
      'Loan': document.getElementById('afLoanType').value.toUpperCase(),
      'Amount': '₹' + parseInt(document.getElementById('afAmount').value).toLocaleString('en-IN')
    };

    summary.innerHTML = '';
    for (let [key, val] of Object.entries(data)) {
      summary.innerHTML += `<li style="display:flex; justify-content:space-between; margin-bottom:0.4rem; padding-bottom:0.4rem; border-bottom:1px solid var(--glass-border);">
        <span style="font-weight:700;">${key}:</span>
        <span>${val}</span>
      </li>`;
    }
  }

  // ── 5. Enhanced Navbar & Menu ──────────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = hamburger.querySelector('i');
      icon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    });
  }

  // ── 6. Advanced Scroll Reveal ──────────────────────────────
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        if (e.target.classList.contains('loan-card')) {
          e.target.style.transitionDelay = (Array.from(e.target.parentNode.children).indexOf(e.target) * 0.1) + 's';
        }
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .loan-card, .step').forEach(el => revealObs.observe(el));

  // ── 7. EMI Calculator Enhanced ────────────────────────────
  const calcAmount = document.getElementById('calcAmount');
  const calcRate = document.getElementById('calcRate');
  const calcTenure = document.getElementById('calcTenure');

  function updateEMI() {
    if (!calcAmount) return;
    const P = parseInt(calcAmount.value);
    const R = (parseFloat(calcRate.value) / 12) / 100;
    const N = parseInt(calcTenure.value);

    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    const totalPayable = emi * N;
    const totalInterest = totalPayable - P;

    document.getElementById('calcEMI').textContent = '₹' + Math.round(emi).toLocaleString('en-IN');
    document.getElementById('calcInterest').textContent = '₹' + Math.round(totalInterest).toLocaleString('en-IN');
    document.getElementById('calcTotal').textContent = '₹' + Math.round(totalPayable).toLocaleString('en-IN');
    
    document.getElementById('calcAmountVal').textContent = '₹' + (P / 100000).toFixed(1) + 'L';
    document.getElementById('calcRateVal').textContent = calcRate.value + '%';
    document.getElementById('calcTenureVal').textContent = (N / 12) + ' Years';

    // Update SVG Chart
    const interestPercent = (totalInterest / totalPayable) * 100;
    const arc = document.getElementById('interestArc');
    if (arc) arc.style.strokeDasharray = `${interestPercent}, 100`;
  }

  [calcAmount, calcRate, calcTenure].forEach(el => {
    if (el) el.addEventListener('input', updateEMI);
  });
  updateEMI();

  // ── Form Submission ──────────────────────────────────────
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('applyBtn');
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finalizing...';
      btn.disabled = true;

      setTimeout(() => {
        document.getElementById('applySuccess').style.display = 'block';
        btn.innerHTML = '✅ Consultation Booked';
        btn.style.background = '#16a34a';
        applyForm.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
      }, 1500);
    });
  }

  // ── Global Functions ──────────────────────────────────────
  window.toggleFaq = function(element) {
    const answer = element.nextElementSibling;
    const isOpen = answer.classList.contains('show');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-a').forEach(el => {
      el.classList.remove('show');
      el.previousElementSibling.classList.remove('open');
    });

    if (!isOpen) {
      answer.classList.add('show');
      element.classList.add('open');
    }
  };

  window.checkEligibility = function() {
    const amount = document.getElementById('loanAmount')?.value;
    const income = document.getElementById('monthlyIncome')?.value;
    const resultDiv = document.getElementById('eligibilityResult');
    
    if (!amount || !income) {
      resultDiv.style.display = 'block';
      resultDiv.className = 'eligibility-result ineligible';
      resultDiv.innerHTML = 'Please fill out all fields.';
      return;
    }
    
    if (income * 50 >= amount) {
      resultDiv.style.display = 'block';
      resultDiv.className = 'eligibility-result eligible';
      resultDiv.innerHTML = '✅ You are eligible! <a href="apply.html" style="text-decoration:underline; font-weight:bold;">Apply Now</a>';
    } else {
      resultDiv.style.display = 'block';
      resultDiv.className = 'eligibility-result ineligible';
      resultDiv.innerHTML = '⚠️ Loan amount might be too high for this income.';
    }
  };

});
