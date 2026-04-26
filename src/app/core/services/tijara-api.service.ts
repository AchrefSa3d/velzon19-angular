import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class TijaraApiService {

  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const currentUser = localStorage.getItem('currentUser');
    let token = '';
    if (currentUser) {
      try { token = JSON.parse(currentUser).token || ''; } catch {}
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  // ─── Auth ───────────────────────────────────────────────
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  googleLogin(credential: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/google`, { credential });
  }

  facebookLogin(accessToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/facebook`, { access_token: accessToken });
  }

  confirmEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/confirm-email?token=${token}`);
  }

  resendConfirm(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/resend-confirm`, { email });
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`, { headers: this.getHeaders() });
  }

  // ─── Produits ───────────────────────────────────────────
  getProducts(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`, { params, headers: this.getHeaders() });
  }

  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  createProduct(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, data, { headers: this.getHeaders() });
  }

  updateProduct(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${id}`, data, { headers: this.getHeaders() });
  }

  toggleProductStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/products/${id}/status`, {}, { headers: this.getHeaders() });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  // ─── Catégories ─────────────────────────────────────────
  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }

  getCategoriesAdmin(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories/all`, { headers: this.getHeaders() });
  }

  createCategory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, data, { headers: this.getHeaders() });
  }

  updateCategory(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${id}`, data, { headers: this.getHeaders() });
  }

  toggleCategory(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/categories/${id}/toggle`, {}, { headers: this.getHeaders() });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`, { headers: this.getHeaders() });
  }

  // ─── Commandes ──────────────────────────────────────────
  getOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders`, { headers: this.getHeaders() });
  }

  getOrder(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${id}`, { headers: this.getHeaders() });
  }

  createOrder(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, data, { headers: this.getHeaders() });
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/orders/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  // ─── Réclamations ───────────────────────────────────────
  getReclamations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reclamations`, { headers: this.getHeaders() });
  }

  createReclamation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reclamations`, data, { headers: this.getHeaders() });
  }

  updateReclamation(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reclamations/${id}`, data, { headers: this.getHeaders() });
  }

  // ─── Annonces ───────────────────────────────────────────
  getAnnonces(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/annonces`, { params });
  }

  getMyAnnonces(): Observable<any> {
    return this.http.get(`${this.apiUrl}/annonces/mine`, { headers: this.getHeaders() });
  }

  createAnnonce(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/annonces`, data, { headers: this.getHeaders() });
  }

  deleteAnnonce(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/annonces/${id}`, { headers: this.getHeaders() });
  }

  toggleLike(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/annonces/${id}/like`, {}, { headers: this.getHeaders() });
  }

  getComments(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/annonces/${id}/comments`);
  }

  addComment(id: number, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/annonces/${id}/comments`, { content }, { headers: this.getHeaders() });
  }

  // ─── Vendor profile (public) ────────────────────────────
  getVendorProfile(vendorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/vendor/${vendorId}`);
  }

  // ─── Reviews ────────────────────────────────────────────
  getProductReviews(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${productId}/reviews`);
  }

  addReview(productId: number, data: { rating: number; comment?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/products/${productId}/reviews`, data, { headers: this.getHeaders() });
  }

  deleteReview(productId: number, reviewId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${productId}/reviews/${reviewId}`, { headers: this.getHeaders() });
  }

  // ─── Profil ─────────────────────────────────────────────
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/profile`, data, { headers: this.getHeaders() });
  }

  changePassword(data: { current_password: string; new_password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, data, { headers: this.getHeaders() });
  }

  // ─── Messages ───────────────────────────────────────────
  getConversations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/conversations`, { headers: this.getHeaders() });
  }

  getConversationMessages(convId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/conversations/${convId}`, { headers: this.getHeaders() });
  }

  sendMessage(convId: number, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages/conversations/${convId}`, { content }, { headers: this.getHeaders() });
  }

  startConversation(data: { vendor_id: number; product_id?: number; product_name?: string; content: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages/start`, data, { headers: this.getHeaders() });
  }

  // ─── Admin modération ────────────────────────────────────
  getAdminAnnonces(status?: string): Observable<any> {
    const options: any = { headers: this.getHeaders() };
    if (status) options.params = { status };
    return this.http.get(`${this.apiUrl}/admin/annonces`, options);
  }

  approveAnnonce(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/annonces/${id}/approve`, {}, { headers: this.getHeaders() });
  }

  rejectAnnonce(id: number, reason?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/annonces/${id}/reject`, { reason }, { headers: this.getHeaders() });
  }

  getAdminPendingProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/products/pending`, { headers: this.getHeaders() });
  }

  approveProduct(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/products/${id}/approve`, {}, { headers: this.getHeaders() });
  }

  rejectProductAdmin(id: number, reason?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/products/${id}/reject`, { reason }, { headers: this.getHeaders() });
  }

  getMyProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/mine`, { headers: this.getHeaders() });
  }

  getAdminOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/orders`, { headers: this.getHeaders() });
  }

  updateAdminOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/orders/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  getAdminAllProducts(approvalStatus?: string): Observable<any> {
    const options: any = { headers: this.getHeaders() };
    if (approvalStatus) options.params = { approval_status: approvalStatus };
    return this.http.get(`${this.apiUrl}/admin/all-products`, options);
  }

  // ─── Admin profiles ──────────────────────────────────────
  getAdminVendorDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/vendors/${id}`, { headers: this.getHeaders() });
  }

  getAdminUserDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users/${id}`, { headers: this.getHeaders() });
  }

  deleteAdminUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${id}`, { headers: this.getHeaders() });
  }

  toggleAdminUser(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/users/${id}/toggle`, {}, { headers: this.getHeaders() });
  }

  // ─── Admin ──────────────────────────────────────────────
  getAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`, { headers: this.getHeaders() });
  }

  getAdminUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users`, { headers: this.getHeaders() });
  }

  getPendingVendors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/vendors/pending`, { headers: this.getHeaders() });
  }

  getAllVendors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/vendors`, { headers: this.getHeaders() });
  }

  approveVendor(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/vendors/${id}/approve`, {}, { headers: this.getHeaders() });
  }

  rejectVendor(id: number, reason?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/vendors/${id}/reject`, { reason }, { headers: this.getHeaders() });
  }

  // ─── Follows ─────────────────────────────────────────────
  toggleFollow(vendorId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/follows/${vendorId}`, {}, { headers: this.getHeaders() });
  }

  checkFollow(vendorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/follows/check/${vendorId}`, { headers: this.getHeaders() });
  }

  getMyFollows(): Observable<any> {
    return this.http.get(`${this.apiUrl}/follows/mine`, { headers: this.getHeaders() });
  }

  getMyFollowers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/follows/my-followers`, { headers: this.getHeaders() });
  }

  // ─── Notifications ───────────────────────────────────────
  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  markNotificationRead(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/${id}/read`, {}, { headers: this.getHeaders() });
  }

  markAllNotificationsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/read-all`, {}, { headers: this.getHeaders() });
  }

  // ─── Admin Settings ──────────────────────────────────────
  getAdminSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/settings`, { headers: this.getHeaders() });
  }

  updateAdminSettings(settings: Record<string, string>): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/settings`, { settings }, { headers: this.getHeaders() });
  }

  // ─── Point Packets (CRUD admin) ──────────────────────────
  getPointPackets(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/point-packets`, { headers: this.getHeaders() });
  }

  createPointPacket(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/point-packets`, payload, { headers: this.getHeaders() });
  }

  updatePointPacket(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/point-packets/${id}`, payload, { headers: this.getHeaders() });
  }

  deletePointPacket(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/point-packets/${id}`, { headers: this.getHeaders() });
  }

  // ─── Annonces (public detail) ────────────────────────────
  getAnnonce(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/annonces/${id}`);
  }

  // ─── Deals ───────────────────────────────────────────────
  getDeals(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/deals`, { params });
  }

  getDeal(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/deals/${id}`);
  }

  // ─── Vendors public ──────────────────────────────────────
  getVendors(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendors`, { params });
  }

  getVendor(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendors/${id}`);
  }

  // ─── LOT 1 — Admin catalog CRUD (generic helper) ─────────
  adminList(path: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/${path}`, { headers: this.getHeaders() });
  }
  adminCreate(path: string, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/${path}`, payload, { headers: this.getHeaders() });
  }
  adminUpdate(path: string, id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/${path}/${id}`, payload, { headers: this.getHeaders() });
  }
  adminPatch(subPath: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/${subPath}`, {}, { headers: this.getHeaders() });
  }
  adminDelete(path: string, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/${path}/${id}`, { headers: this.getHeaders() });
  }

  getAdminAllUsers(role?: string, premium?: string): Observable<any> {
    const params: any = {};
    if (role)    params.role    = role;
    if (premium) params.premium = premium;
    return this.http.get(`${this.apiUrl}/admin/all-users`, { headers: this.getHeaders(), params });
  }

  getAdminDeals(status?: string): Observable<any> {
    const params: any = status ? { status } : {};
    return this.http.get(`${this.apiUrl}/admin/deals`, { headers: this.getHeaders(), params });
  }

  toggleUserPremium(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/users/${id}/toggle-premium`, {}, { headers: this.getHeaders() });
  }

  // ─── LOT 2 — Wishlist (user) ─────────────────────────────
  getWishlistAds(): Observable<any> {
    return this.http.get(`${this.apiUrl}/wishlist/ads`, { headers: this.getHeaders() });
  }

  addToWishlist(type: 'ads' | 'deals', id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/wishlist/${type}/${id}`, {}, { headers: this.getHeaders() });
  }

  removeFromWishlist(type: 'ads' | 'deals', id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/wishlist/${type}/${id}`, { headers: this.getHeaders() });
  }

  getWishlistDeals(): Observable<any> {
    return this.http.get(`${this.apiUrl}/wishlist/deals`, { headers: this.getHeaders() });
  }

  checkWishlist(adId?: number, dealId?: number): Observable<any> {
    const params: any = {};
    if (adId)   params.adId   = adId;
    if (dealId) params.dealId = dealId;
    return this.http.get(`${this.apiUrl}/wishlist/check`, { headers: this.getHeaders(), params });
  }

  // ─── LOT 2 — Reviews ─────────────────────────────────────
  getReviews(type: string, targetId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews`, { params: { type, targetId } });
  }

  getReviewSummary(type: string, targetId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/summary`, { params: { type, targetId } });
  }

  getMyReviews(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/my`, { headers: this.getHeaders() });
  }

  addReviewGeneric(type: string, targetId: number, payload: { rating: number; comment?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews?type=${type}&targetId=${targetId}`, payload, { headers: this.getHeaders() });
  }

  deleteReviewGeneric(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${id}`, { headers: this.getHeaders() });
  }

  // ═══ LOT 3 + 6 ═══════════════════════════════════════════════════════════

  // ─── Permissions (admin) ─────────────────────────────────
  getPermissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/permissions`, { headers: this.getHeaders() });
  }
  getPermissionsByRole(idRole: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/permissions/role/${idRole}`, { headers: this.getHeaders() });
  }
  savePermission(p: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/permissions`, p, { headers: this.getHeaders() });
  }
  updatePermission(id: number, p: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/permissions/${id}`, p, { headers: this.getHeaders() });
  }
  deletePermission(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/permissions/${id}`, { headers: this.getHeaders() });
  }

  // ─── Payments ────────────────────────────────────────────
  createPayment(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments`, payload, { headers: this.getHeaders() });
  }
  getMyPayments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/payments/mine`, { headers: this.getHeaders() });
  }
  getAllPayments(status?: string): Observable<any> {
    const params: any = status ? { status } : {};
    return this.http.get(`${this.apiUrl}/payments`, { headers: this.getHeaders(), params });
  }
  refundPayment(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/${id}/refund`, {}, { headers: this.getHeaders() });
  }

  // ─── Public catalog (admin → users/vendors) ──────────────
  getPublicCoupons(): Observable<any> {
    return this.http.get(`${this.apiUrl}/coupons`);
  }
  getPublicPrizes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/prizes`);
  }
  getPublicBoostPacks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/boost-packs`, { headers: this.getHeaders() });
  }
  getPublicWinners(): Observable<any> {
    return this.http.get(`${this.apiUrl}/winners`);
  }

  // ─── Transports ──────────────────────────────────────────
  getTransports(onlyActive = false): Observable<any> {
    return this.http.get(`${this.apiUrl}/transports`, { params: { onlyActive } as any });
  }
  createTransport(t: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/transports`, t, { headers: this.getHeaders() });
  }
  updateTransport(id: number, t: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/transports/${id}`, t, { headers: this.getHeaders() });
  }
  toggleTransport(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/transports/${id}/toggle`, {}, { headers: this.getHeaders() });
  }
  deleteTransport(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/transports/${id}`, { headers: this.getHeaders() });
  }

  // ─── Deliveries ──────────────────────────────────────────
  getDeliveries(status?: string): Observable<any> {
    const params: any = status ? { status } : {};
    return this.http.get(`${this.apiUrl}/deliveries`, { headers: this.getHeaders(), params });
  }
  createDelivery(d: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/deliveries`, d, { headers: this.getHeaders() });
  }
  updateDeliveryStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/deliveries/${id}/status`, { status }, { headers: this.getHeaders() });
  }
  updateDelivery(id: number, d: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/deliveries/${id}`, d, { headers: this.getHeaders() });
  }

  // ─── Invoices ────────────────────────────────────────────
  getInvoices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/invoices`, { headers: this.getHeaders() });
  }
  getInvoice(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/invoices/${id}`, { headers: this.getHeaders() });
  }
  generateInvoiceFromOrder(orderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/invoices/from-order/${orderId}`, {}, { headers: this.getHeaders() });
  }
  markInvoicePaid(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/invoices/${id}/paid`, {}, { headers: this.getHeaders() });
  }

  // ─── Reports ─────────────────────────────────────────────
  getReportOverview(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/overview`, { headers: this.getHeaders() });
  }
  getSalesByMonth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/sales-by-month`, { headers: this.getHeaders() });
  }
  getTopProducts(limit = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/top-products`, { headers: this.getHeaders(), params: { limit } as any });
  }
  getTopCustomers(limit = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/top-customers`, { headers: this.getHeaders(), params: { limit } as any });
  }

  // ─── SMS ─────────────────────────────────────────────────
  sendSms(recipient: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sms`, { recipient, message }, { headers: this.getHeaders() });
  }
  getSmsLogs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sms`, { headers: this.getHeaders() });
  }
}
