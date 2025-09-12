# glucolte.github.io

Personal website and knowledge base built with Jekyll.

## 🌐 Live Site

Visit the site at: **[https://glucolte.github.io/](https://glucolte.github.io/)**

## 📖 About

This repository contains the source code for my personal website, which serves as a:

- **Knowledge base** for study notes, principles, and rules
- **Project showcase** with dynamic GitHub integration
- **Setup guides** for local development environments
- **Learning journal** documenting my journey in tech

## 🛠 Tech Stack

- **Jekyll** - Static site generator
- **GitHub Pages** - Hosting
- **Vanilla JavaScript** - Dynamic features (GitHub API integration)
- **CSS** - Custom styling with CSS variables

## 📁 Structure

```
├── _layouts/          # Jekyll layouts
├── _includes/         # Reusable components
├── assets/            # CSS and images
├── study/             # Study notes and guides
├── projects/          # Project showcase (auto-generated from GitHub)
├── setup/             # Development environment guides
├── principles.md      # Core principles
├── rules.md          # Personal rules
└── stretches.md      # Physical wellness
```

## 🚀 Features

- **Dynamic Projects Page** - Automatically fetches and displays GitHub repositories
- **Search & Filter** - Client-side filtering for projects
- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** - System preference detection
- **Study Organization** - LeetCode and System Design sections

## 📝 Content

The site focuses on:

- **Study Materials** - Coding interview prep, system design
- **Development Setup** - MacBook and Ubuntu server configurations
- **Personal Principles** - Core values and decision-making frameworks
- **Project Portfolio** - Showcase of GitHub repositories

## 🔧 Local Development

```bash
# Clone the repository
git clone https://github.com/gLuColte/glucolte.github.io.git
cd glucolte.github.io

# Install Ruby > 3.2+
brew install ruby
gem install bundler jekyll
bundle install
# Check version
which ruby
ruby -v

# Install Jekyll (if not already installed)
gem install bundler jekyll

# Create Gemfile (if it doesn't exist)
echo "source 'https://rubygems.org'
gem 'github-pages', group: :jekyll_plugins
gem 'jekyll-seo-tag'
gem 'jekyll-sitemap'" > Gemfile

# Install dependencies
bundle install

# Alternative: Use system Ruby instead of Conda

# Serve locally
bundle exec jekyll serve

# Visit http://localhost:4000
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
