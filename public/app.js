(() => {
  // DOM Elements
  const translateForm = document.getElementById("translate-form");
  const urlInput = document.getElementById("video-url-input");
  const pasteBtn = document.getElementById("paste-clipboard-btn");
  const submitBtn = document.getElementById("submit-translate-btn");
  const sourceLangSelect = document.getElementById("source-lang-select");
  const targetLangSelect = document.getElementById("target-lang-select");
  const demoChips = document.querySelectorAll(".demo-chip");

  const statusBanner = document.getElementById("status-banner");
  const statusSpinner = document.getElementById("status-spinner");
  const statusMessage = document.getElementById("status-message");
  const statusTimer = document.getElementById("status-timer");

  const syncOverlay = document.getElementById("sync-start-overlay");
  const overlayStartBtn = document.getElementById("overlay-start-btn");
  const overlayVideoTitle = document.getElementById("overlay-video-title");

  const liveSubBar = document.getElementById("live-subtitle-bar");
  const liveSubRu = document.getElementById("live-sub-ru");
  const liveSubOrig = document.getElementById("live-sub-orig");

  const currentTimeReadout = document.getElementById("current-time-readout");
  const durationTimeReadout = document.getElementById("duration-time-readout");
  const seekSlider = document.getElementById("timeline-seek-slider");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const seekBackBtn = document.getElementById("seek-back-btn");
  const seekFwdBtn = document.getElementById("seek-fwd-btn");
  const resyncNowBtn = document.getElementById("resync-now-btn");
  const playbackRateSelect = document.getElementById("playback-rate-select");

  const activeModeLabel = document.getElementById("active-mode-label");
  const modeButtons = document.querySelectorAll(".mode-card-btn");
  const transVolSlider = document.getElementById("trans-vol-slider");
  const origVolSlider = document.getElementById("orig-vol-slider");
  const transVolBadge = document.getElementById("trans-vol-badge");
  const origVolBadge = document.getElementById("orig-vol-badge");
  const volPills = document.querySelectorAll(".vol-pill[data-target]");

  const voiceMeterBars = document.querySelectorAll("#voice-meter-bars .meter-bar");
  const voiceActivityText = document.getElementById("voice-activity-text");

  const offsetMinusBtn = document.getElementById("offset-minus-btn");
  const offsetPlusBtn = document.getElementById("offset-plus-btn");
  const offsetResetBtn = document.getElementById("offset-reset-btn");
  const offsetReadout = document.getElementById("offset-readout");

  const downloadMp3Btn = document.getElementById("download-mp3-btn");
  const downloadSrtBtn = document.getElementById("download-srt-btn");

  const transcriptList = document.getElementById("transcript-list");
  const subTabBtns = document.querySelectorAll(".sub-tab-btn");
  const copyBookmarkletBtn = document.getElementById("copy-bookmarklet-btn");
  const bookmarkletCode = document.getElementById("bookmarklet-code");

  const voiceAudio = document.getElementById("yandex-voice-audio");

  // Application State
  let ytPlayer = null;
  let ytReady = false;
  let pendingVideoId = "8jPQjjsBbIc";
  let currentVideoId = null;
  let isTranslationReady = false;
  let pollIntervalId = null;
  let countdownIntervalId = null;
  let remainingSeconds = 0;

  // Audio Mixer State
  // Modes: 'pc_mute' (0% original, 100% Russian), 'smart_duck' (auto-ducking), 'manual'
  let audioMode = "pc_mute";
  let transVolumePct = 100; // 0..150%
  let origVolumePct = 0;    // 0..100%
  let syncOffsetSec = 0.0;  // Audio offset relative to video in seconds
  let isSeekingSlider = false;

  // Web Audio API nodes for Gain Boost & Smart Ducking RMS detection
  let audioCtx = null;
  let gainNode = null;
  let analyserNode = null;
  let freqDataArray = null;
  let audioGraphConnected = false;
  let lastSpeechDetectedTime = 0;

  // Subtitles State
  let subtitleCues = [];
  let subtitleMode = "both"; // 'both' | 'ru' | 'off'
  let activeCueIndex = -1;

  // Format seconds as M:SS
  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const total = Math.floor(sec);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  // Banner Helpers
  function showBanner(type, message, showSpin = false, timerText = "") {
    statusBanner.className = `status-banner visible ${type}`;
    statusSpinner.style.display = showSpin ? "block" : "none";
    statusMessage.textContent = message;
    statusTimer.textContent = timerText;
  }

  function clearPolling() {
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
      countdownIntervalId = null;
    }
  }

  // Initialize Web Audio API Graph (unlocked on user gesture when using same-origin /api/audio proxy)
  function ensureAudioGraph() {
    try {
      const isSameOriginProxy =
        voiceAudio.src &&
        (voiceAudio.src.startsWith(window.location.origin) ||
          voiceAudio.src.includes("/api/audio"));
      if (!isSameOriginProxy) {
        return;
      }
      voiceAudio.crossOrigin = "anonymous";
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      if (!audioGraphConnected && audioCtx) {
        const source = audioCtx.createMediaElementSource(voiceAudio);
        gainNode = audioCtx.createGain();
        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.75;
        freqDataArray = new Uint8Array(analyserNode.frequencyBinCount);

        source.connect(gainNode);
        gainNode.connect(analyserNode);
        analyserNode.connect(audioCtx.destination);
        audioGraphConnected = true;
        applyTranslationVolume();
      }
    } catch (err) {
      console.warn("Web Audio API fallback to standard element volume:", err.message);
    }
  }

  function applyTranslationVolume() {
    const normalized = Math.max(0, Math.min(1.5, transVolumePct / 100));
    if (audioGraphConnected && gainNode && audioCtx) {
      voiceAudio.volume = 1.0;
      gainNode.gain.setTargetAtTime(normalized, audioCtx.currentTime, 0.03);
    } else {
      voiceAudio.volume = Math.min(1.0, normalized);
    }
    transVolBadge.textContent = `${transVolumePct}%`;
  }

  function applyOriginalVolume(targetVolPct) {
    const clamped = Math.max(0, Math.min(100, Math.round(targetVolPct)));
    if (ytPlayer && ytReady && typeof ytPlayer.setVolume === "function") {
      if (clamped === 0) {
        ytPlayer.mute();
        ytPlayer.setVolume(0);
      } else {
        if (typeof ytPlayer.isMuted === "function" && ytPlayer.isMuted()) {
          ytPlayer.unMute();
        }
        ytPlayer.setVolume(clamped);
      }
    }

    if (clamped === 0) {
      origVolBadge.textContent = "0% (Заглушена)";
      origVolBadge.classList.add("muted-badge");
    } else {
      origVolBadge.textContent = `${clamped}%`;
      origVolBadge.classList.remove("muted-badge");
    }
  }

  // Switch between 'pc_mute', 'smart_duck', and 'manual'
  function setAudioMode(mode, customOrigVol = null) {
    audioMode = mode;
    modeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    if (mode === "pc_mute") {
      origVolumePct = 0;
      origVolSlider.value = "0";
      applyOriginalVolume(0);
      activeModeLabel.textContent = "ПК Режим: Оригинал 0% (Выкл)";
    } else if (mode === "smart_duck") {
      origVolumePct = 0;
      origVolSlider.value = "0";
      applyOriginalVolume(0);
      activeModeLabel.textContent = "ПК Режим: Умное приглушение";
    } else if (mode === "manual") {
      if (customOrigVol !== null) {
        origVolumePct = customOrigVol;
      } else if (origVolumePct === 0) {
        origVolumePct = 15;
      }
      origVolSlider.value = String(origVolumePct);
      applyOriginalVolume(origVolumePct);
      activeModeLabel.textContent = `Ручной баланс: Оригинал ${origVolumePct}%`;
    }

    updateQuickPillsUI();
  }

  function updateQuickPillsUI() {
    volPills.forEach((pill) => {
      const target = pill.dataset.target;
      const val = Number(pill.dataset.val);
      if (target === "trans") {
        pill.classList.toggle("active", val === transVolumePct);
      } else if (target === "orig") {
        pill.classList.toggle("active", val === origVolumePct && audioMode !== "smart_duck");
      }
    });
  }

  // YouTube IFrame API Setup
  window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player("youtube-player", {
      videoId: pendingVideoId,
      playerVars: {
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        controls: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          ytReady = true;
          applyOriginalVolume(origVolumePct);
          // Automatically request translation for initial demo video
          requestVideoTranslation(`https://www.youtube.com/watch?v=${pendingVideoId}`);
        },
        onStateChange: onPlayerStateChange,
      },
    });
  };

  // Fallback if YT script was already loaded before app.js
  if (window.YT && window.YT.Player && !ytPlayer) {
    window.onYouTubeIframeAPIReady();
  }

  function onPlayerStateChange(event) {
    if (!isTranslationReady) return;

    const state = event.data;
    if (state === YT.PlayerState.PLAYING) {
      syncOverlay.classList.add("hidden");
      ensureAudioGraph();
      // Force mute / volume policy immediately when YouTube starts playing
      if (audioMode === "pc_mute") {
        applyOriginalVolume(0);
      } else if (audioMode === "manual") {
        applyOriginalVolume(origVolumePct);
      }
      syncAudioToVideo(true);
      voiceAudio.play().catch((err) => {
        console.warn("Audio autoplay needed user gesture:", err.message);
      });
      playPauseBtn.textContent = "⏸ Пауза";
    } else if (
      state === YT.PlayerState.PAUSED ||
      state === YT.PlayerState.ENDED ||
      state === YT.PlayerState.BUFFERING
    ) {
      voiceAudio.pause();
      if (state !== YT.PlayerState.BUFFERING) {
        playPauseBtn.textContent = "▶ Старт";
      }
    }
  }

  function syncAudioToVideo(forceSeek = false) {
    if (!ytPlayer || !ytReady || !isTranslationReady) return;
    const ytTime = ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0;
    const targetAudioTime = Math.max(0, ytTime + syncOffsetSec);
    const drift = Math.abs(voiceAudio.currentTime - targetAudioTime);

    if (forceSeek || drift > 0.32) {
      try {
        voiceAudio.currentTime = targetAudioTime;
      } catch {}
    }

    const ytRate = ytPlayer.getPlaybackRate ? ytPlayer.getPlaybackRate() : 1;
    if (voiceAudio.playbackRate !== ytRate) {
      voiceAudio.playbackRate = ytRate;
    }
  }

  // Real-time Loop: Sync, Voice Meter, Smart Ducking & Subtitles
  function startRealtimeLoop() {
    setInterval(() => {
      if (!ytPlayer || !ytReady) return;

      const ytState = ytPlayer.getPlayerState ? ytPlayer.getPlayerState() : -1;
      const isPlaying = ytState === 1;
      const curTime = ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0;
      const duration = ytPlayer.getDuration ? ytPlayer.getDuration() : 0;

      // Update Timeline UI
      currentTimeReadout.textContent = formatTime(curTime);
      durationTimeReadout.textContent = formatTime(duration);
      if (!isSeekingSlider && duration > 0) {
        seekSlider.max = String(duration);
        seekSlider.value = String(curTime);
      }

      if (isPlaying && isTranslationReady) {
        // Keep audio in sync with video
        syncAudioToVideo(false);
        if (voiceAudio.paused) {
          voiceAudio.play().catch(() => {});
        }
      }

      // Update Subtitles
      updateLiveSubtitles(curTime * 1000);

      // Voice Activity & Smart Ducking
      updateVoiceMeterAndDucking(isPlaying, curTime * 1000);
    }, 100);
  }

  function updateVoiceMeterAndDucking(isPlaying, curTimeMs) {
    if (!isPlaying || !isTranslationReady || voiceAudio.paused) {
      voiceMeterBars.forEach((b) => (b.style.height = "3px"));
      voiceActivityText.textContent = "Голос: Пауза";
      return;
    }

    let speechEnergy = 0;
    if (audioGraphConnected && analyserNode && freqDataArray) {
      analyserNode.getByteFrequencyData(freqDataArray);
      let sum = 0;
      // Focus on human speech frequencies (~150Hz - 3.5kHz)
      const bins = Math.min(48, freqDataArray.length);
      for (let i = 2; i < bins; i++) {
        sum += freqDataArray[i];
      }
      speechEnergy = sum / (bins - 2); // 0..255
    } else {
      // Fallback if Web Audio API graph isn't active: use subtitle cue presence
      const cueActive = subtitleCues.some(
        (c) => curTimeMs >= c.startMs && curTimeMs <= c.endMs
      );
      speechEnergy = cueActive ? 95 : 8;
    }

    const isSpeaking = speechEnergy > 18;
    if (isSpeaking) {
      lastSpeechDetectedTime = performance.now();
    }

    // Animate 5 LED bars
    const factors = [0.55, 0.85, 1.0, 0.75, 0.5];
    voiceMeterBars.forEach((bar, idx) => {
      const h = isSpeaking
        ? Math.max(3, Math.min(12, Math.round((speechEnergy / 140) * 12 * factors[idx])))
        : 3;
      bar.style.height = `${h}px`;
    });

    if (audioMode === "pc_mute") {
      // Strictly keep original YouTube audio at 0%
      if (ytPlayer.isMuted && !ytPlayer.isMuted()) {
        applyOriginalVolume(0);
      }
      voiceActivityText.textContent = isSpeaking
        ? "Диктор говорит (Ориг 0%)"
        : "Пауза (Ориг 0%)";
    } else if (audioMode === "smart_duck") {
      // Smart Ducking: 0% when Russian narrator speaks, smoothly rises to 45% in pauses > 400ms
      const timeSinceSpeech = performance.now() - lastSpeechDetectedTime;
      if (isSpeaking || timeSinceSpeech < 420) {
        applyOriginalVolume(0);
        voiceActivityText.textContent = "Речь RU → Ориг 0%";
      } else {
        applyOriginalVolume(45);
        voiceActivityText.textContent = "Пауза RU → Ориг 45%";
      }
    } else {
      voiceActivityText.textContent = isSpeaking
        ? `Речь RU (Ориг ${origVolumePct}%)`
        : `Пауза (Ориг ${origVolumePct}%)`;
    }
  }

  // Subtitle Rendering & Sync
  function renderTranscriptList() {
    if (!subtitleCues || subtitleCues.length === 0) {
      transcriptList.innerHTML = `<div class="empty-transcript">Субтитры для этого видео не найдены или ещё генерируются, но русская аудиодорожка перевода работает в полном режиме.</div>`;
      downloadSrtBtn.style.display = "none";
      return;
    }

    downloadSrtBtn.style.display = "inline-flex";
    transcriptList.innerHTML = subtitleCues
      .map(
        (cue, idx) => `
        <div class="cue-item" data-idx="${idx}" data-start="${cue.startMs}">
          <span class="cue-time">${formatTime(cue.startMs / 1000)}</span>
          <div class="cue-texts">
            <div class="cue-ru">${escapeHtml(cue.text)}</div>
            ${
              subtitleMode === "both" && cue.origText
                ? `<div class="cue-orig">${escapeHtml(cue.origText)}</div>`
                : ""
            }
          </div>
        </div>
      `
      )
      .join("");

    transcriptList.querySelectorAll(".cue-item").forEach((el) => {
      el.addEventListener("click", () => {
        const startSec = Number(el.dataset.start) / 1000;
        seekToSecond(startSec);
      });
    });
  }

  function updateLiveSubtitles(curTimeMs) {
    if (subtitleMode === "off") {
      liveSubBar.style.display = "none";
      return;
    }
    liveSubBar.style.display = "flex";

    if (!subtitleCues || subtitleCues.length === 0) {
      return;
    }

    const idx = subtitleCues.findIndex(
      (c) => curTimeMs >= c.startMs && curTimeMs <= c.endMs
    );

    if (idx !== activeCueIndex) {
      activeCueIndex = idx;
      const items = transcriptList.querySelectorAll(".cue-item");
      items.forEach((item, i) => {
        item.classList.toggle("active", i === idx);
      });

      if (idx >= 0 && items[idx]) {
        items[idx].scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    if (idx >= 0) {
      const cue = subtitleCues[idx];
      liveSubRu.textContent = cue.text;
      liveSubOrig.textContent =
        subtitleMode === "both" && cue.origText ? cue.origText : "";
      liveSubOrig.style.display =
        subtitleMode === "both" && cue.origText ? "block" : "none";
    } else if (isTranslationReady) {
      liveSubRu.textContent = "♪ ...";
      liveSubOrig.textContent = "";
    }
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function extractYoutubeIdClient(raw) {
    const str = (raw || "").trim();
    const m = str.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
    return null;
  }

  async function translateViaBrowserWorker(rawUrl, requestLang, responseLang) {
    if (!window.VOTBrowser) {
      throw new Error("Не удалось подключиться к API перевода");
    }
    const ytId = extractYoutubeIdClient(rawUrl);
    if (!ytId) {
      throw new Error("Укажите корректную ссылку на YouTube видео");
    }
    const normalizedUrl = `https://youtu.be/${ytId}`;
    const watchUrl = `https://www.youtube.com/watch?v=${ytId}`;
    const videoData = { url: normalizedUrl, videoId: ytId, host: "youtube", duration: 343 };

    const workerHosts = ["vot-worker.toil.cc", "vot-worker-s1.toil.cc", "vot-worker-s2.toil.cc"];
    let translationRes = null;
    let client = null;
    let lastErr = null;

    for (const host of workerHosts) {
      try {
        client = window.VOTBrowser.createClient(host);
        try {
          translationRes = await client.translateVideo({ videoData, requestLang, responseLang });
        } catch (err) {
          if (err.message && err.message.includes("fake video translation fail audio")) {
            translationRes = await client.translateVideo({
              videoData,
              requestLang,
              responseLang,
              shouldSendFailedAudio: false,
            });
          } else {
            throw err;
          }
        }
        if (translationRes) break;
      } catch (e) {
        lastErr = e;
      }
    }

    if (!translationRes) {
      throw lastErr || new Error("Сервер перевода временно недоступен");
    }

    let cues = [];
    try {
      const subsRes = await client.getSubtitles({ videoData, requestLang });
      const list = subsRes?.subtitles || [];
      const track = list.find((s) => s.translatedLanguage === responseLang) || list[0];
      if (track?.translatedUrl) {
        const subJson = await fetch(track.translatedUrl).then((r) => (r.ok ? r.json() : null));
        if (subJson?.subtitles) {
          cues = subJson.subtitles.map((item) => ({
            text: item.text || "",
            origText: "",
            startMs: item.startMs || 0,
            durationMs: item.durationMs || 2000,
            endMs: (item.startMs || 0) + (item.durationMs || 2000),
          }));
        }
      }
    } catch {}

    let title = `YouTube (${ytId})`;
    let author = "YouTube";
    try {
      const oem = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(watchUrl)}`).then((r) => r.json());
      if (oem?.title) title = oem.title;
      if (oem?.author_name) author = oem.author_name;
    } catch {}

    return {
      success: true,
      video: {
        videoId: ytId,
        host: "youtube",
        url: watchUrl,
        normalizedUrl,
        title,
        author,
        thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
      },
      translation: {
        translated: Boolean(translationRes.translated),
        status: translationRes.status,
        remainingTime: typeof translationRes.remainingTime === "number" ? translationRes.remainingTime : -1,
        audioUrl: translationRes.url || null,
        downloadUrl: translationRes.url || null,
      },
      subtitles: { cues },
    };
  }

  // Request Translation from Backend (Cloudflare Pages Function / Node) with Browser Worker Fallback
  async function requestVideoTranslation(rawUrl, isPolling = false) {
    if (!rawUrl) return;
    if (!isPolling) {
      clearPolling();
      isTranslationReady = false;
      voiceAudio.pause();
      submitBtn.disabled = true;
      showBanner(
        "loading",
        "Подключаемся к Яндекс Нейропереводу и отключаем оригинальную дорожку...",
        true
      );
    }

    try {
      let data = null;
      try {
        const res = await fetch("./api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: rawUrl,
            requestLang: sourceLangSelect.value,
            responseLang: targetLangSelect.value,
          }),
        });
        if (res.ok) {
          data = await res.json();
        } else if (res.status === 404 || res.status === 405) {
          data = await translateViaBrowserWorker(rawUrl, sourceLangSelect.value, targetLangSelect.value);
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Ошибка получения перевода");
        }
      } catch (fetchErr) {
        data = await translateViaBrowserWorker(rawUrl, sourceLangSelect.value, targetLangSelect.value);
      }

      submitBtn.disabled = false;

      if (!data || !data.success) {
        throw new Error(data?.error || "Ошибка получения перевода");
      }

      const { video, translation, subtitles } = data;
      urlInput.value = video.url;

      // Load YouTube Video if changed
      if (video.videoId && video.videoId !== currentVideoId) {
        currentVideoId = video.videoId;
        if (ytPlayer && ytReady && typeof ytPlayer.cueVideoById === "function") {
          ytPlayer.cueVideoById(video.videoId);
          applyOriginalVolume(audioMode === "manual" ? origVolumePct : 0);
        } else {
          pendingVideoId = video.videoId;
        }
      }

      overlayVideoTitle.textContent = `${video.title} (${video.author}) — Оригинал 0%, Русский перевод 100%`;

      // Load Subtitles
      subtitleCues = subtitles?.cues || [];
      activeCueIndex = -1;
      renderTranscriptList();

      if (translation.translated && translation.audioUrl) {
        clearPolling();
        isTranslationReady = true;
        voiceAudio.src = translation.audioUrl;
        voiceAudio.load();
        applyTranslationVolume();

        // Setup Download Links
        if (translation.downloadUrl) {
          downloadMp3Btn.href = translation.downloadUrl;
          downloadMp3Btn.style.display = "inline-flex";
        }

        syncOverlay.classList.remove("hidden");
        liveSubRu.textContent = `Перевод готов: «${video.title}»`;
        liveSubOrig.textContent =
          "Нажмите «Включить видео с русским переводом» для синхронного старта";

        showBanner(
          "ready",
          `Русская озвучка Яндекса загружена! Оригинальная дорожка: ${
            audioMode === "pc_mute"
              ? "0% (Полностью заглушена, как на ПК)"
              : audioMode === "smart_duck"
              ? "Умное приглушение"
              : origVolumePct + "%"
          }`,
          false,
          subtitleCues.length > 0 ? `Субтитров: ${subtitleCues.length}` : "Аудио готово"
        );
      } else {
        // Video is currently being translated by Yandex AI
        remainingSeconds =
          translation.remainingTime > 0 ? translation.remainingTime : 45;
        showBanner(
          "loading",
          "Яндекс генерирует нейроозвучку для этого видео. Она запустится автоматически...",
          true,
          `~${remainingSeconds} сек`
        );

        if (!pollIntervalId) {
          countdownIntervalId = setInterval(() => {
            if (remainingSeconds > 1) {
              remainingSeconds--;
              statusTimer.textContent = `~${remainingSeconds} сек`;
            }
          }, 1000);

          pollIntervalId = setInterval(() => {
            requestVideoTranslation(rawUrl, true);
          }, 6000);
        }
      }
    } catch (err) {
      submitBtn.disabled = false;
      clearPolling();
      showBanner("error", err.message || "Ошибка при запросе перевода", false);
    }
  }

  // Start Synchronized Playback (Unlocks Mobile Audio + Starts YT Player at 0% Original Volume)
  function startSynchronizedPlayback() {
    if (!ytPlayer || !ytReady) return;
    ensureAudioGraph();
    syncOverlay.classList.add("hidden");

    if (audioMode === "pc_mute" || audioMode === "smart_duck") {
      applyOriginalVolume(0);
    } else {
      applyOriginalVolume(origVolumePct);
    }

    applyTranslationVolume();
    ytPlayer.playVideo();

    if (isTranslationReady) {
      syncAudioToVideo(true);
      voiceAudio.play().catch(() => {});
    }
    playPauseBtn.textContent = "⏸ Пауза";
  }

  function togglePlayPause() {
    if (!ytPlayer || !ytReady) return;
    ensureAudioGraph();
    const state = ytPlayer.getPlayerState ? ytPlayer.getPlayerState() : -1;
    if (state === 1) {
      ytPlayer.pauseVideo();
      voiceAudio.pause();
      playPauseBtn.textContent = "▶ Старт";
    } else {
      startSynchronizedPlayback();
    }
  }

  function seekToSecond(targetSec) {
    if (!ytPlayer || !ytReady) return;
    const dur = ytPlayer.getDuration ? ytPlayer.getDuration() : 0;
    const clamped = Math.max(0, dur > 0 ? Math.min(dur, targetSec) : targetSec);
    ytPlayer.seekTo(clamped, true);
    if (isTranslationReady) {
      voiceAudio.currentTime = Math.max(0, clamped + syncOffsetSec);
    }
  }

  // Export Subtitles as .SRT
  function downloadSrtFile() {
    if (!subtitleCues || subtitleCues.length === 0) return;
    const toSrtTime = (ms) => {
      const totalSec = Math.floor(ms / 1000);
      const hrs = String(Math.floor(totalSec / 3600)).padStart(2, "0");
      const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
      const secs = String(totalSec % 60).padStart(2, "0");
      const millis = String(ms % 1000).padStart(3, "0");
      return `${hrs}:${mins}:${secs},${millis}`;
    };

    const srtContent = subtitleCues
      .map(
        (c, i) =>
          `${i + 1}\n${toSrtTime(c.startMs)} --> ${toSrtTime(c.endMs)}\n${c.text}\n`
      )
      .join("\n");

    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yandex-subtitles-${currentVideoId || "video"}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Event Listeners
  translateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = urlInput.value.trim();
    if (val) {
      demoChips.forEach((c) => c.classList.remove("active"));
      requestVideoTranslation(val);
    }
  });

  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        urlInput.value = text.trim();
        requestVideoTranslation(text.trim());
      }
    } catch {
      urlInput.focus();
    }
  });

  demoChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      demoChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const demoUrl = chip.dataset.url;
      urlInput.value = demoUrl;
      requestVideoTranslation(demoUrl);
    });
  });

  overlayStartBtn.addEventListener("click", startSynchronizedPlayback);
  playPauseBtn.addEventListener("click", togglePlayPause);

  seekBackBtn.addEventListener("click", () => {
    if (!ytPlayer || !ytReady) return;
    seekToSecond((ytPlayer.getCurrentTime() || 0) - 10);
  });

  seekFwdBtn.addEventListener("click", () => {
    if (!ytPlayer || !ytReady) return;
    seekToSecond((ytPlayer.getCurrentTime() || 0) + 10);
  });

  resyncNowBtn.addEventListener("click", () => {
    syncAudioToVideo(true);
  });

  seekSlider.addEventListener("input", () => {
    isSeekingSlider = true;
    currentTimeReadout.textContent = formatTime(Number(seekSlider.value));
  });

  seekSlider.addEventListener("change", () => {
    seekToSecond(Number(seekSlider.value));
    isSeekingSlider = false;
  });

  playbackRateSelect.addEventListener("change", () => {
    const rate = Number(playbackRateSelect.value) || 1;
    if (ytPlayer && ytReady && ytPlayer.setPlaybackRate) {
      ytPlayer.setPlaybackRate(rate);
    }
    voiceAudio.playbackRate = rate;
  });

  // Audio Mode Cards
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      ensureAudioGraph();
      setAudioMode(btn.dataset.mode);
    });
  });

  // Volume Sliders
  transVolSlider.addEventListener("input", () => {
    ensureAudioGraph();
    transVolumePct = Number(transVolSlider.value);
    applyTranslationVolume();
    updateQuickPillsUI();
  });

  origVolSlider.addEventListener("input", () => {
    const val = Number(origVolSlider.value);
    if (val === 0) {
      setAudioMode("pc_mute");
    } else {
      setAudioMode("manual", val);
    }
  });

  // Quick Volume Pills
  volPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      ensureAudioGraph();
      const target = pill.dataset.target;
      const val = Number(pill.dataset.val);
      if (target === "trans") {
        transVolumePct = val;
        transVolSlider.value = String(val);
        applyTranslationVolume();
        updateQuickPillsUI();
      } else if (target === "orig") {
        if (val === 0) {
          setAudioMode("pc_mute");
        } else {
          setAudioMode("manual", val);
        }
      }
    });
  });

  // Sync Offset Buttons
  function updateOffsetUI() {
    const sign = syncOffsetSec > 0 ? "+" : "";
    offsetReadout.textContent = `${sign}${syncOffsetSec.toFixed(1)}с`;
    syncAudioToVideo(true);
  }

  offsetMinusBtn.addEventListener("click", () => {
    syncOffsetSec = Math.round((syncOffsetSec - 0.2) * 10) / 10;
    updateOffsetUI();
  });

  offsetPlusBtn.addEventListener("click", () => {
    syncOffsetSec = Math.round((syncOffsetSec + 0.2) * 10) / 10;
    updateOffsetUI();
  });

  offsetResetBtn.addEventListener("click", () => {
    syncOffsetSec = 0.0;
    updateOffsetUI();
  });

  downloadSrtBtn.addEventListener("click", downloadSrtFile);

  // Subtitle Mode Tabs
  subTabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      subTabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      subtitleMode = btn.dataset.submode;
      renderTranscriptList();
    });
  });

  // Bookmarklet Copy
  copyBookmarkletBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletCode.textContent);
      copyBookmarkletBtn.textContent = "✓ Скопировано!";
      setTimeout(() => {
        copyBookmarkletBtn.textContent = "Копировать";
      }, 2000);
    } catch {}
  });

  // Start background sync loop
  startRealtimeLoop();
})();
