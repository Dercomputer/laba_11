document.addEventListener('DOMContentLoaded', () => {
    const authToggleBtn = document.getElementById('auth-toggle-btn');
    const authDropdown = document.getElementById('auth-dropdown');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages-container');

    // 1. Управление разворачивающимся окном аутентификации
    authToggleBtn.addEventListener('click', () => {
        // Переключает класс 'hidden' для показа/скрытия
        authDropdown.classList.toggle('hidden');
    });

    // 2. Обработка отправки сообщения
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Предотвращение перезагрузки страницы

        const messageText = messageInput.value.trim();

        if (messageText) {
            // Получаем имя пользователя (в реальном приложении оно будет храниться в JS/сессии)
            const author = document.getElementById('username').value || 'Гость';

            // Создаем и добавляем новое сообщение
            addMessageToDOM(author, messageText);

            // Очищаем поле ввода
            messageInput.value = '';

            // Прокручиваем контейнер сообщений вниз
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });

    // Функция для создания HTML-элемента сообщения
    function addMessageToDOM(author, text) {
        const messageCard = document.createElement('div');
        messageCard.classList.add('message-card');

        const authorSpan = document.createElement('span');
        authorSpan.classList.add('message-author');
        authorSpan.textContent = author;

        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = text;

        messageCard.appendChild(authorSpan);
        messageCard.appendChild(messageParagraph);
        messagesContainer.appendChild(messageCard);
    }
});

// 3. Функция-заглушка для обработки входа/регистрации (вызывается из HTML)
function handleAuth(type) {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        alert(`${type === 'login' ? 'Вход' : 'Регистрация'} пользователя ${username} завершен. (Это заглушка, нет связи с API)`);
        document.getElementById('auth-dropdown').classList.add('hidden'); // Скрыть окно после действия
        document.getElementById('auth-toggle-btn').textContent = `Привет, ${username}!`; // Обновить текст кнопки
    } else {
        alert('Пожалуйста, введите имя пользователя и пароль.');
    }
}