---
title: Macbook Setup
permalink: /setup/macbook
---

Complete MacBook setup guide for **local development and playground** — with essential tools, apps, and configuration commands.

---

# 🛠 System Setup Guide for macOS

## 📦 Prerequisites

Install Xcode Command Line Tools:

```bash
xcode-select --install
````

Install Homebrew (package manager):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew update && brew doctor
```

---

## ⚙️ Zsh + Powerlevel10k

Install Zsh and plugins:

```bash
brew install zsh zsh-autosuggestions zsh-syntax-highlighting
chsh -s /bin/zsh
```

Add to your `~/.zshrc`:

```bash
source $(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source $(brew --prefix)/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
```

Install Powerlevel10k and fonts:

```bash
brew install powerlevel10k
brew tap homebrew/cask-fonts
brew install --cask font-meslo-lg-nerd-font
echo 'source $(brew --prefix)/share/powerlevel10k/powerlevel10k.zsh-theme' >> ~/.zshrc
p10k configure
```

---

## 💻 Terminal Tools

### Tmux

```bash
brew install tmux
```

Create `~/.tmux.conf`:

```bash
set -g prefix C-a
unbind C-b
set -g mouse on
set -g base-index 1
setw -g pane-base-index 1
```

(Optional TPM plugins):

```bash
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
```

### Fuzzy Finder Suite

```bash
brew install fzf ripgrep fd
$(brew --prefix)/opt/fzf/install
```

Add to `~/.zshrc`:

```bash
export FZF_DEFAULT_COMMAND='fd --type f --hidden --follow --exclude .git'
export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border'
```

---

## 🐳 Docker

Install Docker Desktop and helper tools:

```bash
brew install --cask docker
brew install lazydocker
docker compose version
```

---

## 🌱 Git

Install and configure Git:

```bash
brew install git lazygit git-extras

git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --global color.ui auto
```

Useful aliases:

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
```

### LazyGit (Terminal Git UI)

LazyGit provides a simple terminal UI for Git commands. Launch with:

```bash
lazygit
```

Key bindings:
- `q` - Quit
- `?` - Help/Key bindings
- `c` - Commit
- `P` - Push
- `p` - Pull
- `space` - Stage/unstage files
- `enter` - View file diff
- `m` - Merge
- `b` - Create branch
- `d` - Delete branch

Create config file `~/.config/lazygit/config.yml` for customization:

```yaml
gui:
  showFileTree: true
  showBranchCommitHash: true
  showDivergenceFromBaseBranch: true
git:
  autoFetch: true
  autoRefresh: true
```

---

## 🧪 Languages & Package Managers

### Node.js + npm (via nvm)

```bash
brew install node nvm
mkdir ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$(brew --prefix)/opt/nvm/nvm.sh" ] && \. "$(brew --prefix)/opt/nvm/nvm.sh"' >> ~/.zshrc
```

### Python + Conda

```bash
brew install python
brew install --cask miniconda
conda init zsh
```

Common usage:

```bash
conda create --name myenv python=3.11
conda activate myenv
conda deactivate
```

---

## 📝 Editors

```bash
brew install neovim vim
brew install --cask visual-studio-code
```

---

## 💼 Productivity Apps

```bash
brew install --cask rectangle
brew install --cask obsidian
brew install --cask keepassxc
brew install --cask displaylink
```

---

## ✅ Final Steps

```bash
source ~/.zshrc
zsh --version
tmux -V
docker --version
fzf --version
git --version
```

