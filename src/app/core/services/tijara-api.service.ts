import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class TijaraApiService {

  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const currentUser = sessionStorage.getItem('currentUser');
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

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  // ─── Catégories ─────────────────────────────────────────
  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`, { headers: this.getHeaders() });
  }

  createCategory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, data, { headers: this.getHeaders() });
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
}
