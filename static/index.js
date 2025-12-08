document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '';
    let currentGuestId = null;
    let currentAuthorName = 'Гость';

    const authToggleBtn = document.getElementById('auth-toggle-btn');
    const authDropdown = document.getElementById('auth-dropdown');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages-container');

    function addMessageToDOM(author, text, timestamp) {
        const messageCard = document.createElement('div');
        messageCard.classList.add('message-card');

        const authorSpan = document.createElement('span');
        authorSpan.classList.add('message-author');
        authorSpan.textContent = author;

        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = text;

        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-timestamp');
        timeSpan.textContent = timestamp ? new Date(timestamp).toLocaleTimeString() : '';

        messageCard.appendChild(authorSpan);
        messageCard.appendChild(messageParagraph);
        messageCard.appendChild(timeSpan);
        messagesContainer.appendChild(messageCard);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (!event.shiftKey) {
                event.preventDefault();
                messageForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    messageForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const messageText = messageInput.value.trim();

        if (messageText && currentGuestId) {
            try {
                const response = await fetch(`${API_URL}/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        author: currentAuthorName,
                        guest_id: currentGuestId,
                        text: messageText
                    })
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сервера: ${response.status}`);
                }

                const createdMessage = await response.json();

                addMessageToDOM(createdMessage.author, createdMessage.text, createdMessage.timestamp);

                messageInput.value = '';

            } catch (error) {
                console.error("Ошибка при отправке сообщения:", error);
                alert('Не удалось отправить сообщение.');
            }
        }
    });

    async function initGuest() {
        try {
            const response = await fetch(`${API_URL}/api/guest/init`);
            const data = await response.json();

            currentGuestId = data.guest_id;
            currentAuthorName = data.guest_name;

            authToggleBtn.textContent = `Привет, ${currentAuthorName}!`;

            loadMessages();

        } catch (error) {
            console.error("Ошибка инициализации гостя:", error);
        }
    }

    async function loadMessages() {
        try {
            const response = await fetch(`${API_URL}/show`);
            if (!response.ok) { throw new Error('Ошибка загрузки сообщений'); }

            const messages = await response.json();
            messagesContainer.innerHTML = '';
            messages.forEach(msg => {
                addMessageToDOM(msg.author, msg.text, msg.timestamp);
            });
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

        } catch (error) {
            console.error("Проблема с загрузкой сообщений:", error);
        }
    }

    initGuest();

    authToggleBtn.addEventListener('click', () => {
        authDropdown.classList.toggle('hidden');
    });

});

function handleAuth(type) {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        alert(`${type === 'login' ? 'Вход' : 'Регистрация'} пользователя ${username} завершен. (Это заглушка, нет связи с API)`);
        document.getElementById('auth-dropdown').classList.add('hidden');
        document.getElementById('auth-toggle-btn').textContent = `Привет, ${username}!`;
    } else {
        alert('Пожалуйста, введите имя пользователя и пароль.');
    }
}