/**
 * StudentHub — Ek İhtiyaç İlanları
 * Mevcut veriyi SİLMEDEN yeni ihtiyaçlar ekler.
 * Çalıştırmak için: node addNeeds.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Need from './models/Need.js';

async function addNeeds() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✔ MongoDB bağlantısı kuruldu\n');

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

  const soon = (days) => new Date(Date.now() + days * 24 * 3600 * 1000);

  const newNeeds = [
    /* ── TASARIM ── */
    {
      owner: ayse?._id,
      title: 'Mobil Uygulama için Onboarding Ekranları Tasarımı',
      description: 'Geliştirdiğim sağlık takip uygulaması için 4-5 ekranlık onboarding akışı lazım. Figma\'da teslim edilmeli, renkler mevcut marka kitine uymalı.',
      category: 'Tasarım',
      budget: 350,
      deadline: soon(10),
      tags: ['figma', 'ui', 'onboarding', 'mobil'],
      status: 'open',
    },
    {
      owner: emre?._id,
      title: 'API Dökümantasyonu için İllüstrasyon Seti',
      description: 'Açık kaynak kütüphanemizin dökümantasyon sitesinde kullanmak üzere 8-10 adet teknik konsepti anlatan flat-style SVG illüstrasyon istiyorum.',
      category: 'Tasarım',
      budget: 500,
      deadline: soon(14),
      tags: ['illüstrasyon', 'svg', 'teknik', 'dökümantasyon'],
      status: 'open',
    },
    {
      owner: kaan?._id,
      title: 'Sosyal Medya İçerik Şablonları (Instagram & LinkedIn)',
      description: 'Ajansımız için Canva veya Figma\'da 10 adet yeniden kullanılabilir post şablonu. Marka renkleri ve font dosyaları tarafımca sağlanacak.',
      category: 'Tasarım',
      budget: 280,
      deadline: soon(7),
      tags: ['sosyal medya', 'canva', 'figma', 'şablon'],
      status: 'open',
    },

    /* ── YAZILIM ── */
    {
      owner: zeynep?._id,
      title: 'Python FastAPI ile ML Model Servisi',
      description: 'Eğittiğim PyTorch modelini REST API olarak sunacak FastAPI servisi lazım. Docker ile containerize edilmesi ve basit bir test endpoint\'i de dahil olmalı.',
      category: 'Yazılım',
      budget: 600,
      deadline: soon(8),
      tags: ['fastapi', 'python', 'docker', 'machine learning'],
      status: 'open',
    },
    {
      owner: can?._id,
      title: 'Discord Botu — Oyun Sunucusu Yönetim Sistemi',
      description: 'Discord.js ile yazılmış oyun sunucusu için rol atama, hoş geldin mesajı, moderasyon komutları ve basit bir puanlama sistemi içeren bot istiyorum.',
      category: 'Yazılım',
      budget: 400,
      deadline: soon(6),
      tags: ['discord', 'bot', 'node.js', 'javascript'],
      status: 'open',
    },
    {
      owner: fatma?._id,
      title: 'Flutter Uygulamasına Stripe Ödeme Entegrasyonu',
      description: 'Mevcut Flutter projeme Stripe ödeme ekranı eklemem gerekiyor. Tek seferlik ödeme ve abonelik akışı dahil, test modu çalışıyor olmalı.',
      category: 'Yazılım',
      budget: 750,
      deadline: soon(12),
      tags: ['flutter', 'stripe', 'ödeme', 'mobil'],
      status: 'open',
    },
    {
      owner: selin?._id,
      title: 'Chrome Eklentisi — Sayfa Okuma Süresi Hesaplayıcı',
      description: 'Ziyaret ettiğim her sayfanın tahmini okuma süresini hesaplayıp toolbar\'da gösteren, isteğe bağlı istatistik kaydeden basit Chrome extension istiyorum.',
      category: 'Yazılım',
      budget: 300,
      deadline: soon(9),
      tags: ['chrome extension', 'javascript', 'manifest v3'],
      status: 'open',
    },

    /* ── AKADEMİK ── */
    {
      owner: merve?._id,
      title: 'Endüstriyel Tasarım Bitirme Tezi Yazım Desteği',
      description: 'Tamamladığım ürün tasarımı projesinin akademik tez formatına dönüştürülmesi gerekiyor. APA atıf sistemi, bölüm yapısı ve dil düzenlemesi dahil.',
      category: 'Akademik',
      budget: 450,
      deadline: soon(20),
      tags: ['tez', 'akademik yazım', 'apa', 'tasarım'],
      status: 'open',
    },
    {
      owner: burak?._id,
      title: 'Siber Güvenlik Sertifika Sınavı (CEH) Ders Notu',
      description: 'CEH sınavına hazırlık için konuları düzenli, anlaşılır şekilde özetleyen Türkçe ders notu seti lazım. PDF olarak teslim edilebilir.',
      category: 'Akademik',
      budget: 200,
      deadline: soon(15),
      tags: ['siber güvenlik', 'ceh', 'sertifika', 'ders notu'],
      status: 'open',
    },

    /* ── ÇEVİRİ ── */
    {
      owner: zeynep?._id,
      title: 'Makine Öğrenmesi Makalesi Türkçe → İngilizce',
      description: 'Yazdığım 6000 kelimelik Türkçe araştırma makalesini akademik İngilizceye çevrilmesi gerekiyor. NLP terminolojisine hâkim biri olmalı.',
      category: 'Çeviri',
      budget: 550,
      deadline: soon(11),
      tags: ['çeviri', 'makale', 'ingilizce', 'akademik'],
      status: 'open',
    },
    {
      owner: can?._id,
      title: 'Unity Oyun Arayüzü Lokalizasyonu (TR → EN + DE)',
      description: 'Oyunumuzdaki ~800 kelimelik UI metni ve diyalogların İngilizce ve Almancaya çevrilmesi lazım. Oyun bağlamına uygun, doğal bir dil bekliyoruz.',
      category: 'Çeviri',
      budget: 480,
      deadline: soon(13),
      tags: ['lokalizasyon', 'oyun', 'ingilizce', 'almanca'],
      status: 'open',
    },

    /* ── FOTOĞRAF ── */
    {
      owner: kaan?._id,
      title: 'Ürün Kataloğu Fotoğraf Çekimi (20 Ürün)',
      description: 'El yapımı takı markamız için 20 farklı ürünün beyaz fon üzerinde, yüksek çözünürlüklü e-ticaret fotoğrafları lazım. Stüdyo gerekli.',
      category: 'Fotoğraf',
      budget: 700,
      deadline: soon(16),
      tags: ['ürün fotoğrafı', 'stüdyo', 'e-ticaret', 'takı'],
      status: 'open',
    },
    {
      owner: selin?._id,
      title: 'Mezuniyet / Portfolyo Portre Çekimi',
      description: 'Mezuniyet ve iş başvurusu için profesyonel portre fotoğraf çekimi istiyorum. İstanbul\'da stüdyo veya dış mekân olabilir, düzenleme dahil 10 kare yeterli.',
      category: 'Fotoğraf',
      budget: 300,
      deadline: soon(20),
      tags: ['portre', 'mezuniyet', 'fotoğraf'],
      status: 'open',
    },

    /* ── VİDEO ── */
    {
      owner: ayse?._id,
      title: 'Uygulama Tanıtım Videosu (60 saniye)',
      description: 'Mobil uygulamamız için ekran kayıtları ve motion graphics kullanılarak hazırlanmış 60 saniyelik App Store / sosyal medya tanıtım videosu istiyorum.',
      category: 'Video',
      budget: 650,
      deadline: soon(10),
      tags: ['tanıtım', 'mobil', 'motion graphics', 'app store'],
      status: 'open',
    },
    {
      owner: emre?._id,
      title: 'Teknik Eğitim Videosu — Spring Boot API',
      description: 'Spring Boot ile REST API geliştirme konusunda 3-4 bölümlük ekran kaydı eğitim videosu lazım. Seslendirme ve alt yazı dahil olmalı.',
      category: 'Video',
      budget: 800,
      deadline: soon(18),
      tags: ['eğitim', 'spring boot', 'ekran kaydı', 'youtube'],
      status: 'open',
    },

    /* ── MÜZİK ── */
    {
      owner: omer?._id,
      title: 'Kısa Film İçin Arka Plan Müziği',
      description: 'Üniversite bitirme projesi kısa filmim için 3 farklı sahneye uygun arka plan müziği lazım. Toplam ~4 dakika, telif hakkı sorunsuz olmalı.',
      category: 'Müzik',
      budget: 350,
      deadline: soon(14),
      tags: ['film müziği', 'arka plan', 'kısa film', 'telif'],
      status: 'open',
    },
    {
      owner: burak?._id,
      title: 'Podcast Serisi için Jingle & Intro Sesi',
      description: 'Siber güvenlik temalı podcast serim için 15 saniyelik açılış jingle\'ı ve geçiş müziği lazım. Atmosferik, teknoloji temalı bir his bekliyoruz.',
      category: 'Müzik',
      budget: 250,
      deadline: soon(8),
      tags: ['podcast', 'jingle', 'intro', 'müzik'],
      status: 'open',
    },

    /* ── ARAŞTIRMA ── */
    {
      owner: fatma?._id,
      title: 'Flutter Uygulama Kullanılabilirlik Testi',
      description: 'Geliştirdiğim sağlık uygulamasının 10-15 kullanıcıyla düzenlenmesini istediğim kullanılabilirlik testi ve UX analiz raporu lazım.',
      category: 'Araştırma',
      budget: 400,
      deadline: soon(12),
      tags: ['kullanılabilirlik', 'ux', 'test', 'flutter'],
      status: 'open',
    },
    {
      owner: elif?._id,
      title: 'Türkiye Freelance Pazarı Rekabet Analizi',
      description: 'Freelance platform kurmayı planlıyorum. Türkiye\'deki mevcut platformları (Bionluk, Fiverr TR kullanımı vb.) karşılaştıran pazar araştırması raporu lazım.',
      category: 'Araştırma',
      budget: 500,
      deadline: soon(17),
      tags: ['pazar araştırması', 'rekabet analizi', 'freelance', 'türkiye'],
      status: 'open',
    },

    /* ── YAPAY ZEKA ── */
    {
      owner: kaan?._id,
      title: 'İçerik Üretimi için GPT Prompt Sistemi',
      description: 'Blog yazısı, ürün açıklaması ve sosyal medya içeriği üretmek için optimize edilmiş system prompt ve few-shot örnek seti oluşturulmasını istiyorum.',
      category: 'Yapay Zeka',
      budget: 300,
      deadline: soon(6),
      tags: ['gpt', 'prompt', 'içerik', 'pazarlama'],
      status: 'open',
    },
    {
      owner: deniz?._id,
      title: 'Anket Verisi için Otomatik Raporlama Scripti',
      description: 'Google Forms verilerini çekip R veya Python ile otomatik grafik ve özet tablo oluşturan, PDF rapor döken bir script lazım. Aylık tekrarlayan çalışacak.',
      category: 'Yapay Zeka',
      budget: 450,
      deadline: soon(9),
      tags: ['otomasyon', 'python', 'r', 'raporlama'],
      status: 'open',
    },

    /* ── MOBİL ── */
    {
      owner: merve?._id,
      title: 'Tasarım Portfolyo Uygulaması (iOS)',
      description: 'SolidWorks ve AutoCAD projelerimi sergileyen sade, hızlı bir iOS portfolyo uygulaması lazım. SwiftUI ile native geliştirme tercih ederim.',
      category: 'Mobil',
      budget: 900,
      deadline: soon(21),
      tags: ['ios', 'swiftui', 'portfolyo', 'tasarım'],
      status: 'open',
    },

    /* ── SOSYAL GİRİŞİM ── */
    {
      owner: elif?._id,
      title: 'Gönüllü Koordinasyon Web Sitesi',
      description: 'Yönettiğim STK için gönüllülerin etkinliklere kayıt olabileceği, profil oluşturabileceği basit bir web sitesi lazım. WordPress veya sıfırdan olabilir.',
      category: 'Sosyal Girişim',
      budget: 600,
      deadline: soon(25),
      tags: ['stk', 'gönüllü', 'web sitesi', 'wordpress'],
      status: 'open',
    },
  ].filter((n) => n.owner);

  const inserted = await Need.insertMany(newNeeds);
  console.log(`✅ ${inserted.length} yeni ihtiyaç ilanı eklendi.\n`);

  const total = await Need.countDocuments();
  console.log(`📋 Toplam ihtiyaç ilanı: ${total}`);

  await mongoose.disconnect();
}

addNeeds().catch((err) => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
