import { onRequestPost as handleTranslatePost, onRequestOptions as handleTranslateOptions } from "./cf-translate-fn.js";
import { onRequestGet as handleAudioGet } from "../functions/api/audio.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return handleTranslateOptions();
    }

    // POST /api/translate
    if (url.pathname === "/api/translate" && request.method === "POST") {
      return handleTranslatePost({ request, env, ctx });
    }

    // GET /api/audio
    if (url.pathname === "/api/audio" && request.method === "GET") {
      return handleAudioGet({ request, env, ctx });
    }

    // Serve static assets from ./public
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  },
};
