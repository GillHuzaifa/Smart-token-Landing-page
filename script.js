// Mobile nav toggle
const navToggleButton = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
if (navToggleButton && navList) {
    navToggleButton.addEventListener('click', () => {
        const isOpen = navList.classList.toggle('open');
        navToggleButton.setAttribute('aria-expanded', String(isOpen));
    });
}

// Smooth scrolling for same-page links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            navList && navList.classList.remove('open');
            navToggleButton && navToggleButton.setAttribute('aria-expanded', 'false');
        }
    });
});

// Dynamic year in footer
const yearSpan = document.getElementById('year');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
}

// Newsletter handler with backend integration
const BACKEND_ENDPOINT = ''; // e.g., 'https://script.google.com/macros/s/DEPLOYMENT_ID/exec'
const FORM_ENDPOINT = 'https://formspree.io/f/your_form_id_here'; // fallback if BACKEND_ENDPOINT is empty
const newsletterForm = document.querySelector('.newsletter-form');
const newsletterEmail = document.getElementById('newsletter-email');
const newsletterNote = document.getElementById('newsletter-note');
const newsletterCompany = document.getElementById('newsletter-company'); // honeypot

async function submitNewsletter(email) {
    const endpoint = BACKEND_ENDPOINT || FORM_ENDPOINT;
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return response;
}

if (newsletterForm && newsletterEmail && newsletterNote) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = newsletterEmail.value.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValid) {
            newsletterNote.textContent = 'Please enter a valid email address.';
            newsletterNote.style.color = '#ff9aa2';
            return;
        }
        // honeypot check
        if (newsletterCompany && newsletterCompany.value) {
            newsletterNote.textContent = 'Unexpected error. Please try again later.';
            newsletterNote.style.color = '#ff9aa2';
            return;
        }
        const submitButton = newsletterForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        newsletterNote.textContent = '';
        try {
            const res = await submitNewsletter(email);
            if (res.ok) {
                newsletterNote.textContent = 'Thanks! You\'re subscribed.';
                newsletterNote.style.color = '#a7f3d0';
                newsletterEmail.value = '';
            } else {
                newsletterNote.textContent = 'Submission failed. Please try again.';
                newsletterNote.style.color = '#ff9aa2';
            }
        } catch (err) {
            newsletterNote.textContent = 'Network error. Please try again.';
            newsletterNote.style.color = '#ff9aa2';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}


