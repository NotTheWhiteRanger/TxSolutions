/**
 * TxSolutions Website Scripts
 * Professional IT & Cybersecurity Services
 */

// Smooth scroll for internal anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (href === '#') return; // ignore empty hash
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Fade-in animation for service cards
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .tip-card, .badge-item').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(card);
});

// Mobile nav toggle
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-navigation');
  if (!toggle || !nav) return;
  
  toggle.addEventListener('click', function(){
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    
    if (!expanded){
      nav.style.display = 'flex';
      nav.style.flexDirection = 'column';
      nav.style.background = 'white';
      nav.style.position = 'absolute';
      nav.style.right = '20px';
      nav.style.top = '64px';
      nav.style.padding = '1rem';
      nav.style.borderRadius = '8px';
      nav.style.boxShadow = '0 6px 20px rgba(0,0,0,.12)';
      nav.style.zIndex = '200';
    } else {
      nav.style.display = '';
      nav.style.position = '';
    }
  });
  
  // Close mobile menu on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 880){
      nav.style.display = '';
      nav.style.position = '';
      toggle.setAttribute('aria-expanded','false');
    }
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      if (toggle.getAttribute('aria-expanded') === 'true') {
        nav.style.display = '';
        nav.style.position = '';
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
})();

// Contact Form Handler
(function(){
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const btn = document.getElementById('sendBtn');
  
  if (!form || !status || !btn) return;
  
  // IMPORTANT: Replace this endpoint with your own form submission service
  // Options: Formspree.io, Google Apps Script, or custom backend
  const endpoint = 'https://script.google.com/macros/s/AKfycbyyMhkP-8n0DDKSdhcr18cMIo_MvOCYnbeVbHNm8fa3RZv-K6KF3HZL8czLbdN4JayP0g/exec';

  function isValidEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function sendData(formData){
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try{
      const resp = await fetch(endpoint, { 
        method: 'POST', 
        body: formData, 
        signal: controller.signal 
      });
      clearTimeout(timeout);
      return resp;
    } catch(err){
      clearTimeout(timeout);
      throw err;
    }
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();

    // Honeypot: if filled, silently drop (anti-spam)
    if (form.company && form.company.value.trim() !== '') {
      // Silent rejection - looks like success to bots
      status.textContent = 'Message sent. We\'ll contact you soon.';
      status.className = 'status-ok';
      form.reset();
      return;
    }

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone ? form.phone.value.trim() : '';
    const preferred = form.preferred ? form.preferred.value : 'email';
    const serviceInterest = form.service_interest ? form.service_interest.value : '';
    const message = form.message.value.trim();

    // Validation
    if (!name || !email || !message){
      status.textContent = 'Please complete all required fields.';
      status.className = 'status-err';
      status.setAttribute('aria-hidden', 'false');
      return;
    }

    if (!isValidEmail(email)){
      status.textContent = 'Please enter a valid email address.';
      status.className = 'status-err';
      return;
    }

    // If user prefers phone contact, require a phone number
    if (preferred === 'phone' && !phone){
      status.textContent = 'Please provide a phone number or choose Email as preferred contact.';
      status.className = 'status-err';
      return;
    }

    // Show sending state
    status.textContent = 'Sending...';
    status.className = '';
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    form.setAttribute('aria-busy', 'true');

    try{
      // Build FormData
      const fd = new FormData(form);
      fd.set('phone', phone || '');
      fd.set('preferred', preferred || 'email');
      fd.set('service_interest', serviceInterest || 'General Inquiry');
      // Combine message for compatibility with various form handlers
      fd.set('fullMessage', `Service Interest: ${serviceInterest || 'General Inquiry'}\nPreferred contact: ${preferred}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`);

      const resp = await sendData(fd);
      
      if (resp && resp.ok){
        // Reflect preferred contact back to user for clarity
        const contactLine = (preferred === 'phone' && phone) ? `We'll contact you by phone at ${phone}.` : `We'll contact you by email at ${email}.`;
        status.textContent = `Message sent. ${contactLine}`;
        status.className = 'status-ok';
        form.reset();
      } else {
        status.textContent = 'Error sending message. Please try calling us at (254) 442-0796.';
        status.className = 'status-err';
      }
    } catch(err){
      if (err.name === 'AbortError'){
        status.textContent = 'Request timed out. Please try again or call (254) 442-0796.';
      } else {
        status.textContent = 'Network error. Please call us at (254) 442-0796.';
      }
      status.className = 'status-err';
    } finally {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      form.removeAttribute('aria-busy');
    }
  });
})();

// Animated Statistics Counter
(function() {
  const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, duration / steps);
  };

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumbers = entry.target.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => animateCounter(stat));
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    statObserver.observe(statsSection);
  }
})();

