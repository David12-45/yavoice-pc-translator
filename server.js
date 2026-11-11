const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let votClientPromise = null;

async function getVotModules() {
  if (!votClientPromise) {
    votClientPromise = (async () => {
      const VOT = await import("@vot.js/node");
      const { getVideoData } = await import("@vot.js/node/utils/videoData");
      const client = new VOT.default();
      return { client, getVideoData };
    })();
  }
  return votClientPromise;
}

/**
 * Normalize user input into a full URL and extract YouTube video ID if applicable.
 */
function normalizeVideoInput(rawInput) {
  let input = (rawInput || "").trim();
  if (!input) {
    throw new Error("Введите ссылку на видео YouTube");
  }

  // If user pasted text containing a URL (e.g., from YouTube Share sheet on mobile)
  const urlMatch = input.match(/https?:\/\/[^\s"'<>]+/i);
  if (urlMatch) {
    input = urlMatch[0];
  } else if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    // Bare 11-char YouTube video ID
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
    // Clean any extra characters if present
    youtubeId = youtubeId.substring(0, 11);
    return {
      normalizedUrl: `https://youtu.be/${youtubeId}`,
      watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      youtubeId,
    };
  }

  return {
    normalizedUrl: input,
    watchUrl: input,
    youtubeId: null,
  };
}

/**
 * Fetch YouTube metadata via oEmbed
 */
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
      authorUrl: data.author_url || "",
      thumbnail:
        data.thumbnail_url ||
        `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  } catch {
    return {
      title: `YouTube видео (${youtubeId})`,
      author: "YouTube",
      authorUrl: "",
      thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }
}

/**
 * Fetch and merge Yandex subtitle JSONs (translated + original)
 */
async function fetchSubtitleCues(subtitlesList, responseLang = "ru") {
  if (!Array.isArray(subtitlesList) || subtitlesList.length === 0) {
    return { availableTracks: [], cues: [] };
  }

  // Prefer track translated to responseLang (usually 'ru')
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

    // Map original cues by startMs or overlap for bilingual view
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
  } catch (err) {
    console.error("Failed to fetch subtitle cues:", err.message);
    return { availableTracks: [], cues: [] };
  }
}

/**
 * POST /api/translate
 * Body: { url, requestLang = 'en', responseLang = 'ru' }
 */
app.post("/api/translate", async (req, res) => {
  try {
    const { url, requestLang = "en", responseLang = "ru" } = req.body || {};
    const { normalizedUrl, watchUrl, youtubeId } = normalizeVideoInput(url);
    const { client, getVideoData } = await getVotModules();

    const videoData = await getVideoData(normalizedUrl);

    // Fetch translation, metadata, and subtitles in parallel
    const translatePromise = (async () => {
      try {
        return await client.translateVideo({
          videoData,
          requestLang,
          responseLang,
        });
      } catch (err) {
        // Fallback with shouldSendFailedAudio: false if fake-audio endpoint returns error
        if (
          err.message &&
          err.message.includes("fake video translation fail audio")
        ) {
          return await client.translateVideo({
            videoData,
            requestLang,
            responseLang,
            shouldSendFailedAudio: false,
          });
        }
        throw err;
      }
    })();

    const metaPromise = fetchYouTubeMeta(youtubeId || videoData.videoId);
    const subsPromise = client
      .getSubtitles({ videoData, requestLang })
      .catch(() => ({ waiting: false, subtitles: [] }));

    const [translationRes, meta, subsRes] = await Promise.all([
      translatePromise,
      metaPromise,
      subsPromise,
    ]);

    const subtitleData = await fetchSubtitleCues(
      subsRes?.subtitles || [],
      responseLang
    );

    const proxiedAudioUrl = translationRes.url
      ? `/api/audio?url=${encodeURIComponent(translationRes.url)}&videoId=${encodeURIComponent(
          youtubeId || videoData.videoId || "video"
        )}`
      : null;

    return res.json({
      success: true,
      video: {
        videoId: youtubeId || videoData.videoId,
        host: videoData.host,
        url: watchUrl,
        normalizedUrl,
        title: meta?.title || `Видео (${videoData.videoId})`,
        author: meta?.author || videoData.host,
        thumbnail:
          meta?.thumbnail ||
          (youtubeId
            ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
            : ""),
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
        audioUrl: proxiedAudioUrl,
        downloadUrl: proxiedAudioUrl ? `${proxiedAudioUrl}&download=1` : null,
      },
      subtitles: subtitleData,
    });
  } catch (err) {
    console.error("Translate error:", err);
    return res.status(400).json({
      success: false,
      error: err.message || "Не удалось получить перевод видео от Яндекса",
      details: err.data || null,
    });
  }
});

/**
 * GET /api/audio
 * Proxies the Yandex TTS MP3 audio stream with CORS and Range support
 * so mobile browsers can seek freely and Web Audio API AnalyserNode works.
 */
app.get("/api/audio", async (req, res) => {
  try {
    const audioUrl = req.query.url;
    const videoId = (req.query.videoId || "video").replace(/[^a-zA-Z0-9_-]/g, "");
    const isDownload = req.query.download === "1";

    if (!audioUrl) {
      return res.status(400).send("Missing audio url parameter");
    }

    const parsed = new URL(audioUrl);
    if (!parsed.hostname.endsWith(".yandex.net") && !parsed.hostname.endsWith(".yandex.ru")) {
      return res.status(403).send("Forbidden audio host");
    }

    const reqHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 YaBrowser/25.4.0.0 Safari/537.36",
    };

    if (req.headers.range) {
      reqHeaders.Range = req.headers.range;
    }

    const upstream = await fetch(audioUrl, { headers: reqHeaders });

    res.status(upstream.status);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "audio/mpeg"
    );
    res.setHeader("Accept-Ranges", "bytes");

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    const contentRange = upstream.headers.get("content-range");
    if (contentRange) {
      res.setHeader("Content-Range", contentRange);
    }

    if (isDownload) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="yandex-ru-${videoId}.mp3"`
      );
    }

    if (!upstream.body) {
      return res.end();
    }

    const reader = upstream.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!res.writableEnded) {
          res.write(Buffer.from(value));
        }
      }
      if (!res.writableEnded) {
        res.end();
      }
    };

    req.on("close", () => {
      try {
        reader.cancel();
      } catch {}
    });

    await pump();
  } catch (err) {
    console.error("Audio proxy error:", err.message);
    if (!res.headersSent) {
      res.status(500).send("Audio stream error");
    }
  }
});

