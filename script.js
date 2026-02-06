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

document.querySelectorAll('.service-card, .tip-card, .testimonial-card, .badge-item').forEach(card => {
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
