/* ==========================================================================
   LANStream (STREAMER) — Interactive Features & Calculator
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initAdbGenerator();
    calculateBitrate();
    setupMobileMenu();
});

// Mobile Navigation Toggle
function setupMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-xmark');
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-xmark');
                }
            });
        });
    }
}

// Module Tabs Switching
function switchModuleTab(tabId, buttonElement) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
}

// Lightbox Modal for Screenshots
function openLightbox(src, caption) {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    const captionEl = document.getElementById('lightboxCaption');

    if (modal && img && captionEl) {
        img.src = src;
        captionEl.textContent = caption;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close lightbox on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

// FAQ Accordion
function toggleFaq(itemElement) {
    const answer = itemElement.querySelector('.faq-answer');
    const isOpen = itemElement.classList.contains('active');

    // Close all other items
    document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('active');
        const ans = el.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = null;
    });

    if (!isOpen && answer) {
        itemElement.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
    }
}

// Clipboard Copy
function copyCode(buttonElement) {
    const pre = buttonElement.parentElement.querySelector('pre');
    if (!pre) return;
    const text = pre.innerText;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Script copied to clipboard!');
        const icon = buttonElement.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-regular', 'fa-copy');
            icon.classList.add('fa-solid', 'fa-check');
            setTimeout(() => {
                icon.classList.remove('fa-solid', 'fa-check');
                icon.classList.add('fa-regular', 'fa-copy');
            }, 2000);
        }
    });
}

function copyGeneratedAdb(buttonElement) {
    const code = document.getElementById('generatedAdbCode');
    if (!code) return;

    navigator.clipboard.writeText(code.innerText).then(() => {
        showToast('ADB commands copied to clipboard!');
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }
}

// Interactive ADB Script Generator
function initAdbGenerator() {
    generateAdbScript();
}

function generateAdbScript() {
    const module = document.getElementById('adbModule')?.value || 'tv';
    const ip = document.getElementById('adbIp')?.value.trim() || '192.168.1.100';
    const port = document.getElementById('adbPort')?.value.trim() || '5555';
    const targetEl = document.getElementById('generatedAdbCode');

    if (!targetEl) return;

    let script = `# Environment Setup\n# Ensure Android SDK platform-tools is in your PATH\n\n`;

    if (module === 'mobile') {
        script += `# 1. Build LANStream Mobile application\n./gradlew :mobile:assembleDebug\n\n`;
        script += `# 2. Connect ADB over Wi-Fi\nadb connect ${ip}:${port}\n\n`;
        script += `# 3. Install and Launch LANStream Mobile\nadb -s ${ip}:${port} install -r mobile/build/outputs/apk/debug/mobile-debug.apk\n`;
        script += `adb -s ${ip}:${port} shell am start -n com.lanstream.mobile/.MainActivity`;
    } else if (module === 'tv') {
        script += `# 1. Build LANStream TV Release APK with R8 Single-Dex\n./gradlew :tv:assembleRelease\n\n`;
        script += `# 2. Connect ADB to Android TV\nadb connect ${ip}:${port}\n\n`;
        script += `# 3. Install, Speed Profile Compile, and Launch LANStream TV\nadb -s ${ip}:${port} install -r tv/build/outputs/apk/release/tv-release.apk\n`;
        script += `adb -s ${ip}:${port} shell cmd package compile -m speed -f com.lanstream.tv\n`;
        script += `adb -s ${ip}:${port} shell am start -n com.lanstream.tv/.TvPlayerActivity`;
    }

    targetEl.innerText = script;
}

// Interactive Bitrate & Wi-Fi Calculator
function calculateBitrate() {
    const mediaPreset = document.getElementById('mediaPreset')?.value || '4kremux';
    const wifiStandard = document.getElementById('wifiStandard')?.value || 'wifi5';
    const resultsContainer = document.getElementById('calcResults');

    if (!resultsContainer) return;

    const mediaSpecs = {
        '1080p': { bitrate: 12, label: '1080p FHD' },
        '4kweb': { bitrate: 25, label: '4K Web-DL' },
        '4kremux': { bitrate: 85, label: '4K UHD Remux' },
        'flac': { bitrate: 9, label: 'Hi-Res FLAC Audio' }
    };

    const wifiSpecs = {
        'wifi4': { bandwidth: 72, label: 'Wi-Fi 4 (2.4GHz)' },
        'wifi5': { bandwidth: 433, label: 'Wi-Fi 5 (5GHz)' },
        'wifi6': { bandwidth: 866, label: 'Wi-Fi 6 (5GHz)' },
        'hotspot': { bandwidth: 200, label: 'Phone Hotspot (5GHz AP)' }
    };

    const media = mediaSpecs[mediaPreset];
    const wifi = wifiSpecs[wifiStandard];

    // Estimated real-world effective throughput (usually ~60% of PHY link speed)
    const effectiveThroughput = wifi.bandwidth * 0.65;
    const usagePercent = Math.min(100, Math.round((media.bitrate / effectiveThroughput) * 100));
    const freeHeadroom = Math.max(0, 100 - usagePercent);

    let isGood = usagePercent <= 60;
    let isWarning = usagePercent > 60 && usagePercent <= 90;

    let badgeClass = isGood ? 'good' : 'warn';
    let iconClass = isGood ? 'fa-circle-check' : 'fa-triangle-exclamation';

    let statusTitle = '';
    let statusDesc = '';

    if (isGood) {
        statusTitle = `LAN Bandwidth Headroom: ${freeHeadroom}% Free (${effectiveThroughput.toFixed(0)} Mbps available)`;
        statusDesc = `Estimated Buffer Latency: < 75ms • Flawless 4K Direct Playback with zero dropped frames.`;
    } else if (isWarning) {
        statusTitle = `Tight Bandwidth Headroom: ${freeHeadroom}% Free (${effectiveThroughput.toFixed(0)} Mbps available)`;
        statusDesc = `May experience brief initial buffer (~1.5s). Recommend 5GHz Wi-Fi or Phone Hotspot for smoother timeline scrubbing.`;
    } else {
        statusTitle = `Bandwidth Congestion Warning: ${usagePercent}% link capacity required!`;
        statusDesc = `Wi-Fi 4 2.4GHz is too saturated for uncompressed 85 Mbps 4K Remux. Switch to 5GHz Wi-Fi or reduce video bitrate to 1080p/4K Web-DL.`;
    }

    resultsContainer.innerHTML = `
        <div class="result-badge ${badgeClass}">
            <i class="fa-solid ${iconClass}"></i>
            <div>
                <strong>${statusTitle}</strong>
                <p>${statusDesc}</p>
            </div>
        </div>
    `;
}
