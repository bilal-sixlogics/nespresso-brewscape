// Cafrezzo Admin — JS enhancements

document.addEventListener('DOMContentLoaded', () => {
    // Stagger animate stat cards on first load
    document.querySelectorAll('.fi-wi-stats-overview-stat').forEach((el, i) => {
        el.style.animationDelay = `${i * 60}ms`;
        el.style.opacity = '0';
        requestAnimationFrame(() => {
            el.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    });

    // Animate numeric stat values counting up
    document.querySelectorAll('.fi-wi-stats-overview-stat-value').forEach(el => {
        const raw = el.textContent.replace(/[^\d.]/g, '');
        const num = parseFloat(raw);
        if (!isNaN(num) && num > 0 && num < 100000) {
            const prefix = el.textContent.replace(/[\d.,]+/, '').trim().split(/[\d.,]/)[0] || '';
            let start = 0;
            const duration = 800;
            const startTime = performance.now();
            const tick = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * num);
                el.textContent = prefix + current.toLocaleString();
                if (progress < 1) requestAnimationFrame(tick);
                else el.textContent = el.dataset.original;
            };
            el.dataset.original = el.textContent;
            requestAnimationFrame(tick);
        }
    });
});

// Re-animate after Livewire updates
document.addEventListener('livewire:navigated', () => {
    document.querySelectorAll('.fi-section, .fi-wi-stats-overview-stat').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        setTimeout(() => {
            el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, i * 40);
    });
});
