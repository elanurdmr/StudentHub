/**
 * StudentHub — Mock Data
 * Backend hazır olduğunda bu dosyayı silip api.js'deki
 * gerçek fonksiyonları kullanmak yeterli.
 *
 * Kullanım:
 *   const services = await MockAPI.services.list();
 *   const projects = await MockAPI.projects.list();
 */

// ─────────────────────────────────────────────
// MOCK VERİ — HİZMETLER
// ─────────────────────────────────────────────

const MOCK_SERVICES = [
  {
    id: 1,
    title: "React & Next.js Web Geliştirme",
    description: "Modern, performanslı ve SEO dostu web uygulamaları geliştiriyorum. TypeScript, Tailwind CSS ve Prisma ile tam kapsamlı frontend.",
    category: "Yazılım",
    price: 450,
    delivery_days: 3,
    emoji: "⚛️",
    banner_color: "#eef2ff",
    cat_color: "#4f46e5",
    seller_name: "Elanur Demir",
    seller_initial: "E",
    seller_color: "#4f46e5",
    avg_rating: 4.9,
    review_count: 23,
    tags: ["React", "Next.js", "TypeScript", "Tailwind"],
  },
  {
    id: 2,
    title: "Python & Makine Öğrenmesi",
    description: "Veri analizi, görselleştirme ve ML model geliştirme. Scikit-learn, Pandas, Matplotlib ile profesyonel çözümler.",
    category: "Veri Bilimi",
    price: 380,
    delivery_days: 5,
    emoji: "🐍",
    banner_color: "#f0fdfa",
    cat_color: "#0f766e",
    seller_name: "Gökçe Aksoy",
    seller_initial: "G",
    seller_color: "#14b8a6",
    avg_rating: 4.8,
    review_count: 17,
    tags: ["Python", "Scikit-learn", "Pandas", "ML"],
  },
  {
    id: 3,
    title: "Figma UI/UX Tasarım",
    description: "Kullanıcı odaklı arayüz tasarımı. Wireframe'den high-fidelity prototipe, component library ve design system.",
    category: "Tasarım",
    price: 290,
    delivery_days: 4,
    emoji: "🎨",
    banner_color: "#fffbeb",
    cat_color: "#92400e",
    seller_name: "Şeyma Mavideniz",
    seller_initial: "Ş",
    seller_color: "#f59e0b",
    avg_rating: 5.0,
    review_count: 31,
    tags: ["Figma", "UI Design", "Prototyping"],
  },
  {
    id: 4,
    title: "Flutter Mobil Uygulama",
    description: "iOS ve Android için tek codebase ile native performanslı mobil uygulama. Firebase entegrasyonu dahil.",
    category: "Yazılım",
    price: 520,
    delivery_days: 7,
    emoji: "📱",
    banner_color: "#fff1f2",
    cat_color: "#be123c",
    seller_name: "Mert Yılmaz",
    seller_initial: "M",
    seller_color: "#ff6b6b",
    avg_rating: 4.7,
    review_count: 12,
    tags: ["Flutter", "Dart", "Firebase", "iOS", "Android"],
  },
  {
    id: 5,
    title: "Node.js & REST API Geliştirme",
    description: "Express.js ile RESTful API tasarımı ve geliştirme. JWT auth, rate limiting, Swagger dokümantasyonu.",
    category: "Yazılım",
    price: 410,
    delivery_days: 4,
    emoji: "🔐",
    banner_color: "#f5f3ff",
    cat_color: "#6d28d9",
    seller_name: "Ali Çelik",
    seller_initial: "A",
    seller_color: "#7c3aed",
    avg_rating: 4.6,
    review_count: 8,
    tags: ["Node.js", "Express", "REST API", "JWT"],
  },
  {
    id: 6,
    title: "Excel & Power BI Veri Analizi",
    description: "Ham veriyi anlamlı raporlara dönüştürüyorum. Dashboard tasarımı, pivot tablolar, DAX formülleri.",
    category: "Veri Bilimi",
    price: 240,
    delivery_days: 2,
    emoji: "📊",
    banner_color: "#fef9c3",
    cat_color: "#854d0e",
    seller_name: "Zeynep Kaya",
    seller_initial: "Z",
    seller_color: "#eab308",
    avg_rating: 4.9,
    review_count: 19,
    tags: ["Excel", "Power BI", "DAX", "Dashboard"],
  },
  {
    id: 7,
    title: "WordPress & WooCommerce Site",
    description: "Hızlı, SEO uyumlu WordPress siteleri. WooCommerce ile e-ticaret entegrasyonu, özel tema geliştirme.",
    category: "Yazılım",
    price: 320,
    delivery_days: 5,
    emoji: "🌐",
    banner_color: "#ecfdf5",
    cat_color: "#065f46",
    seller_name: "Burak Şahin",
    seller_initial: "B",
    seller_color: "#059669",
    avg_rating: 4.5,
    review_count: 14,
    tags: ["WordPress", "WooCommerce", "PHP", "SEO"],
  },
  {
    id: 8,
    title: "3D Modelleme & Animasyon",
    description: "Blender ile ürün görselleştirme, mimari render ve karakter animasyonu. Photorealistic sonuçlar.",
    category: "Tasarım",
    price: 480,
    delivery_days: 6,
    emoji: "🎭",
    banner_color: "#fdf4ff",
    cat_color: "#86198f",
    seller_name: "Deniz Arslan",
    seller_initial: "D",
    seller_color: "#a21caf",
    avg_rating: 4.8,
    review_count: 9,
    tags: ["Blender", "3D", "Animasyon", "Render"],
  },
  {
    id: 9,
    title: "İngilizce Akademik Yazım",
    description: "Essay, research paper, thesis editing. APA/MLA/Chicago formatlarında düzenleme ve proofreading.",
    category: "Akademik",
    price: 180,
    delivery_days: 2,
    emoji: "📝",
    banner_color: "#f0f9ff",
    cat_color: "#075985",
    seller_name: "Ceren Yıldız",
    seller_initial: "C",
    seller_color: "#0284c7",
    avg_rating: 5.0,
    review_count: 27,
    tags: ["Academic Writing", "English", "Editing", "APA"],
  },
  {
    id: 10,
    title: "Video Montaj & Motion Graphics",
    description: "Premiere Pro & After Effects ile profesyonel video montaj. YouTube içerikleri, tanıtım filmleri, sosyal medya.",
    category: "Video",
    price: 350,
    delivery_days: 4,
    emoji: "🎬",
    banner_color: "#fff7ed",
    cat_color: "#9a3412",
    seller_name: "Kerem Doğan",
    seller_initial: "K",
    seller_color: "#ea580c",
    avg_rating: 4.7,
    review_count: 16,
    tags: ["Premiere Pro", "After Effects", "Motion Graphics"],
  },
  {
    id: 11,
    title: "Arduino & Raspberry Pi Projeleri",
    description: "IoT sistemleri, sensör entegrasyonu ve gömülü sistem programlama. Donanım + yazılım tam çözüm.",
    category: "Yazılım",
    price: 560,
    delivery_days: 10,
    emoji: "🤖",
    banner_color: "#f0fdf4",
    cat_color: "#14532d",
    seller_name: "Oğuz Kaya",
    seller_initial: "O",
    seller_color: "#16a34a",
    avg_rating: 4.6,
    review_count: 6,
    tags: ["Arduino", "Raspberry Pi", "IoT", "C++"],
  },
  {
    id: 12,
    title: "Logo & Kurumsal Kimlik Tasarımı",
    description: "Markanızı yansıtan özgün logo ve kurumsal kimlik paketi. Kartvizit, antetli kağıt, sosyal medya kiti.",
    category: "Tasarım",
    price: 260,
    delivery_days: 3,
    emoji: "✏️",
    banner_color: "#fdf2f8",
    cat_color: "#831843",
    seller_name: "Selin Güneş",
    seller_initial: "S",
    seller_color: "#db2777",
    avg_rating: 4.9,
    review_count: 22,
    tags: ["Logo", "Branding", "Illustrator", "Kimlik"],
  },
];


