# 🔥 Void Runner — HackerGame

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node](https://img.shields.io/badge/Node-22+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![CI](https://img.shields.io/badge/CI-Angular_CLI-blue)](https://angular.dev)

> **An immersive cyberpunk hacking simulator — breach networks, exploit vulnerabilities, conquer the digital underworld.**  
> Built with Angular 21, TypeScript, and a deep narrative-driven gameplay engine.

## 🎮 About

Void Runner is a browser-based hacking game that puts you in the seat of a netrunner in a dystopian cyberpunk world. Explore a rich digital landscape, from corporate megacorps to underground anarchist collectives.

## 📚 Game Content

The game features **25 chapters** of lore, manuals, and guides:

| # | Chapter | Type |
|---|---------|------|
| 01 | Origins of the Void | Lore |
| 02 | Megacorporations | Lore |
| 03 | Fixers & Contacts | Lore |
| 04 | Anarchist Collectives | Lore |
| 05 | Blue Team Defenders | Lore |
| 08 | Neural Uplink | Lore |
| 09 | Terminal Basics | Manual |
| 10 | Advanced Commands | Manual |
| 11 | Hardware Hacking | Manual |
| 12 | Asset Vault | Manual |
| 15 | Darknet Markets | Manual |
| 17-25 | Port Scan → Quantum Exploits | Guides |

## 🚀 Development

### Prerequisites
- Node.js 22+
- Angular CLI 21+

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Open in browser
open http://localhost:4200

# Run tests
ng test

# Build for production
ng build
```

### Docker

```bash
docker build -t void-runner .
docker run -p 4200:80 void-runner
```

## 🏗️ Project Structure

```
void-runner/
├── src/               # Angular application source
├── server/            # Backend server
├── e2e/               # End-to-end tests
├── book/              # 25 chapters of game content
├── public/            # Static assets
├── screenshots/       # Game screenshots
└── videos/            # Game trailers & previews
```

## 🧪 Testing

```bash
# Unit tests
ng test

# E2E tests
ng e2e

# Lint
ng lint
```

## 📄 License

MIT