export default async function handler(req, res) {
  const username = "dupecopy"; 
  // URL Livecounts.io
  const targetUrl = `https://livecounts.io/tiktok-live-follower-counter/${username}`;

  try {
    const response = await fetch(targetUrl, {
        headers: {
            // Максимальная маскировка под браузер
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
        }
    });

    if (!response.ok) {
        throw new Error(`Запрос к Livecounts.io не удался со статусом: ${response.status}`);
    }

    const html = await response.text();
    
    // --- ПОПЫТКА 1: Поиск в JSON-конфигурации (Самый надежный) ---
    // Ищем строку, содержащую JSON-данные о пользователе
    const userDataMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(.*?);\s*<\/script>/s);

    let followers = 0;
    let likes = 0;
    let avatar = "";
    
    if (userDataMatch && userDataMatch[1]) {
        // Если нашли JSON, парсим его
        try {
            const dataJson = JSON.parse(userDataMatch[1]);
            // Пытаемся достать данные из внутренней структуры JSON
            followers = dataJson.tiktok?.user?.stats?.followerCount || 0;
            likes = dataJson.tiktok?.user?.stats?.heartCount || 0;
            avatar = dataJson.tiktok?.user?.avatarLarger || "";
            
            // Если данные успешно найдены в JSON, завершаем работу
            return res.status(200).json({
                user: username,
                followers: followers,
                likes: likes,
                avatar: avatar,
                updated: Date.now()
            });

        } catch (jsonError) {
            // Если парсинг JSON не удался, продолжаем искать в HTML (Попытка 2)
            console.error("JSON parsing failed, falling back to regex:", jsonError.message);
        }
    }
    
    // --- ПОПЫТКА 2: Поиск в HTML через регулярные выражения (Резервный) ---
    // Находим число в блоке с ID 'rc' (real count)
    const followersMatch = html.match(/id="rc">([\d,]+)/);
    // Находим лайки
    const likesMatch = html.match(/Total Likes.*?<span class="lcn-text-num">([\d,]+)/s);
    // Находим аватар
    const avatarMatch = html.match(/class="profile-pic" src="(.*?)"/);

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
    res.status(500).json({ error: "Критическая ошибка скрейпинга (Livecounts.io)", details: e.message });
  }
}
