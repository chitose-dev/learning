// スライドショー機能

let currentCourse = null;
let currentSlideIndex = 0;
let autoplayInterval = null;
let isAutoplay = false;
const AUTOPLAY_INTERVAL = 5000; // 5秒

// スライドショーを初期化
function initSlideshow(course) {
    if (!requireAuth('student')) return;
    
    currentCourse = course;
    currentSlideIndex = 0;
    
    // タイトルを設定
    document.getElementById('courseTitle').textContent = course.title;
    
    // スライドを表示
    displayCurrentSlide();
    updateNavigationState();
    updateProgressBar();
    
    // キーボードイベントを設定
    setupSlideshowKeyEvents();
}

// 現在のスライドを表示
function displayCurrentSlide() {
    if (!currentCourse || !currentCourse.slides) return;
    
    const slide = currentCourse.slides[currentSlideIndex];
    if (!slide) return;
    
    const slideImage = document.getElementById('currentSlide');
    const slideDescription = document.getElementById('slideDescription');
    const slideCounter = document.getElementById('slideCounter');
    
    // 画像を表示（Safari対応のエラーハンドリング付き）
    slideImage.onerror = function() {
        console.warn('画像の読み込みに失敗しました:', slide.imagePath);
        // フォールバック画像を設定
        this.src = createFallbackImage(currentSlideIndex + 1);
        this.onerror = null; // 無限ループを防ぐ
    };
    
    slideImage.onload = function() {
        console.log('画像が正常に読み込まれました:', slide.imagePath);
    };
    
    slideImage.src = slide.imagePath;
    slideImage.alt = `スライド ${currentSlideIndex + 1}`;
    
    // 説明文を表示
    slideDescription.textContent = slide.description || 'スライドの説明がありません。';
    
    // スライド番号を更新
    slideCounter.textContent = `${currentSlideIndex + 1} / ${currentCourse.slides.length}`;
}

// フォールバック画像を作成（SVG）
function createFallbackImage(slideNumber) {
    const svg = `
        <svg width="400" height="225" viewBox="0 0 400 225" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="225" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
            <circle cx="200" cy="90" r="30" fill="#6c757d"/>
            <path d="M185 80 L200 95 L215 80" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="150" y="130" width="100" height="8" fill="#dee2e6" rx="4"/>
            <text x="200" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6c757d">
                スライド ${slideNumber}
            </text>
            <text x="200" y="190" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#adb5bd">
                画像を読み込み中...
            </text>
        </svg>
    `;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// 次のスライドに進む
function nextSlide() {
    if (!currentCourse || !currentCourse.slides) return;
    
    if (currentSlideIndex < currentCourse.slides.length - 1) {
        currentSlideIndex++;
        displayCurrentSlide();
        updateNavigationState();
        updateProgressBar();
    }
}

// 前のスライドに戻る
function previousSlide() {
    if (!currentCourse || !currentCourse.slides) return;
    
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        displayCurrentSlide();
        updateNavigationState();
        updateProgressBar();
    }
}

// ナビゲーションボタンの状態を更新
function updateNavigationState() {
    if (!currentCourse || !currentCourse.slides) return;
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // 前へボタンの状態
    prevBtn.disabled = currentSlideIndex === 0;
    
    // 次へボタンの状態
    nextBtn.disabled = currentSlideIndex === currentCourse.slides.length - 1;
}

// プログレスバーを更新
function updateProgressBar() {
    if (!currentCourse || !currentCourse.slides) return;
    
    const progressFill = document.getElementById('progressFill');
    const progress = ((currentSlideIndex + 1) / currentCourse.slides.length) * 100;
    progressFill.style.width = `${progress}%`;
}

// 自動送り機能をトグル
function toggleAutoplay() {
    if (isAutoplay) {
        stopAutoplay();
    } else {
        startAutoplay();
    }
}

// 自動送りを開始
function startAutoplay() {
    if (!currentCourse || !currentCourse.slides) return;
    
    isAutoplay = true;
    document.getElementById('autoplayBtn').textContent = '自動送り: ON';
    
    autoplayInterval = setInterval(() => {
        if (currentSlideIndex < currentCourse.slides.length - 1) {
            nextSlide();
        } else {
            // 最後のスライドに達したら自動送りを停止
            stopAutoplay();
        }
    }, AUTOPLAY_INTERVAL);
}

// 自動送りを停止
function stopAutoplay() {
    isAutoplay = false;
    document.getElementById('autoplayBtn').textContent = '自動送り: OFF';
    
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
}

// キーボードイベントを設定
function setupSlideshowKeyEvents() {
    document.addEventListener('keydown', handleSlideshowKeydown);
}

// キーボードイベントを削除
function removeSlideshowKeyEvents() {
    document.removeEventListener('keydown', handleSlideshowKeydown);
}

// キーボード操作の処理
function handleSlideshowKeydown(event) {
    // スライドショー画面でない場合は何もしない
    if (document.getElementById('slideshowScreen').style.display === 'none') {
        return;
    }
    
    switch(event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
            event.preventDefault();
            previousSlide();
            break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ': // スペースキー
            event.preventDefault();
            nextSlide();
            break;
        case 'Home':
            event.preventDefault();
            goToFirstSlide();
            break;
        case 'End':
            event.preventDefault();
            goToLastSlide();
            break;
        case 'Escape':
            event.preventDefault();
            backToStudentScreen();
            break;
    }
}

// 最初のスライドに移動
function goToFirstSlide() {
    if (!currentCourse || !currentCourse.slides) return;
    
    currentSlideIndex = 0;
    displayCurrentSlide();
    updateNavigationState();
    updateProgressBar();
}

// 最後のスライドに移動
function goToLastSlide() {
    if (!currentCourse || !currentCourse.slides) return;
    
    currentSlideIndex = currentCourse.slides.length - 1;
    displayCurrentSlide();
    updateNavigationState();
    updateProgressBar();
}

// 特定のスライドに移動
function goToSlide(index) {
    if (!currentCourse || !currentCourse.slides) return;
    
    if (index >= 0 && index < currentCourse.slides.length) {
        currentSlideIndex = index;
        displayCurrentSlide();
        updateNavigationState();
        updateProgressBar();
    }
}

// スライドショー終了時のクリーンアップ
function cleanupSlideshow() {
    stopAutoplay();
    removeSlideshowKeyEvents();
    currentCourse = null;
    currentSlideIndex = 0;
}

// 画面切り替え時に自動送りを停止
document.addEventListener('DOMContentLoaded', function() {
    // 他の画面に切り替わった時に自動送りを停止
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const slideshowScreen = document.getElementById('slideshowScreen');
                if (slideshowScreen && slideshowScreen.style.display === 'none') {
                    cleanupSlideshow();
                }
            }
        });
    });
    
    const slideshowScreen = document.getElementById('slideshowScreen');
    if (slideshowScreen) {
        observer.observe(slideshowScreen, { attributes: true });
    }
});
