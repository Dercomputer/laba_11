document.addEventListener('DOMContentLoaded', () => {
    // ⚙️ Основные константы и переменные
    const API_URL = '';
    let currentAuthorName = 'Гость';
    let targetMessageContent = null;

    // 🎯 Элементы DOM
    const authToggleBtn = document.getElementById('auth-toggle-btn');
    const authDropdown = document.getElementById('auth-dropdown');
    const messagesContainer = document.getElementById('messages-container');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');

    // 🆕 Элементы для МОДАЛЬНОГО ОКНА УДАЛЕНИЯ
    const deleteModal = document.getElementById('delete-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const messageToDeleteText = document.getElementById('message-to-delete-text');
    const modalConfirmDeleteBtn = document.getElementById('modal-confirm-delete-btn');
    const modalCancelDeleteBtn = document.getElementById('modal-cancel-delete-btn');
    const modalDeleteUsernameInput = document.getElementById('modal-delete-username');
    const modalDeletePasswordInput = document.getElementById('modal-delete-password');

    // ------------------------------------
    // 🖋️ Вспомогательные функции
    // ------------------------------------

    function updateCurrentAuthorName() {
        const btnText = authToggleBtn.textContent.trim();
        if (btnText.startsWith('Привет,')) {
            currentAuthorName = btnText.replace('Привет,', '').trim().replace('!', '');
        } else {
            currentAuthorName = 'Гость';
        }
    }

    /** Выделяет сообщение для удаления и показывает модальное окно */
    function selectMessageForDeletion(messageText, element) {
        // 1. Сброс предыдущего выбора
        document.querySelectorAll('.message-card.selected-for-delete').forEach(el => {
            el.classList.remove('selected-for-delete');
        });

        // 2. Установка нового выбора
        targetMessageContent = messageText;
        element.classList.add('selected-for-delete');

        // 3. Обновление и показ модального окна
        messageToDeleteText.textContent = messageText;
        deleteModal.classList.add('visible'); // Используем класс 'visible' для отображения
        modalConfirmDeleteBtn.disabled = false;
    }

    /** Скрывает модальное окно и сбрасывает выделение */
    function hideDeleteModal() {
        deleteModal.classList.remove('visible');
        document.querySelectorAll('.message-card.selected-for-delete').forEach(el => {
            el.classList.remove('selected-for-delete');
        });
        targetMessageContent = null;
        modalDeleteUsernameInput.value = '';
        modalDeletePasswordInput.value = '';
        modalConfirmDeleteBtn.disabled = true;
    }


    /** Добавляет сообщение в DOM */
    function addMessageToDOM(username, message) {
        const messageCard = document.createElement('div');
        messageCard.classList.add('message-card');

        // Добавление кликабельности
        messageCard.addEventListener('click', () => selectMessageForDeletion(message, messageCard));

        const authorSpan = document.createElement('span');
        authorSpan.classList.add('message-author');
        authorSpan.textContent = username;

        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = message;

        messageCard.appendChild(authorSpan);
        messageCard.appendChild(messageParagraph);
        messagesContainer.appendChild(messageCard);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /** Загружает и отображает все сообщения */
    async function loadMessages() {
        try {
            const response = await fetch(`${API_URL}/show`);
            if (!response.ok) { throw new Error('Ошибка загрузки сообщений'); }

            const messages = await response.json();
            messagesContainer.innerHTML = '';
            messages.forEach(msg => {
                addMessageToDOM(msg.username, msg.message);
            });
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

        } catch (error) {
            console.error("Проблема с загрузкой сообщений:", error);
        }
    }

    // ------------------------------------
    // 🚀 Обработчики событий (Listeners)
    // ------------------------------------

    /** Обработчик отправки сообщения (без изменений) */
    messageForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        // ... (логика отправки, как в предыдущем коде)
        const messageText = messageInput.value.trim();
        updateCurrentAuthorName();

        if (messageText) {
            try {
                if (currentAuthorName === 'Гость') {
                    alert('Пожалуйста, войдите или зарегистрируйтесь, чтобы отправить сообщение.');
                    return;
                }

                const response = await fetch(`${API_URL}/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: currentAuthorName,
                        message: messageText
                    })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    alert(`Ошибка: ${errData.detail || 'Не удалось отправить сообщение.'}`);
                    return;
                }

                const createdMessage = await response.json();
                addMessageToDOM(createdMessage.username, createdMessage.message);
                messageInput.value = '';

            } catch (error) {
                console.error("Ошибка при отправке сообщения:", error);
                alert('Не удалось отправить сообщение.');
            }
        }
    });


    /** Обработчик подтверждения удаления (изменен на модальные элементы) */
    modalConfirmDeleteBtn.addEventListener('click', async () => {
        const deleter_username = modalDeleteUsernameInput.value.trim();
        const deleter_password = modalDeletePasswordInput.value;

        if (!deleter_username || !deleter_password || !targetMessageContent) {
            alert("Пожалуйста, введите имя пользователя и пароль и выберите сообщение.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deleter_username: deleter_username,
                    deleter_password: deleter_password,
                    target_message: targetMessageContent
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Сообщение успешно удалено.`);
                hideDeleteModal();
                loadMessages();
            } else {
                alert(`Ошибка удаления: ${data.detail || 'Проверьте логин/пароль или права администратора.'}`);
            }

        } catch (error) {
            console.error("Ошибка сети при удалении:", error);
            alert("Не удалось выполнить запрос на удаление.");
        }
    });

    /** Обработчики скрытия модального окна */
    modalCancelDeleteBtn.addEventListener('click', hideDeleteModal);
    closeModalBtn.addEventListener('click', hideDeleteModal);

    // Скрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === deleteModal) {
            hideDeleteModal();
        }
    });

    /** Переключатель видимости формы авторизации */
    authToggleBtn.addEventListener('click', () => {
        authDropdown.classList.toggle('hidden');
    });

    // ------------------------------------
    // 🏁 Инициализация
    // ------------------------------------
    loadMessages();
});


/** Функция для Login/Register (без изменений) */
async function handleAuth(type) {
    // ... (логика handleAuth без изменений)
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const endpoint = type === 'login' ? '/login' : '/register';
    const API_URL = '';

    if (username && password) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || 'Успешно!');
                document.getElementById('auth-dropdown').classList.add('hidden');
                document.getElementById('auth-toggle-btn').textContent = `Привет, ${username}!`;
                window.location.reload();
            } else {
                alert(`Ошибка: ${data.detail || data.message}`);
            }

        } catch (error) {
            console.error(error);
            alert("Ошибка сети");
        }
    } else {
        alert('Пожалуйста, введите имя пользователя и пароль.');
    }
}