// Password Strength Checker
(function() {
  const passwordInput = document.getElementById('passwordInput');
  const togglePassword = document.getElementById('togglePassword');
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');

  if (!passwordInput || !strengthFill || !strengthText) return;

  // Toggle password visibility
  togglePassword?.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
  });

  // Check password strength
  function checkPasswordStrength(password) {
    if (!password) {
      return { strength: 'none', score: 0, text: 'Enter a password to check its strength' };
    }

    let score = 0;
    const checks = {
      length: password.length >= 12,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^a-zA-Z0-9]/.test(password),
      longLength: password.length >= 16,
      veryLongLength: password.length >= 20
    };

    // Check for common weak patterns
    const commonPatterns = [
      /password/i,
      /123456/,
      /qwerty/i,
      /abc/i,
      /111/,
      /000/,
      /admin/i,
      /letmein/i,
      /welcome/i,
      /monkey/i,
      /dragon/i,
      /master/i,
      /sunshine/i,
      /princess/i,
      /login/i,
      /passw0rd/i,
      /pass/i,
      /\b\d{4,}\b/, // 4+ consecutive digits
      /([a-z])\1{2,}/i, // 3+ repeated characters (aaa, 111, etc)
    ];

    const hasWeakPattern = commonPatterns.some(pattern => pattern.test(password));

    // Calculate score
    if (checks.length) score += 2;
    if (checks.longLength) score += 2;
    if (checks.veryLongLength) score += 1;
    if (checks.lowercase) score += 1;
    if (checks.uppercase) score += 1;
    if (checks.numbers) score += 1;
    if (checks.symbols) score += 2;

    // Check for multiple character types
    let charTypeCount = 0;
    if (checks.lowercase) charTypeCount++;
    if (checks.uppercase) charTypeCount++;
    if (checks.numbers) charTypeCount++;
    if (checks.symbols) charTypeCount++;
    
    if (charTypeCount >= 3) score += 1;
    if (charTypeCount === 4) score += 1;

    // Penalize if weak patterns detected
    if (hasWeakPattern) {
      score = Math.max(0, score - 4);
    }

    // Determine strength with stricter thresholds
    if (score <= 3 || hasWeakPattern) {
      return { strength: 'weak', score, text: '❌ Weak - Your password is easily crackable' };
    } else if (score <= 6) {
      return { strength: 'fair', score, text: '⚠️ Fair - Could be stronger' };
    } else if (score <= 9) {
      return { strength: 'good', score, text: '✓ Good - Decent password' };
    } else {
      return { strength: 'strong', score, text: '✓✓ Strong - Excellent password!' };
    }
  }

  passwordInput.addEventListener('input', (e) => {
    const password = e.target.value;
    const result = checkPasswordStrength(password);

    // Update UI
    strengthFill.className = `strength-fill ${result.strength}`;
    strengthText.className = `strength-text ${result.strength}`;
    strengthText.textContent = result.text;
  });
})();

// Scroll Progress Indicator
(function() {
  const progressBar = document.getElementById('scrollProgress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = `${scrolled}%`;
  });
})();

// Floating Action Button (FAB)
(function() {
  const fabButton = document.getElementById('fabButton');
  const fabMenu = document.getElementById('fabMenu');
  
  if (!fabButton || !fabMenu) return;

  let isMenuOpen = false;

  fabButton.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    
    if (isMenuOpen) {
      fabMenu.removeAttribute('hidden');
      setTimeout(() => {
        fabMenu.classList.add('show');
        fabButton.classList.add('active');
      }, 10);
    } else {
      fabMenu.classList.remove('show');
      fabButton.classList.remove('active');
      setTimeout(() => {
        fabMenu.setAttribute('hidden', '');
      }, 300);
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (isMenuOpen && !fabButton.contains(e.target) && !fabMenu.contains(e.target)) {
      fabMenu.classList.remove('show');
      fabButton.classList.remove('active');
      isMenuOpen = false;
      setTimeout(() => {
        fabMenu.setAttribute('hidden', '');
      }, 300);
    }
  });

  // Close menu when clicking a menu item
  fabMenu.querySelectorAll('.fab-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      fabMenu.classList.remove('show');
      fabButton.classList.remove('active');
      isMenuOpen = false;
      setTimeout(() => {
        fabMenu.setAttribute('hidden', '');
      }, 300);
    });
  });
})();

// Show FAB after scrolling down
(function() {
  const fabButton = document.getElementById('fabButton');
  if (!fabButton) return;

  // Hide initially
  fabButton.style.opacity = '0';
  fabButton.style.pointerEvents = 'none';

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      fabButton.style.opacity = '1';
      fabButton.style.pointerEvents = 'all';
    } else {
      fabButton.style.opacity = '0';
      fabButton.style.pointerEvents = 'none';
    }
  });
})();
