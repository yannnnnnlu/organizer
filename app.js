let state = {
    users: JSON.parse(localStorage.getItem('fo_users')) || {},
    currentUser: localStorage.getItem('fo_current_user') || null,
    currentTab: 'login',
    theme: localStorage.getItem('fo_theme') || 'light',
    lang: localStorage.getItem('fo_lang') || 'ru',
    tasks: [],
    reminders: [],
    history: {}
};

let chartInstance = null;

const translations = {
    ru: {
        authSubtitle: "Войдите в свой аккаунт для продолжения",
        loginTab: "Вход",
        regTab: "Регистрация",
        lblUsername: "Имя пользователя",
        lblPassword: "Пароль",
        btnLogin: "Войти в приложение",
        btnRegister: "Зарегистрироваться",
        profileTitle: "Мой Профиль",
        changePhoto: "Сменить фото",
        logout: "Выйти из аккаунта",
        settingsTitle: "Настройки",
        themeLabel: "Тема оформления",
        langLabel: "Язык приложения",
        calendarTitle: "Календарь истории",
        selectDateHint: "Выберите дату для просмотра списка выполненных дел.",
        noHistoryText: "Нет выполненных дел за выбранную дату.",
        tasksTitle: "Дела на сегодня",
        addPlaceholder: "Что нужно сделать?",
        progressTitle: "Прогресс дня",
        remindersTitle: "Напоминания",
        addReminderTitle: "Новое напоминание",
        reminderPlaceholder: "О чем напомнить?",
        btnSetReminder: "Установить",
        activeReminders: "Активные",
        navProfile: "Профиль",
        navTasks: "Задачи",
        navReminders: "Напоминания",
        dayTheme: "☀️️ Дневная",
        nightTheme: "🌙 Ночная",
        errUserExists: "Пользователь с таким именем уже существует",
        errInvalidCreds: "Неверный логин или пароль",
        optNormal: "Обычный",
        optImportant: "Важный ⚡",
        optUrgent: "Срочный 🔥",
        chartCompleted: "Выполнено",
        chartRemaining: "Осталось"
    },
    en: {
        authSubtitle: "Log in to your account to continue",
        loginTab: "Login",
        regTab: "Register",
        lblUsername: "Username",
        lblPassword: "Password",
        btnLogin: "Log In",
        btnRegister: "Create Account",
        profileTitle: "My Profile",
        changePhoto: "Change Photo",
        logout: "Log Out",
        settingsTitle: "Settings",
        themeLabel: "Theme",
        langLabel: "Language",
        calendarTitle: "History Calendar",
        selectDateHint: "Select a date to view completed tasks history.",
        noHistoryText: "No completed tasks for the selected date.",
        tasksTitle: "Today's Tasks",
        addPlaceholder: "What needs to be done?",
        progressTitle: "Daily Progress",
        remindersTitle: "Reminders",
        addReminderTitle: "New Reminder",
        reminderPlaceholder: "Remind me about...",
        btnSetReminder: "Set Reminder",
        activeReminders: "Active",
        navProfile: "Profile",
        navTasks: "Tasks",
        navReminders: "Reminders",
        dayTheme: "☀️ Light",
        nightTheme: "🌙 Dark",
        errUserExists: "Username already exists",
        errInvalidCreds: "Invalid username or password",
        optNormal: "Normal",
        optImportant: "Important ⚡",
        optUrgent: "Urgent 🔥",
        chartCompleted: "Completed",
        chartRemaining: "Remaining"
    }
};

const quotes = [
    "«Каждый маленький шаг приближает к большой цели!»",
    "«Лучший способ начать что-то делать — перестать говорить и начать делать.»",
    "«Дисциплина — это мост между целями и достижениями.»",
    "«Успех — это сумма небольших усилий, повторяющихся изо дня в день.»"
];

document.addEventListener("DOMContentLoaded", () => {
    applyTheme(state.theme);
    applyLanguage(state.lang);

    if (state.currentUser && state.users[state.currentUser]) {
        showMainApp();
    } else {
        showAuthScreen();
    }

    const quoteEl = document.getElementById('quote-box');
    if (quoteEl) {
        quoteEl.innerText = quotes[Math.floor(Math.random() * quotes.length)];
    }

    const uInput = document.getElementById('auth-username');
    const pInput = document.getElementById('auth-password');
    if (uInput) uInput.addEventListener('input', hideAuthError);
    if (pInput) pInput.addEventListener('input', hideAuthError);
});

function switchAuthTab(tab) {
    state.currentTab = tab;
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-register');
    if (tabLogin) tabLogin.classList.toggle('active', tab === 'login');
    if (tabReg) tabReg.classList.toggle('active', tab === 'register');

    const t = translations[state.lang];
    const submitBtn = document.getElementById('auth-submit-btn');
    if (submitBtn) submitBtn.innerText = tab === 'login' ? t.btnLogin : t.btnRegister;
    hideAuthError();
}

function handleAuthSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    hideAuthError();

    const usernameEl = document.getElementById('auth-username');
    const passwordEl = document.getElementById('auth-password');
    if (!usernameEl || !passwordEl) return false;

    const username = usernameEl.value.trim();
    const password = passwordEl.value;

    if (!username || !password) return false;

    if (state.currentTab === 'register') {
        if (state.users[username]) {
            showAuthError(translations[state.lang].errUserExists);
            return false;
        }
        state.users[username] = { password, avatar: null, tasks: [], reminders: [], history: {} };
        saveUsers();
        loginUser(username);
    } else {
        if (!state.users[username] || state.users[username].password !== password) {
            showAuthError(translations[state.lang].errInvalidCreds);
            return false;
        }
        loginUser(username);
    }
    return false;
}

function loginUser(username) {
    state.currentUser = username;
    localStorage.setItem('fo_current_user', username);

    const uInput = document.getElementById('auth-username');
    const pInput = document.getElementById('auth-password');
    if (uInput) uInput.value = '';
    if (pInput) pInput.value = '';

    hideAuthError();
    showMainApp();
}

function logout() {
    state.currentUser = null;
    localStorage.removeItem('fo_current_user');
    showAuthScreen();
}

function showAuthScreen() {
    document.getElementById('auth-screen').classList.remove('hidden');
    const mainApp = document.getElementById('main-app');
    if (mainApp) mainApp.classList.add('hidden');
}

function showMainApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    const mainApp = document.getElementById('main-app');
    if (mainApp) mainApp.classList.remove('hidden');

    const userData = state.users[state.currentUser] || { tasks: [], reminders: [], history: {} };
    const dispName = document.getElementById('display-username');
    if (dispName) dispName.innerText = state.currentUser;

    const avatarImg = document.getElementById('avatar-img');
    if (avatarImg && userData.avatar) {
        avatarImg.src = userData.avatar;
    }

    state.tasks = userData.tasks || [];
    state.reminders = userData.reminders || [];
    state.history = userData.history || {};

    renderTasks();
    renderReminders();
    initChart();
}

function showAuthError(msg) {
    const errBox = document.getElementById('auth-error');
    if (errBox) {
        errBox.innerText = msg;
        errBox.classList.remove('hidden');
    }
}

function hideAuthError() {
    const errBox = document.getElementById('auth-error');
    if (errBox) {
        errBox.classList.add('hidden');
    }
}

function switchPage(pageId, btnElement) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
}

function addTask(e) {
    if (e && e.preventDefault) e.preventDefault();
    const input = document.getElementById('task-input');
    const priorityEl = document.getElementById('task-priority');
    if (!input) return;

    const priority = priorityEl ? priorityEl.value : 'normal';
    const text = input.value.trim();
    if (!text) return;

    state.tasks.push({ id: Date.now(), text, completed: false, priority });
    input.value = '';
    saveUserData();
    renderTasks();
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if (task.completed && typeof confetti === 'function') {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }

        const today = new Date().toISOString().split('T')[0];
        if (!state.history[today]) state.history[today] = [];
        if (task.completed) {
            state.history[today].push(task.text);
        } else {
            state.history[today] = state.history[today].filter(t => t !== task.text);
        }

        saveUserData();
        renderTasks();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveUserData();
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('task-list');
    if (!list) return;
    list.innerHTML = '';

    state.tasks.forEach(t => {
        const li = document.createElement('li');
        li.className = `task-item priority-${t.priority} ${t.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask(${t.id})">
                <span>${escapeHtml(t.text)}</span>
            </div>
            <button class="btn-delete" onclick="deleteTask(${t.id})">✕</button>
        `;
        list.appendChild(li);
    });

    updateChart();
}

function addReminder(e) {
    if (e && e.preventDefault) e.preventDefault();
    const textEl = document.getElementById('reminder-text');
    const timeEl = document.getElementById('reminder-time');
    if (!textEl || !timeEl) return;

    const text = textEl.value.trim();
    const time = timeEl.value;
    if (!text || !time) return;

    state.reminders.push({ id: Date.now(), text, time });
    textEl.value = '';
    timeEl.value = '';
    saveUserData();
    renderReminders();
}

function deleteReminder(id) {
    state.reminders = state.reminders.filter(r => r.id !== id);
    saveUserData();
    renderReminders();
}

function renderReminders() {
    const list = document.getElementById('reminder-list');
    if (!list) return;
    list.innerHTML = '';

    state.reminders.forEach(r => {
        const dateFormatted = new Date(r.time).toLocaleString(state.lang === 'ru' ? 'ru-RU' : 'en-US', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
        const li = document.createElement('li');
        li.className = 'reminder-item';
        li.innerHTML = `
            <div>
                <strong>${escapeHtml(r.text)}</strong>
                <div style="font-size: 11px; color: var(--text-secondary);">${dateFormatted}</div>
            </div>
            <button class="btn-delete" onclick="deleteReminder(${r.id})">✕</button>
        `;
        list.appendChild(li);
    });
}

function uploadAvatar(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const avatarData = evt.target.result;
            const img = document.getElementById('avatar-img');
            if (img) img.src = avatarData;
            if (state.users[state.currentUser]) {
                state.users[state.currentUser].avatar = avatarData;
                saveUsers();
            }
        };
        reader.readAsDataURL(file);
    }
}

