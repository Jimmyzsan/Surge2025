/** 有道每日一句 - 独立 Surge Panel */
const date = localDate();
const api = `https://dict.youdao.com/infoline?mode=publish&date=${date}&update=auto&apiversion=5.0`;

$httpClient.get({ url: api, timeout: 15 }, (error, response, body) => {
  if (error || !response || response.status !== 200) {
    $done({ title: "有道每日一句", content: `获取失败\n${error || `HTTP ${response ? response.status : "unknown"}`}`, icon: "exclamationmark.triangle.fill", "icon-color": "#F59E0B" });
    return;
  }
  try {
    const data = JSON.parse(body);
    const list = data[date] || data[Object.keys(data)[0]] || [];
    const item = list.find(x => x.media === "DAILY" || x.shape === "DAILY") || list[0];
    if (!item) throw new Error("今日内容为空");
    const english = clean(item.title) || "Have a beautiful day.";
    const chinese = clean(item.summary) || "愿你拥有美好的一天。";
    const source = clean(item.source);
    const image = secure((item.gif && item.gif[0]) || (item.image && item.image[0]) || "");
    $done({
      title: "有道每日一句",
      content: `${english}\n\n${chinese}${source ? `\n\n—— ${source}` : ""}${image ? "\n\n🖼 点击查看今日配图" : ""}`,
      icon: "photo.on.rectangle.angled",
      "icon-color": "#E11D48",
      url: image || "https://dict.youdao.com/"
    });
  } catch (e) {
    $done({ title: "有道每日一句", content: `解析失败\n${e.message}`, icon: "exclamationmark.triangle.fill", "icon-color": "#F59E0B" });
  }
});

function localDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function secure(url) { return clean(url).replace(/^http:/i, "https:"); }
function clean(value) { return typeof value === "string" ? value.trim() : ""; }
