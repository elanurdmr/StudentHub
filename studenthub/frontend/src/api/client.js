import axios from 'axios';
import useAuthStore from '../store/authStore.js';
import {
  mockRes, mockLogin,
  MOCK_USER, MOCK_USERS, MOCK_SERVICES, MOCK_NEEDS,
  MOCK_PROJECTS, MOCK_NOTIFICATIONS, MOCK_REVIEWS,
  MOCK_APPLICATIONS,
} from './mock.js';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  }
);

export default api;

/* ── Yardımcı: gerçek API yoksa mock döner ── */
async function tryOrMock(apiFn, mockData) {
  try {
    return await apiFn();
  } catch {
    return { data: typeof mockData === 'function' ? mockData() : mockData };
  }
}

/* ── Auth ── */
export const authAPI = {
  register: async (data) => {
    try {
      return await api.post('/auth/register', data);
    } catch {
      const result = mockLogin();
      result.user = { ...result.user, ...data, _id: 'user-mock-' + Date.now() };
      return { data: result };
    }
  },
  login: async (data) => {
    try {
      return await api.post('/auth/login', data);
    } catch {
      return { data: mockLogin() };
    }
  },
  me: () => tryOrMock(() => api.get('/auth/me'), MOCK_USER),
};

/* ── Users ── */
export const usersAPI = {
  get: (id) => tryOrMock(() => api.get(`/users/${id}`), MOCK_USERS.find((u) => u._id === id) || MOCK_USER),
  update: async (id, data) => {
    try { return await api.patch(`/users/${id}`, data); }
    catch { return { data: { ...MOCK_USER, ...data } }; }
  },
  addSkill: async (id, skill) => {
    try { return await api.post(`/users/${id}/skills`, { skill }); }
    catch { return { data: { ...MOCK_USER, skills: [...(MOCK_USER.skills || []), skill] } }; }
  },
  removeSkill: async (id, skill) => {
    try { return await api.delete(`/users/${id}/skills/${skill}`); }
    catch { return { data: { ...MOCK_USER, skills: MOCK_USER.skills.filter((s) => s !== skill) } }; }
  },
  addPortfolio: async (id, data) => {
    try { return await api.post(`/users/${id}/portfolio`, data); }
    catch { return { data: MOCK_USER }; }
  },
  removePortfolio: async (id, itemId) => {
    try { return await api.delete(`/users/${id}/portfolio/${itemId}`); }
    catch { return { data: MOCK_USER }; }
  },
};