function loadHistoryDate(dateStr) {
    const container = document.getElementById('history-results');
    if (!container) return;
    const tasksOnDate = state.history[dateStr] || [];
    const t = translations[state.lang];

    if (tasksOnDate.length === 0) {
        container.innerHTML = `<p class="text-muted">${t.noHistoryText}</p>`;
    } else {
        container.innerHTML = `<ul class="task-list" style="margin-top: 10px;">` +
            tasksOnDate.map(taskText => `<li class="task-item"><span>✓ ${escapeHtml(taskText)}</span></li>`).join('') +
            `</ul>`;
    }
}

function initChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas || typeof Chart === 'undefined') return;
    const ctx = canvas.getContext('2d');
    if (chartInstance) chartInstance.destroy();

    const t = translations[state.lang];

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [t.chartCompleted, t.chartRemaining],
            datasets: [{
                data: [0, 1],
                backgroundColor: ['#6c5ce7', '#e2e8f0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: { legend: { display: false } }
        }
    });
    updateChart();
}

function updateChart() {
    if (!chartInstance) return;
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    chartInstance.data.datasets[0].data = total === 0 ? [0, 1] : [completed, total - completed];
    chartInstance.update();

    const centerText = document.getElementById('chart-center-text');
    if (centerText) centerText.innerText = `${pct}%`;
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('fo_theme', state.theme);
    applyTheme(state.theme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('theme-btn');
    const themeBtnMain = document.getElementById('theme-btn-main');
    const labelText = theme === 'light' ? translations[state.lang].dayTheme : translations[state.lang].nightTheme;
    if (themeBtn) themeBtn.innerText = labelText;
    if (themeBtnMain) themeBtnMain.innerText = labelText;
}

function changeLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('fo_lang', lang);
    applyLanguage(lang);
}

function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function applyLanguage(lang) {
    const t = translations[lang];

    setElText('auth-subtitle', t.authSubtitle);
    setElText('tab-login', t.loginTab);
    setElText('tab-register', t.regTab);
    setElText('lbl-username', t.lblUsername);
    setElText('lbl-password', t.lblPassword);
    setElText('auth-submit-btn', state.currentTab === 'login' ? t.btnLogin : t.btnRegister);

    setElText('txt-profile-title', t.profileTitle);
    setElText('txt-change-photo', t.changePhoto);
    setElText('txt-logout', t.logout);
    setElText('txt-settings-title', t.settingsTitle);
    setElText('txt-theme-label', t.themeLabel);
    setElText('txt-lang-label', t.langLabel);
    setElText('txt-calendar-title', t.calendarTitle);
    setElText('txt-select-date-hint', t.selectDateHint);

    setElText('txt-tasks-title', t.tasksTitle);
    const taskInput = document.getElementById('task-input');
    if (taskInput) taskInput.placeholder = t.addPlaceholder;

    setElText('txt-progress-title', t.progressTitle);

    setElText('txt-reminders-title', t.remindersTitle);
    setElText('txt-add-reminder-title', t.addReminderTitle);

    const remInput = document.getElementById('reminder-text');
    if (remInput) remInput.placeholder = t.reminderPlaceholder;

    setElText('btn-set-reminder', t.btnSetReminder);
    setElText('txt-active-reminders', t.activeReminders);

    setElText('nav-lbl-profile', t.navProfile);
    setElText('nav-lbl-tasks', t.navTasks);
    setElText('nav-lbl-reminders', t.navReminders);

    const prioSelect = document.getElementById('task-priority');
    if (prioSelect && prioSelect.options.length >= 3) {
        prioSelect.options[0].text = t.optNormal;
        prioSelect.options[1].text = t.optImportant;
        prioSelect.options[2].text = t.optUrgent;
    }

    const authLangSelect = document.getElementById('auth-lang-select');
    const mainLangSelect = document.getElementById('main-lang-select');
    if (authLangSelect) authLangSelect.value = lang;
    if (mainLangSelect) mainLangSelect.value = lang;

    applyTheme(state.theme);

    if (chartInstance) {
        chartInstance.data.labels = [t.chartCompleted, t.chartRemaining];
        chartInstance.update();
    }
    renderReminders();
}

function saveUserData() {
    if (state.currentUser && state.users[state.currentUser]) {
        state.users[state.currentUser].tasks = state.tasks;
        state.users[state.currentUser].reminders = state.reminders;
        state.users[state.currentUser].history = state.history;
        saveUsers();
    }
}

function saveUsers() {
    localStorage.setItem('fo_users', JSON.stringify(state.users));
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, match => {
        const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return escapeMap[match];
    });
}