// ─────────────────────────────────────────────
// MOCK VERİ — PROJELER
// ─────────────────────────────────────────────

const MOCK_PROJECTS = [
  {
    id: 1,
    title: "Kampüs İçi Yemek Sipariş Uygulaması",
    description: "Üniversite kantinleri için mobil sipariş platformu. Gerçek zamanlı sipariş takibi, QR kod ile ödeme ve kantin yönetim paneli.",
    category: "Yazılım",
    badge_bg: "#eef2ff",
    badge_color: "#4f46e5",
    required_skills: ["React Native", "Node.js", "PostgreSQL", "UI/UX"],
    open_slots: 2,
    total_slots: 4,
    owner_name: "Elanur Demir",
    owner_initial: "E",
    owner_color: "#4f46e5",
    created_ago: "2 gün önce",
    status: "open",
  },
  {
    id: 2,
    title: "Öğrenci Performans Tahmin Sistemi",
    description: "ML modelleri kullanarak öğrenci başarısını tahmin eden ve kişisel çalışma önerileri sunan yapay zeka destekli sistem.",
    category: "Yapay Zeka",
    badge_bg: "#f0fdf4",
    badge_color: "#15803d",
    required_skills: ["Python", "Scikit-learn", "FastAPI", "React"],
    open_slots: 3,
    total_slots: 4,
    owner_name: "Gökçe Aksoy",
    owner_initial: "G",
    owner_color: "#16a34a",
    created_ago: "1 gün önce",
    status: "open",
  },
  {
    id: 3,
    title: "Üniversite Etkinlik Platformu Redesign",
    description: "Mevcut etkinlik platformunun tamamen yeniden tasarlanması. Kullanıcı araştırması, Figma prototipler ve kullanıcı testleri.",
    category: "Tasarım",
    badge_bg: "#fffbeb",
    badge_color: "#b45309",
    required_skills: ["Figma", "User Research", "Prototyping", "CSS"],
    open_slots: 1,
    total_slots: 3,
    owner_name: "Şeyma Mavideniz",
    owner_initial: "Ş",
    owner_color: "#f59e0b",
    created_ago: "3 gün önce",
    status: "open",
  },
  {
    id: 4,
    title: "2D Bulmaca Oyunu — Unity",
    description: "Mobil platform için eğitim amaçlı bulmaca oyunu. Unity ile geliştirilecek, App Store ve Play Store'a çıkılacak.",
    category: "Oyun",
    badge_bg: "#fff1f2",
    badge_color: "#be123c",
    required_skills: ["Unity", "C#", "2D Art", "Sound Design"],
    open_slots: 1,
    total_slots: 3,
    owner_name: "Mert Yılmaz",
    owner_initial: "M",
    owner_color: "#ff6b6b",
    created_ago: "5 gün önce",
    status: "open",
  },
  {
    id: 5,
    title: "Sürdürülebilir Alışveriş Uygulaması",
    description: "İkinci el ürün takası ve sürdürülebilir tüketimi teşvik eden marketplace. TÜBİTAK 2209-A başvurusu hedefleniyor.",
    category: "Girişim",
    badge_bg: "#f5f3ff",
    badge_color: "#6d28d9",
    required_skills: ["Flutter", "Firebase", "UI/UX", "Marketing"],
    open_slots: 4,
    total_slots: 5,
    owner_name: "Ali Çelik",
    owner_initial: "A",
    owner_color: "#7c3aed",
    created_ago: "1 hafta önce",
    status: "open",
  },
  {
    id: 6,
    title: "Doğal Dil İşleme ile Yorum Analizi",
    description: "Türkçe sosyal medya yorumlarını analiz eden NLP pipeline. BERT tabanlı model, akademik yayın hedefleniyor.",
    category: "Araştırma",
    badge_bg: "#ecfeff",
    badge_color: "#0e7490",
    required_skills: ["NLP", "Python", "BERT", "Veri Görselleştirme"],
    open_slots: 2,
    total_slots: 3,
    owner_name: "Zeynep Kaya",
    owner_initial: "Z",
    owner_color: "#0891b2",
    created_ago: "1 hafta önce",
    status: "open",
  },
  {
    id: 7,
    title: "Blockchain Tabanlı Diploma Doğrulama",
    description: "Üniversite diplomalarının sahteciliğini önlemek için Ethereum üzerinde akıllı sözleşme. Web3 entegrasyonu.",
    category: "Yazılım",
    badge_bg: "#eef2ff",
    badge_color: "#4f46e5",
    required_skills: ["Solidity", "Web3.js", "React", "Ethereum"],
    open_slots: 3,
    total_slots: 4,
    owner_name: "Burak Şahin",
    owner_initial: "B",
    owner_color: "#059669",
    created_ago: "2 hafta önce",
    status: "open",
  },
  {
    id: 8,
    title: "Akıllı Kütüphane Yönetim Sistemi",
    description: "QR kod ile kitap takibi, otomatik iade hatırlatmaları ve kişiselleştirilmiş kitap önerileri sunan sistem.",
    category: "Yapay Zeka",
    badge_bg: "#f0fdf4",
    badge_color: "#15803d",
    required_skills: ["Python", "Django", "React", "Machine Learning"],
    open_slots: 2,
    total_slots: 4,
    owner_name: "Ceren Yıldız",
    owner_initial: "C",
    owner_color: "#0284c7",
    created_ago: "2 hafta önce",
    status: "open",
  },
];


