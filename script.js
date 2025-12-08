// /script.js
const LAST_VIDEO_KEY = 'last_tiktok_video_id';

async function updateStats() {
  try {
    const res = await fetch("/api/tiktok");
    const data = await res.json();

    // 1. Обновляем счетчики (если данные есть, иначе ---)
    document.getElementById("followers").innerText = data.followers ? data.followers.toLocaleString() : "---";
    document.getElementById("likes").innerText = data.likes ? data.likes.toLocaleString() : "---";

    if (data.avatar) {
      document.getElementById("avatar").src = data.avatar;
    }

    // 2. Логика Уведомлений о Новом Видео
    if (data.latestVideoId) {
      const savedVideoId = localStorage.getItem(LAST_VIDEO_KEY);
      
      // Если у нас уже есть сохраненное ID, и оно отличается от нового
      if (savedVideoId && savedVideoId !== data.latestVideoId) {
        showNewVideoNotification(data); 
      }
      
      // Сохраняем последний известный ID для следующей проверки
      localStorage.setItem(LAST_VIDEO_KEY, data.latestVideoId);
    }

  } catch (err) {
    console.log("Ошибка обновления:", err);
    // При ошибке можно выводить, что данные не доступны
    document.getElementById("followers").innerText = "ОШИБКА";
    document.getElementById("likes").innerText = "ОШИБКА";
  }
}

// Функция отображения PWA-уведомления
function showNewVideoNotification(data) {
  // Проверяем, разрешены ли уведомления
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`🔔 НОВОЕ ВИДЕО ОТ @${data.user}`, {
      body: data.latestVideoDesc || "Нажмите, чтобы посмотреть новый клип!",
      icon: document.getElementById('avatar').src,
      tag: 'new-tiktok-video'
    }).onclick = function() {
      // При нажатии на уведомление открываем ссылку на видео
      if (data.latestVideoUrl) {
        window.open(data.latestVideoUrl, '_blank');
      }
    };
  }
}

// Запрашиваем разрешение на уведомления при первой загрузке
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

// Запуск
requestNotificationPermission(); 
updateStats();
// Увеличиваем интервал до 30 секунд. Это снизит риск блокировки.
setInterval(updateStats, 30000);