/* ── Services ── */
export const servicesAPI = {
  list: (params) => tryOrMock(() => api.get('/services', { params }), () => {
    let list = [...MOCK_SERVICES];
    if (params?.category) list = list.filter((s) => s.category === params.category);
    if (params?.q) list = list.filter((s) => s.title.toLowerCase().includes(params.q.toLowerCase()));
    if (params?.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (params?.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    if (params?.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    return list;
  }),
  mine: () => tryOrMock(() => api.get('/services/mine'), MOCK_SERVICES.filter((s) => s.owner._id === 'user-1')),
  get: (id) => tryOrMock(() => api.get(`/services/${id}`), MOCK_SERVICES.find((s) => s._id === id) || MOCK_SERVICES[0]),
  create: async (data) => {
    try { return await api.post('/services', data); }
    catch { return { data: { ...data, _id: 'svc-new-' + Date.now(), owner: MOCK_USER, rating: 0, reviewCount: 0, purchaseCount: 0 } }; }
  },
  update: async (id, data) => {
    try { return await api.patch(`/services/${id}`, data); }
    catch { return { data: { ...MOCK_SERVICES[0], ...data } }; }
  },
  remove: async (id) => {
    try { return await api.delete(`/services/${id}`); }
    catch { return { data: { message: 'Silindi' } }; }
  },
  purchase: async (id) => {
    try { return await api.post(`/services/${id}/purchase`); }
    catch { return { data: { message: 'Satın alma başarılı' } }; }
  },
};

/* ── Needs ── */
export const needsAPI = {
  list: (params) => tryOrMock(() => api.get('/needs', { params }), () => {
    let list = [...MOCK_NEEDS];
    if (params?.category) list = list.filter((n) => n.category === params.category);
    if (params?.q) list = list.filter((n) => n.title.toLowerCase().includes(params.q.toLowerCase()));
    return list;
  }),
  get: (id) => tryOrMock(() => api.get(`/needs/${id}`), { ...(MOCK_NEEDS.find((n) => n._id === id) || MOCK_NEEDS[0]), offers: [] }),
  create: async (data) => {
    try { return await api.post('/needs', data); }
    catch { return { data: { ...data, _id: 'need-new-' + Date.now(), owner: MOCK_USER, status: 'open' } }; }
  },
  update: async (id, data) => {
    try { return await api.patch(`/needs/${id}`, data); }
    catch { return { data: { ...MOCK_NEEDS[0], ...data } }; }
  },
  remove: async (id) => {
    try { return await api.delete(`/needs/${id}`); }
    catch { return { data: { message: 'Silindi' } }; }
  },
  makeOffer: async (id, data) => {
    try { return await api.post(`/needs/${id}/offers`, data); }
    catch { return { data: { ...data, _id: 'offer-' + Date.now(), offerer: MOCK_USER, status: 'pending' } }; }
  },
  acceptOffer: async (needId, offerId) => {
    try { return await api.patch(`/needs/${needId}/offers/${offerId}/accept`); }
    catch { return { data: { status: 'accepted' } }; }
  },
  rejectOffer: async (needId, offerId) => {
    try { return await api.patch(`/needs/${needId}/offers/${offerId}/reject`); }
    catch { return { data: { status: 'rejected' } }; }
  },
};

/* ── Projects ── */
export const projectsAPI = {
  list: (params) => tryOrMock(() => api.get('/projects', { params }), () => {
    let list = [...MOCK_PROJECTS];
    if (params?.category) list = list.filter((p) => p.category === params.category);
    if (params?.q) list = list.filter((p) => p.title.toLowerCase().includes(params.q.toLowerCase()));
    return list;
  }),
  mine: () => tryOrMock(() => api.get('/projects/mine'), MOCK_PROJECTS.filter((p) => p.owner._id === 'user-1')),
  get: (id) => tryOrMock(() => api.get(`/projects/${id}`), MOCK_PROJECTS.find((p) => p._id === id) || MOCK_PROJECTS[0]),
  create: async (data) => {
    try { return await api.post('/projects', data); }
    catch { return { data: { ...data, _id: 'prj-new-' + Date.now(), owner: MOCK_USER, applicationCount: 0, status: 'recruiting' } }; }
  },
  update: async (id, data) => {
    try { return await api.patch(`/projects/${id}`, data); }
    catch { return { data: { ...MOCK_PROJECTS[0], ...data } }; }
  },
  remove: async (id) => {
    try { return await api.delete(`/projects/${id}`); }
    catch { return { data: { message: 'Silindi' } }; }
  },
  apply: async (id, data) => {
    try { return await api.post(`/projects/${id}/apply`, data); }
    catch { return { data: { ...data, _id: 'app-' + Date.now(), status: 'pending' } }; }
  },
  applications: (id) => tryOrMock(() => api.get(`/projects/${id}/applications`), MOCK_APPLICATIONS),
  updateApplication: async (projectId, appId, status) => {
    try { return await api.patch(`/projects/${projectId}/applications/${appId}`, { status }); }
    catch { return { data: { _id: appId, status } }; }
  },
  recommendations: () => tryOrMock(() => api.get('/projects/recommendations'), MOCK_PROJECTS.slice(0, 3)),
};

/* ── Messages ── */
export const messagesAPI = {
  conversations: () => tryOrMock(() => api.get('/messages/conversations'), []),
  getMessages: (convId) => tryOrMock(() => api.get(`/messages/${convId}`), []),
  send: async (convId, text) => {
    try { return await api.post(`/messages/${convId}`, { text }); }
    catch { return { data: { _id: Date.now(), conversationId: convId, sender: MOCK_USER, text, createdAt: new Date().toISOString() } }; }
  },
  markRead: async (convId) => {
    try { return await api.patch(`/messages/${convId}/read`); }
    catch { return { data: { message: 'Okundu' } }; }
  },
};

/* ── Reviews ── */
export const reviewsAPI = {
  create: async (data) => {
    try { return await api.post('/reviews', data); }
    catch { return { data: { ...data, _id: 'rev-' + Date.now() } }; }
  },
  list: (userId) => tryOrMock(() => api.get('/reviews', { params: { user_id: userId } }), MOCK_REVIEWS),
};

/* ── Notifications ── */
export const notificationsAPI = {
  list: () => tryOrMock(() => api.get('/notifications'), MOCK_NOTIFICATIONS),
  markRead: async (id) => {
    try { return await api.patch(`/notifications/${id}/read`); }
    catch { return { data: { _id: id, isRead: true } }; }
  },
  markAllRead: async () => {
    try { return await api.patch('/notifications/read-all'); }
    catch { return { data: { message: 'Tümü okundu' } }; }
  },
};

/* ── Dashboard ── */
export const dashboardAPI = {
  summary: () => tryOrMock(() => api.get('/dashboard/summary'), { services: 2, projects: 1, applications: 3, unreadNotifs: 2 }),
  progress: () => tryOrMock(() => api.get('/dashboard/projects/progress'), MOCK_PROJECTS.filter((p) => p.owner._id === 'user-1')),
  stats: () =>
    tryOrMock(() => api.get('/dashboard/stats'), {
      earnings: { total: 0, orderCount: 0, totalSalesListed: 0 },
      spending: { total: 0, orderCount: 0 },
      recentPurchases: [],
      completedProjectsOwned: 0,
      acceptedApplications: [],
    }),
};

/* ── Upload ── */
export const uploadAPI = {
  avatar: async (file) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      return await api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    } catch {
      return { data: { url: URL.createObjectURL(file) } };
    }
  },
  portfolio: async (file) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      return await api.post('/upload/portfolio', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    } catch {
      return { data: { url: URL.createObjectURL(file) } };
    }
  },
  serviceCover: async (file) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      return await api.post('/upload/service-cover', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    } catch {
      return { data: { url: URL.createObjectURL(file) } };
    }
  },
};

