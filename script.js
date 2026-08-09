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

    // 顶栏始终固定显示，不再根据手机上下滑动隐藏。
    header?.classList.remove('header-hidden');

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
        { selector: '#overview .project-overview .section-title-row h2', label: '项目总览', en: 'PROJECT OVERVIEW', section: '#overview' },
        { selector: '#experience .experience-label h2, #experience .section-title-row h2', label: '工作经历', en: 'WORK EXPERIENCE', section: '#experience' },
        { selector: '#skills .section-heading h2, #skills .section-title-row h2', label: '能力与荣誉', en: 'CAPABILITY & HONORS', section: '#skills' },
        { selector: '#projects .section-heading h2, #projects .section-title-row h2', label: '项目详情', en: 'PROJECT DETAILS', section: '#projects' }
    ];
    const detailBrandItems = [...document.querySelectorAll('#projects .detail-card[data-project]')].map(card => ({
        heading: card.querySelector('.detail-head h3'),
        label: card.querySelector('.detail-head h3')?.textContent.trim() || '项目详情',
        en: 'PROJECT CASE STUDY'
    })).filter(item => item.heading);

    let activeBrand = '';
    let activeDetailIndex = 0;
    let brandTimer;
    let brandRaf = 0;
    let programmaticScroll = false;
    let programmaticScrollTimer;
    const setBrand = (label, en) => {
        if (!brandLabel || !label) return;
        if (label === activeBrand && brandLabel.dataset.en === en) return;
        activeBrand = label;
        clearTimeout(brandTimer);
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
        const headerBottom = header?.getBoundingClientRect().bottom || getHeaderOffset();
        // UX：顶栏应该“预告”用户即将进入的内容，而不是等标题已经贴到
        // 顶栏甚至滑过去后才反应。这里看“标题顶部”进入预告区的时机，
        // 比看标题底部更符合真实阅读感受。
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        // 预告距离：标题真正进入阅读区之前，顶栏先给出明确的上下文提示。
        // 这里故意比上一版更早：避免用户已经滑过标题一点点后，顶栏才跟上。
        const switchLead = isMobile ? 155 : 220;
        const threshold = headerBottom + switchLead;
        const candidates = [];
        brandSections.forEach(item => {
            const el = document.querySelector(item.selector);
            if (!el) return;
            const r = el.getBoundingClientRect();
            if (r.top <= threshold) candidates.push({ ...item, top: r.top });
        });
        // 项目详情现在是横向轮播：只有当前显示的项目参与顶栏上下文判断。
        // 如果把所有横向卡片都加入候选，5 个项目的标题垂直位置相同，顶栏会错误地跳到最后一个项目。
        const activeDetail = detailBrandItems[activeDetailIndex];
        if (activeDetail?.heading) {
            const r = activeDetail.heading.getBoundingClientRect();
            if (r.top <= threshold) candidates.push({ label: activeDetail.label, en: activeDetail.en, top: r.top });
        }
        if (!candidates.length) return { label: 'ZiKai Portfolio', en: 'PERSONAL PORTFOLIO' };
        candidates.sort((a, b) => b.top - a.top);
        return candidates[0];
    };
    const updateBrandByViewport = () => {
        cancelAnimationFrame(brandRaf);
        brandRaf = requestAnimationFrame(() => {
            if (programmaticScroll) {
                clearTimeout(programmaticScrollTimer);
                programmaticScrollTimer = setTimeout(() => {
                    programmaticScroll = false;
                    updateBrandByViewport();
                }, 220);
                return;
            }
            const candidate = getBrandCandidate();
            if (candidate) setBrand(candidate.label, candidate.en);
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

    /*
     * 项目详情横向轮播：
     * - 一次只显示一个项目，项目数量增加只增加横向长度，不再增加页面纵向高度。
     * - 手机用原生 pointer/touch 手势，桌面用按钮 + 拖拽；两者共用同一个切换函数，
     *   保证“手动滑动”和“总览点击跳转”使用完全一致的缓动特效。
     * - 使用 transform 而不是逐帧 scrollTo，避免移动端滚动主线程抖动。
     */
    const detailCarousel = document.getElementById('project-detail-carousel');
    const detailViewport = detailCarousel?.querySelector('.detail-carousel-viewport');
    const detailTrack = detailCarousel?.querySelector('.detail-list');
    const detailPrev = detailCarousel?.querySelector('.detail-carousel-prev');
    const detailNext = detailCarousel?.querySelector('.detail-carousel-next');
    const detailCount = detailCarousel?.querySelector('.detail-carousel-count');
    const detailDots = detailCarousel?.querySelector('.detail-carousel-dots');
    let detailCarouselIndex = 0;
    let detailCarouselWidth = 0;
    let detailCardWidth = 0;
    let detailCardGap = 18;
    let detailCarouselDragging = false;
    let detailCarouselDragStartX = 0;
    let detailCarouselDragStartY = 0;
    let detailCarouselDragDelta = 0;
    let detailCarouselDragHorizontal = false;
    let detailCarouselSuppressClick = false;
    let detailCarouselRaf = 0;
    let detailCarouselDragRaf = 0;
    let detailCarouselPendingDragX = 0;
    let detailCarouselTrackIndex = 1;
    let detailCarouselResetTimer = 0;

    const getDetailStep = () => detailCardWidth + detailCardGap;
    const getDetailTrackOffset = (trackIndex, dragOffset = 0) => {
        const viewportWidth = detailViewport?.clientWidth || detailCarouselWidth || 1;
        const sidePeek = Math.max(0, (viewportWidth - detailCardWidth) / 2);
        return sidePeek - (trackIndex * getDetailStep()) + dragOffset;
    };

    const setDetailTrackPosition = (trackIndex, animate = true, dragOffset = 0) => {
        if (!detailTrack || !detailViewport) return;
        detailTrack.style.transition = animate ? 'transform 420ms cubic-bezier(0.22, 0.75, 0.2, 1)' : 'none';
        detailTrack.style.transform = `translate3d(${getDetailTrackOffset(trackIndex, dragOffset)}px, 0, 0)`;
    };

    const updateDetailCarouselUI = () => {
        const total = detailCards.length;
        if (!total) return;
        detailCount && (detailCount.textContent = `${String(detailCarouselIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`);
        detailPrev && (detailPrev.disabled = total < 2);
        detailNext && (detailNext.disabled = total < 2);
        detailDots?.querySelectorAll('button').forEach((dot, i) => {
            const active = i === detailCarouselIndex;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-selected', String(active));
            dot.tabIndex = active ? 0 : -1;
        });
        detailCards.forEach((card, i) => {
            const relative = ((i - detailCarouselIndex + total + 1) % total) - 1;
            card.setAttribute('aria-hidden', String(i !== detailCarouselIndex));
            card.classList.toggle('is-carousel-active', i === detailCarouselIndex);
            card.classList.toggle('is-carousel-prev', relative === -1);
            card.classList.toggle('is-carousel-next', relative === 1);
        });
    };

    const updateDetailCarouselIndex = (index, { animate = true, fromUser = true, allowLoop = true } = {}) => {
        if (!detailCards.length) return;
        const total = detailCards.length;
        let target = index;
        let trackTarget = index + 1;
        if (allowLoop && total > 1) {
            if (index < 0) { target = total - 1; trackTarget = 0; }
            else if (index >= total) { target = 0; trackTarget = total + 1; }
        } else {
            target = Math.max(0, Math.min(total - 1, index));
            trackTarget = target + 1;
        }
        detailCarouselIndex = target;
        activeDetailIndex = target;
        detailCarouselTrackIndex = trackTarget;
        setDetailTrackPosition(trackTarget, animate);
        updateDetailCarouselUI();
        if (fromUser) updateBrandByViewport();

        if (trackTarget === 0 || trackTarget === total + 1) {
            clearTimeout(detailCarouselResetTimer);
            detailCarouselResetTimer = window.setTimeout(() => {
                detailCarouselTrackIndex = target + 1;
                setDetailTrackPosition(detailCarouselTrackIndex, false);
            }, animate ? 440 : 0);
        }
    };

    const goToDetailProject = (index, options = {}) => {
        updateDetailCarouselIndex(index, { animate: options.animate !== false, fromUser: options.fromUser !== false, allowLoop: options.allowLoop !== false });
    };

    if (detailCarousel && detailViewport && detailTrack && detailCards.length) {
        // 复制首尾卡片形成无缝循环：最后一张向右滑可自然回到第一张，第一张向左也同理。
        const firstClone = detailCards[0].cloneNode(true);
        const lastClone = detailCards[detailCards.length - 1].cloneNode(true);
        // 克隆卡片也保留项目 ID：这样两侧露出的预览卡同样可以点击。
        firstClone.dataset.project = detailCards[0].dataset.project;
        lastClone.dataset.project = detailCards[detailCards.length - 1].dataset.project;
        [firstClone, lastClone].forEach(clone => {
            clone.classList.add('is-carousel-clone');
            clone.setAttribute('aria-hidden', 'true');
            clone.removeAttribute('tabindex');
        });
        detailTrack.prepend(lastClone);
        detailTrack.append(firstClone);

        detailDots.innerHTML = detailCards.map((card, i) => `
            <button type="button" role="tab" aria-label="查看项目 ${String(i + 1).padStart(2, '0')}" aria-selected="${i === 0}" tabindex="${i === 0 ? '0' : '-1'}" data-detail-index="${i}"></button>
        `).join('');

        detailDots.querySelectorAll('button').forEach(dot => {
            dot.addEventListener('click', () => goToDetailProject(Number(dot.dataset.detailIndex)));
        });
        detailPrev?.addEventListener('click', () => goToDetailProject(detailCarouselIndex - 1));
        detailNext?.addEventListener('click', () => goToDetailProject(detailCarouselIndex + 1));

        const resizeDetailCarousel = () => {
            cancelAnimationFrame(detailCarouselRaf);
            detailCarouselRaf = requestAnimationFrame(() => {
                detailCarouselWidth = detailViewport.clientWidth || 1;
                detailCardWidth = Math.min(detailCarouselWidth * (window.matchMedia('(max-width: 768px)').matches ? 0.84 : 0.78), detailCarouselWidth - 24);
                detailCardGap = window.matchMedia('(max-width: 768px)').matches ? 12 : 18;
                detailTrack.style.width = `${(detailCardWidth + detailCardGap) * (detailCards.length + 2)}px`;
                detailTrack.querySelectorAll('.detail-card').forEach(card => {
                    card.style.flexBasis = `${detailCardWidth}px`;
                    card.style.width = `${detailCardWidth}px`;
                    card.style.maxWidth = `${detailCardWidth}px`;
                });
                setDetailTrackPosition(detailCarouselTrackIndex, false);
            });
        };
        addEventListener('resize', resizeDetailCarousel);

        detailViewport.addEventListener('pointerdown', event => {
            if (event.button !== undefined && event.button !== 0) return;
            detailCarouselDragging = true;
            detailCarouselDragHorizontal = false;
            detailCarouselSuppressClick = false;
            detailCarouselDragStartX = event.clientX;
            detailCarouselDragStartY = event.clientY;
            detailCarouselDragDelta = 0;
            detailTrack.style.transition = 'none';
            detailViewport.setPointerCapture?.(event.pointerId);
        });

        detailViewport.addEventListener('pointermove', event => {
            if (!detailCarouselDragging) return;
            const dx = event.clientX - detailCarouselDragStartX;
            const dy = event.clientY - detailCarouselDragStartY;
            if (!detailCarouselDragHorizontal) {
                if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
                if (Math.abs(dx) <= Math.abs(dy)) {
                    detailCarouselDragging = false;
                    return;
                }
                detailCarouselDragHorizontal = true;
                detailCarouselSuppressClick = true;
            }
            event.preventDefault();
            detailCarouselDragDelta = dx;
            detailCarouselPendingDragX = dx;
            // pointermove 在触屏设备上可能一帧触发多次。只在下一帧更新一次
            // transform，避免每个触摸事件都强制浏览器重新计算布局。
            if (!detailCarouselDragRaf) {
                detailCarouselDragRaf = requestAnimationFrame(() => {
                    detailCarouselDragRaf = 0;
                    if (!detailCarouselDragging || !detailCarouselDragHorizontal) return;
                    setDetailTrackPosition(detailCarouselTrackIndex, false, detailCarouselPendingDragX);
                });
            }
        }, { passive: false });

        const finishDetailDrag = event => {
            if (!detailCarouselDragging) return;
            detailCarouselDragging = false;
            if (detailCarouselDragHorizontal) {
                const width = detailViewport.clientWidth || 1;
                const travel = Math.abs(detailCarouselDragDelta);
                if (travel > Math.min(64, width * 0.14)) {
                    const direction = detailCarouselDragDelta < 0 ? 1 : -1;
                    goToDetailProject(detailCarouselIndex + direction);
                } else {
                    setDetailTrackPosition(detailCarouselTrackIndex, true);
                }
            } else {
                setDetailTrackPosition(detailCarouselTrackIndex, true);
            }
            detailCarouselDragDelta = 0;
            detailCarouselPendingDragX = 0;
            detailCarouselDragHorizontal = false;
            if (detailCarouselDragRaf) {
                cancelAnimationFrame(detailCarouselDragRaf);
                detailCarouselDragRaf = 0;
            }
            if (event?.pointerId != null) detailViewport.releasePointerCapture?.(event.pointerId);
            if (detailCarouselSuppressClick) {
                // 仅屏蔽拖拽结束后紧接着产生的 click，不再锁死 500ms。
                window.setTimeout(() => { detailCarouselSuppressClick = false; }, 140);
            }
        };

        detailViewport.addEventListener('pointerup', finishDetailDrag);
        detailViewport.addEventListener('pointercancel', finishDetailDrag);
        detailViewport.addEventListener('lostpointercapture', () => {
            if (detailCarouselDragging) finishDetailDrag({});
        });

        detailViewport.addEventListener('click', event => {
            if (detailCarouselSuppressClick) {
                event.preventDefault();
                event.stopPropagation();
            }
        }, true);

        // 克隆卡片不在 bindProjectCardEvents 的原始节点集合里，
        // 因此统一在轮播轨道上处理：点击左右预览卡 -> 切换项目；
        // 点击当前主卡仍由原始卡片事件打开详情弹窗。
        detailTrack.addEventListener('click', event => {
            if (detailCarouselSuppressClick) return;
            const card = event.target.closest('.detail-card[data-project]');
            if (!card) return;

            const isClone = card.classList.contains('is-carousel-clone');
            if (!isClone) return; // 原始卡片交给 bindProjectCardEvents，避免重复触发

            const targetIndex = detailCards.findIndex(item => item.dataset.project === card.dataset.project);
            if (targetIndex < 0) return;

            event.preventDefault();
            event.stopPropagation();
            goToDetailProject(targetIndex);
        });

        detailCarousel.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft') { event.preventDefault(); goToDetailProject(detailCarouselIndex - 1); }
            if (event.key === 'ArrowRight') { event.preventDefault(); goToDetailProject(detailCarouselIndex + 1); }
        });

        detailTrack.addEventListener('transitionend', event => {
            if (event.propertyName !== 'transform') return;
            if (detailCarouselTrackIndex === 0 || detailCarouselTrackIndex === detailCards.length + 1) {
                detailCarouselTrackIndex = detailCarouselIndex + 1;
                setDetailTrackPosition(detailCarouselTrackIndex, false);
            }
        });

        resizeDetailCarousel();
        updateDetailCarouselIndex(0, { animate: false, fromUser: false });
    }

    const projectSection = document.getElementById('projects');
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
                // 必须在 if 代码块外保存索引。旧版本把 targetIndex 声明在
                // if 内，桌面端点击总览卡片时后续 focusDetailCard 会直接
                // 触发 ReferenceError，导致“卡片点了但页面不跳转”。
                const targetIndex = detailCards.indexOf(target);
                if (targetIndex < 0) return;

                // 总览 -> 详情：先切换横向轮播，再把“项目详情”主区域整体带到视口。
                // 不再用 detail-card 的 getBoundingClientRect() 做纵向定位：卡片本身
                // 正在被 translate3d 横向移动，尤其是第 05 项在循环轨道末端时，
                // 容易拿到一个尚未稳定的坐标，表现为“点了但页面没跳”。
                goToDetailProject(targetIndex, { animate: true, fromUser: false });

                programmaticScroll = true;
                clearTimeout(programmaticScrollTimer);
                clearTimeout(brandIdleTimer);
                cancelAnimationFrame(brandRaf);

                const focusDetailArea = () => {
                    scrollToElement(detailCarousel || projectSection, 10);
                    const activeTarget = detailCards[targetIndex] || target;
                    activeTarget.classList.add('detail-card-focus');
                    window.setTimeout(() => activeTarget.classList.remove('detail-card-focus'), 900);
                };
                // 给横向轮播一个完整的切换时间，再做纵向滚动；第 05 项同样走这条路径。
                window.setTimeout(focusDetailArea, 430);

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

    // 项目详情统一采用事件委托：原始卡片、循环克隆卡片都从同一个入口判断。
    // 这样不会因为轮播 transform、克隆节点或事件绑定顺序不同，导致“点击主卡没反应”。
    const bindProjectCardEvents = () => {
        if (!detailCarousel) return;
        detailCarousel.addEventListener('click', event => {
            if (detailCarouselSuppressClick) return;
            if (event.target.closest('a') || event.target.closest('button')) return;
            const card = event.target.closest('.detail-card[data-project]');
            if (!card || !detailCarousel.contains(card)) return;

            const id = card.dataset.project;
            const targetIndex = detailCards.findIndex(item => item.dataset.project === id);
            if (targetIndex < 0) return;

            // 当前主卡：打开项目详情弹窗。
            if (targetIndex === detailCarouselIndex && !card.classList.contains('is-carousel-clone')) {
                event.preventDefault();
                openModalFromCard(card);
                return;
            }

            // 左右预览卡 / 循环克隆：先切换到对应项目。
            event.preventDefault();
            event.stopPropagation();
            goToDetailProject(targetIndex);
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