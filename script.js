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
    let headerScrolled = false;
    addEventListener('scroll', () => {
        const next = window.scrollY > 6;
        if (next === headerScrolled) return;
        headerScrolled = next;
        header?.classList.toggle('scrolled', next);
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

    // 代表性数字计数动画：等待页面资源全部加载完成后再启动。
    // 不维护额外属性：strong 的文字末尾带 + 就自动计数，删除 + 就保持静态。
    const animatedMetrics = [...document.querySelectorAll('.hr-metric strong')].map(metric => {
        const source = metric.textContent.trim();
        const match = source.match(/^(\d[\d,]*)\+$/);
        if (!match) return null;

        const target = Number.parseInt(match[1].replaceAll(',', ''), 10);
        if (!Number.isFinite(target)) return null;

        metric.classList.add('has-count-animation');
        return { metric, target };
    }).filter(Boolean);
    const reduceMetricMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const startMetricCounters = () => {
        animatedMetrics.forEach(({ metric, target }, index) => {
            metric.setAttribute('aria-label', `${target}+`);
            if (reduceMetricMotion) {
                metric.textContent = `${target}+`;
                return;
            }

            metric.textContent = '0+';
            metric.classList.add('is-counting');
            const duration = Math.min(1900, 1200 + Math.sqrt(target) * 45);
            const delay = index * 90;

            window.setTimeout(() => {
                const startTime = performance.now();
                const tick = now => {
                    const progress = Math.min(1, (now - startTime) / duration);
                    const eased = 1 - Math.pow(1 - progress, 4);
                    metric.textContent = `${Math.min(target, Math.round(target * eased))}+`;

                    if (progress < 1) {
                        requestAnimationFrame(tick);
                    } else {
                        metric.textContent = `${target}+`;
                        window.setTimeout(() => metric.classList.remove('is-counting'), 260);
                    }
                };
                requestAnimationFrame(tick);
            }, delay);
        });
    };

    const queueMetricCounters = () => {
        requestAnimationFrame(() => requestAnimationFrame(startMetricCounters));
    };

    if (document.readyState === 'complete') {
        queueMetricCounters();
    } else {
        window.addEventListener('load', queueMetricCounters, { once: true });
    }

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
        { selector: '#overview .profile-head h1', label: '蒋子凯', en: 'ABOUT ME', section: '#overview' },
        { selector: '#overview .project-overview .section-title-row h2', label: '项目总览', en: 'PROJECT OVERVIEW', section: '#overview' },
        { selector: '#experience .experience-label h2, #experience .section-title-row h2', label: '工作经历', en: 'WORK EXPERIENCE', section: '#experience' },
        { selector: '#projects .section-heading h2, #projects .section-title-row h2', label: '项目详情', en: 'PROJECT DETAILS', section: '#projects' },
        { selector: '#skills .section-heading h2, #skills .section-title-row h2', label: '能力与荣誉', en: 'CAPABILITY & HONORS', section: '#skills' }
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
    let brandMeasureRaf = 0;
    let brandScrollPending = false;
    let programmaticScroll = false;
    let programmaticScrollTimer;
    let brandSectionPositions = [];

    // 只在载入、尺寸改变或动态内容生成后测量一次位置。
    // 实时滚动时只读取 scrollY 并比较缓存数字，移动端也能即时切换且不反复触发布局计算。
    const brandSectionNodes = brandSections.map(item => ({
        ...item,
        el: document.querySelector(item.selector)
    })).filter(item => item.el);

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

        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const thresholdY = window.scrollY + getHeaderOffset() + (isMobile ? 72 : 108);
        let best = null;

        for (const item of brandSectionPositions) {
            if (item.top > thresholdY) break;
            best = item;
        }

        if (best?.label === '项目详情') {
            const activeDetail = detailBrandItems[activeDetailIndex];
            if (activeDetail) return { label: activeDetail.label, en: activeDetail.en };
        }

        return best || { label: 'ZiKai Portfolio', en: 'PERSONAL PORTFOLIO' };
    };

    const updateBrandByViewport = () => {
        if (brandScrollPending) return;
        brandScrollPending = true;
        cancelAnimationFrame(brandRaf);
        brandRaf = requestAnimationFrame(() => {
            brandScrollPending = false;
            if (programmaticScroll) return;
            const candidate = getBrandCandidate();
            if (candidate) setBrand(candidate.label, candidate.en);
        });
    };

    const measureBrandPositions = () => {
        cancelAnimationFrame(brandMeasureRaf);
        brandMeasureRaf = requestAnimationFrame(() => {
            brandSectionPositions = brandSectionNodes.map(item => ({
                label: item.label,
                en: item.en,
                top: item.el.getBoundingClientRect().top + window.scrollY
            })).sort((a, b) => a.top - b.top);
            updateBrandByViewport();
        });
    };

    addEventListener('scroll', updateBrandByViewport, { passive: true });
    addEventListener('resize', measureBrandPositions, { passive: true });
    addEventListener('orientationchange', measureBrandPositions, { passive: true });
    window.addEventListener('load', measureBrandPositions, { once: true });
    document.fonts?.ready?.then(measureBrandPositions);
    measureBrandPositions();
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

    // 详情提示统一挂到整张卡片上，避免随内容高度变化而在手机/电脑端错位。
    detailCards.forEach(card => {
        const hint = card.querySelector('.detail-view-hint');
        if (hint && hint.parentElement !== card) card.appendChild(hint);
    });

    // 手机端只解码当前项目及相邻项目图片，避免进入页面时同时加载全部大图。
    // 桌面端仍保留完整预载，确保宽屏轮播两侧预览即时显示。
    const mobileDetailMedia = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)');
    const detailImagePreloads = new Map();

    const getDetailImageUrl = value => {
        const match = String(value || '').match(/url\((['"]?)(.*?)\1\)/);
        return match?.[2] || '';
    };

    const preloadDetailImage = (cssImage, priority = 'auto') => {
        if (!cssImage || detailImagePreloads.has(cssImage)) return;
        const url = getDetailImageUrl(cssImage);
        if (!url) return;

        const image = new Image();
        image.decoding = 'async';
        if ('fetchPriority' in image) image.fetchPriority = priority;
        image.src = url;
        const decoded = typeof image.decode === 'function'
            ? image.decode().catch(() => undefined)
            : Promise.resolve();
        detailImagePreloads.set(cssImage, { image, decoded });
    };

    detailCards.forEach(card => {
        const image = card.style.getPropertyValue('--detail-bg-image').trim();
        if (image) {
            card.dataset.detailBgImage = image;
            // 不再在移动端切换时删除背景变量，避免下一张卡临时重新生成图片层。
            card.style.setProperty('--detail-bg-image', image);
        }

        if (!card.querySelector(':scope > .detail-focus-ring')) {
            const ring = document.createElement('span');
            ring.className = 'detail-focus-ring';
            ring.setAttribute('aria-hidden', 'true');
            card.appendChild(ring);
        }
    });

    const hydrateDetailImages = (activeIndex = 0) => {
        const total = detailCards.length;
        if (!total) return;

        const orderedIndexes = [
            activeIndex,
            (activeIndex + 1) % total,
            (activeIndex - 1 + total) % total
        ];
        orderedIndexes.forEach((index, order) => {
            const card = detailCards[index];
            const image = card?.dataset.detailBgImage;
            if (!image) return;
            card.style.setProperty('--detail-bg-image', image);
            preloadDetailImage(image, order < 2 ? 'high' : 'auto');
        });
    };
    hydrateDetailImages(0);

    const warmAllDetailImages = () => {
        detailCards.forEach(card => preloadDetailImage(card.dataset.detailBgImage, 'auto'));
    };
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(warmAllDetailImages, { timeout: 1200 });
    } else {
        window.setTimeout(warmAllDetailImages, 220);
    }

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
    let detailCarouselPointerStartX = 0;
    let detailCarouselPointerStartY = 0;
    let detailCarouselPointerMoved = false;
    const nativeDetailScroll = mobileDetailMedia.matches;
    let nativeDetailScrollTimer = 0;
    let nativeDetailScrollStartLeft = 0;

    const getDetailStep = () => detailCardWidth + detailCardGap;
    const getDetailTrackOffset = (trackIndex, dragOffset = 0) => {
        const viewportWidth = detailViewport?.clientWidth || detailCarouselWidth || 1;
        const sidePeek = Math.max(0, (viewportWidth - detailCardWidth) / 2);
        return sidePeek - (trackIndex * getDetailStep()) + dragOffset;
    };

    const setDetailTrackPosition = (trackIndex, animate = true, dragOffset = 0) => {
        if (!detailTrack || !detailViewport) return;

        if (nativeDetailScroll) {
            const viewportWidth = detailViewport.clientWidth || detailCarouselWidth || 1;
            const sidePeek = Math.max(0, (viewportWidth - detailCardWidth) / 2);
            const left = Math.max(0, trackIndex * getDetailStep() - sidePeek - dragOffset);
            detailTrack.style.transition = 'none';
            detailTrack.style.transform = 'none';
            detailViewport.style.scrollBehavior = animate ? 'smooth' : 'auto';
            if (Math.abs(detailViewport.scrollLeft - left) > 1) {
                detailViewport.scrollTo({ left, behavior: animate ? 'smooth' : 'auto' });
            }
            return;
        }

        const transition = animate ? 'transform 300ms cubic-bezier(0.22, 0.8, 0.18, 1)' : 'none';
        const transform = `translate3d(${getDetailTrackOffset(trackIndex, dragOffset)}px, 0, 0)`;
        if (detailTrack.style.transition !== transition) detailTrack.style.transition = transition;
        if (detailTrack.style.transform !== transform) detailTrack.style.transform = transform;
    };

    const updateDetailCarouselUI = () => {
        const total = detailCards.length;
        if (!total) return;
        hydrateDetailImages(detailCarouselIndex);
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
            // 循环占位卡只负责视觉预览，不复制大段隐藏案例内容，降低手机端 DOM 与内存压力。
            clone.querySelector('.project-case-data')?.remove();
        });
        detailTrack.prepend(lastClone);
        detailTrack.append(firstClone);

        detailDots.innerHTML = detailCards.map((card, i) => `
            <button type="button" role="tab" aria-label="查看项目 ${String(i + 1).padStart(2, '0')}" aria-selected="${i === 0}" tabindex="${i === 0 ? '0' : '-1'}" data-detail-index="${i}"></button>
        `).join('');

        detailDots.querySelectorAll('button').forEach(dot => {
            dot.addEventListener('click', () => goToDetailProject(Number(dot.dataset.detailIndex)));
        });
        const pressDetailButton = button => {
            if (!button) return;
            button.classList.remove('is-pressed');
            requestAnimationFrame(() => button.classList.add('is-pressed'));
            window.setTimeout(() => button.classList.remove('is-pressed'), 280);
        };
        detailPrev?.addEventListener('click', () => {
            pressDetailButton(detailPrev);
            goToDetailProject(detailCarouselIndex - 1);
        });
        detailNext?.addEventListener('click', () => {
            pressDetailButton(detailNext);
            goToDetailProject(detailCarouselIndex + 1);
        });

        const resizeDetailCarousel = () => {
            cancelAnimationFrame(detailCarouselRaf);
            detailCarouselRaf = requestAnimationFrame(() => {
                detailCarouselWidth = detailViewport.clientWidth || 1;
                detailCardWidth = Math.min(detailCarouselWidth * (window.matchMedia('(max-width: 768px)').matches ? 0.88 : 0.78), detailCarouselWidth - 20);
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

        const syncNativeDetailIndex = () => {
            if (!nativeDetailScroll || !detailCards.length) return;
            const viewportWidth = detailViewport.clientWidth || 1;
            const sidePeek = Math.max(0, (viewportWidth - detailCardWidth) / 2);
            const maxTrackIndex = detailCards.length + 1;
            const trackIndex = Math.max(0, Math.min(
                maxTrackIndex,
                Math.round((detailViewport.scrollLeft + sidePeek) / Math.max(1, getDetailStep()))
            ));

            let targetIndex = trackIndex - 1;
            let resetTrackIndex = null;
            if (trackIndex === 0) {
                targetIndex = detailCards.length - 1;
                resetTrackIndex = detailCards.length;
            } else if (trackIndex === maxTrackIndex) {
                targetIndex = 0;
                resetTrackIndex = 1;
            }

            detailCarouselIndex = Math.max(0, Math.min(detailCards.length - 1, targetIndex));
            activeDetailIndex = detailCarouselIndex;
            detailCarouselTrackIndex = trackIndex;
            updateDetailCarouselUI();
            updateBrandByViewport();

            if (resetTrackIndex !== null) {
                requestAnimationFrame(() => {
                    detailCarouselTrackIndex = resetTrackIndex;
                    setDetailTrackPosition(resetTrackIndex, false);
                });
            }

            window.setTimeout(() => {
                detailCarouselSuppressClick = false;
            }, 160);
        };

        let nativeTapStartX = 0;
        let nativeTapStartY = 0;
        let nativeTapPointerId = null;

        if (nativeDetailScroll) {
            detailViewport.addEventListener('pointerdown', event => {
                nativeTapStartX = event.clientX;
                nativeTapStartY = event.clientY;
                nativeTapPointerId = event.pointerId;
                nativeDetailScrollStartLeft = detailViewport.scrollLeft;
                detailCarouselSuppressClick = false;
            }, { passive: true });

            detailViewport.addEventListener('pointerup', event => {
                if (nativeTapPointerId !== event.pointerId) return;
                const dx = Math.abs(event.clientX - nativeTapStartX);
                const dy = Math.abs(event.clientY - nativeTapStartY);
                nativeTapPointerId = null;

                // 移动端原生滚动过程中 click 可能被浏览器延迟/取消。
                // 对“真正的轻点”直接走详情入口，避免第 05 项在循环边界失去 click。
                if (dx < 8 && dy < 8) {
                    const activeCard = detailCards[detailCarouselIndex];
                    if (activeCard && !event.target.closest('a,button')) {
                        detailCarouselSuppressClick = true;
                        openModalFromCard(activeCard);
                        window.setTimeout(() => { detailCarouselSuppressClick = false; }, 180);
                    }
                }
            }, { passive: true });

            detailViewport.addEventListener('scroll', () => {
                if (Math.abs(detailViewport.scrollLeft - nativeDetailScrollStartLeft) > 6) {
                    detailCarouselSuppressClick = true;
                }
                clearTimeout(nativeDetailScrollTimer);
                nativeDetailScrollTimer = window.setTimeout(syncNativeDetailIndex, 72);
            }, { passive: true });
        }

        detailViewport.addEventListener('pointerdown', event => {
            if (nativeDetailScroll) {
                nativeDetailScrollStartLeft = detailViewport.scrollLeft;
                detailCarouselSuppressClick = false;
                return;
            }
            if (event.button !== undefined && event.button !== 0) return;
            detailCarouselDragging = true;
            detailViewport.classList.add('is-dragging');
            detailCarouselDragHorizontal = false;
            detailCarouselSuppressClick = false;
            detailCarouselDragStartX = event.clientX;
            detailCarouselDragStartY = event.clientY;
            detailCarouselPointerStartX = event.clientX;
            detailCarouselPointerStartY = event.clientY;
            detailCarouselPointerMoved = false;
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
                    detailViewport.classList.remove('is-dragging');
                    detailViewport.releasePointerCapture?.(event.pointerId);
                    return;
                }
                detailCarouselDragHorizontal = true;
                detailCarouselPointerMoved = true;
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

            // 桌面端：某些浏览器在 pointer capture + transform 轮播组合下，
            // click 事件可能落在已经移动过的节点上。对“没有发生横向拖拽”的鼠标
            // 操作在 pointerup 时直接打开当前项目，作为稳定兜底；真正拖拽仍走轮播。
            const isDesktopTap = event?.pointerType === 'mouse' &&
                !detailCarouselDragHorizontal &&
                !detailCarouselPointerMoved &&
                Math.abs((event?.clientX ?? detailCarouselPointerStartX) - detailCarouselPointerStartX) < 6 &&
                Math.abs((event?.clientY ?? detailCarouselPointerStartY) - detailCarouselPointerStartY) < 6;

            detailCarouselDragging = false;
            detailViewport.classList.remove('is-dragging');
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

            if (isDesktopTap) {
                const activeCard = detailCards[detailCarouselIndex];
                if (activeCard) {
                    // 阻止紧接着产生的 click 再次打开一次。
                    detailCarouselSuppressClick = true;
                    openModalFromCard(activeCard);
                    window.setTimeout(() => { detailCarouselSuppressClick = false; }, 180);
                }
            }

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

    // 项目详情进入视口后，连续 8 秒没有触摸/拖动/点击则自动向左切换一张。
    const detailSectionForAutoplay = document.getElementById('projects');
    let detailAutoplayTimer = 0;
    let detailSectionVisible = false;

    const scheduleDetailAutoplay = () => {
        clearTimeout(detailAutoplayTimer);
        if (!detailSectionVisible || document.hidden || detailCards.length < 2) return;

        detailAutoplayTimer = window.setTimeout(() => {
            const modalOpen = document.getElementById('project-modal')?.classList.contains('active');
            if (modalOpen || detailCarouselDragging) {
                scheduleDetailAutoplay();
                return;
            }
            goToDetailProject(detailCarouselIndex + 1, {
                animate: true,
                fromUser: false,
                allowLoop: true
            });
            updateBrandByViewport();
            scheduleDetailAutoplay();
        }, 8000);
    };

    const markDetailInteraction = () => scheduleDetailAutoplay();
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(type => {
        detailCarousel?.addEventListener(type, markDetailInteraction, { passive: type !== 'keydown' });
    });
    detailViewport?.addEventListener('scroll', markDetailInteraction, { passive: true });
    document.addEventListener('visibilitychange', scheduleDetailAutoplay);

    if (detailSectionForAutoplay) {
        const detailAutoplayObserver = new IntersectionObserver(entries => {
            detailSectionVisible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.28);
            scheduleDetailAutoplay();
        }, { threshold: [0, 0.28, 0.55] });
        detailAutoplayObserver.observe(detailSectionForAutoplay);
    }

    const projectSection = document.getElementById('projects');
    const escapeText = (value) => String(value ?? '').trim();
    const formatOverviewDate = (value) => {
        const source = escapeText(value);
        const years = [...source.matchAll(/(?:19|20)\d{2}/g)].map(match => match[0]);
        const uniqueYears = [...new Set(years)];
        if (!uniqueYears.length) return source;
        if (source.includes('至今')) return `${uniqueYears[0]}–至今`;
        if (uniqueYears.length === 1) return uniqueYears[0];
        return `${uniqueYears[0]}–${uniqueYears[uniqueYears.length - 1]}`;
    };

    let detailFocusStartTimer;
    let detailFocusEndTimer;
    const focusDetailCard = (index) => {
        clearTimeout(detailFocusStartTimer);
        clearTimeout(detailFocusEndTimer);
        detailTrack?.querySelectorAll('.detail-card-focus').forEach(card => card.classList.remove('detail-card-focus'));

        const target = detailCards[index];
        if (!target) return;
        // 等轮播完成位移后再高亮真实卡片，避免描边落在克隆卡片或滑动路径上。
        detailFocusStartTimer = window.setTimeout(() => {
            target.classList.add('detail-card-focus');
            detailFocusEndTimer = window.setTimeout(() => target.classList.remove('detail-card-focus'), 720);
        }, 340);
    };

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
            const date = formatOverviewDate(dateEl?.textContent);
            const summary = escapeText(summaryEl?.textContent);
            const tags = tagEls.slice(0, 2).map(el => el.outerHTML).join('');
            const brandEl = titleEl?.querySelector('.megmeet_logo, .chengtou_logo');
            const brand = brandEl ? brandEl.outerHTML : '';
            const mobileName = titleEl
                ? titleEl.cloneNode(true)
                : null;
            if (mobileName && brandEl) mobileName.querySelector('.megmeet_logo, .chengtou_logo')?.remove();
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
                </div>
            `;

            const jumpToDetail = (event) => {
                event?.preventDefault?.();
                event?.stopPropagation?.();
                card.blur();

                // 关键：不要通过 querySelector 找目标卡片再 indexOf。
                // 轮播会在 detailTrack 前后插入 05/01 克隆卡片，05 的 querySelector
                // 可能拿到克隆节点，导致 indexOf === -1，点击 05 直接中断。
                const targetIndex = detailCards.findIndex(card => card.dataset.project === id);
                if (targetIndex < 0 || !projectSection) return;

                clearTimeout(detailCarouselResetTimer);
                goToDetailProject(targetIndex, {
                    animate: true,
                    fromUser: false,
                    allowLoop: false
                });
                const targetBrand = detailBrandItems[targetIndex];
                if (targetBrand) setBrand(targetBrand.label, targetBrand.en);

                // 总览点击是“定位”操作，不再依赖轮播卡片的几何位置。
                // 直接滚动页面真正的 scrollingElement，PC / 手机统一走这一条路径。
                programmaticScroll = true;
                clearTimeout(programmaticScrollTimer);
                cancelAnimationFrame(brandRaf);

                const scrollDetailSection = () => {
                    const scroller = document.scrollingElement || document.documentElement;
                    const headerHeight = header?.getBoundingClientRect().height || getHeaderOffset();
                    const sectionTop = projectSection.getBoundingClientRect().top + scroller.scrollTop;
                    const targetTop = Math.max(0, sectionTop - headerHeight - 10);

                    // 先用原生 scrollingElement，避免 window.scrollTo 在部分桌面浏览器
                    // + sticky header 场景下出现“调用了但页面位置不变”。
                    scroller.scrollTo({ top: targetTop, behavior: 'smooth' });

                    focusDetailCard(targetIndex);
                };

                // 等轮播 transform 写入后再滚页面，但不再等待完整动画。
                requestAnimationFrame(() => {
                    requestAnimationFrame(scrollDetailSection);
                });

                // 强制兜底：检查页面是否真的已经移动到 projects 区域。
                // 05 也会经过这里，因此不会出现“05 能切卡但页面不动”。
                window.setTimeout(() => {
                    const headerHeight = header?.getBoundingClientRect().height || getHeaderOffset();
                    const desiredTop = headerHeight + 10;
                    const currentTop = projectSection.getBoundingClientRect().top;
                    if (currentTop > desiredTop + 28 || currentTop < desiredTop - 28) {
                        const scroller = document.scrollingElement || document.documentElement;
                        const sectionTop = projectSection.getBoundingClientRect().top + scroller.scrollTop;
                        scroller.scrollTo({
                            top: Math.max(0, sectionTop - desiredTop),
                            behavior: 'smooth'
                        });
                    }
                }, 650);

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
    measureBrandPositions();

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

    const getCanonicalDetailCard = (cardOrId) => {
        const id = typeof cardOrId === 'string'
            ? cardOrId
            : cardOrId?.dataset?.project;
        if (!id) return null;
        // 永远从初始 detailCards 中取“真卡片”，不依赖 querySelector。
        // 轮播运行后会额外插入 01/05 克隆卡，尤其是 05 在循环边界时，
        // querySelector 可能命中克隆节点，导致详情数据被移除后无法打开。
        return detailCards.find(item => item.dataset.project === id) || null;
    };

    const openModalFromCard = (card) => {
        const source = getCanonicalDetailCard(card);
        if (!source) return;
        const id = source.dataset.project;

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

            // 当前项目无论是原始卡还是轮播边界克隆，都统一打开“真卡片”的详情。
            // 这条路径不再依赖 DOM 克隆节点，因此第 05 项也能稳定打开。
            if (targetIndex === detailCarouselIndex) {
                event.preventDefault();
                event.stopPropagation();
                openModalFromCard(detailCards[targetIndex]);
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


    // 前端内容保护只能提高直接复制门槛，不能替代服务端保护或阻止专业抓取。
    document.body.classList.add('content-protected');
    const editableSelector = 'input, textarea, select, [contenteditable="true"]';
    const isEditableTarget = target => target instanceof Element && Boolean(target.closest(editableSelector));
    let protectionNoticeAt = 0;
    const showProtectionNotice = () => {
        const now = Date.now();
        if (now - protectionNoticeAt < 1200) return;
        protectionNoticeAt = now;
        showToast('页面内容已开启保护', 1600);
    };
    const blockProtectedAction = event => {
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
        event.stopPropagation();
        showProtectionNotice();
    };

    ['contextmenu', 'copy', 'cut', 'paste', 'selectstart', 'dragstart'].forEach(type => {
        document.addEventListener(type, blockProtectedAction, { capture: true });
    });

    document.addEventListener('keydown', event => {
        const key = String(event.key || '').toLowerCase();
        const modifier = event.ctrlKey || event.metaKey;
        const developerShortcut =
            event.key === 'F12' ||
            (modifier && event.shiftKey && ['i', 'j', 'c', 'k'].includes(key)) ||
            (event.metaKey && event.altKey && ['i', 'j', 'c', 'u'].includes(key));
        const sourceShortcut = modifier && ['u', 's', 'p'].includes(key);
        const contentShortcut = modifier && ['a', 'c', 'x', 'v'].includes(key) && !isEditableTarget(event.target);

        if (!developerShortcut && !sourceShortcut && !contentShortcut) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        showProtectionNotice();
    }, true);

})();