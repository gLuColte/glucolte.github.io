---
title: projects
permalink: /projects/
---

# /projects

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
    
    // Projects to ignore - edit this list directly in the code
    this.ignoreList = [
      'garyJune',
      'glucolte.github.io'
      // Add more project names here as needed
    ];
    
    this.init();
  }

  async init() {
    try {
      await this.loadProjects();
    } catch (error) {
      console.error('Error loading projects:', error);
      this.showError();
    }
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