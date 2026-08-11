(() => {
    const mobileMedia = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)');
    if (!mobileMedia.matches) return;

    const carousel = document.getElementById('project-detail-carousel');
    const viewport = carousel?.querySelector('.detail-carousel-viewport');
    const track = carousel?.querySelector('.detail-list');
    if (!carousel || !viewport || !track) return;

    const trackCards = [...track.children].filter(card => card.classList.contains('detail-card'));
    const sourceCards = [...document.querySelectorAll('#projects .detail-card[data-project]:not(.is-carousel-clone)')];
    const retainedImages = [];
    const decodeTasks = new Map();
    let visibleFrame = 0;

    const imageUrlFromCard = card => {
        const cssImage = card?.dataset.detailBgImage ||
            card?.style.getPropertyValue('--detail-bg-image') ||
            '';
        return String(cssImage).match(/url\((['"]?)(.*?)\1\)/)?.[2] || '';
    };

    const decodeImage = (url, priority = 'auto') => {
        if (!url) return Promise.resolve();
        if (decodeTasks.has(url)) return decodeTasks.get(url);

        const image = new Image();
        image.decoding = 'async';
        if ('fetchPriority' in image) image.fetchPriority = priority;
        image.src = url;
        retainedImages.push(image);

        const task = typeof image.decode === 'function'
            ? image.decode().catch(() => undefined)
            : new Promise(resolve => {
                image.onload = resolve;
                image.onerror = resolve;
            });
        decodeTasks.set(url, task);
        return task;
    };

    const initialUrls = sourceCards.map(imageUrlFromCard).filter(Boolean);
    const decodeOrder = [
        initialUrls[0],
        initialUrls[1],
        initialUrls[initialUrls.length - 1],
        ...initialUrls.slice(2, -1)
    ].filter((url, index, urls) => url && urls.indexOf(url) === index);

    const scheduleIdle = callback => {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback, { timeout: 450 });
        } else {
            window.setTimeout(callback, 90);
        }
    };

    const warmQueue = async index => {
        if (index >= decodeOrder.length) return;
        const priority = index < 3 ? 'high' : 'low';
        await decodeImage(decodeOrder[index], priority);
        scheduleIdle(() => warmQueue(index + 1));
    };

    // 当前卡立即解码；其余图片逐张、低优先级解码，避免 5 张同时占用主线程。
    warmQueue(0);

    const updateVisibleCards = () => {
        visibleFrame = 0;
        if (!trackCards.length) return;

        const center = viewport.scrollLeft + viewport.clientWidth / 2;
        let nearest = 0;
        let nearestDistance = Infinity;

        trackCards.forEach((card, index) => {
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            const distance = Math.abs(cardCenter - center);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = index;
            }
        });

        // 先读完几何信息，再统一写 class，避免滚动事件里反复触发布局。
        trackCards.forEach((card, index) => {
            card.classList.toggle('is-carousel-visible', Math.abs(index - nearest) <= 1);
        });

        [nearest - 1, nearest, nearest + 1].forEach(index => {
            const url = imageUrlFromCard(trackCards[index]);
            if (url) decodeImage(url, 'high');
        });
    };

    const requestVisibleUpdate = () => {
        if (visibleFrame) return;
        visibleFrame = requestAnimationFrame(updateVisibleCards);
    };

    carousel.classList.add('carousel-optimized');
    requestVisibleUpdate();
    viewport.addEventListener('scroll', requestVisibleUpdate, { passive: true });
    viewport.addEventListener('pointerdown', requestVisibleUpdate, { passive: true });
    window.addEventListener('resize', requestVisibleUpdate, { passive: true });
})();
