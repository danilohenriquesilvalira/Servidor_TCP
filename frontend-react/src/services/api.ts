// Serviços de API EDP - Conexão com backend Go
import {
  User,
  LoginRequest,
  LoginResponse,
  UserPermissions,
  UserCreateRequest,
  UserUpdateRequest,
  ChangePasswordRequest,
  ApiError
} from '@/types/auth';

// Configuração da API
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8081';
const API_PREFIX = '/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = `${API_BASE_URL}${API_PREFIX}`;
    // Recupera o token do localStorage se existir
    this.token = localStorage.getItem('edp_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('edp_token', token);
    } else {
      localStorage.removeItem('edp_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Adiciona token de autorização se existir
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Parse da resposta JSON
      const data = await response.json();

      if (!response.ok) {
        // Trata erros da API
        const error = data as ApiError;
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de conexão com o servidor');
    }
  }

  // Endpoints de Autenticação
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Define o token automaticamente após login bem-sucedido
    this.setToken(response.token);
    
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/me');
  }

  async getUserPermissions(): Promise<UserPermissions> {
    return this.request<UserPermissions>('/permissions');
  }

  // Endpoints de Usuários
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(userData: UserCreateRequest): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: UserUpdateRequest): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(id: string, passwordData: ChangePasswordRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async blockUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}/block`, {
      method: 'PUT',
    });
  }

  async unblockUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}/unblock`, {
      method: 'PUT',
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Health Check
  async healthCheck(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.text();
  }

  // Logout (limpa token)
  logout() {
    this.setToken(null);
  }
}

// Instância única do serviço
export const apiService = new ApiService();

// Funções de conveniência
export const authAPI = {
  login: (credentials: LoginRequest) => apiService.login(credentials),
  getCurrentUser: () => apiService.getCurrentUser(),
  getUserPermissions: () => apiService.getUserPermissions(),
  logout: () => apiService.logout(),
};

export const usersAPI = {
  getAll: () => apiService.getUsers(),
  getById: (id: string) => apiService.getUserById(id),
  create: (userData: UserCreateRequest) => apiService.createUser(userData),
  update: (id: string, userData: UserUpdateRequest) => apiService.updateUser(id, userData),
  changePassword: (id: string, passwordData: ChangePasswordRequest) => 
    apiService.changePassword(id, passwordData),
  block: (id: string) => apiService.blockUser(id),
  unblock: (id: string) => apiService.unblockUser(id),
  delete: (id: string) => apiService.deleteUser(id),
};

export default apiService;