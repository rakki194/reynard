/**
 * Authentication API Tests
 * 
 * Tests all authentication endpoints:
 * - POST /api/auth/login
 * - POST /api/auth/register
 * - POST /api/auth/refresh
 * - GET /api/auth/profile
 */

import { describe, it, expect } from 'vitest';
import { apiRequest, getTestServer } from '../test-setup';

describe('Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@reynard.com',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');
      expect(data).toHaveProperty('expiresIn');
      
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('email');
      expect(data.user).toHaveProperty('name');
      expect(data.user).toHaveProperty('role');
    });

    it('should login with any email/password (mock behavior)', async () => {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'anypassword',
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.user.email).toBe('newuser@example.com');
      expect(data.user.name).toBe('newuser');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          // missing password
        }),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('required');
    });

    it('should return 400 for empty credentials', async () => {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: '',
          password: '',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        }),
      });

      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');
      
      expect(data.user.email).toBe('newuser@example.com');
      expect(data.user.name).toBe('New User');
      expect(data.user.role).toBe('user');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          // missing password and name
        }),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('required');
    });

    it('should return 409 for existing user', async () => {
      // First, register a user
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User',
        }),
      });

      // Try to register the same user again
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User',
        }),
      });

      expect(response.status).toBe(409);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const response = await apiRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: 'valid-refresh-token',
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');
      expect(data).toHaveProperty('expiresIn');
    });

    it('should return 400 for missing refresh token', async () => {
      const response = await apiRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('required');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile with valid token', async () => {
      // First login to get a token
      const loginResponse = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@reynard.com',
          password: 'password123',
        }),
      });

      const loginData = await loginResponse.json();
      const token = loginData.accessToken;

      // Get profile with token
      const response = await apiRequest('/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('email');
      expect(data.user).toHaveProperty('name');
    });

    it('should return 401 for missing authorization header', async () => {
      const response = await apiRequest('/auth/profile', {
        method: 'GET',
      });

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Authorization header required');
    });

    it('should return 401 for invalid token', async () => {
      const response = await apiRequest('/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Invalid or expired token');
    });

    it('should return 401 for malformed authorization header', async () => {
      const response = await apiRequest('/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: 'InvalidFormat token',
        },
      });

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Authorization header required');
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should complete full authentication flow', async () => {
      // 1. Register a new user
      const registerResponse = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'flowtest@example.com',
          password: 'password123',
          name: 'Flow Test User',
        }),
      });

      expect(registerResponse.status).toBe(201);
      const registerData = await registerResponse.json();
      const { accessToken, refreshToken, user } = registerData;

      // 2. Get profile with access token
      const profileResponse = await apiRequest('/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(profileResponse.status).toBe(200);
      const profileData = await profileResponse.json();
      expect(profileData.user.id).toBe(user.id);

      // 3. Refresh tokens
      const refreshResponse = await apiRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken,
        }),
      });

      expect(refreshResponse.status).toBe(200);
      const refreshData = await refreshResponse.json();
      expect(refreshData).toHaveProperty('accessToken');
      expect(refreshData).toHaveProperty('refreshToken');

      // 4. Login with the same credentials
      const loginResponse = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'flowtest@example.com',
          password: 'password123',
        }),
      });

      expect(loginResponse.status).toBe(200);
      const loginData = await loginResponse.json();
      expect(loginData.user.email).toBe('flowtest@example.com');
    });
  });
});
