# StudentHub

Öğrenciler arası hizmet pazarı, proje ekip kurma ve ihtiyaç ilanı platformu.
**YM304 Projesi**

---

## Projeyi Çalıştırmak

Bu proje iki parçadan oluşuyor: **frontend** ve **backend**.
Frontend tek başına da çalışır (sahte veriyle). Backend için MongoDB gerekiyor.

---

## 1. Sadece Frontend (Hızlı Başlangıç)

Backend kurmak istemiyorsan sadece frontend'i çalıştırabilirsin.
Sayfalar sahte veriyle dolu gelir, kayıt/giriş da çalışır.

**Node.js kurulu olması gerekiyor** → https://nodejs.org (LTS sürümü indir)

```bash
cd studenthub/frontend
npm install
npm run dev
```

Tarayıcıda aç: **http://localhost:5173**

---

## 2. Frontend + Backend (Tam Kurulum)

### Adım 1 — Node.js kur
https://nodejs.org → LTS sürümünü indir ve kur.

### Adım 2 — MongoDB kur
https://www.mongodb.com/try/download/community → kendi işletim sistemine göre indir ve kur.

Kurulum bittikten sonra MongoDB'yi başlat:
- **Windows**: Kurulum sırasında "Install MongoDB as a Service" seçeneği işaretliyse otomatik başlar.
- **Mac**: Terminalde `brew services start mongodb-community` yaz.
- **Manuel başlatma**: `mongod` komutunu ayrı bir terminalde çalıştır.

### Adım 3 — Backend'i başlat
```bash
cd studenthub/backend
npm install
npm run dev
```
Terminal şunu göstermeli:
```
MongoDB bağlantısı kuruldu
Sunucu http://localhost:8000 adresinde çalışıyor
```

### Adım 4 — Frontend'i başlat (yeni bir terminal aç)
```bash
cd studenthub/frontend
npm install
npm run dev
```

Tarayıcıda aç: **http://localhost:5173**

---

## Klasör Yapısı

```
studenthub/
├── frontend/    → React uygulaması (Vite)
└── backend/     → Node.js API sunucusu (Express + MongoDB)
```

---

## Sayfalar

| Sayfa | Adres |
|-------|-------|
| Ana Sayfa | / |
| Giriş / Kayıt | /auth |
| Kullanıcı Paneli | /dashboard |
| Hizmet Pazarı | /market |
| Proje İlanları | /projects |
| İhtiyaç İlanları | /needs |
| İlan Oluştur | /create |
| Mesajlaşma | /messages |
| Bildirimler | /notifications |
| Profil | /profile/:id |
| Admin Paneli | /admin |

---

## Sık Karşılaşılan Hatalar

**`npm: command not found`**
→ Node.js kurulu değil. https://nodejs.org adresinden indir.

**`npm install` çalışmıyor**
→ Doğru klasörde olduğundan emin ol. `studenthub/frontend` veya `studenthub/backend` klasöründe olmalısın.

**Backend başlamıyor / MongoDB hatası**
→ MongoDB çalışmıyor olabilir. `mongod` komutunu ayrı bir terminalde çalıştır.

**Sayfa açılıyor ama veri gelmiyor**
→ Backend çalışmıyorsa sorun yok, sahte veriyle çalışmaya devam eder.

---

## Teknolojiler

| | Teknoloji |
|-|-----------|
| Frontend | React 18, Vite, React Router, Zustand |
| Backend | Node.js, Express, Socket.io, JWT |
| Veritabanı | MongoDB |
| Gerçek Zamanlı | Socket.io (mesajlaşma, bildirimler) |
