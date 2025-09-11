---
title: projects
permalink: /projects/
---

# /projects

## Configuration

<div class="config-section">
  <h3>Ignore Projects</h3>
  <p>Add project names (one per line) to hide them from the list:</p>
  <textarea id="ignore-list" placeholder="project-name-1&#10;project-name-2&#10;another-project" rows="4"></textarea>
  <button id="apply-config" class="config-button">Apply Changes</button>
  <button id="reset-config" class="config-button secondary">Reset to Default</button>
</div>

---

<div id="projects-container">
  <div id="loading" class="loading">
    <div class="loading-spinner"></div>
    <p id="loading-text">Fetching repositories...</p>
    <div class="loading-progress">
      <div class="progress-bar" id="progress-bar"></div>
      <span id="progress-text">0 / 0</span>
    </div>
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
    return saved ? saved.split('\n').filter(name => name.trim()) : [];
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
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    try {
      // Step 1: Fetch repositories
      loadingText.textContent = 'Fetching repositories...';
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

      // Step 2: Load READMEs with progress tracking
      loadingText.textContent = 'Loading project details...';
      progressText.textContent = `0 / ${filteredRepos.length}`;
      
      const projectsWithReadme = await this.loadReadmesWithProgress(filteredRepos, progressBar, progressText);

      this.renderProjects(projectsWithReadme);
      
      loadingEl.style.display = 'none';
      projectsEl.style.display = 'block';
      
    } catch (error) {
      console.error('Error fetching projects:', error);
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';
      errorEl.querySelector('p').textContent = error.message || 'Failed to load projects. Please try again later.';
    }
  }

  async loadReadmesWithProgress(repos, progressBar, progressText) {
    const projectsWithReadme = [];
    const total = repos.length;
    
    for (let i = 0; i < repos.length; i++) {
      const repo = repos[i];
      
      try {
        // Add small delay to avoid rate limiting (only for README requests)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        const readmeResponse = await fetch(`${this.apiBase}/repos/${this.username}/${repo.name}/readme`);
        let readmeContent = null;
        
        if (readmeResponse.ok) {
          const readmeData = await readmeResponse.json();
          readmeContent = atob(readmeData.content);
        }
        
        projectsWithReadme.push({
          ...repo,
          readme: readmeContent
        });
      } catch (error) {
        console.warn(`Could not fetch README for ${repo.name}:`, error);
        projectsWithReadme.push({
          ...repo,
          readme: null
        });
      }
      
      // Update progress
      const progress = ((i + 1) / total) * 100;
      progressBar.style.setProperty('--progress', `${progress}%`);
      progressText.textContent = `${i + 1} / ${total}`;
    }
    
    return projectsWithReadme;
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
    
    let readmePreview = '';
    if (project.readme) {
      // Clean and truncate README content
      const cleanReadme = project.readme
        .replace(/^#+\s*.*$/gm, '') // Remove headers
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();
      
      const truncatedReadme = cleanReadme.length > 200 
        ? cleanReadme.substring(0, 200) + '...' 
        : cleanReadme;
      
      if (truncatedReadme) {
        readmePreview = `<div class="readme-preview">${truncatedReadme}</div>`;
      }
    }

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
        ${readmePreview}
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