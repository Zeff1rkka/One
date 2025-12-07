export default async function handler(req, res) {
  const username = "dupecopy";

  try {
    const response = await fetch(`https://tokcount.com/?user=${username}`);
    const html = await response.text();

    const followersMatch = html.match(/"followerCount":(\d+)/);
    const likesMatch = html.match(/"heartCount":(\d+)/);
    const avatarMatch = html.match(/"avatarLarger":"(.*?)"/);

    res.status(200).json({
      user: username,
      followers: followersMatch ? Number(followersMatch[1]) : 0,
      likes: likesMatch ? Number(likesMatch[1]) : 0,
      avatar: avatarMatch ? avatarMatch[1].replace(/\\u002F/g, "/") : "",
      updated: Date.now()
    });
  } catch (e) {
    res.status(500).json({ error: "Parsing failed", details: e.message });
  }
}
