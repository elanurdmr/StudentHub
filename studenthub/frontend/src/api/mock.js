/* Mock data — backend olmadan çalışır */

export const MOCK_USER = {
  _id: 'user-1',
  firstName: 'Ayşe',
  lastName: 'Kaya',
  email: 'ayse@example.com',
  avatar: '',
  bio: 'Bilgisayar Mühendisliği 3. sınıf öğrencisi. React ve Node.js geliştirici.',
  role: 'user',
  skills: [
    { name: 'React', level: 'expert' },
    { name: 'Node.js', level: 'intermediate' },
    { name: 'Figma', level: 'beginner' },
    { name: 'Python', level: 'intermediate' },
  ],
  rating: 4.8,
  reviewCount: 12,
  portfolio: [],
};

export const MOCK_USERS = [
  MOCK_USER,
  { _id: 'user-2', firstName: 'Mehmet', lastName: 'Demir', avatar: '', rating: 4.5, reviewCount: 8, skills: [{ name: 'Photoshop', level: 'expert' }, { name: 'Illustrator', level: 'expert' }], bio: 'Grafik tasarımcı.' },
  { _id: 'user-3', firstName: 'Zeynep', lastName: 'Arslan', avatar: '', rating: 4.9, reviewCount: 21, skills: [{ name: 'Python', level: 'expert' }, { name: 'ML', level: 'intermediate' }, { name: 'TensorFlow', level: 'intermediate' }], bio: 'Yapay zeka araştırmacısı.' },
  { _id: 'user-4', firstName: 'Can', lastName: 'Yıldız', avatar: '', rating: 4.2, reviewCount: 5, skills: [{ name: 'Unity', level: 'expert' }, { name: 'C#', level: 'intermediate' }, { name: 'Blender', level: 'beginner' }], bio: 'Oyun geliştirici.' },
];

export const MOCK_SERVICES = [
  { _id: 'svc-1', title: 'Profesyonel Logo Tasarımı', description: 'Markanıza özel, özgün ve modern logo tasarımı yapıyorum. 3 konsept, sınırsız revizyon.', category: 'Tasarım', price: 350, deliveryDays: 5, rating: 4.9, reviewCount: 34, purchaseCount: 67, owner: MOCK_USERS[1], tags: ['logo', 'marka', 'vektör'] },
  { _id: 'svc-2', title: 'React Web Uygulaması Geliştirme', description: 'React ile modern, hızlı ve mobil uyumlu web uygulamaları geliştiriyorum. REST API entegrasyonu dahil.', category: 'Yazılım', price: 1200, deliveryDays: 14, rating: 4.8, reviewCount: 18, purchaseCount: 29, owner: MOCK_USER, tags: ['react', 'frontend', 'javascript'] },
  { _id: 'svc-3', title: 'Python ile Veri Analizi', description: 'Pandas, NumPy ve Matplotlib kullanarak verilerinizi analiz ediyor, görselleştiriyorum.', category: 'Akademik', price: 500, deliveryDays: 7, rating: 4.7, reviewCount: 11, purchaseCount: 22, owner: MOCK_USERS[2], tags: ['python', 'veri', 'analiz'] },
  { _id: 'svc-4', title: 'İngilizce-Türkçe Çeviri', description: 'Akademik, teknik ve edebi metinlerde profesyonel çeviri hizmeti. Sayfa başı uygun fiyat.', category: 'Çeviri', price: 80, deliveryDays: 2, rating: 4.6, reviewCount: 45, purchaseCount: 120, owner: MOCK_USERS[3], tags: ['çeviri', 'ingilizce', 'türkçe'] },
  { _id: 'svc-5', title: 'Unity Oyun Geliştirme', description: '2D ve 3D Unity oyunları geliştiriyorum. Mobil ve PC platformları için optimize edilmiş.', category: 'Yazılım', price: 1800, deliveryDays: 21, rating: 4.5, reviewCount: 7, purchaseCount: 12, owner: MOCK_USERS[3], tags: ['unity', 'oyun', 'c#'] },
  { _id: 'svc-6', title: 'UI/UX Tasarım & Figma Prototipi', description: 'Kullanıcı dostu arayüz tasarımı ve tıklanabilir Figma prototipleri oluşturuyorum.', category: 'Tasarım', price: 650, deliveryDays: 10, rating: 4.9, reviewCount: 23, purchaseCount: 41, owner: MOCK_USERS[1], tags: ['figma', 'ui', 'ux'] },
];

