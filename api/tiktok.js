export default async function handler(req, res) {
  const username = "dupecopy"; // Убедитесь, что здесь ВАШ никнейм

  try {
    const response = await fetch(`https://tokcount.com/?user=${username}`);
    const html = await response.text();

    // Более надежные регулярные выражения
    const followersMatch = html.match(/"followerCount"\s*:\s*(\d+)/);
    const likesMatch = html.match(/"heartCount"\s*:\s*(\d+)/);
    // Для аватара: ищет первое попавшееся большое изображение, чтобы избежать ошибки
    const avatarMatch = html.match(/"avatarLarger":"(.*?)"/);

    res.status(200).json({
      user: username,
      // Используем followersMatch[1] только если он существует, иначе 0
      followers: followersMatch ? Number(followersMatch[1]) : 0,
      likes: likesMatch ? Number(likesMatch[1]) : 0,
      // Заменяем кодировку URL на обычные слеши
      avatar: avatarMatch ? avatarMatch[1].replace(/\\u002F/g, "/") : "",
      updated: Date.now()
    });
  } catch (e) {
    // В случае ошибки парсинга или таймаута вернет 500
    res.status(500).json({ error: "Parsing failed", details: e.message });
  }
}
