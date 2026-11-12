import VOTClient from "@vot.js/core/client";
import { YandexProvider } from "@vot.js/core/providers/yandex";
import { VOTNextWorkerProvider } from "@vot.js/core/providers/votworker";

function normalizeVideoInput(rawInput) {
  let input = (rawInput || "").trim();
  if (!input) {
    throw new Error("Введите ссылку на видео YouTube");
  }

  const urlMatch = input.match(/https?:\/\/[^\s"'<>]+/i);
  if (urlMatch) {
    input = urlMatch[0];
  } else if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    input = `https://www.youtube.com/watch?v=${input}`;
  } else if (!/^https?:\/\//i.test(input)) {
    input = `https://${input}`;
  }

  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error("Некорректный формат ссылки на видео");
  }

  let youtubeId = null;
  const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtu.be") {
    youtubeId = parsed.pathname.split("/").filter(Boolean)[0] || null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (parsed.pathname === "/watch") {
      youtubeId = parsed.searchParams.get("v");
    } else if (
      parsed.pathname.startsWith("/shorts/") ||
      parsed.pathname.startsWith("/embed/") ||
      parsed.pathname.startsWith("/live/") ||
      parsed.pathname.startsWith("/v/")
    ) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      youtubeId = parts[1] || null;
    }
  }

  if (youtubeId) {
    youtubeId = youtubeId.substring(0, 11);
    return {
      normalizedUrl: `https://youtu.be/${youtubeId}`,
      watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      youtubeId,
    };
  }

  throw new Error("Пожалуйста, укажите корректную ссылку на видео YouTube");
}

async function fetchYouTubeMeta(youtubeId) {
  if (!youtubeId) return null;
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(
      youtubeId
    )}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || `YouTube видео (${youtubeId})`,
      author: data.author_name || "YouTube",
      thumbnail:
        data.thumbnail_url ||
        `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  } catch {
    return {
      title: `YouTube видео (${youtubeId})`,
      author: "YouTube",
      thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }
}

async function fetchSubtitleCues(subtitlesList, responseLang = "ru") {
  if (!Array.isArray(subtitlesList) || subtitlesList.length === 0) {
    return { availableTracks: [], cues: [] };
  }

  const targetTrack =
    subtitlesList.find((s) => s.translatedLanguage === responseLang) ||
    subtitlesList.find((s) => s.language === responseLang) ||
    subtitlesList[0];

  if (!targetTrack) {
    return { availableTracks: subtitlesList, cues: [] };
  }

  try {
    const [transRes, origRes] = await Promise.all([
      targetTrack.translatedUrl
        ? fetch(targetTrack.translatedUrl).then((r) => (r.ok ? r.json() : null))
        : Promise.resolve(null),
      targetTrack.url
        ? fetch(targetTrack.url).then((r) => (r.ok ? r.json() : null))
        : Promise.resolve(null),
    ]);

    const transSubs = transRes?.subtitles || [];
    const origSubs = origRes?.subtitles || [];

    const cues = transSubs.map((item, idx) => {
      const origMatch =
        origSubs[idx] &&
        Math.abs((origSubs[idx].startMs || 0) - (item.startMs || 0)) < 2500
          ? origSubs[idx]
          : origSubs.find(
              (o) => Math.abs((o.startMs || 0) - (item.startMs || 0)) < 1500
            );

      return {
        text: item.text || "",
        origText: origMatch ? origMatch.text || "" : "",
        startMs: item.startMs || 0,
        durationMs: item.durationMs || 2000,
        endMs: (item.startMs || 0) + (item.durationMs || 2000),
        speakerId: item.speakerId || "0",
      };
    });

    return {
      availableTracks: subtitlesList.map((s) => ({
        language: s.language,
        translatedLanguage: s.translatedLanguage,
      })),
      sourceLang: targetTrack.language,
      targetLang: targetTrack.translatedLanguage,
      cues,
    };
  } catch {
    return { availableTracks: [], cues: [] };
  }
}

async function fetchYouTubeInfo(youtubeId) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${youtubeId}&hl=en`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return { duration: null };
    const html = await res.text();
    const m =
      html.match(/"lengthSeconds":"(\d+)"/) ||
      html.match(/"approxDurationMs":"(\d+)"/);
    let duration = null;
    if (m) {
      const n = Number(m[1]);
      duration = m[0].includes("approx") ? Math.round(n / 1000) : n;
    }
    return { duration };
  } catch {
    return { duration: null };
  }
}

