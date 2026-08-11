/** 诗词、一言与每日双语 - Surge 定时通知 / Panel */
const SOURCES = [
  { key: "poem", url: "https://v1.jinrishici.com/all.json", format: formatPoem },
  { key: "hitokoto", url: "https://v1.hitokoto.cn/", format: formatHitokoto },
  { key: "english", url: "https://open.iciba.com/dsapi/", format: formatEnglish }
];
const results = {};
let completed = 0;

SOURCES.forEach(({ key, url, format }) => {
  requestJSON(url, (error, data) => {
    results[key] = error ? { error: String(error) } : format(data);
    completed += 1;
    if (completed === SOURCES.length) finish();
  });
});

function requestJSON(url, callback) {
  $httpClient.get({ url, timeout: 10 }, (error, response, body) => {
    if (error || !response || response.status !== 200) {
      callback(error || `HTTP ${response ? response.status : "unknown"}`);
      return;
    }
    try { callback(null, JSON.parse(body)); }
    catch (e) { callback(`解析失败：${e.message}`); }
  });
}

function finish() {
  const poem = display(results.poem);
  const hitokoto = display(results.hitokoto);
  const english = display(results.english);

  if (typeof $input !== "undefined") {
    $done({
      title: "诗词 · 一言 · 双语",
      content: `【今日诗词】\n${poem}\n\n──────────\n\n【一言】\n${hitokoto}\n\n──────────\n\n【每日双语】\n${english}`,
      icon: "character.book.closed.fill",
      "icon-color": "#16A34A",
      url: "https://www.esdict.cn/"
    });
  } else {
    const poemLine = results.poem.error ? "今日诗词获取失败" : results.poem.text;
    const hitokotoLine = results.hitokoto.error ? "一言获取失败" : results.hitokoto.text;
    const englishLine = results.english.error ? "双语获取失败" : `${results.english.text}\n${results.english.source}`;
    $notification.post("诗词 · 一言 · 双语", poemLine, `${hitokotoLine}\n\n${englishLine}`, {
      url: results.hitokoto.url || "https://www.esdict.cn/"
    });
    $done();
  }
}

function display(item) {
  return item.error ? `获取失败：${item.error}` : `${item.text}\n${item.source}`;
}
function formatPoem(data) {
  const text = clean(data.content) || "愿你今日心有诗意。";
  const author = clean(data.author) || "佚名";
  const origin = clean(data.origin), category = clean(data.category);
  return { text, source: [category, author, origin ? `《${origin}》` : ""].filter(Boolean).join(" · ") };
}
function formatHitokoto(data) {
  const text = clean(data.hitokoto) || "愿你今日有所触动。";
  const author = clean(data.from_who), from = clean(data.from), uuid = clean(data.uuid);
  return {
    text,
    source: [author, from ? `《${from}》` : ""].filter(Boolean).join(" · ") || "一言",
    url: uuid ? `https://hitokoto.cn/?uuid=${uuid}` : "https://hitokoto.cn/"
  };
}
function formatEnglish(data) {
  return {
    text: clean(data.content) || "Keep learning, keep growing.",
    source: clean(data.note) || "持续学习，不断成长。"
  };
}
function clean(value) { return typeof value === "string" ? value.trim() : ""; }
