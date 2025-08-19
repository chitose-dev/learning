// 共通機能とデータ管理

// ローカルストレージからコース一覧を取得
function getCourses() {
    const courses = localStorage.getItem('courses');
    return courses ? JSON.parse(courses) : [];
}

// コース一覧をローカルストレージに保存
function saveCourses(courses) {
    localStorage.setItem('courses', JSON.stringify(courses));
}

// IDでコースを取得
function getCourseById(courseId) {
    const courses = getCourses();
    return courses.find(course => course.id === courseId);
}

// コースを更新
function updateCourse(courseId, updatedCourse) {
    const courses = getCourses();
    const index = courses.findIndex(course => course.id === courseId);
    
    if (index !== -1) {
        courses[index] = updatedCourse;
        saveCourses(courses);
        return true;
    }
    return false;
}

// コースを削除
function removeCourse(courseId) {
    const courses = getCourses();
    const filteredCourses = courses.filter(course => course.id !== courseId);
    saveCourses(filteredCourses);
}

// アプリケーション初期化
function initializeApp() {
    // デバッグ用: ローカルストレージをクリア（開発時のみ）
    // localStorage.clear();
    
    // サンプルデータの作成
    createSampleData();
    
    // 認証状態の復元
    restoreUserSession();
}

// デモ用サンプルデータを作成
function createSampleData() {
    const existingCourses = getCourses();
    
    // 既にデータがある場合は何もしない
    if (existingCourses.length > 0) {
        return;
    }
    
    const sampleCourses = [
        {
            id: 'course_web_basics',
            title: 'Web開発入門',
            slides: [
                {
                    id: 'slide1',
                    imagePath: 'web_basics.jpg',
                    description: 'Web開発の基礎について学習します。現代のWebサイトはHTML、CSS、JavaScriptの3つの技術で構成されています。HTMLは文書の構造を、CSSは見た目を、JavaScriptは動的な機能を担当します。'
                },
                {
                    id: 'slide2',
                    imagePath: 'html_structure.jpg',
                    description: 'HTMLはHyperText Markup Languageの略で、Webページの構造を定義するマークアップ言語です。タグを使って見出し、段落、リンク、画像などの要素を配置し、文書の骨組みを作ります。'
                },
                {
                    id: 'slide3',
                    imagePath: 'css_styling.jpg',
                    description: 'CSSはCascading Style Sheetsの略で、HTMLで作成した要素の見た目を装飾する言語です。色、フォント、レイアウト、アニメーションなどを指定して、美しいWebページを作成できます。'
                }
            ],
            lastUpdated: new Date().toLocaleDateString()
        },
        {
            id: 'course_javascript',
            title: 'JavaScript基礎プログラミング',
            slides: [
                {
                    id: 'slide1',
                    imagePath: 'javascript_basics.jpg',
                    description: 'JavaScriptはWebページに動的な機能を追加するプログラミング言語です。ユーザーの操作に応じて画面を変化させたり、データを処理したり、インタラクティブな体験を提供できます。'
                }
            ],
            lastUpdated: new Date().toLocaleDateString()
        }
    ];
    
    saveCourses(sampleCourses);
}

// エラーハンドリング用の共通関数
function handleError(error, userMessage = 'エラーが発生しました') {
    console.error('Error:', error);
    alert(userMessage);
}

// ファイルサイズを人間が読みやすい形式に変換
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 画像ファイルかどうかをチェック
function isImageFile(file) {
    return file && file.type && file.type.startsWith('image/');
}

// Base64データURLかどうかをチェック
function isDataURL(str) {
    return str && typeof str === 'string' && str.startsWith('data:');
}

// デバッグ用: データをクリア
function clearAllData() {
    if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
        localStorage.clear();
        location.reload();
    }
}

// デバッグ用: サンプルデータを再作成
function recreateSampleData() {
    if (confirm('既存のデータを削除してサンプルデータを再作成しますか？')) {
        localStorage.removeItem('courses');
        createSampleData();
        alert('サンプルデータを再作成しました。ページを再読み込みします。');
        location.reload();
    }
}

// データのエクスポート（デバッグ用）
function exportData() {
    const data = {
        courses: getCourses(),
        currentUser: getCurrentUser()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'elearning_data.json';
    link.click();
}

// データのインポート（デバッグ用）
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.courses) {
                saveCourses(data.courses);
            }
            
            alert('データを正常にインポートしました。');
            location.reload();
            
        } catch (error) {
            handleError(error, 'ファイルの形式が正しくありません。');
        }
    };
    reader.readAsText(file);
}

// アプリケーションの状態をチェック
function checkAppStatus() {
    const courses = getCourses();
    const user = getCurrentUser();
    
    console.log('=== アプリケーション状態 ===');
    console.log('教材数:', courses.length);
    console.log('現在のユーザー:', user ? user.name : 'ログインしていません');
    console.log('ローカルストレージ使用量:', JSON.stringify(localStorage).length + ' 文字');
    
    // コース詳細
    courses.forEach((course, index) => {
        console.log(`教材 ${index + 1}: ${course.title} (${course.slides ? course.slides.length : 0} スライド)`);
    });
}

// パフォーマンス監視
function monitorPerformance() {
    if (window.performance && window.performance.mark) {
        window.performance.mark('app-start');
        
        window.addEventListener('load', function() {
            window.performance.mark('app-loaded');
            window.performance.measure('app-load-time', 'app-start', 'app-loaded');
            
            const measure = window.performance.getEntriesByName('app-load-time')[0];
            console.log('アプリケーション読み込み時間:', Math.round(measure.duration) + 'ms');
        });
    }
}

// デバッグモードの有効化
function enableDebugMode() {
    // グローバル関数として公開
    window.clearAllData = clearAllData;
    window.recreateSampleData = recreateSampleData;
    window.exportData = exportData;
    window.checkAppStatus = checkAppStatus;
    
    console.log('=== デバッグモードが有効になりました ===');
    console.log('使用可能な関数:');
    console.log('- clearAllData(): すべてのデータを削除');
    console.log('- recreateSampleData(): サンプルデータを再作成');
    console.log('- exportData(): データをエクスポート');
    console.log('- checkAppStatus(): アプリケーション状態を表示');
}

// アプリケーション開始時の処理
document.addEventListener('DOMContentLoaded', function() {
    try {
        monitorPerformance();
        initializeApp();
        
        // 開発環境でのみデバッグモードを有効化
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            enableDebugMode();
        }
        
        console.log('eラーニングアプリケーションが正常に起動しました。');
        
    } catch (error) {
        handleError(error, 'アプリケーションの初期化中にエラーが発生しました。');
    }
});

// ウィンドウを閉じる前の確認（データ保護）
window.addEventListener('beforeunload', function(e) {
    const user = getCurrentUser();
    if (user && user.type === 'admin') {
        // 管理者の場合は確認を表示
        e.preventDefault();
        e.returnValue = '編集中のデータがある可能性があります。本当にページを離れますか？';
    }
});

// エラーハンドリング
window.addEventListener('error', function(e) {
    console.error('予期しないエラー:', e.error);
    handleError(e.error, 'アプリケーションでエラーが発生しました。ページを再読み込みしてください。');
});

// 未処理のPromise拒否をキャッチ
window.addEventListener('unhandledrejection', function(e) {
    console.error('未処理のPromise拒否:', e.reason);
    handleError(e.reason, 'データの処理中にエラーが発生しました。');
});
