// 管理者機能

let currentEditingCourse = null;

// 管理者画面の教材一覧を読み込み
function loadAdminCourseList() {
    if (!requireAuth('admin')) return;
    
    const adminCourseList = document.getElementById('adminCourseList');
    const courses = getCourses();
    
    adminCourseList.innerHTML = '';
    
    if (courses.length === 0) {
        adminCourseList.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #f9f9f9; border-radius: 8px;">
                <p>教材がありません。新しい教材を作成してください。</p>
            </div>
        `;
        return;
    }
    
    courses.forEach(course => {
        const courseItem = createAdminCourseItem(course);
        adminCourseList.appendChild(courseItem);
    });
}

// 管理者用教材アイテムを作成
function createAdminCourseItem(course) {
    const item = document.createElement('div');
    item.className = 'admin-course-item';
    
    item.innerHTML = `
        <div class="admin-course-info">
            <h4>${course.title}</h4>
            <p>スライド数: ${course.slides ? course.slides.length : 0}枚 | 最終更新: ${course.lastUpdated || '未設定'}</p>
        </div>
        <div class="admin-course-actions">
            <button onclick="editCourse('${course.id}')" class="btn-primary">編集</button>
            <button onclick="deleteCourse('${course.id}')" class="btn-danger">削除</button>
        </div>
    `;
    
    return item;
}

// 新しい教材を作成
function createNewCourse() {
    if (!requireAuth('admin')) return;
    
    const titleInput = document.getElementById('newCourseTitle');
    const title = titleInput.value.trim();
    
    if (!title) {
        alert('教材名を入力してください。');
        return;
    }
    
    const newCourse = {
        id: generateCourseId(),
        title: title,
        slides: [],
        lastUpdated: new Date().toLocaleDateString()
    };
    
    const courses = getCourses();
    courses.push(newCourse);
    saveCourses(courses);
    
    titleInput.value = '';
    loadAdminCourseList();
    
    alert('新しい教材を作成しました。');
}

// 教材を編集
function editCourse(courseId) {
    if (!requireAuth('admin')) return;
    
    const course = getCourseById(courseId);
    if (!course) {
        alert('教材が見つかりません。');
        return;
    }
    
    currentEditingCourse = course;
    document.getElementById('editCourseTitle').textContent = `「${course.title}」を編集`;
    
    updateSlideEditor();
    document.getElementById('editModal').style.display = 'flex';
}

// 教材を削除
function deleteCourse(courseId) {
    if (!requireAuth('admin')) return;
    
    const course = getCourseById(courseId);
    if (!course) {
        alert('教材が見つかりません。');
        return;
    }
    
    if (confirm(`教材「${course.title}」を削除しますか？この操作は取り消せません。`)) {
        const courses = getCourses();
        const updatedCourses = courses.filter(c => c.id !== courseId);
        saveCourses(updatedCourses);
        loadAdminCourseList();
        alert('教材を削除しました。');
    }
}

// スライド編集エリアを更新
function updateSlideEditor() {
    const slideEditor = document.getElementById('slideEditor');
    
    if (!currentEditingCourse) {
        slideEditor.innerHTML = '<p>編集する教材が選択されていません。</p>';
        return;
    }
    
    slideEditor.innerHTML = '<h3>スライド一覧</h3>';
    
    if (!currentEditingCourse.slides || currentEditingCourse.slides.length === 0) {
        slideEditor.innerHTML += '<p>スライドがありません。画像をアップロードして追加してください。</p>';
        return;
    }
    
    currentEditingCourse.slides.forEach((slide, index) => {
        const slideItem = createSlideEditorItem(slide, index);
        slideEditor.appendChild(slideItem);
    });
}

// スライド編集アイテムを作成
function createSlideEditorItem(slide, index) {
    const item = document.createElement('div');
    item.className = 'slide-editor-item';
    
    item.innerHTML = `
        <img src="${slide.imagePath}" alt="スライド ${index + 1}" class="slide-preview">
        <div class="slide-editor-content">
            <label>説明文:</label>
            <textarea placeholder="スライドの説明を入力してください" 
                     onblur="updateSlideDescription(${index}, this.value)">${slide.description || ''}</textarea>
        </div>
        <div class="slide-editor-actions">
            <button onclick="moveSlideUp(${index})" class="btn-secondary" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button onclick="moveSlideDown(${index})" class="btn-secondary" ${index === currentEditingCourse.slides.length - 1 ? 'disabled' : ''}>↓</button>
            <button onclick="removeSlide(${index})" class="btn-danger">削除</button>
        </div>
    `;
    
    return item;
}

// 画像をアップロード
function uploadImages() {
    if (!requireAuth('admin')) return;
    if (!currentEditingCourse) {
        alert('先に教材を選択してください。');
        return;
    }
    
    const fileInput = document.getElementById('imageUpload');
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('画像ファイルを選択してください。');
        return;
    }
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // ファイルタイプチェック
        if (!file.type.startsWith('image/')) {
            alert(`${file.name} は画像ファイルではありません。`);
            continue;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const newSlide = {
                id: generateSlideId(),
                imagePath: e.target.result, // Base64データURL
                description: ''
            };
            
            currentEditingCourse.slides.push(newSlide);
            updateSlideEditor();
        };
        reader.readAsDataURL(file);
    }
    
    fileInput.value = ''; // ファイル選択をリセット
}

// スライドの説明文を更新
function updateSlideDescription(index, description) {
    if (currentEditingCourse && currentEditingCourse.slides[index]) {
        currentEditingCourse.slides[index].description = description;
    }
}

// スライドを上に移動
function moveSlideUp(index) {
    if (!currentEditingCourse || index <= 0) return;
    
    const slides = currentEditingCourse.slides;
    [slides[index - 1], slides[index]] = [slides[index], slides[index - 1]];
    updateSlideEditor();
}

// スライドを下に移動
function moveSlideDown(index) {
    if (!currentEditingCourse || index >= currentEditingCourse.slides.length - 1) return;
    
    const slides = currentEditingCourse.slides;
    [slides[index], slides[index + 1]] = [slides[index + 1], slides[index]];
    updateSlideEditor();
}

// スライドを削除
function removeSlide(index) {
    if (!currentEditingCourse) return;
    
    if (confirm('このスライドを削除しますか？')) {
        currentEditingCourse.slides.splice(index, 1);
        updateSlideEditor();
    }
}

// 教材を保存
function saveCourse() {
    if (!requireAuth('admin')) return;
    if (!currentEditingCourse) return;
    
    // 最終更新日を設定
    currentEditingCourse.lastUpdated = new Date().toLocaleDateString();
    
    // データベースに保存
    const courses = getCourses();
    const index = courses.findIndex(c => c.id === currentEditingCourse.id);
    
    if (index !== -1) {
        courses[index] = currentEditingCourse;
    } else {
        courses.push(currentEditingCourse);
    }
    
    saveCourses(courses);
    
    alert('教材を保存しました。');
    closeEditModal();
    loadAdminCourseList();
}

// 編集モーダルを閉じる
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditingCourse = null;
}

// ユニークなコースIDを生成
function generateCourseId() {
    return 'course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ユニークなスライドIDを生成
function generateSlideId() {
    return 'slide_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// モーダル外クリックで閉じる
document.addEventListener('click', function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
});

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('editModal');
        if (modal.style.display === 'flex') {
            closeEditModal();
        }
    }
});
