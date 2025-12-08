// Глобальная переменная для хранения текущего пользователя
let currentUsername = "Guest";
const currentUserElement = document.getElementById('current-user');

// --- Вспомогательные функции ---

/**
 * Обновляет отображаемое имя текущего пользователя.
 * @param {string} username - Имя пользователя.
 */
function updateCurrentUser(username) {
    currentUsername = username;
    currentUserElement.textContent = username;
    // Очистка сообщений формы при смене пользователя
    document.getElementById('auth-message').textContent = '';
    document.getElementById('send-message').textContent = '';
    document.getElementById('change-message').textContent = '';
    document.getElementById('delete-message').textContent = '';
}

/**
 * Универсальная функция для отправки POST-запросов.
 */
async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response;
}

/**
 * Универсальная функция для отправки DELETE-запросов.
 */
async function deleteData(url, data) {
     const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response;
}

/**
 * Универсальная функция для отправки PATCH-запросов.
 */
async function patchData(url, data) {
     const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response;
}

// --- Обработчики Событий ---

async function handleRegister() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('auth-message');
    messageElement.textContent = '';

    try {
        const response = await postData('/register', { username, password });
        const result = await response.json();

        if (response.ok) {
            messageElement.textContent = `✅ ${result.message}`;
        } else {
            messageElement.textContent = `❌ ${result.detail || result.message}`;
        }
    } catch (error) {
        messageElement.textContent = `❌ Ошибка сети: ${error.message}`;
    }
}

async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('auth-message');
    messageElement.textContent = '';

    const url = `/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (response.ok) {
            messageElement.textContent = `✅ ${result.message}. Вы вошли как ${username}.`;
            updateCurrentUser(username);
        } else {
            messageElement.textContent = `❌ ${result.detail || result.message}`;
            updateCurrentUser("Guest");
        }
    } catch (error) {
        messageElement.textContent = `❌ Ошибка сети: ${error.message}`;
    }
}

async function handleSend() {
    const messageText = document.getElementById('message-text').value;
    const messageElement = document.getElementById('send-message');
    messageElement.textContent = '';

    if (currentUsername === "Guest") {
        messageElement.textContent = "❌ Гости не могут писать сообщения. Пожалуйста, войдите.";
        return;
    }

    try {
        const response = await postData('/send', {
            username: currentUsername,
            message: messageText
        });
        const result = await response.json();

        if (response.ok) {
            messageElement.textContent = `✅ Сообщение отправлено.`;
            document.getElementById('message-text').value = '';
            showMessages();
        } else {
            messageElement.textContent = `❌ ${result.detail || result.message}`;
        }
    } catch (error) {
        messageElement.textContent = `❌ Ошибка сети: ${error.message}`;
    }
}

async function showMessages() {
    const container = document.getElementById('messages-container');
    container.innerHTML = 'Загрузка сообщений...';

    try {
        const response = await fetch('/show');
        const messages = await response.json();

        container.innerHTML = '';

        if (messages.length === 0) {
            container.innerHTML = '<p>Нет сообщений.</p>';
        } else {
            messages.forEach(msg => {
                const div = document.createElement('div');
                div.className = 'message-item';
                div.innerHTML = `<strong>${msg.name}</strong>: ${msg.message}`;
                container.appendChild(div);
            });
        }
    } catch (error) {
        container.innerHTML = `<p class="error">❌ Ошибка загрузки сообщений: ${error.message}</p>`;
    }
}

async function handleDelete() {
    const targetMessage = document.getElementById('target-message').value;
    const messageElement = document.getElementById('delete-message');
    messageElement.textContent = '';

    if (currentUsername === "Guest") {
        messageElement.textContent = "❌ Гости не могут удалять сообщения. Пожалуйста, войдите.";
        return;
    }

    // Запрос пароля для соответствия логике бэкенда.
    const deleterPassword = prompt(`Введите пароль для ${currentUsername} для подтверждения удаления:`);
    if (!deleterPassword) {
        messageElement.textContent = "❌ Пароль не введен. Удаление отменено.";
        return;
    }

    try {
        const response = await deleteData('/delete', {
            deleter_username: currentUsername,
            deleter_password: deleterPassword,
            target_message: targetMessage
        });
        const result = await response.json();

        if (response.ok) {
            messageElement.textContent = `✅ Сообщение успешно удалено. Удалено записей: ${result.count}`;
            document.getElementById('target-message').value = '';
            showMessages();
        } else {
            messageElement.textContent = `❌ Ошибка удаления: ${result.detail || result.message}`;
        }
    } catch (error) {
        messageElement.textContent = `❌ Ошибка сети: ${error.message}`;
    }
}

async function handleChangePassword() {
    const oldPassword = document.getElementById('change-old-password').value;
    const newPassword = document.getElementById('change-new-password').value;
    const messageElement = document.getElementById('change-message');
    messageElement.textContent = '';

    if (currentUsername === "Guest") {
        messageElement.textContent = "❌ Смена пароля доступна только для авторизованных пользователей.";
        return;
    }

    try {
        const response = await patchData('/change_password', {
            username: currentUsername,
            old_password: oldPassword,
            new_password: newPassword
        });
        const result = await response.json();

        if (response.ok) {
            messageElement.textContent = `✅ ${result.message}`;
            document.getElementById('change-old-password').value = '';
            document.getElementById('change-new-password').value = '';
        } else {
            messageElement.textContent = `❌ ${result.detail || result.message}`;
        }
    } catch (error) {
        messageElement.textContent = `❌ Ошибка сети: ${error.message}`;
    }
}