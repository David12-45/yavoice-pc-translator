export async function onRequestGet(context) {
  try {
    const reqUrl = new URL(context.request.url);
    const audioUrl = reqUrl.searchParams.get("url");
    const videoId = (reqUrl.searchParams.get("videoId") || "video").replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );
    const isDownload = reqUrl.searchParams.get("download") === "1";

    if (!audioUrl) {
      return new Response("Missing url parameter", { status: 400 });
    }

    const parsed = new URL(audioUrl);
    if (
      !parsed.hostname.endsWith(".yandex.net") &&
      !parsed.hostname.endsWith(".yandex.ru")
    ) {
      return new Response("Forbidden audio host", { status: 403 });
    }

    const reqHeaders = new Headers({
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 YaBrowser/25.4.0.0 Safari/537.36",
    });

    const range = context.request.headers.get("Range");
    if (range) {
      reqHeaders.set("Range", range);
    }

    const upstream = await fetch(audioUrl, { headers: reqHeaders });
    const respHeaders = new Headers(upstream.headers);
    respHeaders.set("Access-Control-Allow-Origin", "*");
    respHeaders.set("Accept-Ranges", "bytes");
    if (!respHeaders.get("Content-Type")) {
      respHeaders.set("Content-Type", "audio/mpeg");
    }

    if (isDownload) {
      respHeaders.set(
        "Content-Disposition",
        `attachment; filename="yandex-ru-${videoId}.mp3"`
      );
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: respHeaders,
    });
  } catch (err) {
    return new Response(`Audio stream error: ${err.message}`, { status: 500 });
  }
}
