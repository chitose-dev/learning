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
    
    // 画像を表示
    slideImage.src =