/**
 * GET /api/demos
 * Pre-verified YouTube videos with instant cached Yandex neural Russian voice-over & subtitles
 */
app.get("/api/demos", (_req, res) => {
  res.json({
    demos: [
      {
        videoId: "jNQXAC9IVRw",
        url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        title: "Me at the zoo (Первое видео на YouTube)",
        author: "jawed",
        duration: "0:19",
        thumbnail: "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
        badge: "Мгновенный перевод • 19 сек",
      },
      {
        videoId: "8jPQjjsBbIc",
        url: "https://www.youtube.com/watch?v=8jPQjjsBbIc",
        title: "How to speak so that people want to listen",
        author: "Julian Treasure • TED",
        duration: "9:58",
        thumbnail: "https://i.ytimg.com/vi/8jPQjjsBbIc/hqdefault.jpg",
        badge: "TED • Многоголосый RU",
      },
      {
        videoId: "arj7oStGLkU",
        url: "https://www.youtube.com/watch?v=arj7oStGLkU",
        title: "Inside the Mind of a Master Procrastinator",
        author: "Tim Urban • TED",
        duration: "14:04",
        thumbnail: "https://i.ytimg.com/vi/arj7oStGLkU/hqdefault.jpg",
        badge: "TED • Полный дубляж",
      },
      {
        videoId: "qp0HIF3SfI4",
        url: "https://www.youtube.com/watch?v=qp0HIF3SfI4",
        title: "How Great Leaders Inspire Action",
        author: "Simon Sinek • TED",
        duration: "18:04",
        thumbnail: "https://i.ytimg.com/vi/qp0HIF3SfI4/hqdefault.jpg",
        badge: "TED • Русская озвучка",
      },
    ],
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Yandex Video Translator (PC Mode) running at http://localhost:${PORT}`);
});
