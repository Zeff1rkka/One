export default async function handler(req, res) {
  const username = "dupecopy";

  try {
    // 1. Добавляем объект с заголовками (headers) в fetch
    const response = await fetch(`https://tokcount.com/?user=${username}`, {
        headers: {
            // Имитируем запрос от браузера Chrome на Windows
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    
    // Проверяем, если ответ не 200 OK, возвращаем ошибку
    if (!response.ok) {
        throw new Error(`External fetch failed with status: ${response.status}`);
    }

    const html = await response.text();

    // Оставляем регулярные выражения как есть
    const followersMatch = html.match(/"followerCount":(\d+)/);
    const likesMatch = html.match(/"heartCount":(\d+)/);
    const avatarMatch = html.match(/"avatarLarger":"(.*?)"/);
    
    // ... (остальной код остается без изменений)
    res.status(200).json({
      user: username,
      followers: followersMatch ? Number(followersMatch[1]) : 0,
      likes: likesMatch ? Number(likesMatch[1]) : 0,
      avatar: avatarMatch ? avatarMatch[1].replace(/\\u002F/g, "/") : "",
      updated: Date.now()
    });
    
  } catch (e) {
    // Если fetch заблокирован, эта ошибка будет поймана
    res.status(500).json({ error: "Parsing failed or request blocked", details: e.message });
  }
}
