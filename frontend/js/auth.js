/**
 * StudentHub — Auth State Yönetimi
 * Token saklama, navbar güncelleme, oturum kontrolü.
 * Her sayfada api.js'den SONRA yükleyin:
 *   <script src="api.js"></script>
 *   <script src="auth.js"></script>
 */

const AuthState = {
  // ── Token & User ──────────────────────────

  saveSession(token, user) {
    localStorage.setItem("sh_token", token);
    localStorage.setItem("sh_user", JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem("sh_token");
    localStorage.removeItem("sh_user");
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem("sh_user"));
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return !!localStorage.getItem("sh_token");
  },

  // ── Navbar Güncelleme ─────────────────────

  /**
   * Sayfadaki navbar'ı kullanıcı durumuna göre günceller.
   * Giriş yapılmışsa: avatar + isim + çıkış butonu göster.
   * Giriş yapılmamışsa: "Giriş Yap / Kayıt" butonu göster.
   */
  updateNavbar() {
    const cta = document.querySelector(".nav-cta");
    if (!cta) return;

    const user = this.getUser();

    if (user) {
      // Kullanıcı girişi var — butonu kullanıcı menüsüne çevir
      cta.outerHTML = `
        <div class="nav-user-menu" id="nav-user-menu">
          <div class="nav-avatar" data-initial="${user.first_name?.[0] ?? "?"}" onclick="AuthState.toggleMenu()">
            <span class="nav-user-name">${user.first_name || "Kullanıcı"}</span>
            <span class="nav-chevron">▾</span>
          </div>
          <div class="nav-dropdown" id="nav-dropdown">
            <a class="nav-dd-item" onclick="go('profile')">👤 Profilim</a>
            <a class="nav-dd-item" onclick="go('dashboard')">📊 Dashboard</a>
            <a class="nav-dd-item" onclick="go('messages')">💬 Mesajlar</a>
            <a class="nav-dd-item" onclick="go('create')">➕ İlan Oluştur</a>
            <div class="nav-dd-sep"></div>
            <a class="nav-dd-item danger" onclick="AuthState.logout()">🚪 Çıkış Yap</a>
          </div>
        </div>`;

      // Menüyü dışarı tıklayınca kapat
      if (!this._outsideClickBound) {
        document.addEventListener("click", (e) => {
          if (!document.getElementById("nav-user-menu")?.contains(e.target)) {
            document.getElementById("nav-dropdown")?.classList.remove("open");
          }
        });
        this._outsideClickBound = true;
      }
    }
    // Giriş yapılmamışsa mevcut buton zaten doğru
  },

  toggleMenu() {
    document.getElementById("nav-dropdown")?.classList.toggle("open");
  },

  // ── Sayfa Koruma ──────────────────────────

  /**
   * Giriş gerektiren sayfalarda çağır.
   * Giriş yapılmamışsa auth sayfasına yönlendirir.
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      sessionStorage.setItem("sh_redirect", window.location.href);
      window.location.href = "auth.html";
    }
  },

  /**
   * Giriş yapılmış kullanıcı auth sayfasına gelirse dashboard'a yönlendir.
   */
  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.href = "dashboard.html";
    }
  },

  // ── Login / Register ──────────────────────

  async login(email, password) {
    UI.showLoading("#login-submit", "Giriş yapılıyor...");
    try {
      const res = await SH.Auth.login({ email, password });
      this.saveSession(res.token, res.user);
      this.updateNavbar();
      const redirect =
        sessionStorage.getItem("sh_redirect") || "dashboard.html";
      sessionStorage.removeItem("sh_redirect");
      window.location.href = redirect;
    } catch (err) {
      UI.showError("#login-error", err.message || "E-posta veya şifre hatalı.");
    } finally {
      UI.hideLoading("#login-submit", "Giriş Yap →");
    }
  },

  async register(data) {
    UI.showLoading("#register-submit", "Hesap oluşturuluyor...");
    try {
      const res = await SH.Auth.register(data);
      this.saveSession(res.token, res.user);
      window.location.href = "dashboard.html";
    } catch (err) {
      UI.showError(
        "#register-error",
        err.message || "Kayıt başarısız, tekrar deneyin.",
      );
    } finally {
      UI.hideLoading("#register-submit", "Kayıt Ol & Başla →");
    }
  },

  async logout() {
    try {
      await SH.Auth.logout();
    } catch {}
    this.clearSession();
    window.location.href = "landing.html";
  },
};

