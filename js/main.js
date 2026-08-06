(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  const header = document.querySelector('.site-header');

  const saved = localStorage.getItem('portfolio-theme-v5');
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = saved || (prefersDark ? 'dark' : 'light');

  const syncTheme = () => {
    if (themeToggle) themeToggle.textContent = root.dataset.theme === 'dark' ? '☀' : '◐';
  };
  syncTheme();

  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('portfolio-theme-v5', root.dataset.theme);
    syncTheme();
  });

  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.site-nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', scrollY > 6);
  }, { passive: true });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .1 });

  document.querySelectorAll('.reveal').forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 45}ms`;
    observer.observe(element);
  });
})();
