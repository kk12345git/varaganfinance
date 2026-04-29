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
      'Full Name': document.getElementById('afFirst').value + ' ' + document.getElementById('afLast').value,
      'Contact': document.getElementById('afPhone').value,
      'Identity': `PAN: ***${document.getElementById('afPan').value} | Aadhaar: ***${document.getElementById('afAadhaar').value}`,
      'Loan Type': document.getElementById('afLoanType').value.toUpperCase(),
      'Amount': '₹' + parseInt(document.getElementById('afAmount').value).toLocaleString('en-IN'),
      'Employment': document.getElementById('afJob').value.toUpperCase(),
      'Monthly Income': document.getElementById('afIncome').options[document.getElementById('afIncome').selectedIndex].text,
      'Purpose': document.getElementById('afPurpose').value.toUpperCase()
    };

    summary.innerHTML = '';
    for (let [key, val] of Object.entries(data)) {
      summary.innerHTML += `
        <div class="review-item">
          <span class="review-label">${key}</span>
          <span class="review-value">${val}</span>
        </div>`;
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

    // Close menu when link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.querySelector('i').className = 'fas fa-bars';
      });
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

  // ── 9. Header Chit Announcement Logic ──────────────────
  let currentHeaderSlide = 0;
  const headerSlides = document.querySelectorAll('.ca-slide');

  window.moveHeaderSlide = function(index) {
    if (!headerSlides.length) return;
    headerSlides.forEach(s => s.classList.remove('active'));
    
    currentHeaderSlide = (index + headerSlides.length) % headerSlides.length;
    headerSlides[currentHeaderSlide].classList.add('active');
  };

  window.nextHeaderSlide = () => moveHeaderSlide(currentHeaderSlide + 1);
  window.prevHeaderSlide = () => moveHeaderSlide(currentHeaderSlide - 1);

  function autoHeaderSlide() {
    if (!headerSlides.length) return;
    moveHeaderSlide(currentHeaderSlide + 1);
  }

  if (headerSlides.length) {
    moveHeaderSlide(0); // Initialize first slide
    setInterval(autoHeaderSlide, 6000);
  }

  // ── Form Submission ──────────────────────────────────────
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('applyBtn');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Application...';
      btn.disabled = true;

      const formData = new FormData(applyForm);
      
      const data = {
        name: formData.get('First Name') + ' ' + formData.get('Last Name'),
        mobile: formData.get('Mobile Number'),
        loan_type: formData.get('Loan Type'),
        amount: formData.get('Loan Amount'),
        income: formData.get('Monthly Income'),
        source_page: 'Loan Application'
      };

      fetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }).then(response => {
        if (response.ok) {
          const name = (document.getElementById('afFirst')?.value || '') + ' ' + (document.getElementById('afLast')?.value || '');
          const amount = document.getElementById('afAmount')?.value || '0';
          const type = document.getElementById('afLoanType')?.value || 'Loan';
          
          const summary = { name, amount, type };
          localStorage.setItem('lastApplication', JSON.stringify(summary));

          // AUTO-SEND TO JAIHARI (New Tab)
          const jaihariNumber = "919790792672";
          const message = `*NEW LOAN APPLICATION*%0A%0AName: ${name}%0ALoan: ${type}%0AAmount: ₹${parseInt(amount).toLocaleString('en-IN')}%0A%0A_Sent via Varagan Website_`;
          window.open(`https://wa.me/${jaihariNumber}?text=${message}`, '_blank');

          window.location.href = 'success.html';
        } else {
          // If fetch fails (4xx/5xx), try a standard form submission as a fallback
          // but first show a more detailed error message
          btn.innerHTML = '⚠️ Submission Error. Retrying...';
          setTimeout(() => {
            applyForm.submit(); // Fallback to standard POST
          }, 1500);
        }
      }).catch(error => {
        console.error('Submission error:', error);
        btn.innerHTML = '⚠️ Network Error. Retrying...';
        setTimeout(() => {
          applyForm.submit(); // Fallback to standard POST
        }, 1500);
      });
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      btn.disabled = true;

      const formData = new FormData(contactForm);
      
      const data = {
        name: formData.get('Name'),
        mobile: formData.get('Mobile'),
        loan_type: formData.get('Loan Interest'),
        source_page: 'Contact Enquiry'
      };

      fetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }).then(response => {
        if (response.ok) {
          const name = document.getElementById('cfName')?.value || 'Customer';
          const type = (document.getElementById('cfLoan')?.value || 'Contact') + ' Enquiry';
          const summary = { name, amount: 'N/A', type };
          localStorage.setItem('lastApplication', JSON.stringify(summary));

          // AUTO-SEND TO JAIHARI
          const message = `*NEW CONTACT ENQUIRY*%0A%0AName: ${name}%0AInterest: ${type}%0A%0A_Sent via Varagan Website_`;
          window.open(`https://wa.me/919790792672?text=${message}`, '_blank');

          window.location.href = 'success.html';
        } else {
          btn.innerHTML = '⚠️ Sending Error. Retrying...';
          setTimeout(() => {
            contactForm.submit();
          }, 1500);
        }
      }).catch(error => {
        console.error('Contact error:', error);
        btn.innerHTML = '⚠️ Network Error. Retrying...';
        setTimeout(() => {
          contactForm.submit();
        }, 1500);
      });
    });
  }

  const chitForm = document.getElementById('chitApplyForm');
  if (chitForm) {
    chitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = chitForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      btn.disabled = true;

      const formData = new FormData(chitForm);
      const data = {
        name: formData.get('Name'),
        mobile: formData.get('Mobile'),
        loan_type: 'Chit Fund',
        amount: formData.get('Chit Value'),
        source_page: 'Chit Application'
      };

      fetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }).then(response => {
        if (response.ok) {
          const name = document.getElementById('cfName')?.value || 'Customer';
          const summary = { name, amount: 'Chit Reservation', type: 'Chit Fund' };
          localStorage.setItem('lastApplication', JSON.stringify(summary));

          // AUTO-SEND TO JAIHARI
          const message = `*NEW CHIT RESERVATION*%0A%0AName: ${name}%0AGroup: Chit Fund Slot%0A%0A_Sent via Varagan Website_`;
          window.open(`https://wa.me/919790792672?text=${message}`, '_blank');

          window.location.href = 'success.html';
        } else {
          btn.innerHTML = '⚠️ Error. Try again.';
          btn.disabled = false;
          setTimeout(() => { btn.innerHTML = originalText; }, 3000);
        }
      }).catch(error => {
        btn.innerHTML = '⚠️ Network Error';
        btn.disabled = false;
        setTimeout(() => { btn.innerHTML = originalText; }, 3000);
      });
    });
  }

  const referForm = document.getElementById('referForm');
  if (referForm) {
    referForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = referForm.querySelector('button[type="submit"]');
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
      btn.disabled = true;

      const formData = new FormData(referForm);
      const data = {
        referrer_name: formData.get('Referrer Name'),
        referrer_mobile: formData.get('Referrer Mobile'),
        friend_name: formData.get('Friend Name'),
        friend_mobile: formData.get('Friend Mobile')
      };

      fetch('/api/referrals', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }).then(response => {
        if (response.ok) {
          alert('Referral submitted successfully! We will contact you once approved.');
          referForm.reset();
        } else {
          alert('Submission error. Please try again.');
        }
      }).finally(() => {
        btn.innerHTML = 'Submit Referral <i class="fas fa-paper-plane"></i>';
        btn.disabled = false;
      });
    });
  }

  // ── Auth UI Logic ──────────────────────────────────────────
  const authArea = document.getElementById('authArea');
  if (authArea) {
    const user = JSON.parse(localStorage.getItem('v_user'));
    if (user) {
      authArea.innerHTML = `
        <div style="display:flex; align-items:center; gap:15px;">
          <a href="portal.html" class="nav-link" style="font-size:0.85rem; display:flex; align-items:center; gap:5px;">
            <i class="fas fa-user-circle" style="color:var(--gold-luxe);"></i> ${user.name.split(' ')[0]}
          </a>
          <button onclick="logout()" style="background:none; border:none; color:var(--gray); cursor:pointer; font-size:0.8rem;">Logout</button>
        </div>
      `;
    }
  }

  window.logout = function() {
    localStorage.removeItem('v_token');
    localStorage.removeItem('v_user');
    window.location.reload();
  };

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
      resultDiv.innerHTML = `
        <div class="pre-approval-card reveal-active">
          <div class="pa-header">
            <i class="fas fa-check-circle"></i> Instant Pre-Approval
          </div>
          <div class="pa-body" style="text-align:center; padding: 1.5rem;">
            <p style="color:var(--gray); margin-bottom:1rem;">Based on your income, you are pre-approved for:</p>
            <div style="font-family:var(--font-display); font-size:2.5rem; color:var(--gold-luxe); font-weight:900; margin-bottom:1.5rem;">₹${parseInt(amount).toLocaleString('en-IN')}</div>
            <a href="apply.html" class="btn-primary-lg" style="width:100%; justify-content:center;">Claim Your Loan Now <i class="fas fa-arrow-right"></i></a>
          </div>
          <div style="font-size:0.7rem; color:var(--gray); opacity:0.5; margin-top:1rem;">*Subject to document verification. Validity: 48 Hours.</div>
        </div>
      `;
    } else {
      resultDiv.style.display = 'block';
      resultDiv.className = 'eligibility-result ineligible';
      resultDiv.innerHTML = '<i class="fas fa-circle-exclamation"></i> Loan amount exceeds our standard multipliers for this income level. Try a lower amount or contact us for a special review.';
    }
  };

  // ── Smart WhatsApp Widget Logic ────────────────────────────
  const waWidget = document.getElementById('waWidget');
  const waChatBubble = document.getElementById('waChatBubble');
  const waFloatBtn = document.getElementById('waFloatBtn');
  const waCloseBtn = document.getElementById('waCloseBtn');

  if (waWidget && waChatBubble && waFloatBtn) {
    // Open bubble automatically after 5 seconds
    setTimeout(() => {
      if(!sessionStorage.getItem('waClosed')) {
        waChatBubble.classList.add('open');
      }
    }, 5000);

    waFloatBtn.addEventListener('click', () => {
      waChatBubble.classList.toggle('open');
    });

    waCloseBtn.addEventListener('click', () => {
      waChatBubble.classList.remove('open');
      sessionStorage.setItem('waClosed', 'true');
    });
  }

});

// ── Service Worker Registration (PWA) ────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW Registration failed: ', err);
    });
  });
}
