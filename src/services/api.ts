const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Fix linter for import.meta.env
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("auth_token");
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse(response);
  }

  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    return this.handleResponse(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Products endpoints
  async getProducts(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append("category", params.category);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const response = await fetch(`${this.baseURL}/products?${searchParams}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getProduct(id: number) {
    const response = await fetch(`${this.baseURL}/products/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createProduct(productData: any) {
    const response = await fetch(`${this.baseURL}/products`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(productData),
    });

    return this.handleResponse(response);
  }

  async updateProduct(id: number, productData: any) {
    const response = await fetch(`${this.baseURL}/products/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(productData),
    });

    return this.handleResponse(response);
  }

  async deleteProduct(id: number) {
    const response = await fetch(`${this.baseURL}/products/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Categories endpoints
  async getCategories() {
    const response = await fetch(`${this.baseURL}/categories`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createCategory(categoryData: any) {
    const response = await fetch(`${this.baseURL}/categories`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(categoryData),
    });

    return this.handleResponse(response);
  }

  // Cart endpoints
  async getCart() {
    const response = await fetch(`${this.baseURL}/cart`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async addToCart(productId: number, quantity: number = 1) {
    const response = await fetch(`${this.baseURL}/cart`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });

    return this.handleResponse(response);
  }

  async updateCartItem(id: number, quantity: number) {
    const response = await fetch(`${this.baseURL}/cart/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ quantity }),
    });

    return this.handleResponse(response);
  }

  async removeFromCart(id: number) {
    const response = await fetch(`${this.baseURL}/cart/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async clearCart() {
    const response = await fetch(`${this.baseURL}/cart`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Orders endpoints
  async getOrders() {
    const response = await fetch(`${this.baseURL}/orders`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createOrder(orderData: {
    items: Array<{ product_id: number; quantity: number }>;
    shipping_address: string;
    shipping_fee?: number;
    discount?: number;
    promo_code?: string;
    final_total?: number;
  }) {
    const response = await fetch(`${this.baseURL}/orders`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(orderData),
    });

    return this.handleResponse(response);
  }

  // Wishlist endpoints
  async getWishlist() {
    const response = await fetch(`${this.baseURL}/wishlist`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async addToWishlist(productId: number) {
    const response = await fetch(`${this.baseURL}/wishlist`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ product_id: productId }),
    });

    return this.handleResponse(response);
  }

  async removeFromWishlist(id: number) {
    const response = await fetch(`${this.baseURL}/wishlist/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async removeFromWishlistByProduct(productId: number) {
    const response = await fetch(
      `${this.baseURL}/wishlist/product/${productId}`,
      {
        method: "DELETE",
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse(response);
  }

  // Reviews endpoints
  async getProductReviews(productId: number) {
    const response = await fetch(
      `${this.baseURL}/reviews/product/${productId}`,
      {
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse(response);
  }

  async createReview(reviewData: {
    product_id: number;
    rating: number;
    comment: string;
  }) {
    const response = await fetch(`${this.baseURL}/reviews`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(reviewData),
    });

    return this.handleResponse(response);
  }

  // User endpoints
  async getUserProfile() {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async updateUserProfile(profileData: {
    first_name: string;
    last_name: string;
    phone?: string;
  }) {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(profileData),
    });

    return this.handleResponse(response);
  }

  async changePassword(passwordData: {
    current_password: string;
    new_password: string;
  }) {
    const response = await fetch(`${this.baseURL}/users/password`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(passwordData),
    });

    return this.handleResponse(response);
  }

  // Admin endpoints
  async getAdminStats() {
    const response = await fetch(`${this.baseURL}/admin/stats`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getSalesAnalytics(period: string = "month") {
    const response = await fetch(
      `${this.baseURL}/admin/analytics/sales?period=${period}`,
      {
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse(response);
  }

  async getProductAnalytics() {
    const response = await fetch(`${this.baseURL}/admin/analytics/products`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getAllOrders() {
    const response = await fetch(`${this.baseURL}/orders/admin`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async updateOrderStatus(orderId: number, status: string) {
    const response = await fetch(`${this.baseURL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });

    return this.handleResponse(response);
  }

  async getAllUsers() {
    const response = await fetch(`${this.baseURL}/users/admin`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async updateUserStatus(userId: number, isActive: boolean) {
    const response = await fetch(
      `${this.baseURL}/users/admin/${userId}/status`,
      {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify({ is_active: isActive }),
      }
    );

    return this.handleResponse(response);
  }

  async updateUserRole(userId: number, role: string) {
    const response = await fetch(`${this.baseURL}/users/admin/${userId}/role`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ role }),
    });

    return this.handleResponse(response);
  }

  // Promotions endpoints
  async getPromotions() {
    const response = await fetch(`${this.baseURL}/promotions`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createPromotion(promotionData: any) {
    const response = await fetch(`${this.baseURL}/promotions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(promotionData),
    });
    return this.handleResponse(response);
  }

  async updatePromotion(id: number, promotionData: any) {
    const response = await fetch(`${this.baseURL}/promotions/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(promotionData),
    });
    return this.handleResponse(response);
  }

  async deletePromotion(id: number) {
    const response = await fetch(`${this.baseURL}/promotions/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Admin Reviews endpoints
  async getAllReviews() {
    const response = await fetch(`${this.baseURL}/reviews/admin`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async approveReview(reviewId: number) {
    const response = await fetch(`${this.baseURL}/reviews/admin/${reviewId}/approve`, {
      method: "PUT",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async rejectReview(reviewId: number) {
    const response = await fetch(`${this.baseURL}/reviews/admin/${reviewId}/reject`, {
      method: "PUT",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async deleteReview(reviewId: number) {
    const response = await fetch(`${this.baseURL}/reviews/admin/${reviewId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateReviewReply(reviewId: number, reply: string) {
    const response = await fetch(`${this.baseURL}/reviews/admin/${reviewId}/reply`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ reply }),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