// ─────────────────────────────────────────────
// MOCK VERİ — İHTİYAÇ İLANLARI
// ─────────────────────────────────────────────

const MOCK_NEEDS = [
  {
    id: 1,
    title: "Django REST API geliştiricisi arıyorum",
    description: "Bitirme projemde kullanmak üzere bir envanter yönetim sistemi için backend API geliştirmesine ihtiyacım var. JWT auth, CRUD ve raporlama endpoint'leri dahil.",
    category: "Yazılım",
    badge_bg: "#eef2ff",
    badge_color: "#4f46e5",
    budget: 600,
    deadline: "3 gün içinde",
    tags: ["Django", "REST API", "PostgreSQL", "JWT"],
    owner_name: "Mert Yılmaz",
    offer_count: 4,
    created_ago: "2 gün önce",
  },
  {
    id: 2,
    title: "Mobil uygulama için Figma UI tasarımı",
    description: "Bir sağlık takip uygulaması için ekran tasarımı yapılmasını istiyorum. 8-10 ekran, component library ve prototip dahil olmalı.",
    category: "Tasarım",
    badge_bg: "#fffbeb",
    badge_color: "#b45309",
    budget: 350,
    deadline: "5 gün içinde",
    tags: ["Figma", "UI Design", "Mobile", "Prototyping"],
    owner_name: "Zeynep Kaya",
    offer_count: 7,
    created_ago: "1 gün önce",
  },
  {
    id: 3,
    title: "Calculus 2 özel ders — sınava hazırlık",
    description: "Diferansiyel denklemler ve integral konularında sıkıştım, final öncesi 3-4 saat online özel ders arıyorum.",
    category: "Akademik",
    badge_bg: "#f0fdf4",
    badge_color: "#15803d",
    budget: 180,
    deadline: "2 gün içinde",
    tags: ["Matematik", "Calculus", "Online Ders"],
    owner_name: "Ali Çelik",
    offer_count: 2,
    created_ago: "4 saat önce",
  },
  {
    id: 4,
    title: "Ürün tanıtım videosu montajı",
    description: "Bir startup projesi için 60-90 saniyelik ürün tanıtım videosu montajı. Ham görüntüler hazır, müzik ve motion graphics eklenecek.",
    category: "Video",
    badge_bg: "#ecfeff",
    badge_color: "#0e7490",
    budget: 250,
    deadline: "1 hafta içinde",
    tags: ["Premiere Pro", "After Effects", "Motion Graphics"],
    owner_name: "Şeyma Mavideniz",
    offer_count: 1,
    created_ago: "3 gün önce",
  },
  {
    id: 5,
    title: "React Native uygulama hata ayıklama",
    description: "Mevcut Flutter projesini React Native'e migrate etmem gerekiyor. Tecrübeli biri yardımcı olursa çok sevinirim.",
    category: "Yazılım",
    badge_bg: "#eef2ff",
    badge_color: "#4f46e5",
    budget: 400,
    deadline: "4 gün içinde",
    tags: ["React Native", "Flutter", "Migration", "Debug"],
    owner_name: "Burak Şahin",
    offer_count: 3,
    created_ago: "5 saat önce",
  },
];


