// 受講者機能

// 教材選択画面に戻る
function backToStudentScreen() {
    if (!requireAuth('student')) return;
    hideAllScreens();
    showStudentScreen();
}

// 教材一覧を読み込み表示
function loadCourseList() {
    if (!requireAuth('student')) return;
    
    const courseListElement = document.getElementById('courseList');
    const courses = getCourses();
    
    courseListElement.innerHTML = '';
    
    if (courses.length === 0) {
        courseListElement.innerHTML = `
            <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <h3>教材がありません</h3>
                <p>管理者が教材を作成するまでお待ちください。</p>
            </div>
        `;
        return;
    }
    
    courses.forEach(course => {
        if (course.slides && course.slides.length > 0) {
            const courseCard = createCourseCard(course);
            courseListElement.appendChild(courseCard);
        }
    });
}

// 教材カードを作成
function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.onclick = () => startCourse(course.id);
    
    card.innerHTML = `
        <h3>${course.title}</h3>
        <p>スライド数: ${course.slides.length}枚</p>
        <p>最終更新: ${course.lastUpdated || '未設定'}</p>
        <div style="margin-top: 15px;">
            <button class="btn-primary" onclick="event.stopPropagation(); startCourse('${course.id}')">
                受講開始
            </button>
        </div>
    `;
    
    return card;
}

// 教材の受講を開始
function startCourse(courseId) {
    if (!requireAuth('student')) return;
    
    const course = getCourseById(courseId);
    if (!course) {
        alert('教材が見つかりません。');
        return;
    }
    
    if (!course.slides || course.slides.length === 0) {
        alert('この教材にはスライドがありません。');
        return;
    }
    
    // スライドショーを開始
    initSlideshow(course);
    hideAllScreens();
    showSlideshowScreen();
}

// デモ用サンプル教材を作成（初回のみ）
function createSampleCourses() {
    const existingCourses = getCourses();
    if (existingCourses.length === 0) {
        const sampleCourses = [
            {
                id: 'sample1',
                title: 'Web開発入門',
                slides: [
                    {
                        id: 'slide1',
                        imagePath: 'sample1.jpg',
                        description: 'Web開発の基礎について学習します。HTML、CSS、JavaScriptの役割を理解しましょう。'
                    },
                    {
                        id: 'slide2',
                        imagePath: 'sample2.jpg',
                        description: 'HTMLはWebページの構造を定義するマークアップ言語です。要素とタグの概念を覚えましょう。'
                    }
                ],
                lastUpdated: new Date().toLocaleDateString()
            },
            {
                id: 'sample2',
                title: 'JavaScript基礎',
                slides: [
                    {
                        id: 'slide1',
                        imagePath: 'sample3.jpg',
                        description: 'JavaScriptはWebページに動的な機能を追加するプログラミング言語です。'
                    }
                ],
                lastUpdated: new Date().toLocaleDateString()
            }
        ];
        
        localStorage.setItem('courses', JSON.stringify(sampleCourses));
    }
}

// ページ読み込み時にサンプルデータを作成
document.addEventListener('DOMContentLoaded', function() {
    createSampleCourses();
});
