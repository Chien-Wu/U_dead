/**
 * API Client Service
 * Connects to backend at http://localhost:3000/api/v1
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api/v1';

// Types
export interface User {
  id: string;
  email: string;
  auth_provider: 'google' | 'apple' | 'email';
  checkin_period_hours: number;
  last_active_at: string;
  is_dead: boolean;
  next_deadline: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  next_deadline: string;
  seconds_until_deadline: number;
}

export interface StatusResponse {
  is_dead: boolean;
  last_active_at: string;
  next_deadline: string;
  seconds_remaining: number;
  status: 'safe' | 'warning' | 'critical' | 'dead';
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  death_message: string;
  created_at: string;
}

export interface CheckInLog {
  id: string;
  timestamp: string;
  ip_address: string;
}

export interface LogsResponse {
  logs: CheckInLog[];
  total_count: number;
  has_more: boolean;
}

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use(async (config) => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired - clear auth
          SecureStore.deleteItemAsync('auth_token');
        }
        return Promise.reject(error);
      }
    );
  }

  // ========== AUTHENTICATION ==========

  async loginWithGoogle(idToken: string): Promise<{ accessToken: string; user: User }> {
    const { data } = await this.client.post('/auth/google', { id_token: idToken });
    return { accessToken: data.access_token, user: data.user };
  }

  async loginWithApple(identityToken: string, userEmail: string): Promise<{ accessToken: string; user: User }> {
    const { data } = await this.client.post('/auth/apple', {
      identity_token: identityToken,
      user_email: userEmail,
    });
    return { accessToken: data.access_token, user: data.user };
  }

  async getMe(): Promise<User> {
    const { data } = await this.client.get('/auth/me');
    return data;
  }

  // ========== CHECK-IN ==========

  async checkIn(): Promise<CheckInResponse> {
    const { data } = await this.client.post('/check-in', {});
    return data;
  }

  async getStatus(): Promise<StatusResponse> {
    const { data } = await this.client.get('/status');
    return data;
  }

  // ========== CONTACTS ==========

  async getContacts(): Promise<Contact[]> {
    const { data } = await this.client.get('/contacts');
    return data.contacts;
  }

  async addContact(contact: {
    name: string;
    email: string;
    death_message: string;
  }): Promise<Contact> {
    const { data } = await this.client.post('/contacts', contact);
    return data;
  }

  async updateContact(
    id: string,
    contact: { name: string; email: string; death_message: string }
  ): Promise<Contact> {
    const { data } = await this.client.put(`/contacts/${id}`, contact);
    return data;
  }

  async deleteContact(id: string): Promise<void> {
    await this.client.delete(`/contacts/${id}`);
  }

  // ========== SETTINGS ==========

  async getSettings(): Promise<{ checkin_period_hours: number }> {
    const { data } = await this.client.get('/settings');
    return data;
  }

  async updateSettings(checkinPeriodHours: number): Promise<{ checkin_period_hours: number; message: string }> {
    const { data } = await this.client.put('/settings', {
      checkin_period_hours: checkinPeriodHours,
    });
    return data;
  }

  // ========== LOGS ==========

  async getLogs(limit = 50, offset = 0): Promise<LogsResponse> {
    const { data } = await this.client.get('/logs', {
      params: { limit, offset },
    });
    return data;
  }

  // ========== DEVICES ==========

  async registerDevice(pushToken: string, platform: 'ios' | 'android'): Promise<void> {
    await this.client.post('/devices', { push_token: pushToken, platform });
  }

  async unregisterDevice(pushToken: string): Promise<void> {
    await this.client.delete(`/devices/${pushToken}`);
  }

  // ========== ACCOUNT ==========

  async deleteAccount(): Promise<void> {
    await this.client.delete('/account', { data: { confirm: 'DELETE' } });
  }
}

export default new APIClient();
