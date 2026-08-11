/** 西语一句 + 中英一句 - Surge Panel / 每日通知 */
const SPANISH_URL = "https://www.esdict.cn/";
const ENGLISH_API = "https://open.iciba.com/dsapi/";
let spanishResult, englishResult, completed = 0;

$httpClient.get({ url: SPANISH_URL, timeout: 10 }, (error, response, body) => {
  if (error || !response || response.status !== 200) {
    spanishResult = { error: error || `HTTP ${response ? response.status : "unknown"}` };
  } else {
    const match = body.match(/class=["']voiceText["'][^>]*>\s*每日一句[：:]\s*([\s\S]*?)<\/a>/i);
    spanishResult = match ? { text: decodeHTML(stripTags(match[1])).trim() } : { error: "未找到今日西语" };
  }
  completeOne();
});

$httpClient.get({ url: ENGLISH_API, timeout: 10 }, (error, response, body) => {
  if (error || !response || response.status !== 200) {
    englishResult = { error: error || `HTTP ${response ? response.status : "unknown"}` };
  } else {
    try {
      const data = JSON.parse(body);
      englishResult = {
        english: clean(data.content) || "Keep learning, keep growing.",
        chinese: clean(data.note) || "持续学习，不断成长。"
      };
    } catch (e) {
      englishResult = { error: `解析失败：${e.message}` };
    }
  }
  completeOne();
});

function completeOne() {
  completed += 1;
  if (completed < 2) return;
  const spanish = spanishResult.error ? `获取失败：${spanishResult.error}` : spanishResult.text;
  const bilingual = englishResult.error ? `获取失败：${englishResult.error}` : `${englishResult.english}\n${englishResult.chinese}`;

  if (typeof $input !== "undefined") {
    $done({
      title: "每日语言",
      content: `【西语一句】\n${spanish}\n\n──────────\n\n【中英一句】\n${bilingual}`,
      icon: "character.bubble.fill",
      "icon-color": "#2563EB",
      url: SPANISH_URL
    });
  } else {
    $notification.post("每日语言", `🇪🇸 ${spanish}`, `🇬🇧 ${bilingual}`, { url: SPANISH_URL });
    $done();
  }
}

function stripTags(value) { return String(value).replace(/<[^>]+>/g, " "); }
function decodeHTML(value) {
  return String(value)
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}
function clean(value) { return typeof value === "string" ? value.trim() : ""; }
