---
title: projects
permalink: /projects/
---

# /projects

## Configuration

<div class="config-section">
  <h3>Ignore Projects</h3>
  <p>Add project names (one per line) to hide them from the list:</p>
  <textarea id="ignore-list" placeholder="garyJune&#10;glucolte.github.io&#10;another-project" rows="4"></textarea>
  <button id="apply-config" class="config-button">Apply Changes</button>
  <button id="reset-config" class="config-button secondary">Reset to Default</button>
</div>

---

<div id="projects-container">
  <div id="loading" class="loading">
    <div class="loading-spinner"></div>
    <p id="loading-text">Loading projects...</p>
  </div>
  <div id="error" class="error" style="display: none;">
    <p>Failed to load projects. Please try again later.</p>
    <button id="retry-button" class="retry-button">Retry</button>
  </div>
  <div id="projects-list" class="projects-list" style="display: none;">
    <!-- Projects will be dynamically loaded here -->
  </div>
</div>

<script>
class GitHubProjects {
  constructor() {
    this.username = 'gLuColte'; // Your GitHub username
    this.apiBase = 'https://api.github.com';
    this.ignoreList = this.loadIgnoreList();
    this.init();
  }

  loadIgnoreList() {
    const saved = localStorage.getItem('github-projects-ignore');
    return saved ? saved.split('\n').filter(name => name.trim()) : ['garyJune', 'glucolte.github.io'];
  }

  saveIgnoreList() {
    localStorage.setItem('github-projects-ignore', this.ignoreList.join('\n'));
  }

  async init() {
    this.setupConfigUI();
    try {
      await this.loadProjects();
    } catch (error) {
      console.error('Error loading projects:', error);
      this.showError();
    }
  }

  setupConfigUI() {
    const ignoreTextarea = document.getElementById('ignore-list');
    const applyButton = document.getElementById('apply-config');
    const resetButton = document.getElementById('reset-config');

    // Load current ignore list
    ignoreTextarea.value = this.ignoreList.join('\n');

    applyButton.addEventListener('click', () => {
      const newIgnoreList = ignoreTextarea.value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name);
      
      this.ignoreList = newIgnoreList;
      this.saveIgnoreList();
      this.renderProjects(this.currentProjects || []);
    });

    resetButton.addEventListener('click', () => {
      this.ignoreList = [];
      this.saveIgnoreList();
      ignoreTextarea.value = '';
      this.renderProjects(this.currentProjects || []);
    });
  }

  async loadProjects() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const projectsEl = document.getElementById('projects-list');
    const loadingText = document.getElementById('loading-text');

    try {
      // Fetch repositories
      loadingText.textContent = 'Loading projects...';
      const reposResponse = await fetch(`${this.apiBase}/users/${this.username}/repos?sort=updated&per_page=100`);
      
      if (!reposResponse.ok) {
        if (reposResponse.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        throw new Error(`HTTP error! status: ${reposResponse.status}`);
      }
      
      const repos = await reposResponse.json();
      
      // Filter out forks, ignored projects, and GitHub Pages site
      const filteredRepos = repos
        .filter(repo => !repo.fork && 
                       repo.name !== this.username + '.github.io' &&
                       !this.ignoreList.includes(repo.name))
        .sort((a, b) => b.stargazers_count - a.stargazers_count);

      this.currentProjects = filteredRepos;

      // Projects are ready to render (no README fetching needed)
      this.renderProjects(filteredRepos);
      
      loadingEl.style.display = 'none';
      projectsEl.style.display = 'block';
      
    } catch (error) {
      console.error('Error fetching projects:', error);
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';
      errorEl.querySelector('p').textContent = error.message || 'Failed to load projects. Please try again later.';
    }
  }

  renderProjects(projects) {
    const projectsEl = document.getElementById('projects-list');
    
    if (projects.length === 0) {
      projectsEl.innerHTML = '<p>No projects found.</p>';
      return;
    }

    const projectsHTML = projects.map(project => this.createProjectCard(project)).join('');
    projectsEl.innerHTML = projectsHTML;
  }

  createProjectCard(project) {
    const languages = project.language ? `<span class="language">${project.language}</span>` : '';
    const stars = project.stargazers_count > 0 ? `<span class="stars">⭐ ${project.stargazers_count}</span>` : '';
    const updatedDate = new Date(project.updated_at).toLocaleDateString();

    return `
      <div class="project-card">
        <div class="project-header">
          <h3 class="project-title">
            <a href="${project.html_url}" target="_blank" rel="noopener">${project.name}</a>
          </h3>
          <div class="project-meta">
            ${languages}
            ${stars}
            <span class="updated">Updated ${updatedDate}</span>
          </div>
        </div>
        ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
        <div class="project-links">
          <a href="${project.html_url}" target="_blank" rel="noopener">View on GitHub</a>
          ${project.homepage ? `<a href="${project.homepage}" target="_blank" rel="noopener">Live Demo</a>` : ''}
        </div>
      </div>
    `;
  }

  showError() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    
    // Setup retry button
    const retryButton = document.getElementById('retry-button');
    retryButton.addEventListener('click', () => {
      document.getElementById('error').style.display = 'none';
      document.getElementById('loading').style.display = 'block';
      this.loadProjects();
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new GitHubProjects();
});
</script>