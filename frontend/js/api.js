/**
 * StudentHub — API Servis Katmanı
 * Frontend'den dış API servisine yapılan tüm istekler bu dosyadan geçer.
 * Sadece BASE_URL satırını kendi servis adresinize göre değiştirin.
 */

const BASE_URL = "http://localhost:8000/api"; // geliştirme
// const BASE_URL = 'https://api.studenthub.com/api'; // production

// ─────────────────────────────────────────────
// CORE: HTTP yardımcıları
// ─────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("sh_token");
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body = null) {
  const options = {
    method,
    headers: authHeaders(),
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  // Token süresi dolduysa login'e yönlendir
  if (res.status === 401) {
    localStorage.removeItem("sh_token");
    localStorage.removeItem("sh_user");
    window.location.href = "auth.html";
    return;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.detail || data.message || "Sunucu hatası");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

const Auth = {
  /**
   * Kayıt ol
   * POST /auth/register
   * Body: { first_name, last_name, email, password }
   * Response: { token, user }
   */
  register(data) {
    return api.post("/auth/register", data);
  },

  /**
   * Giriş yap
   * POST /auth/login
   * Body: { email, password }
   * Response: { token, user }
   */
  login(data) {
    return api.post("/auth/login", data);
  },

  /**
   * Çıkış yap
   * POST /auth/logout
   */
  logout() {
    return api.post("/auth/logout");
  },

  /**
   * Mevcut kullanıcıyı getir
   * GET /auth/me
   */
  me() {
    return api.get("/auth/me");
  },

  /**
   * Şifre sıfırlama isteği
   * POST /auth/password-reset
   * Body: { email }
   */
  passwordReset(email) {
    return api.post("/auth/password-reset", { email });
  },
};

// ─────────────────────────────────────────────
// KULLANICI & PROFİL
// ─────────────────────────────────────────────

const Users = {
  /**
   * Profil getir
   * GET /users/:id
   */
  getProfile(userId) {
    return api.get(`/users/${userId}`);
  },

  /**
   * Kendi profilini güncelle
   * PATCH /users/me
   * Body: { bio, profile_image, university, ... }
   */
  updateProfile(data) {
    return api.patch("/users/me", data);
  },

  /**
   * Yetenek ekle
   * POST /users/me/skills
   * Body: { name, level }  — level: 'beginner' | 'intermediate' | 'advanced'
   */
  addSkill(data) {
    return api.post("/users/me/skills", data);
  },

  /**
   * Yetenek sil
   * DELETE /users/me/skills/:skillId
   */
  removeSkill(skillId) {
    return api.delete(`/users/me/skills/${skillId}`);
  },

  /**
   * Portföy ekle
   * POST /users/me/portfolio
   * Body: { title, description, url, tech_stack }
   */
  addPortfolio(data) {
    return api.post("/users/me/portfolio", data);
  },

  /**
   * Portföy sil
   * DELETE /users/me/portfolio/:itemId
   */
  removePortfolio(itemId) {
    return api.delete(`/users/me/portfolio/${itemId}`);
  },

  /**
   * Kullanıcının değerlendirmelerini getir
   * GET /users/:id/reviews
   */
  getReviews(userId) {
    return api.get(`/users/${userId}/reviews`);
  },
};

// ─────────────────────────────────────────────
// HİZMET PAZARI
// ─────────────────────────────────────────────

const Services = {
  /**
   * Hizmet listesi (arama + filtre)
   * GET /services?search=&category=&min_price=&max_price=&min_rating=&ordering=
   */
  list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/services${qs ? "?" + qs : ""}`);
  },

  /**
   * Hizmet detayı
   * GET /services/:id
   */
  get(id) {
    return api.get(`/services/${id}`);
  },

  /**
   * Hizmet ilanı oluştur
   * POST /services
   * Body: { title, description, category, price, delivery_days, revisions, tech_stack }
   */
  create(data) {
    return api.post("/services", data);
  },

  /**
   * Hizmet ilanı güncelle
   * PATCH /services/:id
   */
  update(id, data) {
    return api.patch(`/services/${id}`, data);
  },

  /**
   * Hizmet ilanı sil
   * DELETE /services/:id
   */
  delete(id) {
    return api.delete(`/services/${id}`);
  },

  /**
   * Hizmet satın al / talep gönder
   * POST /services/:id/purchase
   * Body: { message? }
   */
  purchase(id, data = {}) {
    return api.post(`/services/${id}/purchase`, data);
  },

  /**
   * Kendi ilanlarım
   * GET /services/mine
   */
  mine() {
    return api.get("/services/mine");
  },
};

// ─────────────────────────────────────────────
// İHTİYAÇ İLANLARI (Reverse Marketplace)
// ─────────────────────────────────────────────

const Needs = {
  /**
   * İhtiyaç listesi
   * GET /needs?category=&status=open
   */
  list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/needs${qs ? "?" + qs : ""}`);
  },

  /**
   * İhtiyaç detayı
   * GET /needs/:id
   */
  get(id) {
    return api.get(`/needs/${id}`);
  },

  /**
   * İhtiyaç ilanı oluştur
   * POST /needs
   * Body: { title, description, category, budget, deadline }
   */
  create(data) {
    return api.post("/needs", data);
  },

  /**
   * İhtiyaç ilanına teklif ver
   * POST /needs/:id/offers
   * Body: { price, message, delivery_days }
   */
  createOffer(needId, data) {
    return api.post(`/needs/${needId}/offers`, data);
  },

  /**
   * Teklife kabul / ret
   * PATCH /needs/:needId/offers/:offerId
   * Body: { status: 'accepted' | 'rejected' }
   */
  updateOffer(needId, offerId, data) {
    return api.patch(`/needs/${needId}/offers/${offerId}`, data);
  },

  /**
   * İlandaki teklifleri listele
   * GET /needs/:id/offers
   */
  listOffers(needId) {
    return api.get(`/needs/${needId}/offers`);
  },
};

