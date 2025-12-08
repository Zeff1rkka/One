// /api/tiktok.js
export default async function handler(req, res) {
  const username = "dupecopy"; 
  // Используем прокси AllOrigins для обхода блокировок при запросе к странице TikTok
  const profileUrl = `https://www.tiktok.com/@${username}`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(profileUrl)}`;

  try {
    const response = await fetch(proxyUrl, {
        headers: {
            // Маскировка под обычный браузер
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
        }
    });

    if (!response.ok) {
        throw new Error(`Прокси-запрос не удался со статусом: ${response.status}`);
    }

    const html = await response.text();
    
    // Регулярное выражение для поиска ID, времени и описания последнего видео
    // Данные ищутся в JSON-блоке, который TikTok встраивает в HTML.
    const videoDataMatch = html.match(/\"video\":\{\"id\":\"(\d+)\".*?\"createTime\":\"(\d+)\".*?\"desc\":\"(.*?)\".*?\"stats\":\{\"followerCount\":(\d+),\"heartCount\":(\d+)\}/s);
    const avatarMatch = html.match(/\"avatarLarger\":\"(.*?)\"/);
    
    let stats = {
        followers: 0, 
        likes: 0
    };
    let videoInfo = {
        latestVideoId: null,
        latestVideoTime: 0,
        latestVideoDesc: null,
        latestVideoUrl: null
    };
    
    // Если удалось найти данные о видео и статистике
    if (videoDataMatch) {
      videoInfo.latestVideoId = videoDataMatch[1];
      videoInfo.latestVideoTime = Number(videoDataMatch[2]) * 1000; 
      videoInfo.latestVideoDesc = videoDataMatch[3].replace(/\\u002F/g, "/"); 
      videoInfo.latestVideoUrl = `https://www.tiktok.com/@${username}/video/${videoInfo.latestVideoId}`;

      stats.followers = Number(videoDataMatch[4]);
      stats.likes = Number(videoDataMatch[5]);
    }

    res.status(200).json({
      user: username,
      ...stats, // Подписчики и лайки
      ...videoInfo, // Информация о видео
      avatar: avatarMatch ? avatarMatch[1].replace(/\\u002F/g, "/") : "",
      updated: Date.now()
    });

  } catch (e) {
    res.status(500).json({ error: "Ошибка получения данных о видео", details: e.message });
  }
}
