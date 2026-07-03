const DEFAULT_TIME_ZONE = "Europe/Brussels";

function toDateKey(year, month, day) {
  return [year, month, day].map((part) => String(part).padStart(2, "0")).join("-");
}

function dayOfWeek(dateKey = "") {
  const date = new Date(`${dateKey}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? -1 : date.getUTCDay();
}

function previousDateKey(dateKey = "") {
  const date = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function timeToMinutes(value = "") {
  const match = String(value || "").match(/^(\d{2}):(\d{2})$/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

function dateInRange(dateKey, startDate, endDate) {
  if (!dateKey) return false;
  if (startDate && dateKey < startDate) return false;
  if (endDate && dateKey > endDate) return false;
  return true;
}

function zonedParts(now = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    hour12: false
  }).formatToParts(now);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);
  const hour = Number(values.hour);
  const minute = Number(values.minute);
  const dateKey = toDateKey(year, month, day);

  return {
    dateKey,
    minutes: hour * 60 + minute
  };
}

export function isStreamWindowActive(config = {}, now = new Date()) {
  const timeZone = String(config.timeZone || DEFAULT_TIME_ZONE);
  const weekday = Number(config.weekday ?? 5);
  const startDate = String(config.startDate || "");
  const endDate = String(config.endDate || startDate || "");
  const startMinutes = timeToMinutes(config.startTime || "21:55");
  const endMinutes = timeToMinutes(config.endTime || "00:05");
  const current = zonedParts(now, timeZone);

  if (endMinutes > startMinutes) {
    return (
      dateInRange(current.dateKey, startDate, endDate) &&
      dayOfWeek(current.dateKey) === weekday &&
      current.minutes >= startMinutes &&
      current.minutes < endMinutes
    );
  }

  const previous = previousDateKey(current.dateKey);
  const sameDayWindow =
    dateInRange(current.dateKey, startDate, endDate) &&
    dayOfWeek(current.dateKey) === weekday &&
    current.minutes >= startMinutes;
  const afterMidnightWindow =
    dateInRange(previous, startDate, endDate) &&
    dayOfWeek(previous) === weekday &&
    current.minutes < endMinutes;

  return sameDayWindow || afterMidnightWindow;
}

function streamConfig(node) {
  return {
    timeZone: node.dataset.timeZone,
    weekday: Number(node.dataset.weekday || 5),
    startDate: node.dataset.startDate,
    endDate: node.dataset.endDate,
    startTime: node.dataset.startTime,
    endTime: node.dataset.endTime
  };
}

function buildPlayer(node) {
  const mount = node.querySelector("[data-stream-mount]");
  const controls = node.querySelector("[data-stream-controls]");
  const audioMount = node.querySelector("[data-audio-mount]");
  if (!mount || mount.dataset.ready === "true") return;

  const videoUrl = String(node.dataset.videoUrl || "").trim();
  const audioUrl = String(node.dataset.audioUrl || "").trim();
  const label = String(node.dataset.streamLabel || "Livestream").trim();

  if (videoUrl) {
    const frame = document.createElement("div");
    frame.className = "event-stream__frame";

    const iframe = document.createElement("iframe");
    iframe.src = videoUrl;
    iframe.title = label;
    iframe.loading = "lazy";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;

    frame.append(iframe);
    mount.append(frame);
  }

  if (audioMount && audioUrl) {
    const labelNode = document.createElement("span");
    labelNode.className = "event-stream__audio-label";
    labelNode.textContent = "Audio fallback";

    const audio = document.createElement("audio");
    audio.className = "event-stream__audio";
    audio.controls = true;
    audio.preload = "none";
    audio.src = audioUrl;

    audioMount.replaceChildren(labelNode, audio);
  }

  mount.dataset.ready = "true";
  mount.hidden = false;
  if (controls) controls.hidden = false;
}

function clearPlayer(node) {
  const mount = node.querySelector("[data-stream-mount]");
  const controls = node.querySelector("[data-stream-controls]");
  const audioMount = node.querySelector("[data-audio-mount]");
  if (mount) {
    mount.replaceChildren();
    mount.dataset.ready = "false";
    mount.hidden = true;
  }
  if (audioMount) audioMount.replaceChildren();
  if (controls) controls.hidden = true;
}

function updateStatus(node, active) {
  const status = node.querySelector("[data-stream-status]");
  if (!status) return;

  node.classList.toggle("is-stream-live", active);
  status.innerHTML = active
    ? '<span class="event-stream__status-kicker">Live</span><p>De Villa Bota stream is nu beschikbaar op kwartierwest.be.</p>'
    : '<span class="event-stream__status-kicker">Nog niet live</span><p>De livestream wordt hier automatisch beschikbaar tussen 21:55 en 00:05.</p>';
}

function syncStream(node, now = new Date()) {
  const active = isStreamWindowActive(streamConfig(node), now);
  updateStatus(node, active);
  if (active) {
    buildPlayer(node);
  } else {
    clearPlayer(node);
  }
}

export function initEventStreamGate() {
  document.querySelectorAll("[data-event-stream]").forEach((node) => {
    syncStream(node);
    window.setInterval(() => syncStream(node), 30000);
  });
}
