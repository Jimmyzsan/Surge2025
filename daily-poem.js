/** 诗词与一言 - Surge 定时通知 / Panel */
const POEM_API = "https://v1.jinrishici.com/all.json";
const HITOKOTO_API = "https://v1.hitokoto.cn/";
let poemResult, hitokotoResult, completed = 0;

requestJSON(POEM_API, (error, data) => { poemResult = error ? { error } : formatPoem(data); completeOne(); });
requestJSON(HITOKOTO_API, (error, data) => { hitokotoResult = error ? { error } : formatHitokoto(data); completeOne(); });

function requestJSON(url, callback) {
  $httpClient.get({ url, timeout: 10 }, (error, response, body) => {
    if (error || !response || response.status !== 200) {
      callback(error || `HTTP ${response ? response.status : "unknown"}`); return;
    }
    try { callback(null, JSON.parse(body)); } catch (e) { callback(`解析失败：${e.message}`); }
  });
}

function completeOne() {
  completed += 1;
  if (completed < 2) return;
  const poemText = poemResult.error ? `获取失败：${poemResult.error}` : `${poemResult.text}\n${poemResult.source}`;
  const hitokotoText = hitokotoResult.error ? `获取失败：${hitokotoResult.error}` : `${hitokotoResult.text}\n${hitokotoResult.source}`;
  if (typeof $input !== "undefined") {
    $done({ title: "诗词 · 一言", content: `【今日诗词】\n${poemText}\n\n──────────\n\n【一言】\n${hitokotoText}`, icon: "text.quote", "icon-color": "#16A34A" });
  } else {
    $notification.post("诗词 · 一言", poemResult.error ? "今日诗词获取失败" : poemResult.text, hitokotoResult.error ? "一言获取失败" : hitokotoResult.text, { url: hitokotoResult.url || "https://hitokoto.cn/" });
    $done();
  }
}

function formatPoem(data) {
  const text = clean(data.content) || "愿你今日心有诗意。";
  const author = clean(data.author) || "佚名", origin = clean(data.origin), category = clean(data.category);
  return { text, source: [category, author, origin ? `《${origin}》` : ""].filter(Boolean).join(" · ") };
}
function formatHitokoto(data) {
  const text = clean(data.hitokoto) || "愿你今日有所触动。";
  const author = clean(data.from_who), from = clean(data.from), uuid = clean(data.uuid);
  return { text, source: [author, from ? `《${from}》` : ""].filter(Boolean).join(" · ") || "一言", url: uuid ? `https://hitokoto.cn/?uuid=${uuid}` : "https://hitokoto.cn/" };
}
function clean(value) { return typeof value === "string" ? value.trim() : ""; }