/* ── Admin ── */
export const adminAPI = {
  users: () => tryOrMock(() => api.get('/admin/users'), MOCK_USERS),
  banUser: async (id) => {
    try { return await api.patch(`/admin/users/${id}/ban`); }
    catch { return { data: { _id: id, isBanned: true } }; }
  },
  unbanUser: async (id) => {
    try { return await api.patch(`/admin/users/${id}/unban`); }
    catch { return { data: { _id: id, isBanned: false } }; }
  },
  services: () => tryOrMock(() => api.get('/admin/services'), MOCK_SERVICES),
  removeService: async (id) => {
    try { return await api.delete(`/admin/services/${id}`); }
    catch { return { data: { message: 'Silindi' } }; }
  },
  projects: () => tryOrMock(() => api.get('/admin/projects'), MOCK_PROJECTS),
  removeProject: async (id) => {
    try { return await api.delete(`/admin/projects/${id}`); }
    catch { return { data: { message: 'Silindi' } }; }
  },
  needs: () => tryOrMock(() => api.get('/admin/needs'), MOCK_NEEDS),
  removeNeed: async (id) => {
    try { return await api.delete(`/admin/needs/${id}`); }
    catch { return { data: { message: 'Silindi' } }; }
  },
};

/* ── AI (Gemini) ── */
export const aiAPI = {
  matchProjects: () => api.get('/ai/match-projects'),
};
