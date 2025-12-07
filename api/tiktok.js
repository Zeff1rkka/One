export default async function handler(req, res) {
  // Убедитесь, что здесь ваш никнейм.
  const username = "dupecopy"; 

  // URL оригинального счетчика
  const tiktokCountUrl = `https://tokcount.com/?user=${username}`;

  // URL прокси AllOrigins. Мы просим AllOrigins запросить данные с tiktokCountUrl.
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(tiktokCountUrl)}`;

  try {
    // 1. Отправляем запрос на прокси-сервис AllOrigins
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
        throw new Error(`Прокси-запрос не удался со статусом: ${response.status}`);
    }

    // Получаем HTML, который AllOrigins вернул с сайта tokcount.com
    const html = await response.text();
    
    // --- РЕГУЛЯРНЫЕ ВЫРАЖЕНИЯ (вернулись к оригинальным) ---
    
    // Эти выражения ищут данные в HTML-коде, который вернул tokcount.com
    const followersMatch = html.match(/"followerCount":(\d+)/);
    const likesMatch = html.match(/"heartCount":(\d+)/);
    const avatarMatch = html.match(/"avatarLarger":"(.*?)"/);
    
    // --- ПАРСИНГ И ВОЗВРАТ ---

    res.status(200).json({
      user: username,
      // Возвращаем 0, если данные не найдены
      followers: followersMatch ? Number(followersMatch[1]) : 0,
      likes: likesMatch ? Number(likesMatch[1]) : 0,
      // Заменяем кодировку URL на обычные слеши
      avatar: avatarMatch ? avatarMatch[1].replace(/\\u002F/g, "/") : "",
      updated: Date.now()
    });

  } catch (e) {
    res.status(500).json({ error: "Ошибка прокси или парсинга", details: e.message });
  }
}
