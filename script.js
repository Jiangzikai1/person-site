(() => {
    const root = document.documentElement;
    const themeToggle = document.querySelector('.theme-toggle');
    const saved = localStorage.getItem('portfolio-theme-v5');
    const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
    
    root.dataset.theme = saved || (prefersDark ? 'dark' : 'light');

    const syncThemeIcon = () => {
        if (themeToggle) {
            themeToggle.textContent = root.dataset.theme === 'dark' ? '☀' : '◐';
        }
    };
    syncThemeIcon();

    themeToggle?.addEventListener('click', () => {
        root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('portfolio-theme-v5', root.dataset.theme);
        syncThemeIcon();
    });

    const navToggle = document.getElementById('nav-toggle-btn');
    const nav = document.getElementById('main-nav');

    navToggle?.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            navToggle?.setAttribute('aria-expanded', 'false');
        });
    });

    const header = document.querySelector('.site-header');
    addEventListener('scroll', () => {
        header?.classList.toggle('scrolled', scrollY > 6);
    }, { passive: true });

    const backToTopLink = document.getElementById('back-to-top');
    backToTopLink?.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((element, index) => {
        
        element.style.transitionDelay = `${Math.min(index % 3, 2) * 45}ms`;
        revealObserver.observe(element);
    });

    const visitCountEl = document.getElementById('visit-count');
    const vercountSitePv = document.getElementById('vercount_value_site_pv');

    const syncVisitCount = () => {
        const value = vercountSitePv?.textContent?.trim();
        if (value && value !== 'Loading' && value !== '加载中...') {
            if (visitCountEl) visitCountEl.textContent = value;
            return true;
        }
        return false;
    };

    if (!vercountSitePv && visitCountEl) {
        const counterNode = document.createElement('span');
        counterNode.id = 'vercount_value_site_pv';
        counterNode.style.display = 'none';
        counterNode.textContent = 'Loading';
        document.body.appendChild(counterNode);
    }

    let syncAttempts = 0;
    const syncTimer = setInterval(() => {
        syncAttempts += 1;
        if (syncVisitCount() || syncAttempts > 30) {
            clearInterval(syncTimer);
        }
    }, 300);

    const overviewCards = document.getElementById('project-overview-cards');
    const detailCards = [...document.querySelectorAll('#projects .detail-card[data-project]')];

    const escapeText = (value) => String(value ?? '').trim();

    const buildOverview = () => {
        if (!overviewCards || !detailCards.length) return;

        const cards = detailCards.map((detailCard, index) => {
            const id = detailCard.dataset.project;
            const titleEl = detailCard.querySelector('.detail-head h3');
            const tagEl = detailCard.querySelector('.detail-head .tag');
            const dateEl = detailCard.querySelector('.detail-date');
            const summaryEl = detailCard.querySelector('.detail-summary');
            const capabilityEls = [...detailCard.querySelectorAll('.capability')];

            const title = titleEl ? titleEl.innerHTML.trim() : '未命名项目';
            const tag = tagEl ? tagEl.outerHTML : '';
            const date = dateEl ? escapeText(dateEl.textContent) : '';
            const summary = summaryEl ? escapeText(summaryEl.textContent) : '';
            const capabilities = capabilityEls.map(el => ({
                label: escapeText(el.querySelector('span')?.textContent),
                value: escapeText(el.querySelector('strong')?.textContent)
            })).filter(item => item.value);

            const techTags = capabilities
                .flatMap(item => item.value.split(/[·｜|]/).map(s => s.trim()))
                .filter(Boolean)
                .slice(0, index === 0 ? 4 : 5);

            const card = document.createElement('article');
            card.className = `project-card ${index === 0 ? 'project-card-main' : 'compact-card'} hover-lift`;
            card.dataset.project = id;

            card.innerHTML = `
                <div class="card-top">
                    <div class="card-top-left">
                        <span>${String(index + 1).padStart(2, '0')}</span>
                        ${tag}
                    </div>
                    <span>${date}</span>
                </div>
                <div class="card-content">
                    <h3>${title}</h3>
                    <p>${summary}</p>
                    <div class="card-tags">
                        ${techTags.map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                </div>
                ${index === 0 ? `
                <div class="card-stats">
                    ${capabilities.slice(0, 3).map(item => `
                        <div class="stat-item">
                            <strong>${item.value}</strong>
                            <span>${item.label}</span>
                        </div>
                    `).join('')}
                </div>` : ''}
            `;
            return card;
        });

        overviewCards.innerHTML = '';

        if (cards.length) {
            overviewCards.appendChild(cards[0]);

            if (cards.length > 1) {
                const stack = document.createElement('div');
                stack.className = 'project-card-stack';

                const scrollWrap = document.createElement('div');
                scrollWrap.className = 'scroll-wrap';
                cards.slice(1).forEach(card => scrollWrap.appendChild(card));

                stack.appendChild(scrollWrap);

                if (cards.length > 2) {
                    stack.insertAdjacentHTML('beforeend', `
                        <div class="scroll-indicator">
                            <svg viewBox="0 0 24 24" width="14" height="14"
                                 stroke="currentColor" stroke-width="2" fill="none">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                            滚动查看更多
                        </div>
                    `);
                }

                overviewCards.appendChild(stack);
            }
        }
    };

    buildOverview();

    const skillData = [...document.querySelectorAll('#skill-data [data-skill-value]')];
    const radarValue = document.getElementById('radar-value');
    const radarDots = document.getElementById('radar-dots');
    const radarLegend = document.querySelector('.radar-legend');
    const center = 210, radius = 172;
    const angles = [-Math.PI / 2, -Math.PI / 6, Math.PI / 6, Math.PI / 2, 5 * Math.PI / 6, 7 * Math.PI / 6];
    const radarPoints = values => values.map((value, i) => {
        const r = radius * Math.max(0, Math.min(100, Number(value) || 0)) / 100;
        return [center + Math.cos(angles[i]) * r, center + Math.sin(angles[i]) * r];
    });
    const renderRadar = () => {
        const values = skillData.map(el => Number(el.dataset.skillValue) || 0);
        const points = radarPoints(values);
        radarValue?.setAttribute('points', points.map(p => p.join(',')).join(' '));
        if (radarDots) radarDots.innerHTML = points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"></circle>`).join('');
        if (radarLegend) radarLegend.innerHTML = skillData.map(el => `<span>${el.dataset.skill}<strong>${Number(el.dataset.skillValue) || 0}</strong></span>`).join('');
    };
    renderRadar();

    const modal = document.getElementById('project-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');
    const modalBody = document.getElementById('modal-body');

    const openModalFromCard = (card) => {
        const id = card.getAttribute('data-project');
        const source = document.querySelector(`#projects .detail-card[data-project="${CSS.escape(id)}"]`);
        if (!source) return;

        const title = source.querySelector('.detail-head h3')?.textContent.trim() || '项目详情';
        const date = source.querySelector('.detail-date')?.textContent.trim() || '';
        const tag = source.querySelector('.tag')?.textContent.trim() || '';
        const content = source.querySelector('.detail-content')?.cloneNode(true);

        modalTitle.textContent = title;
        modalMeta.textContent = [date, tag].filter(Boolean).join(' | ');

        if (content) {
            content.querySelector('.detail-head')?.remove();
            modalBody.innerHTML = '';
            modalBody.appendChild(content);
        } else {
            modalBody.innerHTML = '<p>暂无详细信息</p>';
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const bindProjectCardEvents = () => {
        document.querySelectorAll('.project-card[data-project], #projects .detail-card[data-project]').forEach(card => {
            if (card.dataset.modalBound === 'true') return;
            card.dataset.modalBound = 'true';
            card.addEventListener('click', function(e) {
                if (e.target.closest('a') || e.target.closest('button')) return;
                if (this.classList.contains('project-card')) {
                    const target = document.querySelector(`#projects .detail-card[data-project="${CSS.escape(this.dataset.project)}"]`);
                    if (target) {
                        const offset = (document.querySelector('.site-header')?.offsetHeight || 0) + 18;
                        const top = target.getBoundingClientRect().top + window.scrollY - offset;
                        window.scrollTo({ top, behavior: 'smooth' });
                    }
                } else {
                    openModalFromCard(this);
                }
            });
        });
    };

    bindProjectCardEvents();

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = ''; 
    };

    modalClose?.addEventListener('click', closeModal);
    
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
    
    modal?.querySelector('.modal-content')?.addEventListener('wheel', (e) => {
        e.stopPropagation();
    }, { passive: true });

})();