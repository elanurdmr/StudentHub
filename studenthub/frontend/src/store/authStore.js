import { create } from 'zustand';

const stored = () => {
  try {
    const token = localStorage.getItem('sh_token');
    const user = JSON.parse(localStorage.getItem('sh_user') || 'null');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const useAuthStore = create((set) => ({
  ...stored(),
  login(token, user) {
    localStorage.setItem('sh_token', token);
    localStorage.setItem('sh_user', JSON.stringify(user));
    set({ token, user });
  },
  logout() {
    localStorage.removeItem('sh_token');
    localStorage.removeItem('sh_user');
    set({ token: null, user: null });
  },
  updateUser(user) {
    localStorage.setItem('sh_user', JSON.stringify(user));
    set({ user });
  },
}));

export default useAuthStore;
