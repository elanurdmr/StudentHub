/**
 * StudentHub — Ek Hizmet İlanları
 * Mevcut veriyi SİLMEDEN yeni ilanlar ekler.
 * Çalıştırmak için: node addServices.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Service from './models/Service.js';

async function addServices() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✔ MongoDB bağlantısı kuruldu\n');

  // Mevcut seed kullanıcılarını bul
  const [ayse, mehmet, zeynep, can, selin, emre, fatma, burak, elif, kaan, deniz, omer, merve] =
    await Promise.all([
      User.findOne({ email: 'ayse@example.com' }),
      User.findOne({ email: 'mehmet@example.com' }),
      User.findOne({ email: 'zeynep@example.com' }),
      User.findOne({ email: 'can@example.com' }),
      User.findOne({ email: 'selin@example.com' }),
      User.findOne({ email: 'emre@example.com' }),
      User.findOne({ email: 'fatma@example.com' }),
      User.findOne({ email: 'burak@example.com' }),
      User.findOne({ email: 'elif@example.com' }),
      User.findOne({ email: 'kaan@example.com' }),
      User.findOne({ email: 'deniz@example.com' }),
      User.findOne({ email: 'omer@example.com' }),
      User.findOne({ email: 'merve@example.com' }),
    ]);

  // SEO ilanının kategorisini düzelt (Danışmanlık → Diğer)
  if (kaan) {
    const fixed = await Service.updateOne(
      { owner: kaan._id, category: 'Danışmanlık' },
      { $set: { category: 'Diğer' } }
    );
    if (fixed.modifiedCount > 0) console.log('🔧 SEO ilanı kategorisi düzeltildi: Danışmanlık → Diğer');
  }

  const newServices = [
    /* ── FOTOĞRAF ── */
    {
      owner: mehmet?._id,
      title: 'LinkedIn & CV Profil Fotoğrafı Düzenleme',
      description:
        'Gönderdiğiniz fotoğrafı Photoshop ile profesyonel stüdyo kalitesine getiriyorum: arka plan temizleme, renk & ışık düzenlemesi, cilt rötuş. İş başvuruları ve LinkedIn profili için ideal.',
      category: 'Fotoğraf',
      price: 120,
      deliveryDays: 2,
      tags: ['fotoğraf', 'linkedin', 'cv', 'retuş'],
      rating: 4.8,
      reviewCount: 9,
      purchaseCount: 21,
    },
    {
      owner: omer?._id,
      title: 'Ürün Fotoğrafı Post-Production',
      description:
        'E-ticaret ürün fotoğraflarınızı beyaz arka plan kesme, gölge ekleme, renk kalibrasyonu ve toplu düzenleme ile satışa hazır hale getiriyorum.',
      category: 'Fotoğraf',
      price: 200,
      deliveryDays: 3,
      tags: ['ürün fotoğrafı', 'e-ticaret', 'photoshop'],
      rating: 4.7,
      reviewCount: 6,
      purchaseCount: 14,
    },

    /* ── MÜZİK ── */
    {
      owner: omer?._id,
      title: 'Podcast & YouTube Intro / Outro Jingle',
      description:
        'Kanalınıza veya podcast\'inize özel 5–15 saniyelik özgün jingle besteler, mikslayıp wav/mp3 olarak teslim ediyorum. Marka kimliğinize uygun tarz seçimi dahil.',
      category: 'Müzik',
      price: 280,
      deliveryDays: 4,
      tags: ['jingle', 'podcast', 'müzik', 'intro'],
      rating: 4.9,
      reviewCount: 11,
      purchaseCount: 18,
    },
    {
      owner: can?._id,
      title: 'Indie Oyun Ses Efektleri Paketi',
      description:
        'Unity veya Godot projeniz için zıplama, patlama, UI tıklama, ödül gibi 20+ adet ses efekti tasarlayıp teslim ediyorum. Lisans özgür, ticari kullanım dahil.',
      category: 'Müzik',
      price: 350,
      deliveryDays: 5,
      tags: ['ses efekti', 'oyun', 'unity', 'sfx'],
      rating: 4.6,
      reviewCount: 4,
      purchaseCount: 7,
    },

    /* ── ARAŞTIRMA ── */
    {
      owner: deniz?._id,
      title: 'Akademik Literatür Taraması & Özet Rapor',
      description:
        'Verdiğiniz konu için Google Scholar, Scopus ve PubMed taraması yapıp en güncel 15–20 makaleyi özetleyerek kaynakça dahil Türkçe/İngilizce rapor hazırlıyorum.',
      category: 'Araştırma',
      price: 400,
      deliveryDays: 5,
      tags: ['literatür', 'akademik', 'araştırma', 'rapor'],
      rating: 4.8,
      reviewCount: 8,
      purchaseCount: 13,
    },
    {
      owner: zeynep?._id,
      title: 'Anket Tasarımı & Online Veri Toplama',
      description:
        'Google Forms veya SurveyMonkey\'de akademik/ticari anket tasarlıyorum; soru yapısı, Likert ölçek kurgusu ve ön test dahil. İstenirse veri toplama süreci yönetimi de yapıyorum.',
      category: 'Araştırma',
      price: 250,
      deliveryDays: 3,
      tags: ['anket', 'google forms', 'araştırma', 'likert'],
      rating: 4.7,
      reviewCount: 5,
      purchaseCount: 9,
    },

    /* ── YAPAY ZEKA ── */
    {
      owner: zeynep?._id,
      title: 'ChatGPT & Claude Prompt Mühendisliği',
      description:
        'İş süreçlerinizi, içerik üretimini veya kod asistanlığını otomatize etmek için özel system prompt ve few-shot örnek seti hazırlıyorum. 3 revizyon hakkı dahil.',
      category: 'Yapay Zeka',
      price: 450,
      deliveryDays: 4,
      tags: ['prompt', 'chatgpt', 'ai', 'otomasyon'],
      rating: 4.9,
      reviewCount: 14,
      purchaseCount: 31,
    },
    {
      owner: ayse?._id,
      title: 'OpenAI API ile Özel Chatbot Entegrasyonu',
      description:
        'Mevcut web sitenize veya Discord/Telegram botunuza OpenAI API bağlayarak kendi eğitim verilerinizle yanıt veren bir chatbot kuruyorum. Node.js veya Python backend dahil.',
      category: 'Yapay Zeka',
      price: 1100,
      deliveryDays: 10,
      tags: ['chatbot', 'openai', 'api', 'entegrasyon'],
      rating: 4.8,
      reviewCount: 7,
      purchaseCount: 11,
    },

    /* ── OYUN ── */
    {
      owner: can?._id,
      title: '2D Karakter & Sprite Sheet Tasarımı',
      description:
        'Indie oyununuz için idle, run, jump, attack animasyonlarını içeren 2D karakter sprite sheet tasarlıyorum. Unity ve Godot için optimize PNG + Aseprite kaynak dosyası teslim.',
      category: 'Oyun',
      price: 600,
      deliveryDays: 8,
      tags: ['sprite', '2d', 'oyun', 'pixel art'],
      rating: 4.7,
      reviewCount: 6,
      purchaseCount: 10,
    },
    {
      owner: burak?._id,
      title: 'Oyun Güvenlik & Anti-Cheat Danışmanlığı',
      description:
        'Multiplayer oyununuzun sunucu tarafı doğrulama açıklarını, hile vektörlerini ve ağ paket manipülasyonunu test ederek rapor hazırlıyorum.',
      category: 'Oyun',
      price: 900,
      deliveryDays: 7,
      tags: ['anti-cheat', 'güvenlik', 'multiplayer', 'pentest'],
      rating: 4.5,
      reviewCount: 3,
      purchaseCount: 5,
    },

    /* ── MOBİL ── */
    {
      owner: fatma?._id,
      title: 'App Store & Google Play Optimizasyonu (ASO)',
      description:
        'Uygulamanızın mağaza sayfasını başlık, açıklama, anahtar kelime ve ekran görüntüsü stratejisiyle optimize ederek organik indirme sayısını artırıyorum.',
      category: 'Mobil',
      price: 380,
      deliveryDays: 4,
      tags: ['aso', 'app store', 'google play', 'mobil'],
      rating: 4.6,
      reviewCount: 5,
      purchaseCount: 12,
    },
    {
      owner: selin?._id,
      title: 'Mobil Uygulama UI Tasarımı (Figma)',
      description:
        'iOS veya Android uygulamanız için Material Design / Human Interface Guidelines uyumlu tam ekran Figma tasarımı: wireframe, görsel tasarım ve tıklanabilir prototip.',
      category: 'Mobil',
      price: 750,
      deliveryDays: 9,
      tags: ['figma', 'mobil', 'ui', 'ios', 'android'],
      rating: 4.9,
      reviewCount: 10,
      purchaseCount: 17,
    },

    /* ── SOSYAL GİRİŞİM ── */
    {
      owner: elif?._id,
      title: 'STK & Sosyal Girişim için Hibe Başvuru Metni',
      description:
        'Avrupa Gençlik Vakfı, TÜBİTAK veya AB hibeleri için İngilizce/Türkçe başvuru formu ve proje özeti yazıyorum. Daha önce kabul edilen başvuru şablonları referans alınır.',
      category: 'Sosyal Girişim',
      price: 550,
      deliveryDays: 6,
      tags: ['hibe', 'stk', 'sosyal girişim', 'ab'],
      rating: 4.9,
      reviewCount: 7,
      purchaseCount: 9,
    },
    {
      owner: deniz?._id,
      title: 'Sosyal Etki Ölçüm Raporu (Theory of Change)',
      description:
        'Girişiminizin paydaşlar, çıktılar ve uzun vadeli etki zincirini Theory of Change metodolojisiyle raporluyorum. Yatırımcı sunumu ve hibe başvurusu için uygun formatta.',
      category: 'Sosyal Girişim',
      price: 480,
      deliveryDays: 7,
      tags: ['sosyal etki', 'theory of change', 'rapor', 'stk'],
      rating: 4.7,
      reviewCount: 4,
      purchaseCount: 6,
    },

    /* ── MEVCUT KATEGORİLERE EK ── */
    {
      owner: emre?._id,
      title: 'PostgreSQL Veritabanı Tasarımı & Optimizasyonu',
      description:
        'Projeniz için normalize edilmiş şema tasarlıyor, indeks stratejisi belirliyor ve yavaş sorguları analiz edip optimize ediyorum. ERD diyagramı teslim dahil.',
      category: 'Yazılım',
      price: 700,
      deliveryDays: 6,
      tags: ['postgresql', 'veritabanı', 'sql', 'optimizasyon'],
      rating: 4.7,
      reviewCount: 5,
      purchaseCount: 8,
    },
    {
      owner: ayse?._id,
      title: 'Next.js Full-Stack Web Sitesi',
      description:
        'Next.js 14 App Router, Tailwind CSS ve MongoDB ile SEO dostu, hızlı ve responsive web sitesi geliştiriyorum. Vercel\'e deploy dahil.',
      category: 'Yazılım',
      price: 1500,
      deliveryDays: 18,
      tags: ['next.js', 'full-stack', 'tailwind', 'vercel'],
      rating: 4.9,
      reviewCount: 8,
      purchaseCount: 13,
    },
    {
      owner: merve?._id,
      title: 'Akademik Poster & Sunum Tasarımı',
      description:
        'Konferans veya sempozyum için bilimsel poster ve PowerPoint / Keynote sunum şablonu tasarlıyorum. Üniversite kurumsal kimliğine uygunluk sağlanır.',
      category: 'Tasarım',
      price: 300,
      deliveryDays: 4,
      tags: ['poster', 'sunum', 'powerpoint', 'akademik'],
      rating: 4.6,
      reviewCount: 7,
      purchaseCount: 15,
    },
    {
      owner: zeynep?._id,
      title: 'Makine Öğrenmesi Modeli Kurma & Eğitim',
      description:
        'Scikit-learn veya PyTorch ile sınıflandırma, regresyon veya kümeleme modeli kuruyorum. Veri ön işleme, model eğitimi, doğruluk metrikleri ve Jupyter Notebook raporu dahil.',
      category: 'Yapay Zeka',
      price: 850,
      deliveryDays: 8,
      tags: ['machine learning', 'scikit-learn', 'pytorch', 'python'],
      rating: 4.8,
      reviewCount: 9,
      purchaseCount: 16,
    },
    {
      owner: kaan?._id,
      title: 'Google Ads & Meta Reklam Kampanyası Kurulumu',
      description:
        'Hedef kitle analizi, reklam metni yazımı, bütçe optimizasyonu ve A/B testi ile Google ve Instagram/Facebook reklam kampanyanızı kurarak yönetiyorum.',
      category: 'Diğer',
      price: 600,
      deliveryDays: 5,
      tags: ['google ads', 'meta', 'reklam', 'dijital pazarlama'],
      rating: 4.5,
      reviewCount: 6,
      purchaseCount: 11,
    },
    {
      owner: elif?._id,
      title: 'Teknik Yazılım Dökümantasyonu Çevirisi (EN↔TR)',
      description:
        'API dökümantasyonu, README dosyası, kullanım kılavuzu gibi teknik içerikleri doğal ve tutarlı bir dille İngilizce↔Türkçe çeviriyorum.',
      category: 'Çeviri',
      price: 220,
      deliveryDays: 3,
      tags: ['çeviri', 'teknik', 'dökümantasyon', 'ingilizce'],
      rating: 4.9,
      reviewCount: 12,
      purchaseCount: 24,
    },
  ].filter((s) => s.owner); // Kullanıcı bulunamazsa o ilanı atla

  const inserted = await Service.insertMany(newServices);
  console.log(`✅ ${inserted.length} yeni hizmet ilanı eklendi.\n`);

  const total = await Service.countDocuments();
  console.log(`📦 Toplam hizmet ilanı: ${total}`);

  await mongoose.disconnect();
}

addServices().catch((err) => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
