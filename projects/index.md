---
title: projects
permalink: /projects/
---

# /projects

<div id="projects-container">
  <div id="loading" class="loading">
    <p>Loading projects...</p>
  </div>
  <div id="error" class="error" style="display: none;">
    <p>Failed to load projects. Please try again later.</p>
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

    try {
      // Fetch repositories with error handling
      const reposResponse = await fetch(`${this.apiBase}/users/${this.username}/repos?sort=updated&per_page=100`);
      
      if (!reposResponse.ok) {
        if (reposResponse.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        throw new Error(`HTTP error! status: ${reposResponse.status}`);
      }
      
      const repos = await reposResponse.json();
      
      // Filter out forks and sort by stars (descending)
      const filteredRepos = repos
        .filter(repo => !repo.fork && repo.name !== this.username + '.github.io')
        .sort((a, b) => b.stargazers_count - a.stargazers_count);

      // Load README for each repository with delay to avoid rate limiting
      const projectsWithReadme = await this.loadReadmesWithDelay(filteredRepos);

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

  async loadReadmesWithDelay(repos) {
    const projectsWithReadme = [];
    
    for (let i = 0; i < repos.length; i++) {
      const repo = repos[i];
      
      try {
        // Add small delay to avoid rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
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
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new GitHubProjects();
});
</script>