export const MOCK_NEEDS = [
  { _id: 'need-1', title: 'Mobil Uygulama için Logo Tasarımı', description: 'Yeni geliştirdiğim Flutter uygulaması için modern ve minimal bir logo tasarımı arıyorum.', category: 'Tasarım', budget: 200, status: 'open', owner: MOCK_USER, tags: ['logo', 'mobil'] },
  { _id: 'need-2', title: 'WordPress Site Kurulumu', description: 'Küçük işletmem için WordPress tabanlı e-ticaret sitesi kurulumu ve özelleştirmesi yapılmasını istiyorum.', category: 'Yazılım', budget: 800, status: 'open', owner: MOCK_USERS[2], tags: ['wordpress', 'eticaret'] },
  { _id: 'need-3', title: 'Bitirme Tezi İstatistik Analizi', description: 'Bitirme tezim için SPSS veya R kullanarak istatistiksel analizlerin yapılmasına ihtiyacım var.', category: 'Akademik', budget: 400, status: 'open', owner: MOCK_USERS[3], tags: ['spss', 'istatistik', 'tez'] },
  { _id: 'need-4', title: 'Sosyal Medya İçerik Üretimi', description: '3 ay boyunca Instagram ve LinkedIn için haftalık içerik üretimi ve paylaşım takvimi oluşturulması.', category: 'Diğer', budget: 600, status: 'open', owner: MOCK_USERS[1], tags: ['sosyal medya', 'içerik'] },
];

export const MOCK_PROJECTS = [
  { _id: 'prj-1', title: 'YapayZeka Destekli Ödev Asistanı', description: 'GPT API kullanarak öğrencilerin ödevlerinde rehberlik eden, kaynak öneren bir web uygulaması geliştiriyoruz.', category: 'Yapay Zeka', requiredSkills: ['React', 'Python', 'OpenAI API', 'FastAPI'], teamSize: 4, duration: '3 ay', status: 'recruiting', applicationCount: 7, owner: MOCK_USERS[2] },
  { _id: 'prj-2', title: 'Kampüs İkinci El Eşya Uygulaması', description: 'Öğrencilerin kampüs içinde ikinci el eşya alıp satabildiği mobil uygulama. React Native ile geliştireceğiz.', category: 'Mobil', requiredSkills: ['React Native', 'Node.js', 'MongoDB'], teamSize: 3, duration: '4 ay', status: 'recruiting', applicationCount: 12, owner: MOCK_USER },
  { _id: 'prj-3', title: 'Öğrenci Etkinlik Takip Platformu', description: 'Üniversite kulüplerinin etkinliklerini takip etmeyi ve katılım yönetimini kolaylaştıran bir platform.', category: 'Yazılım', requiredSkills: ['Vue.js', 'Laravel', 'MySQL'], teamSize: 5, duration: '6 ay', status: 'recruiting', applicationCount: 3, owner: MOCK_USERS[3] },
  { _id: 'prj-4', title: 'AR Kampüs Gezinti Uygulaması', description: 'Artırılmış gerçeklik teknolojisi ile kampüste yön bulmayı kolaylaştıran iOS/Android uygulaması.', category: 'Mobil', requiredSkills: ['Swift', 'ARKit', 'Unity'], teamSize: 3, duration: '5 ay', status: 'active', applicationCount: 9, owner: MOCK_USERS[1] },
];

export const MOCK_NOTIFICATIONS = [
  { _id: 'n-1', type: 'application', title: 'Yeni proje başvurusu', body: '"Kampüs İkinci El" projenize yeni bir başvuru geldi.', link: '/applications/prj-2', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'n-2', type: 'purchase', title: 'Hizmetiniz satın alındı', body: '"React Web Uygulaması" hizmetiniz satın alındı.', link: '/detail/service/svc-2', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: 'n-3', type: 'review', title: 'Yeni değerlendirme aldınız', body: '5 yıldız değerlendirme aldınız.', link: '/profile/user-1', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'n-4', type: 'message', title: 'Yeni mesaj', body: 'Merhaba, hizmetiniz hakkında sormak istediğim...', link: '/messages', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

export const MOCK_REVIEWS = [
  { _id: 'r-1', reviewer: MOCK_USERS[1], rating: 5, comment: 'Harika bir çalışma! Zamanında teslim edildi, iletişim mükemmeldi.', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'r-2', reviewer: MOCK_USERS[2], rating: 5, comment: 'Beklentilerimin çok üzerinde bir sonuç. Kesinlikle tavsiye ederim.', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { _id: 'r-3', reviewer: MOCK_USERS[3], rating: 4, comment: 'Genel olarak memnunum, küçük düzeltmeler gerekti ama sonuç güzel.', createdAt: new Date(Date.now() - 259200000).toISOString() },
];

export const MOCK_APPLICATIONS = [
  { _id: 'app-1', applicant: MOCK_USERS[2], coverLetter: 'Python ve makine öğrenmesi konusunda 2 yıl deneyimim var. Projeye büyük katkı sağlayabileceğimi düşünüyorum.', status: 'pending', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'app-2', applicant: MOCK_USERS[3], coverLetter: 'Full-stack geliştirici olarak React ve Node.js projelerinde aktif rol aldım. Ekibe katılmak istiyorum.', status: 'pending', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: 'app-3', applicant: MOCK_USERS[1], coverLetter: 'UI/UX tasarım ve frontend geliştirme konularında deneyimliyim.', status: 'accepted', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export const MOCK_REPORTS = [];

/* Mock token ve kullanıcı oturumu */
export function mockLogin() {
  return { token: 'mock-token-123', user: MOCK_USER };
}

/* Yardımcı: mock response wrapper */
export function mockRes(data) {
  return Promise.resolve({ data });
}
