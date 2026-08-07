(() => {
    /*
     * 联系我推送配置：只需要把 uuid 换成你自己的 NotifyMe UUID。
     * NotifyMe 官方教程确认支持 GET：uuid / title / body / group / bigText。
     * endpoint 不建议改，除非你有自己的兼容接口。
     */
    const NOTIFY_CONFIG = {
        endpoint: 'https://notifyme-server.wzn556.top/',
        uuid: 'R3J9nCn2Kq24uyT6cpo4BV',
        group: 'portfolio-hr'
    };

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

    const getHeaderOffset = () => (document.querySelector('.site-header')?.offsetHeight || 0) + 6;

    const scrollToElement = (target, extraOffset = 0) => {
        if (!target) return;
        const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - getHeaderOffset() - extraOffset);
        window.scrollTo({ top, behavior: 'smooth' });
    };

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const id = link.getAttribute('href');
            if (!id || id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            nav?.classList.remove('open');
            navToggle?.setAttribute('aria-expanded', 'false');
            const heading = target.querySelector(':scope > .container > .section-heading, :scope > .container > .section-title-row, :scope > .section-heading, :scope > .section-title-row');
            scrollToElement(heading || target);
            history.replaceState(null, '', id);
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

    const brandLabel = document.getElementById('brand-label');
    const brandSublabel = document.getElementById('brand-sublabel');
    const brandSections = [
        { selector: '#overview', label: 'ZiKai Portfolio', en: 'PERSONAL PORTFOLIO', section: null },
        { selector: '#experience', label: '工作经历', en: 'WORK EXPERIENCE', section: '#experience' },
        { selector: '#skills', label: '能力与荣誉', en: 'CAPABILITY & HONORS', section: '#skills' },
        { selector: '#projects', label: '项目详情', en: 'PROJECT DETAILS', section: '#projects' }
    ];
    const detailBrandItems = [...document.querySelectorAll('#projects .detail-card[data-project]')].map(card => ({
        el: card,
        label: card.querySelector('.detail-head h3')?.textContent.trim() || '项目详情',
        en: 'PROJECT CASE STUDY'
    }));
    let activeBrand = '';
    let brandTimer;
    let brandIdleTimer;
    const setBrand = (label, en, activeSection = null) => {
        if (!brandLabel || !label) return;
        if (label === activeBrand && brandLabel.dataset.en === en) return;
        activeBrand = label;
        brandLabel.classList.add('is-changing');
        brandSublabel?.classList.add('is-changing');
        clearTimeout(brandTimer);
        brandTimer = setTimeout(() => {
            brandLabel.textContent = label;
            if (brandSublabel) {
                brandSublabel.textContent = en || '';
                brandSublabel.dataset.en = en || '';
            }
            brandLabel.classList.remove('is-changing');
            brandSublabel?.classList.remove('is-changing');
        }, 150);

        document.querySelectorAll('.context-collapsible').forEach(el => el.classList.remove('context-collapsed'));
        if (activeSection) {
            const section = document.querySelector(activeSection);
            section?.querySelector(':scope > .container > .section-heading, :scope > .container > .experience-label')?.classList.add('context-collapsed');
        }
        if (activeSection === '#projects') {
            document.querySelector('#projects > .container > .section-heading')?.classList.add('context-collapsed');
        }
    };
    const getBrandCandidate = () => {
        if (!brandLabel) return null;
        const line = getHeaderOffset() + Math.min(72, Math.max(42, window.innerHeight * 0.12));
        const detail = detailBrandItems.find(item => {
            const r = item.el.getBoundingClientRect();
            return r.top <= line && r.bottom > line;
        });
        if (detail) return { label: detail.label, en: detail.en, section: '#projects' };

        const section = brandSections.find(item => {
            const el = document.querySelector(item.selector);
            if (!el) return false;
            const r = el.getBoundingClientRect();
            return r.top <= line && r.bottom > line;
        });
        return {
            label: section?.label || 'ZiKai Portfolio',
            en: section?.en || 'PERSONAL PORTFOLIO',
            section: section?.section || null
        };
    };
    const updateBrandByViewport = () => {
        clearTimeout(brandIdleTimer);
        brandIdleTimer = setTimeout(() => {
            const candidate = getBrandCandidate();
            if (candidate) setBrand(candidate.label, candidate.en, candidate.section);
        }, 180);
    };
    addEventListener('scroll', updateBrandByViewport, { passive: true });
    addEventListener('resize', updateBrandByViewport);
    setTimeout(updateBrandByViewport, 0);
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

            const title = titleEl ? escapeText(titleEl.textContent) : '未命名项目';
            const tag = tagEl ? tagEl.outerHTML : '';
            const date = dateEl ? escapeText(dateEl.textContent) : '';
            const summary = summaryEl ? escapeText(summaryEl.textContent) : '';
            const capabilities = capabilityEls.map(el => ({
                label: escapeText(el.querySelector('span')?.textContent),
                value: escapeText(el.querySelector('strong')?.textContent)
            })).filter(item => item.value);

            /* HR 首页只需要先回答三件事：做过什么、负责什么、为什么值得点进去。 */
            const responsibility = capabilities.find(item => /职责|工作|核心工作/i.test(item.label))?.value || capabilities[0]?.value || '';
            const scene = capabilities.find(item => /场景|环境|范围/i.test(item.label))?.value || capabilities[1]?.value || '';
            const valueLine = [responsibility, scene].filter(Boolean).join(' · ');
            const techTags = scene
                .split(/[·｜|]/)
                .map(s => s.trim())
                .filter(Boolean)
                .slice(0, 3);

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
                    <div class="overview-value-line">${valueLine}</div>
                    <div class="card-tags">
                        ${techTags.map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                </div>
                ${index === 0 ? `
                <div class="overview-cta">
                    <span>查看完整项目拆解</span>
                    <span>→</span>
                </div>` : ''}
            `;
            return card;
        });

        overviewCards.innerHTML = '';
        if (!cards.length) return;

        overviewCards.appendChild(cards[0]);
        if (cards.length > 1) {
            const stack = document.createElement('div');
            stack.className = 'project-card-stack';
            const scrollWrap = document.createElement('div');
            scrollWrap.className = 'scroll-wrap';
            cards.slice(1).forEach(card => scrollWrap.appendChild(card));
            stack.appendChild(scrollWrap);
            overviewCards.appendChild(stack);
        }
    };
    buildOverview();

    const skillData = [...document.querySelectorAll('#skill-data [data-skill-value]')];
    const radarValue = document.getElementById('radar-value');
    const radarDots = document.getElementById('radar-dots');
    const radarLegend = document.querySelector('.radar-legend');
    const radarHighlightLines = document.getElementById('radar-highlight-lines');
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
        if (radarHighlightLines) {
            radarHighlightLines.innerHTML = '';
            points.forEach((point, i) => {
                const prev = points[(i - 1 + points.length) % points.length];
                const next = points[(i + 1) % points.length];
                radarHighlightLines.insertAdjacentHTML('beforeend', `<line data-edge="${i}-prev" x1="${point[0]}" y1="${point[1]}" x2="${prev[0]}" y2="${prev[1]}"></line><line data-edge="${i}-next" x1="${point[0]}" y1="${point[1]}" x2="${next[0]}" y2="${next[1]}"></line>`);
            });
        }
        if (radarDots) {
            radarDots.innerHTML = points.map(([x, y], i) => `<circle data-index="${i}" cx="${x}" cy="${y}" r="5"></circle>`).join('');
        }
        if (radarLegend) {
            radarLegend.innerHTML = skillData.map((el, i) => `<span data-index="${i}">${el.dataset.skill}<strong>${Number(el.dataset.skillValue) || 0}</strong></span>`).join('');
        }
        const labels = [...document.querySelectorAll('.radar-labels text')];
        const dots = [...document.querySelectorAll('.radar-dots circle')];
        const legendItems = [...document.querySelectorAll('.radar-legend span')];
        const setRadarActive = index => {
            [...dots, ...labels, ...legendItems].forEach(node => node.classList.toggle('is-active', Number(node.dataset.index) === index));
            radarHighlightLines?.querySelectorAll('line').forEach(line => {
                const edge = line.dataset.edge || '';
                line.classList.toggle('is-active', Number(index) >= 0 && (edge === `${index}-prev` || edge === `${index}-next`));
            });
        };
        labels.forEach((node, i) => node.dataset.index = i);
        dots.forEach(node => {
            node.addEventListener('mouseenter', () => setRadarActive(Number(node.dataset.index)));
            node.addEventListener('mouseleave', () => setRadarActive(-1));
        });
        legendItems.forEach(node => {
            node.addEventListener('mouseenter', () => setRadarActive(Number(node.dataset.index)));
            node.addEventListener('mouseleave', () => setRadarActive(-1));
        });
        labels.forEach(node => {
            node.addEventListener('mouseenter', () => setRadarActive(Number(node.dataset.index)));
            node.addEventListener('mouseleave', () => setRadarActive(-1));
        });
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
                        scrollToElement(target, 0);
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


    // 联系我：浏览器端直接调用 NotifyMe GET 接口；不需要额外服务器。
    const contactModal = document.getElementById('contact-modal');
    const contactTrigger = document.getElementById('contact-trigger');
    const contactClose = document.getElementById('contact-close');
    const contactForm = document.getElementById('contact-form');
    const contactStatus = document.getElementById('contact-status');

    const closeContactModal = () => {
        contactModal?.classList.remove('active');
        contactModal?.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const openContactModal = () => {
        contactModal?.classList.add('active');
        contactModal?.setAttribute('aria-hidden', 'false');
        contactStatus.textContent = '';
        setTimeout(() => document.getElementById('contact-role')?.focus(), 80);
        document.body.style.overflow = 'hidden';
    };

    const buildNotifyPayload = ({ company, role, contact, rating, direct }) => {
        const time = new Date().toLocaleString('zh-CN', { hour12: false });
        const source = location.href;
        const body = [
            'HR岗位反馈',
            `公司：${company}`,
            `岗位：${role}`,
            `联系方式：${contact}`,
            `满意度：${rating}`,
            `是否直签：${direct}`,
            `时间：${time}`
        ].join('\n');
        const markdown = [
            '## HR岗位反馈',
            '',
            `**公司：** ${company}`,
            `**岗位：** ${role}`,
            `**联系方式：** ${contact}`,
            `**满意度：** ${rating}`,
            `**是否直签：** ${direct}`,
            '',
            `**提交时间：** ${time}`,
            `**来源页面：** ${source}`
        ].join('\n');

        return {
            data: {
                uuid: NOTIFY_CONFIG.uuid,
                ttl: 86400,
                priority: 'high',
                data: {
                    title: `HR反馈｜${company}`,
                    body,
                    group: NOTIFY_CONFIG.group,
                    subgroup: 'hr-feedback',
                    bigText: true,
                    id: `hr-${Date.now()}`,
                    record: 1,
                    markdown,
                    urgent: true
                }
            }
        };
    };

    const sendNotify = async payload => {
        const response = await fetch(NOTIFY_CONFIG.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
        });
        if (!response.ok) throw new Error(`NotifyMe HTTP ${response.status}`);
        return response;
    };

    contactTrigger?.addEventListener('click', openContactModal);
    contactClose?.addEventListener('click', closeContactModal);
    contactModal?.addEventListener('click', e => {
        if (e.target === contactModal) closeContactModal();
    });

    contactForm?.addEventListener('submit', async e => {
        e.preventDefault();
        const company = document.getElementById('contact-company')?.value.trim();
        const role = document.getElementById('contact-role')?.value.trim();
        const contact = document.getElementById('contact-info')?.value.trim();
        const rating = contactForm.querySelector('input[name="rating"]:checked')?.value;
        const direct = contactForm.querySelector('input[name="direct"]:checked')?.value;
        if (!company || !role || !contact || !rating || !direct) return;

        if (!NOTIFY_CONFIG.uuid || NOTIFY_CONFIG.uuid === 'YOUR_NOTIFYME_UUID') {
            contactStatus.textContent = '请先在 script.js 的 NOTIFY_CONFIG.uuid 填入你的 NotifyMe UUID。';
            contactStatus.className = 'contact-status is-error';
            return;
        }

        const payload = buildNotifyPayload({ company, role, contact, rating, direct });
        contactStatus.textContent = '正在发送…';
        contactStatus.className = 'contact-status';

        try {
            await sendNotify(payload);
            contactStatus.textContent = '已发送，请继续浏览。';
            contactStatus.className = 'contact-status is-success';
            contactForm.reset();
            setTimeout(closeContactModal, 1100);
        } catch (error) {
            contactStatus.textContent = '发送失败，请检查网络或 NotifyMe 配置。';
            contactStatus.className = 'contact-status is-error';
            console.error('NotifyMe push failed:', error);
        }
    });

})();