async function updateStats() {
  try {
    const res = await fetch("/api/tiktok");
    const data = await res.json();

    document.getElementById("followers").innerText = data.followers.toLocaleString();
    document.getElementById("likes").innerText = data.likes.toLocaleString();

    if (data.avatar) {
      document.getElementById("avatar").src = data.avatar;
    }
  } catch (err) {
    console.log("Ошибка обновления:", err);
  }
}

updateStats();
setInterval(updateStats, 2000);