// ─────────────────────────────────────────────
// MOCK VERİ — DASHBOARD
// ─────────────────────────────────────────────

const MOCK_DASHBOARD = {
  summary: {
    active_listings: 3,
    incoming_offers: 7,
    monthly_earnings: 1240,
    avg_rating: 4.9,
    review_count: 23,
  },
  activity: [
    { color: "#4f46e5", text: "React projesi için yeni başvuru: <strong>Mehmet Y.</strong>",      time: "2 dk"  },
    { color: "#14b8a6", text: "Hizmet ilanına teklif: <strong>₺350 — Python Dersi</strong>",      time: "18 dk" },
    { color: "#a3e635", text: "Değerlendirme aldın: <strong>⭐ 5.0</strong> — UI Tasarım işi",    time: "2 sa"  },
    { color: "#f59e0b", text: "Skill matching: <strong>3 yeni proje</strong> sana uygun bulundu", time: "5 sa"  },
    { color: "#ff6b6b", text: "İhtiyaç ilanın kapandı: <strong>Figma Tasarım</strong>",           time: "1 gün" },
  ],
  notifications: [
    { title: "Proje başvurusu onaylandı", sub: "Mobil Uygulama projesine kabul edildin.",  badge: "Proje",  bg: "#eef2ff", color: "#4f46e5"  },
    { title: "Yeni mesaj",                sub: "Gökçe A. sana mesaj gönderdi.",            badge: "Mesaj",  bg: "#f0fdfa", color: "#0f766e"  },
    { title: "Teklif kabul edildi",       sub: "React ilanına verdiğin teklif onaylandı!", badge: "Teklif", bg: "#fffbeb", color: "#92400e"  },
    { title: "Skill matching güncellendi",sub: "5 yeni proje sana uygun bulundu.",         badge: "Öneri",  bg: "#f7fee7", color: "#3f6212"  },
    { title: "Admin duyurusu",            sub: "Platform güncellemesi yayınlandı.",         badge: "Sistem", bg: "#f5f3ff", color: "#6d28d9"  },
  ],
  projects: [
    { name: "Kampüs Yemek Uygulaması",    pct: 68, color: "#4f46e5" },
    { name: "Etkinlik Platformu Redesign", pct: 45, color: "#14b8a6" },
    { name: "NLP Yorum Analizi",           pct: 22, color: "#f59e0b" },
  ],
};


