/**
 * StudentHub — WebSocket Yöneticisi
 * Gerçek zamanlı mesajlaşma, bildirim ve online durum.
 *
 * Kullanım:
 *   WS.connect();               // Login sonrası bağlan
 *   WS.disconnect();            // Logout'ta bağlantıyı kes
 *   WS.sendMessage(convId, text); // Mesaj gönder
 *   WS.on('message', handler);  // Olayları dinle
 */

const WS = (() => {
  // ── Konfigürasyon ─────────────────────────
  const WS_URL = "ws://localhost:8000/ws"; // Harici gerçek-zamanlı servis adresi
  const RECONNECT_DELAY_MS = 2000;
  const MAX_RECONNECT_TRIES = 10;
  const HEARTBEAT_INTERVAL = 25000; // 25s

  // ── İç durum ─────────────────────────────
  let socket = null;
  let reconnectTries = 0;
  let heartbeatTimer = null;
  let isManualClose = false;

  const listeners = {}; // olay adı → [callback, ...]

  // ── Bağlan ───────────────────────────────

  function connect() {
    const token = localStorage.getItem("sh_token");
    if (!token) return;

    isManualClose = false;
    const url = `${WS_URL}?token=${token}`;

    try {
      socket = new WebSocket(url);
    } catch (e) {
      console.warn("[WS] WebSocket oluşturulamadı:", e);
      return;
    }

    socket.onopen = onOpen;
    socket.onmessage = onMessage;
    socket.onclose = onClose;
    socket.onerror = onError;
  }

  function disconnect() {
    isManualClose = true;
    clearHeartbeat();
    if (socket) {
      socket.close();
      socket = null;
    }
  }

  // ── WebSocket olayları ────────────────────

  function onOpen() {
    console.log("[WS] Bağlandı.");
    reconnectTries = 0;
    startHeartbeat();
    emit("connected", {});
    updateConnectionBadge(true);
  }

  function onMessage(event) {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      console.warn("[WS] JSON parse hatası:", event.data);
      return;
    }

    const { type, payload } = data;

    switch (type) {
      // Gelen mesaj
      case "chat.message":
        handleIncomingMessage(payload);
        break;

      // Okundu bildirimi
      case "chat.read":
        emit("messageRead", payload);
        break;

      // Yazıyor göstergesi
      case "chat.typing":
        emit("typing", payload);
        break;

      // Yeni bildirim (başvuru, teklif, değerlendirme vb.)
      case "notification":
        handleNotification(payload);
        break;

      // Online/offline durum
      case "presence":
        emit("presence", payload);
        break;

      // Heartbeat pong
      case "pong":
        break;

      default:
        emit(type, payload);
    }
  }

  function onClose(event) {
    clearHeartbeat();
    updateConnectionBadge(false);

    if (isManualClose) return;

    if (reconnectTries < MAX_RECONNECT_TRIES) {
      const delay = RECONNECT_DELAY_MS * Math.pow(1.5, reconnectTries);
      reconnectTries++;
      console.log(
        `[WS] Bağlantı kesildi. ${delay}ms sonra yeniden bağlanıyor... (${reconnectTries}/${MAX_RECONNECT_TRIES})`,
      );
      setTimeout(connect, delay);
    } else {
      console.error("[WS] Maksimum yeniden bağlanma denemesi aşıldı.");
      emit("connectionFailed", {});
    }
  }

  function onError(err) {
    console.error("[WS] Hata:", err);
    emit("error", err);
  }

  // ── Mesaj gönderme ────────────────────────

  function sendMessage(conversationId, content) {
    send({
      type: "chat.message",
      payload: { conversation_id: conversationId, content },
    });
  }

  function sendTyping(conversationId) {
    send({
      type: "chat.typing",
      payload: { conversation_id: conversationId },
    });
  }

  function markRead(conversationId) {
    send({
      type: "chat.read",
      payload: { conversation_id: conversationId },
    });
  }

  function send(data) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("[WS] Gönderilemiyor — bağlantı yok:", data);
      return false;
    }
    socket.send(JSON.stringify(data));
    return true;
  }

  // ── Heartbeat ─────────────────────────────

  function startHeartbeat() {
    heartbeatTimer = setInterval(() => {
      send({ type: "ping", payload: {} });
    }, HEARTBEAT_INTERVAL);
  }

  function clearHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  // ── Olay sistemi ──────────────────────────

  function on(eventName, callback) {
    if (!listeners[eventName]) listeners[eventName] = [];
    listeners[eventName].push(callback);
  }

  function off(eventName, callback) {
    if (!listeners[eventName]) return;
    listeners[eventName] = listeners[eventName].filter((cb) => cb !== callback);
  }

  function emit(eventName, data) {
    (listeners[eventName] || []).forEach((cb) => {
      try {
        cb(data);
      } catch (e) {
        console.error("[WS] Listener hatası:", e);
      }
    });
  }

  // ── Gelen mesaj işleme ────────────────────

  function handleIncomingMessage(payload) {
    // Mesaj sayfası açıksa direkt ekle
    const msgBody = document.getElementById("msg-body");
    const activeConversationId = getCurrentConversationId();
    if (
      msgBody &&
      activeConversationId !== null &&
      Number(payload.conversation_id) === activeConversationId
    ) {
      appendMessageBubble(payload);
      markRead(payload.conversation_id);
    } else {
      // Sidebar'daki konuşmada okunmamış sayacı artır
      incrementUnreadBadge(payload.conversation_id);
    }

    // Olay yayınla (sayfalar arası dinleyiciler için)
    emit("message", payload);

    // Tarayıcı bildirimi (izin varsa)
    showBrowserNotification(
      payload.sender_name || "Yeni mesaj",
      payload.content,
      "messages.html",
    );
  }

  function handleNotification(payload) {
    // Navbar bildirim sayacını artır
    incrementNavNotificationBadge();

    // Toast göster
    if (window.UI) {
      const icons = {
        offer: "💼",
        application: "📬",
        review: "⭐",
        message: "💬",
        project: "🚀",
        system: "🔔",
      };
      const icon = icons[payload.type] || "🔔";
      UI.toast(`${icon} ${payload.title}`, "success");
    }

    emit("notification", payload);
  }

  // ── DOM yardımcıları ──────────────────────

  function appendMessageBubble(payload) {
    const msgBody = document.getElementById("msg-body");
    if (!msgBody) return;

    const currentUserId = JSON.parse(
      localStorage.getItem("sh_user") || "{}",
    ).id;
    const isMe = payload.sender_id === currentUserId;

    const now = new Date(payload.created_at || Date.now());
    const time =
      now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");

    const div = document.createElement("div");
    div.className = `msg-bubble ${isMe ? "me" : "them"}`;
    div.dataset.messageId = payload.id;
    div.innerHTML = `
      <div class="bubble-text">${escapeHtml(payload.content)}</div>
      <div class="bubble-time">${time}</div>`;
    msgBody.appendChild(div);
    msgBody.scrollTop = msgBody.scrollHeight;
  }

  function incrementUnreadBadge(conversationId) {
    // Sidebar'da ilgili konuşmayı bul
    const convoItem = document.querySelector(
      `[data-conversation-id="${conversationId}"]`,
    );
    if (!convoItem) return;
    let badge = convoItem.querySelector(".convo-unread");
    if (badge) {
      badge.textContent = parseInt(badge.textContent || "0", 10) + 1;
    } else {
      badge = document.createElement("div");
      badge.className = "convo-unread";
      badge.textContent = "1";
      convoItem.querySelector(".convo-meta")?.appendChild(badge);
    }
  }

  function incrementNavNotificationBadge() {
    let badge = document.getElementById("nav-notif-badge");
    if (badge) {
      badge.textContent = parseInt(badge.textContent || "0", 10) + 1;
      badge.style.display = "flex";
    }
  }

  function updateConnectionBadge(isConnected) {
    const badge = document.getElementById("ws-status");
    if (!badge) return;
    badge.className = isConnected ? "ws-online" : "ws-offline";
    badge.title = isConnected
      ? "Gerçek zamanlı bağlantı aktif"
      : "Bağlantı kesildi, yeniden bağlanıyor...";
  }

  function getCurrentConversationId() {
    const id = document.getElementById("msg-body")?.dataset?.conversationId;
    if (id === undefined || id === null || id === "") return null;
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }

  function showBrowserNotification(title, body, url) {
    if (!("Notification" in window) || Notification.permission !== "granted")
      return;
    const n = new Notification(title, { body, icon: "/favicon.ico" });
    n.onclick = () => {
      window.focus();
      window.location.href = url;
    };
    setTimeout(() => n.close(), 5000);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ── Tarayıcı bildirimi izni ───────────────

  function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  // ── Public API ────────────────────────────

  return {
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    markRead,
    on,
    off,
    isConnected: () => socket?.readyState === WebSocket.OPEN,
    requestNotificationPermission,
  };
})();

