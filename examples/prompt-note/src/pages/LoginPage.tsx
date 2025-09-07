/**
 * Login Page - Authentication entry point for Prompt Note
 */

import { Component } from "solid-js";
import { LoginForm, RegisterForm } from "reynard-auth";
import { Card } from "reynard-components";
import { useTheme } from "reynard-themes";
import "./LoginPage.css";

const LoginPage: Component = () => {
  const { theme } = useTheme();

  return (
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <h1>🦊 Prompt Note</h1>
          <p>OneNote-like note-taking with gamification and AI features</p>
          <div class="theme-info">Current theme: {theme}</div>
        </div>

        <div class="login-forms">
          <Card padding="lg" class="login-card">
            <h2>Welcome Back</h2>
            <p>Sign in to continue your note-taking journey</p>
            <LoginForm
              onSuccess={() => {
                console.log("Login successful");
              }}
              onError={(error: any) => {
                console.error("Login error:", error);
              }}
            />
          </Card>

          <Card padding="lg" class="register-card">
            <h2>New to Prompt Note?</h2>
            <p>Create an account and start your gamified note-taking adventure</p>
            <RegisterForm
              onSuccess={() => {
                console.log("Registration successful");
              }}
              onError={(error: any) => {
                console.error("Registration error:", error);
              }}
            />
          </Card>
        </div>

        <div class="login-features">
          <h3>🎮 Features</h3>
          <div class="feature-grid">
            <div class="feature-item">
              <span class="feature-icon">📝</span>
              <span>Rich Text Editing</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🤝</span>
              <span>Real-time Collaboration</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🤖</span>
              <span>AI-Powered Features</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🏆</span>
              <span>Gamification</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📱</span>
              <span>Cross-Platform</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🔒</span>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
