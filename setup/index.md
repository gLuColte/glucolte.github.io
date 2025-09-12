---
title: setup
permalink: /setup/
---

<div class="hero">
  <div class="hero-text">
    <h1>/setup</h1>
    <p>
      Complete setup guides for development environments — choose your platform and get started with essential tools, configurations, and best practices.
    </p>
  </div>
</div>

---

# 🎮 Choose Your Setup

<div class="setup-selection">
  <div class="setup-card">
    <div class="setup-icon">💻</div>
    <h2>MacBook Setup</h2>
    <p>Complete macOS development environment with terminal tools, package managers, and productivity apps.</p>
    <div class="setup-features">
      <span class="feature-tag">Zsh + Powerlevel10k</span>
      <span class="feature-tag">Docker</span>
      <span class="feature-tag">Git + LazyGit</span>
      <span class="feature-tag">Node.js + Python</span>
      <span class="feature-tag">VS Code + Neovim</span>
    </div>
    <a href="{{ '/setup/macbook' | relative_url }}" class="setup-button">
      Start MacBook Setup →
    </a>
  </div>

  <div class="setup-card">
    <div class="setup-icon">🖥️</div>
    <h2>Server Setup</h2>
    <p>Linux server configuration for deployment, monitoring, and production environments.</p>
    <div class="setup-features">
      <span class="feature-tag">Ubuntu/Debian</span>
      <span class="feature-tag">Docker</span>
      <span class="feature-tag">Nginx</span>
      <span class="feature-tag">SSL/TLS</span>
      <span class="feature-tag">Monitoring</span>
    </div>
    <a href="{{ '/setup/server' | relative_url }}" class="setup-button">
      Start Server Setup →
    </a>
  </div>
</div>

<style>
.setup-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

.setup-card {
  background: var(--card);
  border: 2px solid var(--line);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.setup-card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.setup-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent), #60a5fa);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.setup-card:hover::before {
  opacity: 1;
}

.setup-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.setup-card h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: var(--ink);
}

.setup-card p {
  margin: 0 0 1.5rem 0;
  color: var(--muted);
  line-height: 1.6;
}

.setup-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.feature-tag {
  background: #f8fafc;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: var(--mono);
}

.setup-button {
  display: inline-block;
  background: var(--accent);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 2px solid var(--accent);
}

.setup-button:hover {
  background: white;
  color: var(--accent);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .setup-selection {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .setup-card {
    padding: 1.5rem;
  }
  
  .setup-features {
    justify-content: flex-start;
  }
}
</style>
