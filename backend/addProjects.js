/**
 * StudentHub — Ek Proje İlanları
 * Mevcut veriyi SİLMEDEN yeni projeler ekler.
 * Çalıştırmak için: node addProjects.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Project from './models/Project.js';

async function addProjects() {
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

  const soon  = (days) => new Date(Date.now() + days * 24 * 3600 * 1000);

  const newProjects = [
    /* ── TASARIM ── */
    {
      owner: mehmet?._id,
      title: 'Üniversite Gazete ve Dergi Tasarım Sistemi',
      description:
        'Üniversite öğrenci gazetesi için yeniden kullanılabilir InDesign şablonları, tipografi sistemi ve kapak tasarımları oluşturuyoruz. Basım & dijital yayın iki formatta çıkacak.',
      category: 'Tasarım',
      requiredSkills: ['InDesign', 'Illustrator', 'Tipografi'],
      teamSize: 4,
      duration: '3 ay',
      collaborationType: 'volunteer',
      isRemote: true,
      applicationDeadline: soon(18),
      expectedTimeCommitment: '6 saat/hafta',
      status: 'recruiting',
      applicationCount: 3,
    },
    {
      owner: selin?._id,
      title: 'Açık Kaynak UI Bileşen Kütüphanesi',
      description:
        'Figma ve React ile tamamen erişilebilir (WCAG AA), dark/light mode destekli açık kaynak bir UI kit geliştiriyoruz. GitHub\'da yayınlanacak, dökümantasyon sitesi dahil.',
      category: 'Tasarım',
      requiredSkills: ['Figma', 'React', 'CSS', 'Storybook'],
      teamSize: 5,
      duration: '4 ay',
      collaborationType: 'volunteer',
      isRemote: true,
      applicationDeadline: soon(30),
      expectedTimeCommitment: '8 saat/hafta',
      status: 'recruiting',
      applicationCount: 6,
    },
    {
      owner: merve?._id,
      title: 'Kampüs Sokak Mobilyası Tasarım Yarışması',
      description:
        'Üniversitenin dış mekânları için yenilikçi, sürdürülebilir malzemeler kullanan oturma ünitesi ve bisiklet parkı tasarımı yapıyoruz. SolidWorks render ve fiziksel maket dahil.',
      category: 'Tasarım',
      requiredSkills: ['SolidWorks', 'AutoCAD', '3D Modeling', 'Sürdürülebilir Tasarım'],
      teamSize: 3,
      duration: '2 ay',
      collaborationType: 'competition',
      isRemote: false,
      applicationDeadline: soon(12),
      expectedTimeCommitment: '10 saat/hafta',
      status: 'recruiting',
      applicationCount: 2,
    },

    /* ── ARAŞTIRMA ── */
    {
      owner: deniz?._id,
      title: 'Türkiye\'de Öğrenci Ruh Sağlığı Veri Araştırması',
      description:
        'Üniversite öğrencilerinde anksiyete ve tükenmişlik düzeylerini ölçen geniş çaplı anket çalışması. Veriler R ile analiz edilecek, bulgu raporu akademik dergiye gönderilecek.',
      category: 'Araştırma',
      requiredSkills: ['R', 'SPSS', 'Anket Tasarımı', 'İstatistik'],
      teamSize: 4,
      duration: '5 ay',
      collaborationType: 'academic',
      isRemote: true,
      applicationDeadline: soon(25),
      expectedTimeCommitment: '8 saat/hafta',
      status: 'recruiting',
      applicationCount: 5,
    },
    {
      owner: zeynep?._id,
      title: 'Makine Öğrenmesi ile Hava Kalitesi Tahmini',
      description:
        'İstanbul\'daki hava kalitesi sensör verilerini toplayıp LSTM ve Prophet modelleriyle 48 saatlik tahmin yapan açık kaynak sistem. Veri seti Kaggle\'da paylaşılacak.',
      category: 'Araştırma',
      requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'Veri Analizi'],
      teamSize: 3,
      duration: '4 ay',
      collaborationType: 'research',
      isRemote: true,
      applicationDeadline: soon(20),
      expectedTimeCommitment: '10 saat/hafta',
      status: 'recruiting',
      applicationCount: 8,
    },
    {
      owner: elif?._id,
      title: 'Dil Öğrenme Uygulamalarının Etkinlik Analizi',
      description:
        'Duolingo, Babbel ve Pimsleur\'u kullanan 200+ kişilik denek grubuyla karşılaştırmalı dil edinimi araştırması. Kullanıcı anketi + kelime testi + istatistiksel analiz.',
      category: 'Araştırma',
      requiredSkills: ['Araştırma Metodolojisi', 'SPSS', 'İngilizce', 'Almanca'],
      teamSize: 3,
      duration: '3 ay',
      collaborationType: 'academic',
      isRemote: true,
      applicationDeadline: soon(15),
      expectedTimeCommitment: '7 saat/hafta',
      status: 'recruiting',
      applicationCount: 4,
    },

    /* ── OYUN ── */
    {
      owner: can?._id,
      title: 'Türk Mitolojisi Temalı 2D Metroidvania',
      description:
        'Unity ile geliştirilen, Türk mitolojik figürlerini (Bozkurt, Umay, Erlik) düşman ve yardımcı olarak kullanan bağımsız 2D platform oyunu. Steam\'de yayınlanacak.',
      category: 'Oyun',
      requiredSkills: ['Unity', 'C#', 'Pixel Art', 'Oyun Tasarımı'],
      teamSize: 5,
      duration: '8 ay',
      collaborationType: 'startup',
      isRemote: true,
      applicationDeadline: soon(35),
      expectedTimeCommitment: '15 saat/hafta',
      status: 'recruiting',
      applicationCount: 12,
    },
    {
      owner: can?._id,
      title: 'Eğitici Matematik Puzzle Mobil Oyunu',
      description:
        'İlk ve ortaokul öğrencileri için Unity ile geliştirilen, müfredat uyumlu eğitici bulmaca oyunu. iOS ve Android\'de ücretsiz yayınlanacak, okullarla pilot test yapılacak.',
      category: 'Oyun',
      requiredSkills: ['Unity', 'C#', 'UI Design', 'Eğitim Teknolojileri'],
      teamSize: 4,
      duration: '5 ay',
      collaborationType: 'volunteer',
      isRemote: true,
      applicationDeadline: soon(22),
      expectedTimeCommitment: '10 saat/hafta',
      status: 'recruiting',
      applicationCount: 7,
    },
    {
      owner: burak?._id,
      title: 'Siber Güvenlik Farkındalık Oyunu',
      description:
        'Phishing, sosyal mühendislik ve şifre güvenliği konularını öğreten tarayıcı tabanlı eğitici oyun. Üniversite IT güvenlik eğitimlerinde kullanılacak.',
      category: 'Oyun',
      requiredSkills: ['JavaScript', 'Phaser.js', 'UI/UX', 'Siber Güvenlik'],
      teamSize: 3,
      duration: '3 ay',
      collaborationType: 'academic',
      isRemote: true,
      applicationDeadline: soon(18),
      expectedTimeCommitment: '8 saat/hafta',
      status: 'recruiting',
      applicationCount: 5,
    },

    /* ── SOSYAL GİRİŞİM ── */
    {
      owner: elif?._id,
      title: 'Mülteci Çocuklar için Dijital Dil Platformu',
      description:
        'Türkiye\'deki mülteci çocuklara Türkçe öğreten, oyunlaştırılmış web platformu. UNHCR ve yerel STK\'larla iş birliği yapılacak, tamamen gönüllü ve açık kaynak.',
      category: 'Sosyal Girişim',
      requiredSkills: ['React', 'Node.js', 'UI/UX', 'Eğitim Teknolojileri'],
      teamSize: 6,
      duration: '6 ay',
      collaborationType: 'volunteer',
      isRemote: true,
      applicationDeadline: soon(40),
      expectedTimeCommitment: '10 saat/hafta',
      status: 'recruiting',
      applicationCount: 14,
    },
    {
      owner: deniz?._id,
      title: 'Yaşlılar için Dijital Okuryazarlık Programı',
      description:
        'Huzurevlerinde yaşayan büyüklerimize akıllı telefon, internet güvenliği ve video görüşme kullanımını öğreten gönüllü eğitim programı. Eğitim materyalleri ve uygulama da geliştirilecek.',
      category: 'Sosyal Girişim',
      requiredSkills: ['Eğitim Tasarımı', 'Sabır', 'React Native', 'UX'],
      teamSize: 5,
      duration: '4 ay',
      collaborationType: 'volunteer',
      isRemote: false,
      applicationDeadline: soon(28),
      expectedTimeCommitment: '6 saat/hafta',
      status: 'recruiting',
      applicationCount: 9,
    },

    /* ── YAPAY ZEKA (ek) ── */
    {
      owner: zeynep?._id,
      title: 'Türkçe Duygu Analizi Modeli',
      description:
        'Sosyal medya yorumları için Türkçeye özgü BERT tabanlı duygu analizi (pozitif/negatif/nötr) modeli geliştirip HuggingFace\'de yayınlıyoruz. Veri seti de açık kaynak olacak.',
      category: 'Yapay Zeka',
      requiredSkills: ['Python', 'NLP', 'PyTorch', 'HuggingFace'],
      teamSize: 3,
      duration: '4 ay',
      collaborationType: 'research',
      isRemote: true,
      applicationDeadline: soon(22),
      expectedTimeCommitment: '12 saat/hafta',
      status: 'recruiting',
      applicationCount: 10,
    },
    {
      owner: ayse?._id,
      title: 'AI Destekli Kariyer Yol Haritası Uygulaması',
      description:
        'Kullanıcının beceri seti, ilgi alanları ve hedeflerine göre kişiselleştirilmiş kariyer önerileri ve öğrenme yolu sunan Next.js + OpenAI uygulaması.',
      category: 'Yapay Zeka',
      requiredSkills: ['Next.js', 'OpenAI API', 'MongoDB', 'Figma'],
      teamSize: 4,
      duration: '4 ay',
      collaborationType: 'startup',
      isRemote: true,
      applicationDeadline: soon(26),
      expectedTimeCommitment: '14 saat/hafta',
      status: 'recruiting',
      applicationCount: 11,
    },

    /* ── YAZILIM (ek) ── */
    {
      owner: emre?._id,
      title: 'Açık Kaynak Ders Programı Optimizasyon Aracı',
      description:
        'Öğrenci ve ders verisi girince çakışmasız, zorunlu derslere uyumlu ders programı otomatik oluşturan web uygulaması. Üniversite kayıt sistemleriyle entegre olacak.',
      category: 'Yazılım',
      requiredSkills: ['Java', 'Spring Boot', 'React', 'Algoritma'],
      teamSize: 4,
      duration: '5 ay',
      collaborationType: 'academic',
      isRemote: true,
      applicationDeadline: soon(32),
      expectedTimeCommitment: '10 saat/hafta',
      status: 'recruiting',
      applicationCount: 6,
    },
    {
      owner: fatma?._id,
      title: 'Anlık Kampüs Servis Takip Uygulaması',
      description:
        'GPS tabanlı kampüs servis araçlarını harita üzerinde gerçek zamanlı gösteren Flutter uygulaması. Tahmini varış süresi ve doluluk bilgisi de sunulacak.',
      category: 'Mobil',
      requiredSkills: ['Flutter', 'Google Maps API', 'Firebase', 'Node.js'],
      teamSize: 3,
      duration: '3 ay',
      collaborationType: 'volunteer',
      isRemote: true,
      applicationDeadline: soon(16),
      expectedTimeCommitment: '12 saat/hafta',
      status: 'recruiting',
      applicationCount: 8,
    },
    {
      owner: kaan?._id,
      title: 'Öğrenci Freelance İş Eşleştirme Botu',
      description:
        'LinkedIn, Upwork ve Freelancer\'daki güncel iş ilanlarını tarayıp öğrencinin becerilerine göre filtreleyen ve Telegram üzerinden özet gönderen Python botu.',
      category: 'Yazılım',
      requiredSkills: ['Python', 'Web Scraping', 'Telegram Bot API', 'NLP'],
      teamSize: 2,
      duration: '2 ay',
      collaborationType: 'startup',
      isRemote: true,
      applicationDeadline: soon(10),
      expectedTimeCommitment: '8 saat/hafta',
      status: 'recruiting',
      applicationCount: 4,
    },
  ].filter((p) => p.owner);

  const inserted = await Project.insertMany(newProjects);
  console.log(`✅ ${inserted.length} yeni proje ilanı eklendi.\n`);

  const total = await Project.countDocuments();
  console.log(`📁 Toplam proje ilanı: ${total}`);

  await mongoose.disconnect();
}

addProjects().catch((err) => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
