export default async function handler(req, res) {
  // Убедитесь, что здесь ваш никнейм.
  const username = "dupecopy"; 

  // URL теперь ведет на livecounts.io
  const targetUrl = `https://livecounts.io/tiktok-live-follower-counter/${username}`;

  try {
    const response = await fetch(targetUrl, {
        headers: {
            // Имитируем запрос от браузера (для обхода простых блокировок)
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    if (!response.ok) {
        throw new Error(`External fetch failed with status: ${response.status}`);
    }

    const html = await response.text();
    
    // --- НОВЫЕ РЕГУЛЯРНЫЕ ВЫРАЖЕНИЯ ДЛЯ LIVECOUNTS.IO ---
    
    // Подписчики: Livecounts использует блок с ID 'rc' (real count)
    const followersMatch = html.match(/id="rc">([\d,]+)/);
    
    // Лайки: Livecounts хранит лайки в другом блоке.
    // Это выражение ищет 'Total Likes' и число.
    const likesMatch = html.match(/Total Likes.*?<span class="lcn-text-num">([\d,]+)/s);

    // Аватар: Аватар также ищется по новой структуре.
    const avatarMatch = html.match(/class="profile-pic" src="(.*?)"/);
    
    // --- ПАРСИНГ И ВОЗВРАТ ---

    // Функция очистки числа (удаляет запятые и преобразует в Integer)
    const cleanNumber = (match) => {
        return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
    };

    res.status(200).json({
      user: username,
      followers: cleanNumber(followersMatch),
      likes: cleanNumber(likesMatch),
      avatar: avatarMatch ? avatarMatch[1] : "",
      updated: Date.now()
    });

  } catch (e) {
    res.status(500).json({ error: "Parsing or fetch failed with Livecounts.io", details: e.message });
  }
}
