import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    // Attach token to every request
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('qahal_access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Handle 401 — try refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;
          try {
            const refreshToken = localStorage.getItem('qahal_refresh_token');
            if (refreshToken) {
              const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
              localStorage.setItem('qahal_access_token', data.data.accessToken);
              localStorage.setItem('qahal_refresh_token', data.data.refreshToken);
              original.headers.Authorization = `Bearer ${data.data.accessToken}`;
              return this.client(original);
            }
          } catch {
            localStorage.removeItem('qahal_access_token');
            localStorage.removeItem('qahal_refresh_token');
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
          }
        }
        return Promise.reject(error);
      },
    );
  }

  // ─── Auth ─────────────────────────────────────────────────
  async register(data: {
    churchName: string; subdomain: string; firstName: string;
    lastName: string; email: string; password: string;
  }) {
    const res = await this.client.post('/auth/register', data);
    this.setTokens(res.data.data);
    return res.data;
  }

  async login(email: string, password: string) {
    const res = await this.client.post('/auth/login', { email, password });
    this.setTokens(res.data.data);
    return res.data;
  }

  async getProfile() {
    const res = await this.client.get('/auth/profile');
    return res.data;
  }

  async updateProfile(data: { firstName?: string; lastName?: string }) {
    const res = await this.client.patch('/auth/profile', data);
    return res.data;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const res = await this.client.post('/auth/change-password', data);
    return res.data;
  }

  async forgotPassword(email: string) {
    const res = await this.client.post('/auth/forgot-password', { email });
    return res.data;
  }

  async resetPassword(token: string, password: string) {
    const res = await this.client.post('/auth/reset-password', { token, password });
    return res.data;
  }

  async getTenant() {
    const res = await this.client.get('/auth/tenant');
    return res.data;
  }

  async updateTenant(data: { name?: string; currency?: string; timezone?: string }) {
    const res = await this.client.patch('/auth/tenant', data);
    return res.data;
  }

  logout() {
    localStorage.removeItem('qahal_access_token');
    localStorage.removeItem('qahal_refresh_token');
    localStorage.removeItem('qahal_user');
    window.location.href = '/auth/login';
  }

  // ─── Members ──────────────────────────────────────────────
  async getMembers(params?: Record<string, any>) {
    const res = await this.client.get('/members', { params });
    return res.data;
  }

  async getMember(id: string) {
    const res = await this.client.get(`/members/${id}`);
    return res.data;
  }

  async createMember(data: any) {
    const res = await this.client.post('/members', data);
    return res.data;
  }

  async updateMember(id: string, data: any) {
    const res = await this.client.patch(`/members/${id}`, data);
    return res.data;
  }

  async deleteMember(id: string) {
    const res = await this.client.delete(`/members/${id}`);
    return res.data;
  }

  async getMemberStats() {
    const res = await this.client.get('/members/stats');
    return res.data;
  }

  async getUpcomingBirthdays(days = 30) {
    const res = await this.client.get('/members/birthdays', { params: { days } });
    return res.data;
  }

  // ─── Attendance ───────────────────────────────────────────
  async checkIn(data: { eventId: string; memberId: string; checkInMethod?: string }) {
    const res = await this.client.post('/attendance/check-in', data);
    return res.data;
  }

  async batchCheckIn(data: { eventId: string; memberIds: string[] }) {
    const res = await this.client.post('/attendance/batch-check-in', data);
    return res.data;
  }

  async getAttendanceStats() {
    const res = await this.client.get('/attendance/stats');
    return res.data;
  }

  async getAttendanceReport(params?: Record<string, any>) {
    const res = await this.client.get('/attendance/reports', { params });
    return res.data;
  }

  async getAbsentees(params?: Record<string, any>) {
    const res = await this.client.get('/attendance/absentees', { params });
    return res.data;
  }

  async deleteAttendance(id: string) {
    const res = await this.client.delete(`/attendance/${id}`);
    return res.data;
  }

  // ─── Giving ───────────────────────────────────────────────
  async recordGiving(data: any) {
    const res = await this.client.post('/giving', data);
    return res.data;
  }

  async getGivingRecords(params?: Record<string, any>) {
    const res = await this.client.get('/giving', { params });
    return res.data;
  }

  async getGivingSummary() {
    const res = await this.client.get('/giving/summary');
    return res.data;
  }

  async deleteGiving(id: string) {
    const res = await this.client.delete(`/giving/${id}`);
    return res.data;
  }

  async getGivingReport(params: { from: string; to: string; groupBy?: string }) {
    const res = await this.client.get('/giving/reports', { params });
    return res.data;
  }

  // ─── Events ───────────────────────────────────────────────
  async getEvents(params?: Record<string, any>) {
    const res = await this.client.get('/events', { params });
    return res.data;
  }

  async createEvent(data: any) {
    const res = await this.client.post('/events', data);
    return res.data;
  }

  async deleteEvent(id: string) {
    const res = await this.client.delete(`/events/${id}`);
    return res.data;
  }

  // ─── Groups ───────────────────────────────────────────────
  async getGroups(params?: Record<string, any>) {
    const res = await this.client.get('/groups', { params });
    return res.data;
  }

  async getGroup(id: string) {
    const res = await this.client.get(`/groups/${id}`);
    return res.data;
  }

  async createGroup(data: any) {
    const res = await this.client.post('/groups', data);
    return res.data;
  }

  async addGroupMember(groupId: string, data: { memberId: string }) {
    const res = await this.client.post(`/groups/${groupId}/members`, data);
    return res.data;
  }

  async removeGroupMember(groupId: string, memberId: string) {
    const res = await this.client.delete(`/groups/${groupId}/members/${memberId}`);
    return res.data;
  }

  // ─── Assets ───────────────────────────────────────────────
  async getAssets(params?: Record<string, any>) {
    const res = await this.client.get('/assets', { params });
    return res.data;
  }

  async createAsset(data: any) {
    const res = await this.client.post('/assets', data);
    return res.data;
  }

  async updateAsset(id: string, data: any) {
    const res = await this.client.patch(`/assets/${id}`, data);
    return res.data;
  }

  async deleteAsset(id: string) {
    const res = await this.client.delete(`/assets/${id}`);
    return res.data;
  }

  async getAssetSummary() {
    const res = await this.client.get('/assets/summary');
    return res.data;
  }

  // ─── Reports ──────────────────────────────────────────────
  async getReportOverview() {
    const res = await this.client.get('/reports/overview');
    return res.data;
  }

  async getMemberAttendanceRates(months?: number) {
    const res = await this.client.get('/reports/attendance/member-rates', { params: { months } });
    return res.data;
  }

  async getFirstTimerConversions() {
    const res = await this.client.get('/reports/attendance/first-timer-conversions');
    return res.data;
  }

  async getSeasonalTrends() {
    const res = await this.client.get('/reports/attendance/seasonal-trends');
    return res.data;
  }

  async getServiceComparison() {
    const res = await this.client.get('/reports/attendance/service-comparison');
    return res.data;
  }

  async getWeeklyGiving(weeks?: number) {
    const res = await this.client.get('/reports/giving/weekly', { params: { weeks } });
    return res.data;
  }

  async getMonthlyIncome(year?: number) {
    const res = await this.client.get('/reports/giving/monthly', { params: { year } });
    return res.data;
  }

  async getMemberGivingStatement(memberId: string, year?: number) {
    const res = await this.client.get(`/reports/giving/member-statement/${memberId}`, { params: { year } });
    return res.data;
  }

  async getPledgeReport() {
    const res = await this.client.get('/reports/pledges');
    return res.data;
  }

  // ─── Messages ─────────────────────────────────────────────
  async sendMessage(data: any) {
    const res = await this.client.post('/messages', data);
    return res.data;
  }

  async getMessages(params?: Record<string, any>) {
    const res = await this.client.get('/messages', { params });
    return res.data;
  }

  // ─── Helpers ──────────────────────────────────────────────
  private setTokens(data: any) {
    if (data.accessToken) localStorage.setItem('qahal_access_token', data.accessToken);
    if (data.refreshToken) localStorage.setItem('qahal_refresh_token', data.refreshToken);
    if (data.user) localStorage.setItem('qahal_user', JSON.stringify(data.user));
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('qahal_access_token');
  }

  getUser() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('qahal_user');
    return user ? JSON.parse(user) : null;
  }
}

export const api = new ApiClient();
export default api;