// ─────────────────────────────────────────────
// UI Yardımcıları (Loading, Error, Toast)
// ─────────────────────────────────────────────

const UI = {
  // ── Loading state ─────────────────────────

  showLoading(selector, text = "Yükleniyor...") {
    const el = document.querySelector(selector);
    if (!el) return;
    el.disabled = true;
    el.dataset.originalText = el.textContent;
    el.innerHTML = `<span class="spinner"></span> ${text}`;
  },

  hideLoading(selector, fallbackText) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.disabled = false;
    el.textContent = el.dataset.originalText || fallbackText;
  },

  // ── Error mesajı ──────────────────────────

  showError(selector, message) {
    let el = document.querySelector(selector);
    if (!el) {
      // Dinamik oluştur
      el = document.createElement("div");
      el.id = selector.replace("#", "");
      el.className = "error-msg";
      const form = document.querySelector(
        "form, .create-form, .auth-form-wrap",
      );
      if (form) form.prepend(el);
    }
    el.textContent = "⚠ " + message;
    el.style.display = "block";
    setTimeout(() => {
      el.style.display = "none";
    }, 5000);
  },

  hideError(selector) {
    const el = document.querySelector(selector);
    if (el) el.style.display = "none";
  },

  // ── Toast bildirimi ───────────────────────

  toast(message, type = "success") {
    const existing = document.getElementById("sh-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "sh-toast";
    toast.className = `sh-toast sh-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animasyon
    requestAnimationFrame(() => toast.classList.add("visible"));
    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // ── Skeleton loader ───────────────────────

  skeleton(count = 3, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.innerHTML = Array(count)
      .fill(
        `
      <div class="skeleton-card">
        <div class="sk sk-banner"></div>
        <div class="sk sk-line" style="width:60%"></div>
        <div class="sk sk-line" style="width:90%"></div>
        <div class="sk sk-line" style="width:45%"></div>
      </div>`,
      )
      .join("");
  },

  clearSkeleton(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (container) container.innerHTML = "";
  },

  // ── Form Validasyonu ──────────────────────

  /**
   * Form elemanlarını validate eder.
   * rules: [ { selector, label, rules: ['required','email','min:8'] } ]
   * Geçersizse ilk hata mesajını döner, geçerliyse null.
   */
  validate(rules) {
    for (const field of rules) {
      const el = document.querySelector(field.selector);
      const val = el?.value?.trim() ?? "";

      for (const rule of field.rules) {
        if (rule === "required" && !val) {
          el?.classList.add("input-error");
          return `${field.label} boş bırakılamaz.`;
        }
        if (
          rule === "email" &&
          val &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
        ) {
          el?.classList.add("input-error");
          return `Geçerli bir e-posta adresi girin.`;
        }
        if (rule.startsWith("min:")) {
          const min = parseInt(rule.split(":")[1]);
          if (val.length < min) {
            el?.classList.add("input-error");
            return `${field.label} en az ${min} karakter olmalıdır.`;
          }
        }
        if (rule.startsWith("max:")) {
          const max = parseInt(rule.split(":")[1]);
          if (val.length > max) {
            el?.classList.add("input-error");
            return `${field.label} en fazla ${max} karakter olabilir.`;
          }
        }
        if (rule === "number" && val && isNaN(Number(val))) {
          el?.classList.add("input-error");
          return `${field.label} sayısal bir değer olmalıdır.`;
        }
        if (rule.startsWith("minval:")) {
          const min = parseFloat(rule.split(":")[1]);
          if (parseFloat(val) < min) {
            el?.classList.add("input-error");
            return `${field.label} en az ${min} olmalıdır.`;
          }
        }
        // Geçerliyse hata sınıfını kaldır
        el?.classList.remove("input-error");
      }
    }
    return null; // tüm kurallar geçti
  },

  clearValidation() {
    document
      .querySelectorAll(".input-error")
      .forEach((el) => el.classList.remove("input-error"));
  },
};

// ─────────────────────────────────────────────
// Sayfa yüklenince çalışır
// ─────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  AuthState.updateNavbar();
});

// ─────────────────────────────────────────────
// Dinamik CSS (spinner, toast, hata stilleri)
// ─────────────────────────────────────────────

const authStyles = document.createElement("style");
authStyles.textContent = `
/* Spinner */
.spinner {
  display: inline-block;
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  vertical-align: middle;
  margin-right: 4px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Hata mesajı */
.error-msg {
  background: #fff1f2; color: #be123c;
  border: 1px solid #fecdd3;
  border-radius: 10px; padding: 10px 14px;
  font-size: 13px; margin-bottom: 14px;
  display: none;
}

/* Input hata */
.input-error {
  border-color: #ff6b6b !important;
  background: #fff8f8 !important;
}

/* Toast */
.sh-toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(16px);
  background: #0d0d14; color: #fff;
  padding: 12px 22px; border-radius: 100px;
  font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
  box-shadow: 0 8px 32px rgba(0,0,0,.2);
  z-index: 9999; opacity: 0; transition: all .3s ease;
  white-space: nowrap;
}
.sh-toast.visible { opacity: 1; transform: translateX(-50%) translateY(0); }
.sh-toast.sh-toast-error { background: #be123c; }
.sh-toast.sh-toast-warning { background: #854d0e; }

/* Skeleton */
.skeleton-card {
  background: #fff; border-radius: 16px;
  border: 1px solid rgba(0,0,0,.06); overflow: hidden;
  padding: 16px;
}
.sk {
  background: linear-gradient(90deg, #f0eeea 25%, #e5e2db 50%, #f0eeea 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px; margin-bottom: 10px;
}
.sk-banner { height: 110px; border-radius: 12px; margin-bottom: 14px; }
.sk-line { height: 12px; }
@keyframes shimmer { to { background-position: -200% 0; } }

/* Navbar kullanıcı menüsü */
.nav-user-menu { position: relative; }
.nav-avatar {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; padding: 6px 14px 6px 6px;
  border-radius: 100px; transition: background .2s;
  font-size: 13px; font-weight: 500;
}
.nav-avatar:hover { background: rgba(0,0,0,.06); }
.nav-avatar::before {
  content: attr(data-initial);
  width: 30px; height: 30px; border-radius: 10px;
  background: #4f46e5; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
}
.nav-chevron { font-size: 10px; color: #6b6b8a; }
.nav-dropdown {
  position: absolute; right: 0; top: calc(100% + 8px);
  background: #fff; border: 1px solid rgba(0,0,0,.08);
  border-radius: 14px; padding: 6px;
  box-shadow: 0 16px 40px rgba(0,0,0,.12);
  min-width: 200px; display: none; z-index: 300;
}
.nav-dropdown.open { display: block; animation: fadeIn .2s ease; }
.nav-dd-item {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; border-radius: 9px;
  font-size: 13px; font-weight: 500; color: #0d0d14;
  cursor: pointer; transition: background .15s; text-decoration: none;
}
.nav-dd-item:hover { background: #f5f3ee; }
.nav-dd-item.danger { color: #be123c; }
.nav-dd-item.danger:hover { background: #fff1f2; }
.nav-dd-sep { height: 1px; background: rgba(0,0,0,.07); margin: 4px 0; }
`;
document.head.appendChild(authStyles);
