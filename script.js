const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const menuToggle = $('.menu-toggle');
const mobileMenu = $('.mobile-menu');
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  mobileMenu.classList.toggle('is-open', !open);
  mobileMenu.setAttribute('aria-hidden', String(open));
});
$$('.mobile-menu a').forEach((link) => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
}));

const serviceContent = [
  { icon: '✦', title: 'Save time<br />with AI.', copy: 'We find tasks your team repeats and build simple AI tools to do them faster.', tags: ['Workflows', 'Chatbots', 'CRM logic'] },
  { icon: '↗', title: 'Meta Ads that<br />get attention.', copy: 'We create and improve ads for Facebook and Instagram so the right people see your offer.', tags: ['Paid social', 'Creative testing', 'Retargeting'] },
  { icon: '⌁', title: 'Google Ads for<br />ready buyers.', copy: 'We help your business show up when people search for what you sell.', tags: ['Search', 'Shopping', 'CRO'] },
  { icon: '⌂', title: 'Websites that<br />make sense.', copy: 'We build fast, simple websites that look good and make it easy for visitors to contact or buy.', tags: ['Web design', 'Development', 'CRO'] },
  { icon: '◌', title: 'Social media<br />people remember.', copy: 'We plan and create useful posts that help your brand stay visible and trusted.', tags: ['Content systems', 'Community', 'Social strategy'] },
  { icon: '◈', title: 'AI tools<br />for real work.', copy: 'We use AI to improve support, ideas, research, and daily work.', tags: ['AI strategy', 'Assistants', 'Custom builds'] },
];
const serviceDetail = $('.service-detail');
const placeServiceDetail = (item, index) => {
  item.insertAdjacentElement('afterend', serviceDetail);
  updateService(index);
};
const updateService = (index) => {
  const data = serviceContent[index];
  serviceDetail.classList.add('is-switching');
  window.setTimeout(() => {
    $('.detail-index span', serviceDetail).textContent = `${String(index + 1).padStart(2, '0')}/06`;
    $('.detail-icon', serviceDetail).textContent = data.icon;
    $('h3', serviceDetail).innerHTML = data.title;
    $('p', serviceDetail).textContent = data.copy;
    $('.detail-tags', serviceDetail).innerHTML = data.tags.map((tag) => `<span>${tag}</span>`).join('');
    serviceDetail.classList.remove('is-switching');
  }, 150);
};
const serviceItems = $$('.service-item');
placeServiceDetail(serviceItems.find((item) => item.classList.contains('is-active')) || serviceItems[0], 0);
serviceItems.forEach((item) => item.addEventListener('click', () => {
  const index = Number(item.dataset.service);
  serviceItems.forEach((button) => button.classList.toggle('is-active', button === item));
  placeServiceDetail(item, index);
}));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach((element) => revealObserver.observe(element));

const countObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix || '';
    const duration = 800;
    const start = performance.now();
    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    observer.unobserve(element);
  });
}, { threshold: 0.8 });
$$('[data-count]').forEach((element) => countObserver.observe(element));

$$('.filter').forEach((filter) => filter.addEventListener('click', () => {
  const value = filter.dataset.filter;
  $$('.filter').forEach((button) => button.classList.toggle('is-active', button === filter));
  $$('.work-card').forEach((card) => {
    const visible = value === 'all' || card.dataset.category.split(' ').includes(value);
    card.classList.toggle('is-hidden', !visible);
  });
}));

const glow = $('.cursor-glow');
window.addEventListener('pointermove', (event) => {
  if (!glow || window.matchMedia('(pointer: coarse)').matches) return;
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
  glow.style.opacity = '1';
});
window.addEventListener('pointerleave', () => { if (glow) glow.style.opacity = '0'; });

$$('.magnetic').forEach((element) => {
  element.addEventListener('pointermove', (event) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.08;
    element.style.transform = `translate(${x}px, ${y}px)`;
  });
  element.addEventListener('pointerleave', () => { element.style.transform = ''; });
});