// ─────────────────────────────────────────────
// PROJELER
// ─────────────────────────────────────────────

const Projects = {
  /**
   * Proje listesi
   * GET /projects?category=&status=open&search=
   */
  list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/projects${qs ? "?" + qs : ""}`);
  },

  /**
   * Proje detayı
   * GET /projects/:id
   */
  get(id) {
    return api.get(`/projects/${id}`);
  },

  /**
   * Proje ilanı oluştur
   * POST /projects
   * Body: { title, description, category, required_skills, team_capacity, deadline }
   */
  create(data) {
    return api.post("/projects", data);
  },

  /**
   * Projeye başvur
   * POST /projects/:id/apply
   * Body: { message }
   */
  apply(id, data) {
    return api.post(`/projects/${id}/apply`, data);
  },

  /**
   * Başvuruları görüntüle (proje sahibi)
   * GET /projects/:id/applications
   */
  getApplications(id) {
    return api.get(`/projects/${id}/applications`);
  },

  /**
   * Başvuruyu kabul / ret et
   * PATCH /projects/:projectId/applications/:appId
   * Body: { status: 'accepted' | 'rejected' }
   */
  updateApplication(projectId, appId, data) {
    return api.patch(`/projects/${projectId}/applications/${appId}`, data);
  },

  /**
   * Skill matching — önerilen projeler
   * GET /projects/recommendations
   */
  recommendations() {
    return api.get("/projects/recommendations");
  },

  /**
   * Kendi projelerim
   * GET /projects/mine
   */
  mine() {
    return api.get("/projects/mine");
  },
};

// ─────────────────────────────────────────────
// MESAJLAŞMA
// ─────────────────────────────────────────────

const Messages = {
  /**
   * Konuşma listesi
   * GET /conversations
   */
  listConversations() {
    return api.get("/conversations");
  },

  /**
   * Konuşmayı getir (+ mesajlar)
   * GET /conversations/:id/messages
   */
  getMessages(conversationId) {
    return api.get(`/conversations/${conversationId}/messages`);
  },

  /**
   * Mesaj gönder (REST fallback — WebSocket yoksa)
   * POST /conversations/:id/messages
   * Body: { content }
   */
  send(conversationId, content) {
    return api.post(`/conversations/${conversationId}/messages`, { content });
  },

  /**
   * Yeni konuşma başlat
   * POST /conversations
   * Body: { recipient_id, message }
   */
  startConversation(recipientId, message) {
    return api.post("/conversations", { recipient_id: recipientId, message });
  },

  /**
   * Mesajları okundu işaretle
   * PATCH /conversations/:id/read
   */
  markRead(conversationId) {
    return api.patch(`/conversations/${conversationId}/read`);
  },
};

// ─────────────────────────────────────────────
// DEĞERLENDİRMELER
// ─────────────────────────────────────────────

const Reviews = {
  /**
   * Değerlendirme yap
   * POST /reviews
   * Body: { reviewed_user_id, reference_id, reference_type, rating, comment }
   * reference_type: 'service' | 'project'
   */
  create(data) {
    return api.post("/reviews", data);
  },

  /**
   * Kullanıcının değerlendirmeleri
   * GET /reviews?user_id=
   */
  list(userId) {
    return api.get(`/reviews?user_id=${userId}`);
  },
};

// ─────────────────────────────────────────────
// BİLDİRİMLER
// ─────────────────────────────────────────────

const Notifications = {
  /**
   * Bildirimleri listele
   * GET /notifications
   */
  list() {
    return api.get("/notifications");
  },

  /**
   * Bildirimleri okundu işaretle
   * PATCH /notifications/read-all
   */
  readAll() {
    return api.patch("/notifications/read-all");
  },

  /**
   * Tek bildirimi okundu işaretle
   * PATCH /notifications/:id/read
   */
  read(id) {
    return api.patch(`/notifications/${id}/read`);
  },
};

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

const Dashboard = {
  /**
   * Dashboard özet verileri
   * GET /dashboard/summary
   * Response: { active_listings, incoming_offers, monthly_earnings, avg_rating, recent_activity }
   */
  getSummary() {
    return api.get("/dashboard/summary");
  },

  /**
   * Aktif proje ilerlemeleri
   * GET /dashboard/projects/progress
   */
  getProjectProgress() {
    return api.get("/dashboard/projects/progress");
  },
};

// ─────────────────────────────────────────────
// DOSYA YÜKLEME
// ─────────────────────────────────────────────

const Upload = {
  /**
   * Profil fotoğrafı yükle
   * POST /upload/avatar  (multipart/form-data)
   */
  async avatar(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/upload/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Yükleme başarısız");
    return res.json();
  },

  /**
   * Portföy dosyası yükle
   * POST /upload/portfolio  (multipart/form-data)
   */
  async portfolio(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/upload/portfolio`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Yükleme başarısız");
    return res.json();
  },
};

// ─────────────────────────────────────────────
// Export (ES Modules kullananlar için)
// ─────────────────────────────────────────────

// Eğer bundler (Vite/Webpack) kullanıyorsanız:
// export { Auth, Users, Services, Needs, Projects, Messages, Reviews, Notifications, Dashboard, Upload };

// Vanilla HTML için window'a bağla:
window.SH = {
  Auth,
  Users,
  Services,
  Needs,
  Projects,
  Messages,
  Reviews,
  Notifications,
  Dashboard,
  Upload,
};