// ─────────────────────────────────────────────
// Form Validasyon Kuralları (sayfaya özel)
// ─────────────────────────────────────────────

/**
 * Her sayfa kendi submit fonksiyonunda şu şekilde kullanır:
 *
 * function submitLogin() {
 *   const err = UI.validate(VALIDATION_RULES.login);
 *   if (err) { UI.showError('#login-error', err); return; }
 *   AuthState.login(email, password);
 * }
 */
const VALIDATION_RULES = {
  login: [
    {
      selector: "#login-email",
      label: "E-posta",
      rules: ["required", "email"],
    },
    {
      selector: "#login-password",
      label: "Şifre",
      rules: ["required", "min:6"],
    },
  ],

  register: [
    { selector: "#reg-firstname", label: "Ad", rules: ["required"] },
    { selector: "#reg-lastname", label: "Soyad", rules: ["required"] },
    { selector: "#reg-email", label: "E-posta", rules: ["required", "email"] },
    { selector: "#reg-password", label: "Şifre", rules: ["required", "min:8"] },
  ],

  createService: [
    {
      selector: "#svc-title",
      label: "Başlık",
      rules: ["required", "min:10", "max:100"],
    },
    {
      selector: "#svc-description",
      label: "Açıklama",
      rules: ["required", "min:100"],
    },
    {
      selector: "#svc-price",
      label: "Fiyat",
      rules: ["required", "number", "minval:10"],
    },
    { selector: "#svc-category", label: "Kategori", rules: ["required"] },
    { selector: "#svc-delivery", label: "Teslimat", rules: ["required"] },
  ],

  createNeed: [
    { selector: "#need-title", label: "Başlık", rules: ["required", "min:10"] },
    {
      selector: "#need-description",
      label: "Açıklama",
      rules: ["required", "min:50"],
    },
    {
      selector: "#need-budget",
      label: "Bütçe",
      rules: ["required", "number", "minval:10"],
    },
    { selector: "#need-category", label: "Kategori", rules: ["required"] },
  ],

  createProject: [
    {
      selector: "#proj-title",
      label: "Proje Adı",
      rules: ["required", "min:10"],
    },
    {
      selector: "#proj-description",
      label: "Açıklama",
      rules: ["required", "min:80"],
    },
    { selector: "#proj-category", label: "Kategori", rules: ["required"] },
    {
      selector: "#proj-capacity",
      label: "Kapasite",
      rules: ["required", "number", "minval:1"],
    },
  ],

  sendMessage: [
    { selector: "#msg-inp", label: "Mesaj", rules: ["required", "max:2000"] },
  ],

  createOffer: [
    {
      selector: "#offer-price",
      label: "Teklif fiyatı",
      rules: ["required", "number", "minval:10"],
    },
    {
      selector: "#offer-message",
      label: "Mesaj",
      rules: ["required", "min:20"],
    },
  ],
};

// ─────────────────────────────────────────────
// Sayfa yüklenince WebSocket'i bağla
// ─────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("sh_token")) {
    WS.connect();
    WS.requestNotificationPermission();
  }

  // Sayfa kapanınca temiz kapat
  window.addEventListener("beforeunload", () => WS.disconnect());
});
