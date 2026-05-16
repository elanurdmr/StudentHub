
/**
 * StudentHub — Genişletilmiş Veritabanı Seed Scripti
 * Çalıştırmak için: npm run seed
 *
 * Toplam ~135+ kayıt, 16 koleksiyon
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Service from './models/Service.js';
import Project from './models/Project.js';
import Need from './models/Need.js';
import Application from './models/Application.js';
import Offer from './models/Offer.js';
import Review from './models/Review.js';
import Message from './models/Message.js';
import Notification from './models/Notification.js';
import Favorite from './models/Favorite.js';
import Report from './models/Report.js';
import ServiceOrder from './models/ServiceOrder.js';
import AdminLog from './models/AdminLog.js';
import UserStatistics from './models/UserStatistics.js';
import SearchHistory from './models/SearchHistory.js';
import OneriLog from './models/OneriLog.js';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✔ MongoDB bağlantısı kuruldu\n');

  /* ── Tüm koleksiyonları temizle ── */
  await Promise.all([
    User.deleteMany({}),
    Service.deleteMany({}),
    Project.deleteMany({}),
    Need.deleteMany({}),
    Application.deleteMany({}),
    Offer.deleteMany({}),
    Review.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
    Favorite.deleteMany({}),
    Report.deleteMany({}),
    ServiceOrder.deleteMany({}),
    AdminLog.deleteMany({}),
    UserStatistics.deleteMany({}),
    SearchHistory.deleteMany({}),
    OneriLog.deleteMany({}),
  ]);
  console.log('🗑  Mevcut veriler temizlendi\n');

  /* ───────────────────────────────────────────────────────
   * 1. USERS (14 kayıt — 1 admin + 13 kullanıcı)
   * ─────────────────────────────────────────────────────── */
  const pw = await bcrypt.hash('Test1234!', 10);

  const users = await User.insertMany([
    {
      firstName: 'Admin',
      lastName: 'Demir',
      email: 'admin@studenthub.com',
      password: pw,
      role: 'admin',
      bio: 'Platform yöneticisi.',
      skills: [{ name: 'Yönetim', level: 'expert' }],
      rating: 5,
      reviewCount: 0,
    },
    {
      firstName: 'Ayşe',
      lastName: 'Kaya',
      email: 'ayse@example.com',
      password: pw,
      bio: 'Bilgisayar Mühendisliği 3. sınıf öğrencisi. React ve Node.js geliştirici.',
      skills: [
        { name: 'React', level: 'expert' },
        { name: 'Node.js', level: 'intermediate' },
        { name: 'Figma', level: 'beginner' },
        { name: 'Python', level: 'intermediate' },
      ],
      rating: 4.8,
      reviewCount: 12,
      portfolio: [
        {
          title: 'E-Ticaret Sitesi',
          description: 'React ile geliştirdiğim tam kapsamlı e-ticaret projesi.',
          url: 'https://github.com/ayse/ecommerce',
        },
      ],
    },
    {
      firstName: 'Mehmet',
      lastName: 'Demir',
      email: 'mehmet@example.com',
      password: pw,
      bio: 'Grafik tasarımcı. Adobe Creative Suite uzmanı.',
      skills: [
        { name: 'Photoshop', level: 'expert' },
        { name: 'Illustrator', level: 'expert' },
        { name: 'InDesign', level: 'intermediate' },
      ],
      rating: 4.5,
      reviewCount: 8,
    },
    {
      firstName: 'Zeynep',
      lastName: 'Arslan',
      email: 'zeynep@example.com',
      password: pw,
      bio: 'Yapay zeka araştırmacısı. TensorFlow ve PyTorch deneyimi.',
      skills: [
        { name: 'Python', level: 'expert' },
        { name: 'ML', level: 'expert' },
        { name: 'TensorFlow', level: 'intermediate' },
        { name: 'PyTorch', level: 'intermediate' },
      ],
      rating: 4.9,
      reviewCount: 21,
    },
    {
      firstName: 'Can',
      lastName: 'Yıldız',
      email: 'can@example.com',
      password: pw,
      bio: 'Oyun geliştirici. Unity ve Unreal Engine deneyimi.',
      skills: [
        { name: 'Unity', level: 'expert' },
        { name: 'C#', level: 'intermediate' },
        { name: 'Blender', level: 'beginner' },
      ],
      rating: 4.2,
      reviewCount: 5,
    },
    {
      firstName: 'Selin',
      lastName: 'Öztürk',
      email: 'selin@example.com',
      password: pw,
      bio: 'Frontend geliştirici ve UI/UX tasarımcı. Vue.js uzmanı.',
      skills: [
        { name: 'Vue.js', level: 'expert' },
        { name: 'CSS', level: 'expert' },
        { name: 'Figma', level: 'intermediate' },
      ],
      rating: 4.7,
      reviewCount: 15,
      portfolio: [
        {
          title: 'Üniversite Portalı Tasarımı',
          description: 'Vue.js ile geliştirdiğim üniversite öğrenci portalı.',
          url: 'https://github.com/selin/uni-portal',
        },
      ],
    },
    {
      firstName: 'Emre',
      lastName: 'Çelik',
      email: 'emre@example.com',
      password: pw,
      bio: 'Backend geliştirici. Java ve Spring Boot uzmanı.',
      skills: [
        { name: 'Java', level: 'expert' },
        { name: 'Spring Boot', level: 'expert' },
        { name: 'PostgreSQL', level: 'intermediate' },
      ],
      rating: 4.6,
      reviewCount: 9,
    },
    {
      firstName: 'Fatma',
      lastName: 'Şahin',
      email: 'fatma@example.com',
      password: pw,
      bio: 'Mobil uygulama geliştirici. Flutter ve Swift.',
      skills: [
        { name: 'Flutter', level: 'expert' },
        { name: 'Swift', level: 'intermediate' },
        { name: 'Firebase', level: 'intermediate' },
      ],
      rating: 4.3,
      reviewCount: 6,
    },
    // ── YENİ EKLENEN KULLANICILAR ──
    {
      firstName: 'Burak',
      lastName: 'Yılmaz',
      email: 'burak@example.com',
      password: pw,
      bio: 'Siber Güvenlik ve Ağ Uzmanı. Sızma testleri ve Linux aşığı.',
      skills: [
        { name: 'Sızma Testi', level: 'expert' },
        { name: 'Linux', level: 'expert' },
        { name: 'CyberSecurity', level: 'intermediate' },
      ],
      rating: 4.4,
      reviewCount: 4,
    },
    {
      firstName: 'Elif',
      lastName: 'Aydın',
      email: 'elif@example.com',
      password: pw,
      bio: 'Mütercim Tercümanlık öğrencisi. Teknik ve akademik İngilizce/Almanca çeviri.',
      skills: [
        { name: 'İngilizce Çeviri', level: 'expert' },
        { name: 'Almanca Çeviri', level: 'intermediate' },
      ],
      rating: 4.9,
      reviewCount: 19,
    },
    {
      firstName: 'Kaan',
      lastName: 'Bulut',
      email: 'kaan@example.com',
      password: pw,
      bio: 'SEO ve Dijital Pazarlama Danışmanı. Google Analytics uzmanı.',
      skills: [
        { name: 'SEO', level: 'expert' },
        { name: 'Google Analytics', level: 'intermediate' },
        { name: 'Content Writing', level: 'expert' },
      ],
      rating: 4.6,
      reviewCount: 11,
    },
    {
      firstName: 'Deniz',
      lastName: 'Güneş',
      email: 'deniz@example.com',
      password: pw,
      bio: 'İstatistik ve Veri Bilimi öğrencisi. R ve SPSS analisti.',
      skills: [
        { name: 'R', level: 'expert' },
        { name: 'SPSS', level: 'expert' },
        { name: 'Veri Analizi', level: 'intermediate' },
      ],
      rating: 4.7,
      reviewCount: 7,
    },
    {
      firstName: 'Ömer',
      lastName: 'Koç',
      email: 'omer@example.com',
      password: pw,
      bio: 'Video Editörü ve Animasyon Sanatçısı. After Effects ve Premiere Pro.',
      skills: [
        { name: 'Premiere Pro', level: 'expert' },
        { name: 'After Effects', level: 'expert' },
        { name: 'Video Editing', level: 'expert' },
      ],
      rating: 4.8,
      reviewCount: 14,
    },
    {
      firstName: 'Merve',
      lastName: 'Yurt',
      email: 'merve@example.com',
      password: pw,
      bio: 'Endüstriyel Tasarım ve 3D Modelleme öğrencisi. SolidWorks ve AutoCAD.',
      skills: [
        { name: 'SolidWorks', level: 'expert' },
        { name: 'AutoCAD', level: 'intermediate' },
        { name: '3D Modeling', level: 'expert' },
      ],
      rating: 4.5,
      reviewCount: 3,
    },
  ]);

  const [admin, ayse, mehmet, zeynep, can, selin, emre, fatma, burak, elif, kaan, deniz, omer, merve] = users;
  console.log(`👤 ${users.length} kullanıcı oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 2. SERVICES (12 kayıt)
   * ─────────────────────────────────────────────────────── */
  const services = await Service.insertMany([
    {
      owner: mehmet._id,
      title: 'Profesyonel Logo Tasarımı',
      description: 'Markanıza özel, özgün ve modern logo tasarımı yapıyorum. Vektör formatında teslim edilir.',
      category: 'Tasarım',
      price: 350,
      deliveryDays: 5,
      tags: ['logo', 'marka', 'vektör'],
      rating: 4.9,
      reviewCount: 34,
      purchaseCount: 67,
    },
    {
      owner: ayse._id,
      title: 'React Web Uygulaması Geliştirme',
      description: 'React ile modern, hızlı ve mobil uyumlu web uygulamaları geliştiriyorum.',
      category: 'Yazılım',
      price: 1200,
      deliveryDays: 14,
      tags: ['react', 'frontend', 'javascript'],
      rating: 4.8,
      reviewCount: 18,
      purchaseCount: 29,
    },
    {
      owner: zeynep._id,
      title: 'Python ile Veri Analizi ve Görselleştirme',
      description: 'Pandas, NumPy ve Matplotlib kullanarak verilerinizi analiz ediyor, grafikler hazırlıyorum.',
      category: 'Akademik',
      price: 500,
      deliveryDays: 7,
      tags: ['python', 'veri', 'analiz'],
      rating: 4.7,
      reviewCount: 11,
      purchaseCount: 22,
    },
    {
      owner: can._id,
      title: 'Unity 2D/3D Oyun Geliştirme',
      description: '2D ve 3D Unity oyunları geliştiriyorum. Mobil ve PC platformları için optimize edilmiş.',
      category: 'Yazılım',
      price: 1800,
      deliveryDays: 21,
      tags: ['unity', 'oyun', 'c#'],
      rating: 4.5,
      reviewCount: 7,
      purchaseCount: 12,
    },
    {
      owner: selin._id,
      title: 'UI/UX Tasarım & Figma Prototip',
      description: 'Kullanıcı dostu arayüz tasarımı ve tıklanabilir Figma prototipleri oluşturuyorum.',
      category: 'Tasarım',
      price: 650,
      deliveryDays: 10,
      tags: ['figma', 'ui', 'ux'],
      rating: 4.9,
      reviewCount: 23,
      purchaseCount: 41,
    },
    {
      owner: emre._id,
      title: 'Spring Boot REST API Geliştirme',
      description: 'Kurumsal düzeyde Spring Boot ile güvenli, ölçeklenebilir REST API geliştirme.',
      category: 'Yazılım',
      price: 2000,
      deliveryDays: 20,
      tags: ['java', 'spring', 'api'],
      rating: 4.6,
      reviewCount: 9,
      purchaseCount: 15,
    },
    {
      owner: fatma._id,
      title: 'Flutter Cross-Platform Mobil Uygulama',
      description: 'iOS ve Android için tek kod tabanıyla Flutter ile mobil uygulama geliştiriyorum.',
      category: 'Yazılım',
      price: 2500,
      deliveryDays: 30,
      tags: ['flutter', 'mobil', 'ios'],
      rating: 4.3,
      reviewCount: 6,
      purchaseCount: 8,
    },
    // ── YENİ EKLENEN HİZMETLER ──
    {
      owner: burak._id,
      title: 'Sızma Testi ve Güvenlik Analizi',
      description: 'Web sitenizin veya API katmanınızın güvenlik açıklarını test ediyor, siber rapor sunuyorum.',
      category: 'Yazılım',
      price: 1500,
      deliveryDays: 7,
      tags: ['cybersecurity', 'pentest', 'güvenlik'],
      rating: 4.5,
      reviewCount: 4,
      purchaseCount: 9,
    },
    {
      owner: elif._id,
      title: 'Akademik Makale ve Ödev Çevirisi',
      description: 'İngilizce dökümanlarınızı, akademik dil kurallarına uygun olarak Türkçe\'ye veya tersine çeviriyorum.',
      category: 'Çeviri',
      price: 300,
      deliveryDays: 4,
      tags: ['çeviri', 'ingilizce', 'akademik'],
      rating: 4.9,
      reviewCount: 15,
      purchaseCount: 38,
    },
    {
      owner: kaan._id,
      title: 'Kapsamlı SEO ve Anahtar Kelime Analizi',
      description: 'Web sitenizin Google sıralamasını yükseltmek için teknik SEO ve içerik stratejisi raporu.',
      category: 'Danışmanlık',
      price: 450,
      deliveryDays: 5,
      tags: ['seo', 'google', 'pazarlama'],
      rating: 4.6,
      reviewCount: 10,
      purchaseCount: 19,
    },
    {
      owner: omer._id,
      title: 'YouTube / Instagram Video Kurgu & Edit',
      description: 'Videolarınıza profesyonel renk ayarı, ses miksajı, altyazı ve dinamik geçişler ekliyorum.',
      category: 'Video',
      price: 400,
      deliveryDays: 3,
      tags: ['video', 'edit', 'premiere'],
      rating: 4.8,
      reviewCount: 12,
      purchaseCount: 27,
    },
    {
      owner: merve._id,
      title: 'SolidWorks ile 3D Endüstriyel Modelleme',
      description: 'Teknik çizimlerinizi veya fikirlerinizi SolidWorks ile katı modele dönüştürüp render alıyorum.',
      category: 'Tasarım',
      price: 700,
      deliveryDays: 6,
      tags: ['solidworks', '3d', 'modelleme'],
      rating: 4.4,
      reviewCount: 3,
      purchaseCount: 5,
    },
  ]);

  const [logoSvc, reactSvc, dataSvc, unitySvc, uiSvc, springSvc, flutterSvc, pentestSvc, translationSvc, seoSvc, videoSvc, solidSvc] = services;
  console.log(`🛠  ${services.length} hizmet oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 3. PROJECTS (8 kayıt)
   * ─────────────────────────────────────────────────────── */
  const projects = await Project.insertMany([
    {
      owner: zeynep._id,
      title: 'Yapay Zeka Destekli Ödev Asistanı',
      description: 'GPT API kullanarak öğrencilerin ödevlerinde rehberlik eden web uygulaması.',
      category: 'Yapay Zeka',
      requiredSkills: ['React', 'Python', 'OpenAI API'],
      teamSize: 4,
      duration: '3 ay',
      status: 'recruiting',
      applicationCount: 7,
      tags: ['ai', 'eğitim'],
    },
    {
      owner: ayse._id,
      title: 'Kampüs İkinci El Eşya Uygulaması',
      description: 'Öğrencilerin kampüs içinde ikinci el eşya alıp satabildiği mobil uygulama.',
      category: 'Mobil',
      requiredSkills: ['React Native', 'Node.js', 'MongoDB'],
      teamSize: 3,
      duration: '4 ay',
      status: 'recruiting',
      applicationCount: 12,
      tags: ['mobil', 'pazaryeri'],
    },
    {
      owner: can._id,
      title: 'AR Kampüs Gezinti Uygulaması',
      description: 'Artırılmış gerçeklik teknolojisi ile kampüste yön bulmayı kolaylaştıran iOS/Android uygulaması.',
      category: 'Mobil',
      requiredSkills: ['Swift', 'ARKit', 'Unity'],
      teamSize: 3,
      duration: '5 ay',
      status: 'active',
      applicationCount: 9,
      tags: ['ar', 'kampüs'],
    },
    {
      owner: selin._id,
      title: 'Öğrenci Etkinlik Takip Platformu',
      description: 'Üniversite kulüplerinin etkinliklerini takip etmeyi sağlayan full-stack platform.',
      category: 'Yazılım',
      requiredSkills: ['Vue.js', 'Laravel', 'MySQL'],
      teamSize: 5,
      duration: '6 ay',
      status: 'recruiting',
      applicationCount: 3,
      tags: ['etkinlik', 'kulüp'],
    },
    {
      owner: emre._id,
      title: 'Öğrenci Not Paylaşım Sistemi',
      description: 'Ders notlarını öğrenciler arasında güvenli şekilde paylaşmayı sağlayan platform.',
      category: 'Yazılım',
      requiredSkills: ['Java', 'Spring Boot', 'React'],
      teamSize: 4,
      duration: '4 ay',
      status: 'completed',
      applicationCount: 15,
      tags: ['eğitim', 'not'],
    },
    // ── YENİ EKLENEN PROJELER ──
    {
      owner: burak._id,
      title: 'Açık Kaynak Siber Tehdit Haritası',
      description: 'Anlık siber saldırı verilerini çekip harita üzerinde görselleştiren web tabanlı bir dashboard projesi.',
      category: 'Siber Güvenlik',
      requiredSkills: ['Python', 'D3.js', 'WebSockets', 'Linux'],
      teamSize: 3,
      duration: '2 ay',
      status: 'recruiting',
      applicationCount: 5,
      tags: ['güvenlik', 'dashboard', 'maps'],
    },
    {
      owner: kaan._id,
      title: 'E-Ticaret İçerik Optimizasyon Botu',
      description: 'Yapay zeka desteği ile e-ticaret sitelerindeki ürün açıklamalarını SEO uyumlu hale getiren SaaS yazılımı.',
      category: 'Yazılım',
      requiredSkills: ['Node.js', 'OpenAI API', 'SEO'],
      teamSize: 4,
      duration: '5 ay',
      status: 'recruiting',
      applicationCount: 8,
      tags: ['seo', 'ai', 'saas'],
    },
    {
      owner: merve._id,
      title: 'Geri Dönüşümlü Akıllı Atık Kutusu Prototipi',
      description: 'Atıkları sensörlerle ayrıştıran akıllı çöp kutusunun 3D mekanik tasarımı ve gömülü sistem entegrasyonu.',
      category: 'Donanım',
      requiredSkills: ['SolidWorks', 'Arduino', 'C++'],
      teamSize: 3,
      duration: '3 ay',
      status: 'active',
      applicationCount: 4,
      tags: ['iot', 'hardware', 'solidworks'],
    },
  ]);

  const [aiProj, kampusProj, arProj, etkinlikProj, notProj, cyberProj, seoProj, hardwareProj] = projects;
  console.log(`📁 ${projects.length} proje oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 4. NEEDS (8 kayıt)
   * ─────────────────────────────────────────────────────── */
  const needs = await Need.insertMany([
    {
      owner: ayse._id,
      title: 'Mobil Uygulama için Logo Tasarımı',
      description: 'Yeni geliştirdiğim Flutter uygulaması için modern ve minimal bir logo tasarımı arıyorum.',
      category: 'Tasarım',
      budget: 200,
      deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      tags: ['logo', 'mobil'],
      status: 'open',
    },
    {
      owner: emre._id,
      title: 'WordPress E-Ticaret Sitesi Kurulumu',
      description: 'Küçük işletmem için WooCommerce tabanlı e-ticaret sitesi kurulumu lazım.',
      category: 'Yazılım',
      budget: 800,
      deadline: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      tags: ['wordpress', 'woocommerce'],
      status: 'open',
    },
    {
      owner: can._id,
      title: 'Bitirme Tezi İstatistik Analizi',
      description: 'Sosyoloji bitirme tezim için SPSS veya R kullanarak anket verilerinin analizi gerekiyor.',
      category: 'Akademik',
      budget: 400,
      tags: ['spss', 'r', 'istatistik'],
      status: 'open',
    },
    {
      owner: fatma._id,
      title: 'Python Web Scraping Scripti',
      description: 'Bir e-ticaret sitesinden ürün fiyatlarını günlük otomatik çeken Python scripti istiyorum.',
      category: 'Yazılım',
      budget: 300,
      deadline: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      tags: ['python', 'scraping'],
      status: 'in_progress',
    },
    {
      owner: selin._id,
      title: 'Teknik Yazılım Belgesi Çevirisi',
      description: 'React kütüphanesi dökümantasyonunun seçili bölümlerini İngilizce\'den Türkçe\'ye çevirme.',
      category: 'Çeviri',
      budget: 250,
      tags: ['çeviri', 'teknik'],
      status: 'closed',
    },
    // ── YENİ EKLENEN İHTİYAÇLAR ──
    {
      owner: burak._id,
      title: 'Siber Güvenlik Blogu İçin Tanıtım Videosu',
      description: 'Yeni açacağım siber güvenlik blog platformum için 1 dakikalık hareketli grafik (motion graphics) intro/tanıtım videosu.',
      category: 'Video',
      budget: 350,
      deadline: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      tags: ['video', 'animasyon', 'intro'],
      status: 'open',
    },
    {
      owner: omer._id,
      title: 'Video Editör Portfolyo Web Sitesi',
      description: 'Kurguladığım videoları sergileyebileceğim, modern ve minimalist tek sayfalık HTML/CSS/JS web sitesi.',
      category: 'Yazılım',
      budget: 450,
      deadline: new Date(Date.now() + 12 * 24 * 3600 * 1000),
      tags: ['html', 'css', 'portfolio'],
      status: 'open',
    },
    {
      owner: deniz._id || deniz._id, // Güvenli fallback
      title: 'R Analizi Çıktıları için Rapor Düzenleme',
      description: 'Yürüttüğüm veri analiz projesinin R Markdown çıktılarının akademik formata uygun olarak İngilizce raporlanması.',
      category: 'Akademik',
      budget: 300,
      deadline: new Date(Date.now() + 6 * 24 * 3600 * 1000),
      tags: ['r', 'akademik', 'rapor'],
      status: 'open',
    },
  ]);

  const [logoNeed, wpNeed, tezNeed, scrapeNeed, ceviriNeed, videoNeed, webNeed, reportNeed] = needs;
  console.log(`📋 ${needs.length} ihtiyaç ilanı oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 5. APPLICATIONS (9 kayıt)
   * ─────────────────────────────────────────────────────── */
  const applications = await Application.insertMany([
    { project: aiProj._id, applicant: ayse._id, coverLetter: 'Python ve React konusunda deneyimim var.', status: 'accepted' },
    { project: aiProj._id, applicant: emre._id, coverLetter: 'FastAPI ve backend geliştirme konusunda güçlüyüm.', status: 'pending' },
    { project: kampusProj._id, applicant: selin._id, coverLetter: 'React Native ile iki mobil uygulama geliştirdim.', status: 'pending' },
    { project: kampusProj._id, applicant: can._id, coverLetter: 'Mobil uygulama geliştirme konusunda tecrübeliyim.', status: 'rejected' },
    { project: etkinlikProj._id, applicant: fatma._id, coverLetter: 'Vue.js ve Laravel ile platform geliştirebilirim.', status: 'accepted' },
    // ── YENİ EKLENEN BAŞVURULAR ──
    { project: cyberProj._id, applicant: ayse._id, coverLetter: 'D3.js ve frontend entegrasyonu tarafında harika bir harita çıkarabilirim.', status: 'pending' },
    { project: seoProj._id, applicant: selin._id, coverLetter: 'SaaS tasarımları ve Figma arayüz prototipleri üzerine yoğunlaşıyorum.', status: 'accepted' },
    { project: hardwareProj._id, applicant: burak._id, coverLetter: 'Arduino ve ağ protokolleri güvenliği konularında destek olabilirim.', status: 'pending' },
    { project: cyberProj._id, applicant: emre._id, coverLetter: 'Python WebSocket ve veri tabanı mimarisini kurabilirim.', status: 'accepted' },
  ]);
  console.log(`📨 ${applications.length} başvuru oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 6. OFFERS (8 kayıt)
   * ─────────────────────────────────────────────────────── */
  const offers = await Offer.insertMany([
    { need: logoNeed._id, offerer: mehmet._id, price: 180, description: 'Logo tasarımı konusunda uzmanım.', deliveryDays: 3, status: 'accepted' },
    { need: logoNeed._id, offerer: selin._id, price: 200, description: 'Minimalist mobil uygulama logolarında iyiyim.', deliveryDays: 4, status: 'rejected' },
    { need: wpNeed._id, offerer: ayse._id, price: 750, description: 'WooCommerce kurulumu yapabilirim.', deliveryDays: 10, status: 'pending' },
    { need: tezNeed._id, offerer: zeynep._id, price: 350, description: 'SPSS ve R ile çalışıyorum.', deliveryDays: 7, status: 'pending' },
    // ── YENİ EKLENEN TEKLİFLER ──
    { need: videoNeed._id, offerer: omer._id, price: 300, description: 'After Effects ile siber güvenlik temalı harika bir motion intro hazırlarım.', deliveryDays: 5, status: 'accepted' },
    { need: webNeed._id, offerer: selin._id, price: 400, description: 'Vue/HTML kullanarak çok şık bir portfolyo tasarlayıp kodlarım.', deliveryDays: 6, status: 'pending' },
    { need: reportNeed._id, offerer: elif._id, price: 250, description: 'R çıktılarınızı kusursuz akademik İngilizceye çevirir ve raporlarım.', deliveryDays: 3, status: 'pending' },
    { need: wpNeed._id, offerer: kaan._id, price: 800, description: 'E-Ticaret sitenizi kurarken baştan sona SEO uyumlu yapılandırırım.', deliveryDays: 12, status: 'pending' },
  ]);
  console.log(`💬 ${offers.length} teklif oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 7. REVIEWS (8 kayıt)
   * ─────────────────────────────────────────────────────── */
  const reviews = await Review.insertMany([
    { reviewer: emre._id, target: ayse._id, rating: 5, comment: 'Harika bir çalışma! React projesi tam istediğim gibi oldu.', serviceId: reactSvc._id },
    { reviewer: ayse._id, target: mehmet._id, rating: 5, comment: 'Logo tasarımı beklentilerimin çok üzerindeydi.', serviceId: logoSvc._id },
    { reviewer: can._id, target: zeynep._id, rating: 4, comment: 'Veri analizi eksiksiz yapıldı. Sonuçlar kapsamlıydı.', serviceId: dataSvc._id },
    { reviewer: fatma._id, target: selin._id, rating: 5, comment: 'Figma prototipi çok profesyoneldi.', serviceId: uiSvc._id },
    // ── YENİ EKLENEN DEĞERLENDİRMELER ──
    { reviewer: kaan._id, target: burak._id, rating: 5, comment: 'Sitemizin güvenlik açıklarını çok hızlı tespit edip raporladı.', serviceId: pentestSvc._id },
    { reviewer: deniz._id, target: elif._id, rating: 5, comment: 'Akademik çeviride terminolojiye son derece hakim, çok teşekkürler.', serviceId: translationSvc._id },
    { reviewer: ayse._id, target: kaan._id, rating: 4, comment: 'SEO analiz raporu çok detaylıydı, sitenin eksiklerini net gördük.', serviceId: seoSvc._id },
    { reviewer: burak._id, target: omer._id, rating: 5, comment: 'İntromuz tam istediğimiz siber estetiğe sahip oldu, eline sağlık.', serviceId: videoSvc._id },
  ]);
  console.log(`⭐ ${reviews.length} değerlendirme oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 8. MESSAGES (10 kayıt — 4 konuşma)
   * ─────────────────────────────────────────────────────── */
  const conv1 = [ayse._id.toString(), mehmet._id.toString()].sort().join('-');
  const conv2 = [zeynep._id.toString(), can._id.toString()].sort().join('-');
  const conv3 = [burak._id.toString(), omer._id.toString()].sort().join('-');
  const conv4 = [deniz._id.toString(), elif._id.toString()].sort().join('-');

  const messages = await Message.insertMany([
    { conversationId: conv1, sender: ayse._id, text: 'Merhaba Mehmet, logo tasarımı hakkında konuşabilir miyiz?', readBy: [ayse._id, mehmet._id] },
    { conversationId: conv1, sender: mehmet._id, text: 'Tabii ki! Markanızın renk paletini paylaşır mısınız?', readBy: [mehmet._id, ayse._id] },
    { conversationId: conv2, sender: zeynep._id, text: 'Can, AR projesine backend yazabilir miyim?', readBy: [zeynep._id, can._id] },
    { conversationId: conv2, sender: can._id, text: 'Harika! FastAPI kullanmayı düşünüyoruz.', readBy: [can._id] },
    // ── YENİ EKLENEN MESAJLAR ──
    { conversationId: conv3, sender: burak._id, text: 'Selam Ömer, video ilanım için attığın teklifi gördüm. Örnek çalışmaların var mı?', readBy: [burak._id, omer._id] },
    { conversationId: conv3, sender: omer._id, text: 'Selam Burak, tabii ki. YouTube kanalımdaki son 3 animasyonu profilimde paylaştım, inceleyebilirsin.', readBy: [omer._id, burak._id] },
    { conversationId: conv3, sender: burak._id, text: 'Harika görünüyorlar, projeyi hemen başlatıyorum.', readBy: [burak._id] },
    { conversationId: conv4, sender: deniz._id, text: 'Elif Hanım merhaba, R çıktılarını bu hafta sonuna yetiştirebilir miyiz?', readBy: [deniz._id, elif._id] },
    { conversationId: conv4, sender: elif._id, text: 'Merhaba Deniz Bey, cumartesi akşamına kadar teslim etmiş olurum.', readBy: [elif._id, deniz._id] },
    { conversationId: conv4, sender: deniz._id, text: 'Süper, çok teşekkürler.', readBy: [deniz._id] },
  ]);
  console.log(`💌 ${messages.length} mesaj oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 9. NOTIFICATIONS (10 kayıt)
   * ─────────────────────────────────────────────────────── */
  const notifications = await Notification.insertMany([
    { user: ayse._id, type: 'application', title: 'Yeni proje başvurusu', body: 'Projenize yeni başvuru geldi.', link: `/applications/${kampusProj._id}`, isRead: false },
    { user: ayse._id, type: 'purchase', title: 'Hizmetiniz satın alındı', body: 'React hizmetiniz Emre tarafından satın alındı.', link: `/detail/service/${reactSvc._id}`, isRead: false },
    { user: mehmet._id, type: 'review', title: 'Yeni değerlendirme aldınız', body: 'Ayşe size 5 yıldız bıraktı.', link: `/profile/${mehmet._id}`, isRead: true },
    { user: zeynep._id, type: 'application', title: 'Başvurunuz kabul edildi', body: 'Ödev Asistanı projesine kabul edildiniz.', link: `/detail/project/${aiProj._id}`, isRead: false },
    { user: can._id, type: 'message', title: 'Yeni mesaj', body: 'Zeynep size mesaj gönderdi.', link: '/messages', isRead: true },
    // ── YENİ EKLENEN BİLDİRİMLER ──
    { user: burak._id, type: 'purchase', title: 'Hizmet Siparişi', body: 'Sızma testi hizmetiniz Kaan Bulut tarafından satın alındı.', link: `/detail/service/${pentestSvc._id}`, isRead: false },
    { user: elif._id, type: 'review', title: 'Yüksek Puan!', body: 'Deniz Güneş yaptığınız çeviriye 5 yıldız verdi.', link: `/profile/${elif._id}`, isRead: false },
    { user: omer._id, type: 'offer', title: 'Teklifiniz Kabul Edildi', body: 'Siber güvenlik motion intro teklifiniz kabul edildi.', link: '/offers', isRead: false },
    { user: selin._id, type: 'application', title: 'Proje Kabulü', body: 'SEO Optimizasyon Botu projesine dahil edildiniz.', link: `/detail/project/${seoProj._id}`, isRead: true },
    { user: merve._id, type: 'message', title: 'Yeni Mesaj', body: 'Admin size bir mesaj gönderdi.', link: '/messages', isRead: false },
  ]);
  console.log(`🔔 ${notifications.length} bildirim oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 10. FAVORITES (8 kayıt)
   * ─────────────────────────────────────────────────────── */
  const favorites = await Favorite.insertMany([
    { user: ayse._id, contentType: 'service', contentId: logoSvc._id },
    { user: emre._id, contentType: 'project', contentId: aiProj._id },
    { user: fatma._id, contentType: 'need', contentId: tezNeed._id },
    { user: can._id, contentType: 'service', contentId: uiSvc._id },
    // ── YENİ EKLENEN FAVORİLER ──
    { user: burak._id, contentType: 'service', contentId: videoSvc._id },
    { user: elif._id, contentType: 'project', contentId: cyberProj._id },
    { user: kaan._id, contentType: 'service', contentId: reactSvc._id },
    { user: deniz._id, contentType: 'need', contentId: scrapeNeed._id },
  ]);
  console.log(`❤️  ${favorites.length} favori oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 11. REPORTS (5 kayıt)
   * ─────────────────────────────────────────────────────── */
  const reports = await Report.insertMany([
    { reportedBy: emre._id, contentType: 'service', contentId: unitySvc._id, reason: 'Hizmet açıklaması yanıltıcı.', status: 'pending' },
    { reportedBy: selin._id, contentType: 'user', contentId: can._id, reason: 'Kullanıcı ödeme aldıktan sonra iletişimi kesiyor.', status: 'reviewed' },
    { reportedBy: fatma._id, contentType: 'need', contentId: wpNeed._id, reason: 'İhtiyaç ilanı mükerrer.', status: 'dismissed' },
    // ── YENİ EKLENEN ŞİKAYETLER ──
    { reportedBy: kaan._id, contentType: 'user', contentId: mehmet._id, reason: 'Profil resminde telif hakkı içeren ticari bir logo kullanılıyor.', status: 'pending' },
    { reportedBy: merve._id, contentType: 'service', contentId: solidSvc._id, reason: 'Fiyatlandırma politikası platform kurallarına aykırı ek ödemeler talep ediyor.', status: 'pending' },
  ]);
  console.log(`🚩 ${reports.length} şikayet oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 12. SERVICE ORDERS (6 kayıt)
   * ─────────────────────────────────────────────────────── */
  const serviceOrders = await ServiceOrder.insertMany([
    { buyer: emre._id, seller: ayse._id, service: reactSvc._id, amount: 1200, status: 'completed' },
    { buyer: ayse._id, seller: mehmet._id, service: logoSvc._id, amount: 350, status: 'completed' },
    { buyer: can._id, seller: selin._id, service: uiSvc._id, amount: 650, status: 'completed' },
    // ── YENİ EKLENEN SİPARİŞLER ──
    { buyer: kaan._id, seller: burak._id, service: pentestSvc._id, amount: 1500, status: 'completed' },
    { buyer: deniz._id, seller: elif._id, service: translationSvc._id, amount: 300, status: 'completed' },
    { buyer: burak._id, seller: omer._id, service: videoSvc._id, amount: 400, status: 'completed' },
  ]);
  console.log(`🛒 ${serviceOrders.length} satın alma kaydı oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 13. ADMIN LOGS (3 kayıt)
   * ─────────────────────────────────────────────────────── */
  const adminLogs = await AdminLog.insertMany([
    { admin: admin._id, action: 'BAN_USER', targetType: 'User', targetId: can._id, details: { reason: 'Geçici askıya alma uygulandı.' } },
    { admin: admin._id, action: 'REMOVE_SERVICE', targetType: 'Service', targetId: unitySvc._id, details: { reason: 'Şikayetler nedeniyle kaldırıldı.' } },
    // ── YENİ EKLENEN LOG ──
    { admin: admin._id, action: 'DISMISS_REPORT', targetType: 'Report', targetId: reports[2]._id, details: { reason: 'Mükerrer ilan tespit edilmedi, şikayet reddedildi.' } },
  ]);
  console.log(`🔐 ${adminLogs.length} admin log oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 14. USER STATISTICS (14 kayıt — Her kullanıcı için)
   * ─────────────────────────────────────────────────────── */
  const userStats = await UserStatistics.insertMany([
    { user: admin._id, completedJobs: 0, totalEarnings: 0, projectsJoined: 0, avgRating: 5 },
    { user: ayse._id, completedJobs: 29, totalEarnings: 14500, projectsJoined: 2, avgRating: 4.8 },
    { user: mehmet._id, completedJobs: 67, totalEarnings: 23450, projectsJoined: 0, avgRating: 4.5 },
    { user: zeynep._id, completedJobs: 22, totalEarnings: 11000, projectsJoined: 1, avgRating: 4.9 },
    { user: can._id, completedJobs: 12, totalEarnings: 21600, projectsJoined: 2, avgRating: 4.2 },
    { user: selin._id, completedJobs: 41, totalEarnings: 26650, projectsJoined: 1, avgRating: 4.7 },
    { user: emre._id, completedJobs: 15, totalEarnings: 30000, projectsJoined: 0, avgRating: 4.6 },
    { user: fatma._id, completedJobs: 8, totalEarnings: 20000, projectsJoined: 1, avgRating: 4.3 },
    // ── YENİ KULLANICI İSTATİSTİKLERİ ──
    { user: burak._id, completedJobs: 9, totalEarnings: 13500, projectsJoined: 1, avgRating: 4.4 },
    { user: elif._id, completedJobs: 38, totalEarnings: 11400, projectsJoined: 0, avgRating: 4.9 },
    { user: kaan._id, completedJobs: 19, totalEarnings: 8550, projectsJoined: 1, avgRating: 4.6 },
    { user: deniz._id, completedJobs: 5, totalEarnings: 2500, projectsJoined: 0, avgRating: 4.7 },
    { user: omer._id, completedJobs: 27, totalEarnings: 10800, projectsJoined: 0, avgRating: 4.8 },
    { user: merve._id, completedJobs: 5, totalEarnings: 3500, projectsJoined: 1, avgRating: 4.5 },
  ]);
  console.log(`📊 ${userStats.length} kullanıcı istatistiği oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 15. SEARCH HISTORY (6 kayıt)
   * ─────────────────────────────────────────────────────── */
  const searchHistories = await SearchHistory.insertMany([
    { user: ayse._id, query: 'logo tasarım', type: 'service', resultCount: 4 },
    { user: emre._id, query: 'react geliştirici', type: 'service', resultCount: 3 },
    { user: fatma._id, query: 'yapay zeka projesi', type: 'project', resultCount: 2 },
    // ── YENİ EKLENEN ARAMALAR ──
    { user: burak._id, query: 'video edit', type: 'service', resultCount: 5 },
    { user: kaan._id, query: 'cybersecurity', type: 'service', resultCount: 1 },
    { user: deniz._id, query: 'ingilizce çeviri', type: 'service', resultCount: 8 },
  ]);
  console.log(`🔍 ${searchHistories.length} arama geçmişi oluşturuldu`);

  /* ───────────────────────────────────────────────────────
   * 16. ONERI LOGS (6 kayıt)
   * ─────────────────────────────────────────────────────── */
  const oneriLogs = await OneriLog.insertMany([
    { user: ayse._id, project: aiProj._id, action: 'viewed' },
    { user: emre._id, project: kampusProj._id, action: 'applied' },
    { user: selin._id, project: etkinlikProj._id, action: 'dismissed' },
    // ── YENİ EKLENEN ÖNERİ LOGLARI ──
    { user: burak._id, project: cyberProj._id, action: 'viewed' },
    { user: kaan._id, project: seoProj._id, action: 'applied' },
    { user: merve._id, project: hardwareProj._id, action: 'viewed' },
  ]);
  console.log(`🤖 ${oneriLogs.length} öneri logu oluşturuldu`);

  /* ── Özet ── */
  const total =
    users.length + services.length + projects.length + needs.length +
    applications.length + offers.length + reviews.length + messages.length +
    notifications.length + favorites.length + reports.length +
    serviceOrders.length + adminLogs.length + userStats.length +
    searchHistories.length + oneriLogs.length;

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Seed tamamlandı! Toplam ${total} kayıt, 16 koleksiyon.`);
  console.log('═══════════════════════════════════════');
  console.log('\n📧 Test hesapları (şifre: Test1234!)');
  console.log('   Admin : admin@studenthub.com');
  users.slice(1).forEach(u => {
    console.log(`   User  : ${u.email}`);
  });
  console.log('\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed hatası:', err.message);
  process.exit(1);
});