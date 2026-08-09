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
    const systemTheme = matchMedia('(prefers-color-scheme: dark)');
    let manualTheme = false;

    const applyTheme = (theme) => {
        root.dataset.theme = theme;
        root.style.colorScheme = theme;
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀' : '◐';
            themeToggle.setAttribute(
                'aria-label',
                theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'
            );
        }
    };

    // 默认跟随操作系统，不再读取旧版本 localStorage，避免旧主题设置覆盖系统主题。
    applyTheme(systemTheme.matches ? 'dark' : 'light');

    systemTheme.addEventListener?.('change', event => {
        if (!manualTheme) applyTheme(event.matches ? 'dark' : 'light');
    });

    // 右上角仍可临时手动切换，但不写入 localStorage；刷新后继续跟随系统。
    themeToggle?.addEventListener('click', () => {
        manualTheme = true;
        applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });

    const navToggle = document.getElementById('nav-toggle-btn');
    const nav = document.getElementById('main-nav');

    const closeMobileNav = () => {
        if (!nav?.classList.contains('open')) return;
        nav.classList.remove('open');
        navToggle?.setAttribute('aria-expanded', 'false');
    };

    navToggle?.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = nav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // 菜单打开后，滚动页面或点击菜单外区域立即收起。
    addEventListener('scroll', closeMobileNav, { passive: true });
    document.addEventListener('pointerdown', e => {
        if (!nav?.classList.contains('open')) return;
        if (nav.contains(e.target) || navToggle?.contains(e.target)) return;
        closeMobileNav();
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

    // 手机端向下滚动时收起顶部标题，向上滚动时恢复；
    // 避免“项目详情 / PROJECT DETAILS”等上下文标题一直占着屏幕。
    let lastMobileScrollY = window.scrollY;
    let mobileHeaderRaf = 0;
    const updateMobileHeaderVisibility = () => {
        if (!header || window.innerWidth > 768) return;
        const currentY = window.scrollY;
        const delta = currentY - lastMobileScrollY;
        if (currentY <= 12) {
            header.classList.remove('header-hidden');
        } else if (delta > 4) {
            header.classList.add('header-hidden');
        } else if (delta < -4) {
            header.classList.remove('header-hidden');
        }
        lastMobileScrollY = currentY;
    };
    addEventListener('scroll', () => {
        cancelAnimationFrame(mobileHeaderRaf);
        mobileHeaderRaf = requestAnimationFrame(updateMobileHeaderVisibility);
    }, { passive: true });
    addEventListener('resize', () => {
        if (window.innerWidth > 768) header?.classList.remove('header-hidden');
    });

    // 手机端 ABOUT ME 的“下滑查看项目总览”只提示一次：用户真正开始下滑后立即消失。
    const mobileOverviewCue = document.querySelector('.mobile-overview-cue');
    let mobileCueDismissed = false;
    const dismissMobileOverviewCue = () => {
        if (mobileCueDismissed || window.innerWidth > 768 || window.scrollY <= 8) return;
        mobileCueDismissed = true;
        mobileOverviewCue?.classList.add('is-dismissed');
        removeEventListener('scroll', dismissMobileOverviewCue);
    };
    addEventListener('scroll', dismissMobileOverviewCue, { passive: true });

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
        { selector: '#experience', label: '工作经历', en: 'WORK EXPERIENCE', section: '#experience' },
        { selector: '#skills', label: '能力与荣誉', en: 'CAPABILITY & HONORS', section: '#skills' },
        { selector: '#projects', label: '项目详情', en: 'PROJECT DETAILS', section: '#projects' },
        { selector: '#overview', label: 'ZiKai Portfolio', en: 'PERSONAL PORTFOLIO', section: null }
    ];
    const detailBrandItems = [...document.querySelectorAll('#projects .detail-card[data-project]')].map(card => ({
        el: card,
        label: card.querySelector('.detail-head h3')?.textContent.trim() || '项目详情',
        en: 'PROJECT CASE STUDY'
    }));
    // 滚动期间不再频繁改 Header / section class。旧版每 180ms 都会触发
    // opacity + max-height + margin 动画，手机端尤其容易出现“闪一下/掉帧”。
    let activeBrand = '';
    let brandTimer;
    let brandIdleTimer;
    let brandRaf = 0;
    let programmaticScroll = false;
    let programmaticScrollTimer;
    const setBrand = (label, en, activeSection = null) => {
        if (!brandLabel || !label) return;
        if (label === activeBrand && brandLabel.dataset.en === en) return;
        activeBrand = label;
        clearTimeout(brandTimer);

        // 先更新文字，再做很轻的“进入”动效。旧版先把标题 opacity 降到 0，
        // 再延迟 120ms 换字，手机上会明显看到标题空掉一帧，并产生“卡一下”的感觉。
        // 现在始终保持占位高度，避免滚动过程中出现布局空档。
        brandLabel.textContent = label;
        brandLabel.dataset.en = en || '';
        if (brandSublabel) {
            brandSublabel.textContent = en || '';
            brandSublabel.dataset.en = en || '';
        }
        brandLabel.classList.remove('is-entering');
        brandSublabel?.classList.remove('is-entering');
        requestAnimationFrame(() => {
            brandLabel.classList.add('is-entering');
            brandSublabel?.classList.add('is-entering');
            brandTimer = setTimeout(() => {
                brandLabel.classList.remove('is-entering');
                brandSublabel?.classList.remove('is-entering');
            }, 180);
        });
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
        cancelAnimationFrame(brandRaf);
        brandRaf = requestAnimationFrame(() => {
            if (programmaticScroll) {
                // smooth scroll 期间持续续期；真正停止滚动约 220ms 后再恢复
                // viewport 检测，因此无论跳多远都不会中途闪烁。
                clearTimeout(programmaticScrollTimer);
                programmaticScrollTimer = setTimeout(() => {
                    programmaticScroll = false;
                    updateBrandByViewport();
                }, 220);
                return;
            }
            clearTimeout(brandIdleTimer);
            brandIdleTimer = setTimeout(() => {
                const candidate = getBrandCandidate();
                if (candidate) setBrand(candidate.label, candidate.en, candidate.section);
            }, 140);
        });
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

        /* HR 首页只保留“快速识别”信息：
           编号 + 项目名称 + 一句话结果/场景 + 时间。
           点击这里先跳到对应项目详情行；详情行再负责打开弹窗。 */
        const cards = detailCards.map((detailCard, index) => {
            const id = detailCard.dataset.project;
            const titleEl = detailCard.querySelector('.detail-head h3');
            const dateEl = detailCard.querySelector('.detail-date');
            const summaryEl = detailCard.querySelector('.detail-summary');
            const tagEls = [...detailCard.querySelectorAll('.detail-head .tag')];

            const title = titleEl ? titleEl.innerHTML.trim() : '未命名项目';
            const date = escapeText(dateEl?.textContent);
            const summary = escapeText(summaryEl?.textContent);
            const tags = tagEls.slice(0, 2).map(el => el.outerHTML).join('');
            const brandEl = titleEl?.querySelector('.megmeet_logo');
            const brand = brandEl ? brandEl.outerHTML : '';
            const mobileName = titleEl
                ? titleEl.cloneNode(true)
                : null;
            if (mobileName && brandEl) mobileName.querySelector('.megmeet_logo')?.remove();
            const mobileProjectName = mobileName ? mobileName.textContent.trim() : title.replace(/<[^>]*>/g, '').trim();

            const card = document.createElement('article');
            card.className = 'project-card project-overview-row hover-lift';
            card.classList.remove('overview-row--wide');
            card.dataset.project = id;
            // 手机端项目总览始终保持两列：项目数量增加后也继续沿用同一骨架。
            // 不再根据标题长度让单个项目横跨整行。
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.innerHTML = `
                <span class="overview-row-index">${String(index + 1).padStart(2, '0')}</span>
                <div class="overview-row-main">
                    <div class="overview-row-title">
                        <div class="overview-row-topline">
                            ${brand ? `<span class="overview-row-brand">${brand}</span>` : ''}
                        </div>
                        <h3>${brand ? mobileProjectName : title}</h3>
                        <div class="overview-row-tags">${tags}</div>
                    </div>
                    <p>${summary}</p>
                </div>
                <div class="overview-row-meta">
                    <span>${date}</span>
                    <span class="overview-row-arrow">↓</span>
                </div>
            `;

            const jumpToDetail = () => {
                const target = document.querySelector(`#projects .detail-card[data-project="${CSS.escape(id)}"]`);
                if (!target) return;

                // 总览 -> 详情属于一次完整的程序化滚动。滚动过程中暂停
                // Header/section 的滚动侦测，避免边滚边改布局造成闪烁。
                programmaticScroll = true;
                clearTimeout(programmaticScrollTimer);
                clearTimeout(brandIdleTimer);
                cancelAnimationFrame(brandRaf);

                target.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // 不再给整张卡片加 border/box-shadow 动画；移动端这类大面积
                // 阴影合成很容易出现一帧颜色跳变。
                target.classList.add('detail-card-focus');
                window.setTimeout(() => target.classList.remove('detail-card-focus'), 900);

                // 兜底：极慢的手机 smooth-scroll 也不会永久锁住 Header。
                programmaticScrollTimer = window.setTimeout(() => {
                    programmaticScroll = false;
                    updateBrandByViewport();
                }, 2200);
            };
            card.addEventListener('click', jumpToDetail);
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    jumpToDetail();
                }
            });
            return card;
        });

        overviewCards.innerHTML = '';
        cards.forEach(card => overviewCards.appendChild(card));
    };
    buildOverview();

    // V25：右侧小滚动区使用浏览器原生滚动链。
    // 不再在 touchmove / wheel 中逐帧调用 window.scrollTo，避免手机端主线程抖动；
    // overscroll-behavior-y: auto 会在内部区域到达顶部/底部后自然把手势交还给整页。
    // 这也保证 PC 与手机都能“内部到底 → 继续滚整页”。

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
    const modalClose = document.querySelector('#project-modal .modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');
    const modalBody = document.getElementById('modal-body');

    let modalHistoryActive = false;

    const openModalFromCard = (card) => {
        const id = card.getAttribute('data-project');
        const source = document.querySelector(`#projects .detail-card[data-project="${CSS.escape(id)}"]`);
        if (!source) return;

        // 弹窗标题同样保留 .megmeet_logo，避免 textContent 把品牌样式剥掉。
        const title = source.querySelector('.detail-head h3')?.innerHTML.trim() || '项目详情';
        const date = source.querySelector('.detail-date')?.textContent.trim() || '';
        const tag = source.querySelector('.tag')?.textContent.trim() || '';
        const caseData = source.querySelector('.project-case-data');
        const content = caseData?.cloneNode(true);
        const bgImage = source.style.getPropertyValue('--detail-bg-image').trim();
        const modalContent = modal?.querySelector('.modal-content');

        if (modalContent) {
            if (bgImage) {
                modalContent.style.setProperty('--modal-bg-image', bgImage);
            } else {
                modalContent.style.removeProperty('--modal-bg-image');
            }
        }

        modalTitle.innerHTML = title;
        modalMeta.textContent = [date, tag].filter(Boolean).join(' · ');

        if (content) {
            content.hidden = false;
            content.removeAttribute('hidden');
            modalBody.innerHTML = '';
            modalBody.appendChild(content);
        } else {
            modalBody.innerHTML = '<div class="case-empty"><strong>暂无详细信息</strong><p>请在 index.html 对应项目的 .project-case-data 中补充项目内容。</p></div>';
        }

        modal.classList.add('active');
        requestAnimationFrame(() => modal.querySelector('.case-intro')?.classList.add('is-ready'));
        document.body.classList.add('modal-open');

        // 给详情弹窗建立一个独立的浏览历史记录。这样手机点击系统“返回”时，
        // 只会关闭详情并回到主页，而不会直接退出网站。URL 不改变，分享/刷新行为也不受影响。
        if (!modalHistoryActive) {
            history.pushState({ ...(history.state || {}), projectModal: id }, '', location.href);
            modalHistoryActive = true;
        }
    };

    const bindProjectCardEvents = () => {
        document.querySelectorAll('#projects .detail-card[data-project]').forEach(card => {
            if (card.dataset.modalBound === 'true') return;
            card.dataset.modalBound = 'true';
            card.addEventListener('click', function(e) {
                if (e.target.closest('a') || e.target.closest('button')) return;
                openModalFromCard(this);
            });
        });
    };

    bindProjectCardEvents();

    const closeModal = ({ fromHistory = false } = {}) => {
        if (!modal?.classList.contains('active')) return;
        modal.classList.remove('active');
        modal?.querySelector('.modal-content')?.style.removeProperty('--modal-bg-image');
        document.body.classList.remove('modal-open');

        if (modalHistoryActive) {
            modalHistoryActive = false;
            if (!fromHistory) history.back();
        }
    };

    modalClose?.addEventListener('click', () => closeModal());
    
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    addEventListener('popstate', () => {
        // 手机浏览器返回键 / 系统手势返回：只退出项目详情，不离开当前网页。
        if (modal?.classList.contains('active')) closeModal({ fromHistory: true });
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
    const siteToast = document.getElementById('site-toast');
    const siteToastText = document.getElementById('site-toast-text');
    let toastTimer;

    const showToast = (message, duration = 3000) => {
        if (!siteToast) return;
        if (siteToastText) siteToastText.textContent = message;
        clearTimeout(toastTimer);
        siteToast.classList.add('show');
        toastTimer = setTimeout(() => siteToast.classList.remove('show'), duration);
    };

    const closeContactModal = () => {
        contactModal?.classList.remove('active');
        contactModal?.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    const openContactModal = () => {
        contactModal?.classList.add('active');
        contactModal?.setAttribute('aria-hidden', 'false');
        contactStatus.textContent = '';
        setTimeout(() => document.getElementById('contact-role')?.focus(), 80);
        document.body.classList.add('modal-open');
    };

    const buildNotifyPayload = ({ company, role, contact, note, rating, direct }) => {
        const time = new Date().toLocaleString('zh-CN', { hour12: false });
        const source = location.href;
        const body = [
            'HR岗位反馈',
            `公司：${company}`,
            `岗位：${role}`,
            `联系方式：${contact}`,
            `备注：${note || '无'}`,
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
            `**备注：** ${note || '无'}`,
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

    const sendNotify = async ({ company, role, contact, note, rating, direct }) => {
        const time = new Date().toLocaleString('zh-CN', { hour12: false });
        const title = `HR反馈｜${company}`;
        const body = [
            'HR岗位反馈',
            `公司：${company}`,
            `岗位：${role}`,
            `联系方式：${contact}`,
            `备注：${note || '无'}`,
            `满意度：${rating}`,
            `是否直签：${direct}`,
            `时间：${time}`
        ].join('\n');

        // 当前项目注释标明 NotifyMe 使用 GET：uuid / title / body / group / bigText。
        const params = new URLSearchParams({
            uuid: NOTIFY_CONFIG.uuid,
            title,
            body,
            group: NOTIFY_CONFIG.group,
            bigText: 'true'
        });

        try {
            return await fetch(`${NOTIFY_CONFIG.endpoint}?${params.toString()}`, {
                method: 'GET',
                mode: 'no-cors',
                cache: 'no-store',
                keepalive: true
            });
        } catch (error) {
            // no-cors 下无法读取响应状态，但只要请求成功发出即可。
            // fetch 真正抛异常时才视为发送失败。
            throw error;
        }
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
        const note = document.getElementById('contact-note')?.value.trim() || '';
        const rating = contactForm.querySelector('input[name="rating"]:checked')?.value;
        const direct = contactForm.querySelector('input[name="direct"]:checked')?.value;
        if (!company || !role || !contact || !rating || !direct) return;

        if (!NOTIFY_CONFIG.uuid || NOTIFY_CONFIG.uuid === 'YOUR_NOTIFYME_UUID') {
            contactStatus.textContent = '请先在 script.js 的 NOTIFY_CONFIG.uuid 填入你的 NotifyMe UUID。';
            contactStatus.className = 'contact-status is-error';
            return;
        }

        const feedback = { company, role, contact, note, rating, direct };
        contactStatus.textContent = '正在发送…';
        contactStatus.className = 'contact-status';

        try {
            await sendNotify(feedback);
            contactStatus.textContent = '已发送，请继续浏览。';
            contactStatus.className = 'contact-status is-success';
            contactForm.reset();
            closeContactModal();
            showToast('发送成功，感谢你的反馈。', 3000);
        } catch (error) {
            contactStatus.textContent = '发送失败，请检查网络或 NotifyMe 配置。';
            contactStatus.className = 'contact-status is-error';
            console.error('NotifyMe push failed:', error);
        }
    });

})();