function humanizeError(err) {
  const msg = (err && err.message) || "";
  if (/create session/i.test(msg)) {
    return "Яндекс временно не ответил (сессия). Нажмите «Перевести» ещё раз через пару секунд.";
  }
  if (/too long|длин/i.test(msg)) {
    return "Видео слишком длинное — Яндекс переводит видео до ~4 часов.";
  }
  if (/live|стрим|трансляц/i.test(msg)) {
    return "Прямые трансляции Яндекс не переводит.";
  }
  if (/couldn't translate|не смог перевести/i.test(msg)) {
    return "Это видео ещё не загружено в облачную базу Яндекса (YouTube ограничил скачивание аудиодорожки напрямую с сервера). Что сделать: откройте эту ссылку на 1 минуту в приложении Яндекс Браузера и нажмите «Перевести видео» — браузер загрузит аудио в облако Яндекса, после чего видео сразу заработает здесь с 0% звука оригинала!";
  }
  return msg
    ? `Яндекс не смог перевести видео: ${msg}`
    : "Не удалось получить перевод видео от Яндекса";
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function onRequestPost(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  };

  let firstErr = null;
  try {
    const body = await context.request.json();
    const {
      url,
      requestLang = "en",
      responseLang = "ru",
      isPolling = false,
    } = body || {};
    const { normalizedUrl, watchUrl, youtubeId } = normalizeVideoInput(url);

    const [ytInfo, meta] = await Promise.all([
      fetchYouTubeInfo(youtubeId),
      fetchYouTubeMeta(youtubeId),
    ]);
    const videoData = {
      url: normalizedUrl,
      videoId: youtubeId,
      host: "youtube",
      duration: ytInfo.duration || 343,
    };

    // Try direct YandexProvider first; fallback to VOTNextWorkerProvider if edge location is geo-restricted
    let client = new VOTClient({ provider: YandexProvider });

    const translateWithClient = async (
      vot,
      curLang = requestLang,
      bypassCache = false
    ) => {
      const extraOpts = {
        firstRequest: !isPolling,
        bypassCache,
      };
      try {
        return await vot.translateVideo({
          videoData,
          requestLang: curLang,
          responseLang,
          translationHelp: null,
          shouldSendFailedAudio: !isPolling,
          extraOpts,
        });
      } catch (err) {
        if (
          err.message &&
          err.message.includes("fake video translation fail audio")
        ) {
          return await vot.translateVideo({
            videoData,
            requestLang: curLang,
            responseLang,
            translationHelp: null,
            shouldSendFailedAudio: false,
            extraOpts,
          });
        }
        throw err;
      }
    };

    let translationRes;
    for (let attempt = 0; attempt < 3 && !translationRes; attempt++) {
      try {
        if (attempt > 0) client = new VOTClient({ provider: YandexProvider });
        const useBypass =
          attempt === 1 &&
          firstErr?.message &&
          /couldn't translate/i.test(firstErr.message);
        translationRes = await translateWithClient(
          client,
          requestLang,
          useBypass
        );
      } catch (e) {
        firstErr = firstErr || e;
        await new Promise((r) => setTimeout(r, 700));
      }
    }
    // Auto-detect language if Yandex returned a different detected language
    if (
      !translationRes &&
      firstErr?.data?.language &&
      firstErr.data.language !== requestLang
    ) {
      try {
        client = new VOTClient({ provider: YandexProvider });
        translationRes = await translateWithClient(
          client,
          firstErr.data.language
        );
      } catch {}
    }
    if (!translationRes) {
      try {
        client = new VOTClient({ provider: VOTNextWorkerProvider });
        translationRes = await translateWithClient(client);
      } catch {
        throw new Error(humanizeError(firstErr));
      }
    }

    const subsRes = await client
      .getSubtitles({ videoData, requestLang })
      .catch(() => ({ waiting: false, subtitles: [] }));

    const subtitleData = await fetchSubtitleCues(
      subsRes?.subtitles || [],
      responseLang
    );

    const proxiedAudioUrl = translationRes.url
      ? `/api/audio?url=${encodeURIComponent(
          translationRes.url
        )}&videoId=${encodeURIComponent(youtubeId)}`
      : null;

    return new Response(
      JSON.stringify({
        success: true,
        video: {
          videoId: youtubeId,
          host: "youtube",
          url: watchUrl,
          normalizedUrl,
          title: meta?.title || `YouTube (${youtubeId})`,
          author: meta?.author || "YouTube",
          thumbnail:
            meta?.thumbnail ||
            `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
        },
        translation: {
          translated: Boolean(translationRes.translated),
          status: translationRes.status,
          remainingTime:
            typeof translationRes.remainingTime === "number"
              ? translationRes.remainingTime
              : -1,
          translationId: translationRes.translationId || null,
          rawAudioUrl: translationRes.url || null,
          audioUrl: translationRes.url || proxiedAudioUrl,
          downloadUrl: proxiedAudioUrl ? `${proxiedAudioUrl}&download=1` : null,
        },
        subtitles: subtitleData,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "Не удалось получить перевод видео от Яндекса",
        debug: {
          firstErrMsg: firstErr?.message,
          firstErrData: firstErr?.data,
          errData: err?.data,
        },
      }),
      { status: 400, headers: corsHeaders }
    );
  }
}