// ─────────────────────────────────────────────
// MOCK API — Backend hazır olunca bu dosyayı
// sil ve api.js'deki SH.* fonksiyonlarını kullan
// ─────────────────────────────────────────────

const MockAPI = {

  // Yapay gecikme — gerçek API davranışını simüle eder (ms)
  _delay: (ms = 400) => new Promise(r => setTimeout(r, ms)),

  services: {
    async list({ search = "", category = "", ordering = "" } = {}) {
      await MockAPI._delay();
      let items = [...MOCK_SERVICES];

      if (search) {
        const q = search.toLowerCase();
        items = items.filter(s =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      if (category && category !== "Tümü") {
        items = items.filter(s => s.category === category);
      }
      if (ordering === "price") {
        items.sort((a, b) => a.price - b.price);
      } else if (ordering === "-price") {
        items.sort((a, b) => b.price - a.price);
      } else if (ordering === "-avg_rating") {
        items.sort((a, b) => b.avg_rating - a.avg_rating);
      } else if (ordering === "-created_at") {
        items.sort((a, b) => b.id - a.id);
      }

      return { count: items.length, results: items };
    },

    async get(id) {
      await MockAPI._delay(200);
      return MOCK_SERVICES.find(s => s.id === Number(id)) || null;
    },
  },

  projects: {
    async list({ search = "", category = "" } = {}) {
      await MockAPI._delay();
      let items = [...MOCK_PROJECTS];

      if (search) {
        const q = search.toLowerCase();
        items = items.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.required_skills.some(s => s.toLowerCase().includes(q))
        );
      }
      if (category && category !== "Tümü") {
        items = items.filter(p => p.category === category);
      }

      return { count: items.length, results: items };
    },

    async get(id) {
      await MockAPI._delay(200);
      return MOCK_PROJECTS.find(p => p.id === Number(id)) || null;
    },

    async recommendations() {
      await MockAPI._delay(300);
      // Kullanıcının yeteneklerine göre ilk 3'ü öneri olarak döndür
      return { count: 3, results: MOCK_PROJECTS.slice(0, 3) };
    },
  },

  needs: {
    async list({ category = "" } = {}) {
      await MockAPI._delay();
      let items = [...MOCK_NEEDS];
      if (category && category !== "Tümü") {
        items = items.filter(n => n.category === category);
      }
      return { count: items.length, results: items };
    },
  },

  dashboard: {
    async getSummary() {
      await MockAPI._delay(300);
      return MOCK_DASHBOARD.summary;
    },
    async getActivity() {
      await MockAPI._delay(200);
      return MOCK_DASHBOARD.activity;
    },
    async getNotifications() {
      await MockAPI._delay(200);
      return MOCK_DASHBOARD.notifications;
    },
    async getProjectProgress() {
      await MockAPI._delay(200);
      return MOCK_DASHBOARD.projects;
    },
  },
};