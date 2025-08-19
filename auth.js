// 認証機能

// 固定のユーザー情報（デモ用）
const DEMO_USERS = {
    student: {
        id: 'student',
        password: 'password',
        type: 'student',
        name: '受講者'
    },
    admin: {
        id: 'admin',
        password: 'password',
        type: 'admin',
        name: '管理者'
    }
};

// 現在のユーザー情報を保持
let currentUser = null;

// ログイン処理
function login() {
    const userType = document.getElementById('userType').value;
    const userId = document.getElementById('userId').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // 入力チェック
    if (!userId || !password) {
        alert('ユーザーIDとパスワードを入力してください。');
        return;
    }
    
    // ユーザー認証
    const user = DEMO_USERS[userId];
    if (user && user.password === password && user.type === userType) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // ログイン成功 - 適切な画面に遷移
        hideAllScreens();
        if (user.type === 'student') {
            showStudentScreen();
        } else if (user.type === 'admin') {
            showAdminScreen();
        }
        
        // フォームをリセット
        document.getElementById('userId').value = '';
        document.getElementById('password').value = '';
        
    } else {
        alert('ユーザーID、パスワード、またはユーザータイプが正しくありません。');
    }
}

// ログアウト処理
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    hideAllScreens();
    showLoginScreen();
}

// 画面表示制御
function hideAllScreens() {
    const screens = ['loginScreen', 'studentScreen', 'slideshowScreen', 'adminScreen'];
    screens.forEach(screenId => {
        document.getElementById(screenId).style.display = 'none';
    });
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'block';
}

function showStudentScreen() {
    document.getElementById('studentScreen').style.display = 'block';
    loadCourseList();
}

function showAdminScreen() {
    document.getElementById('adminScreen').style.display = 'block';
    loadAdminCourseList();
}

function showSlideshowScreen() {
    document.getElementById('slideshowScreen').style.display = 'block';
}

// ローカルストレージからユーザー情報を復元
function restoreUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        hideAllScreens();
        if (currentUser.type === 'student') {
            showStudentScreen();
        } else if (currentUser.type === 'admin') {
            showAdminScreen();
        }
    } else {
        showLoginScreen();
    }
}

// エンターキーでログイン
function setupLoginKeyEvents() {
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
}

// ページ読み込み時にセッション復元とキーイベント設定
document.addEventListener('DOMContentLoaded', function() {
    restoreUserSession();
    setupLoginKeyEvents();
});

// ユーザー認証チェック
function requireAuth(requiredType = null) {
    if (!currentUser) {
        alert('ログインが必要です。');
        logout();
        return false;
    }
    
    if (requiredType && currentUser.type !== requiredType) {
        alert('この機能を使用する権限がありません。');
        return false;
    }
    
    return true;
}

// 現在のユーザー情報を取得
function getCurrentUser() {
    return currentUser;
}
