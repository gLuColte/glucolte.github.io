---
title: Ubuntu Setup
permalink: /setup/ubuntu
---

Complete Ubuntu setup guide for **local development and playground** on a GPU machine — includes Nvidia drivers, CUDA, dev tools, monitoring, and daily-use commands.

---

# 🧩 Base Setup

## Update & Essentials
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl wget git unzip net-tools software-properties-common ca-certificates gnupg lsb-release
```

---

# 🎨 Shell & Editor

## Zsh + Powerlevel10k

```bash
sudo apt install -y zsh fonts-powerline
chsh -s $(which zsh)

# Plugins
sudo apt install -y zsh-autosuggestions zsh-syntax-highlighting
echo 'source /usr/share/zsh-autosuggestions/zsh-autosuggestions.zsh' >> ~/.zshrc
echo 'source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh' >> ~/.zshrc

# Powerlevel10k
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/powerlevel10k
echo 'source ~/powerlevel10k/powerlevel10k.zsh-theme' >> ~/.zshrc
```

## Neovim

```bash
sudo apt install -y neovim
```

---

# 🧪 Development Tools

## Git + Lazygit

```bash
sudo apt install -y git
sudo add-apt-repository ppa:lazygit-team/release -y
sudo apt update && sudo apt install -y lazygit

git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

## Docker + Lazydocker

```bash
# Docker
sudo apt remove -y docker docker-engine docker.io containerd runc
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
| sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
newgrp docker

# Lazydocker
sudo curl -L https://github.com/jesseduffield/lazydocker/releases/latest/download/lazydocker_$(uname -s)_$(uname -m).tar.gz | sudo tar -xz -C /usr/local/bin lazydocker
```

---

# 💻 SSH Server

```bash
sudo apt install -y openssh-server
sudo systemctl enable ssh --now
sudo ufw allow ssh
sudo systemctl status ssh
```

---

# ⚡ Nvidia Drivers + CUDA

> **📋 Check Latest Versions**: For the most current Nvidia drivers and CUDA versions, visit:
> - **Nvidia Drivers**: https://www.nvidia.com/drivers/
> - **CUDA Toolkit**: https://developer.nvidia.com/cuda-downloads
> - **CUDA Archive**: https://developer.nvidia.com/cuda-toolkit-archive

## Install Nvidia Driver 520 + CUDA 11.8

```bash
#!/bin/bash
sudo apt purge nvidia* -y
sudo apt autoremove -y && sudo apt autoclean -y
sudo apt update && sudo apt upgrade -y
sudo apt install -y g++ freeglut3-dev build-essential libx11-dev libxmu-dev libxi-dev libglu1-mesa libglu1-mesa-dev
sudo add-apt-repository ppa:graphics-drivers/ppa -y
sudo apt update
sudo apt install -y libnvidia-common-520 libnvidia-gl-520 nvidia-driver-520

# CUDA 11.8 (check CUDA downloads page for latest version)
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin
sudo mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600
wget https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda-repo-ubuntu2204-11-8-local_11.8.0-520.61.05-1_amd64.deb
sudo dpkg -i cuda-repo-ubuntu2204-11-8-local_11.8.0-520.61.05-1_amd64.deb
sudo cp /var/cuda-repo-ubuntu2204-11-8-local/cuda-*-keyring.gpg /usr/share/keyrings/
sudo apt update && sudo apt -y install cuda
rm cuda-ubuntu2204.pin cuda-repo-ubuntu2204-11-8-local_11.8.0-520.61.05-1_amd64.deb
```

Reboot and verify:

```bash
sudo reboot now
nvidia-smi
nvtop
```

## (Optional) Container Toolkit

```bash
sudo apt remove --purge -y nvidia-container-toolkit
sudo apt update && sudo apt autoremove -y
apt list -a "*nvidia-container-toolkit*"
sudo apt install -y nvidia-container-toolkit=1.14.0-1 nvidia-container-toolkit-base=1.14.0-1
```

---

# 📊 Monitoring Tools

## CPU / Memory

```bash
top
vmstat 1
mpstat -P ALL 1
```

## Disk

```bash
iostat -x 1
```

## Network

```bash
traceroute -n -w 2 -m 15 www.google.com
sar -n DEV 1
```

## Processes / Syscalls

```bash
pidstat 1
perf record -F 99 -a -g -- sleep 10
perf report -n --stdio
```

---

# 🧠 Common Command Cheatsheet

## System Info

```bash
lsblk           # List block devices
df -h           # Disk usage
free -h         # Memory usage
lscpu            # CPU info
uname -a         # Kernel version
```

## Networking

```bash
ip a             # Show interfaces
ip route          # Show routes
netstat -tulnp    # Listening ports
traceroute <host> # Trace route
```

## File & Search

```bash
find . -name "*.log"
grep -R "pattern" .
du -h --max-depth=1
```

## Docker

```bash
docker ps -a
docker images
docker compose up -d
lazydocker
```

## Git

```bash
git status
git log --oneline --graph --decorate --all
lazygit
```

## Zsh

```bash
p10k configure
```

