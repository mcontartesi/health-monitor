# Contributing to Health Monitor

Thank you for your interest in contributing to **Health Monitor**! We welcome contributions from developers of all skill levels. By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🛠️ How to Contribute

### 1. Reporting Bugs
Before creating a bug report, please check existing GitHub Issues to avoid duplicates. When filing an issue, please use our **Bug Report template** and include:
- A clear, descriptive title.
- Steps to reproduce the behavior.
- Expected vs. actual behavior.
- Environment details (Node.js version, Cloudflare Wrangler version, Browser OS).

### 2. Suggesting Features
Enhancements and new feature ideas are always welcome! Please use our **Feature Request template** to explain:
- The problem your feature solves.
- Proposed solution and design details.
- Alternative solutions or workarounds considered.

### 3. Submitting Pull Requests (PRs)
1. **Fork the Repository**: Create your own fork of `cron-monitor`.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/my-amazing-feature
   ```
3. **Set Up Your Environment**:
   ```bash
   npm install
   npm run dev
   ```
4. **Make and Verify Your Changes**:
   - Ensure all TypeScript types pass check: `npx tsc --noEmit`
   - Run unit tests: `npm test`
   - Test locally with Wrangler D1: `npm run db:setup:local`
5. **Commit Your Changes**: Follow Conventional Commits convention:
   - `feat: add Telegram webhook alert integration`
   - `fix: resolve stale cron status calculation`
   - `docs: update API endpoints specification`
6. **Push & Open a Pull Request**: Push your branch to GitHub and open a PR against the `main` branch.

---

## 🎨 Code Style & Quality Guidelines

- **TypeScript**: Strict type safety. Avoid `any` types; prefer explicit interfaces and type definitions.
- **Frontend**: React 18 functional components with hooks and Tailwind CSS utility classes. Keep components modular in `src/frontend/components/`.
- **Backend/Worker**: Hono route modules in `src/worker/`. Keep database queries parametrized to prevent SQL injection.
- **Testing**: Write Vitest unit tests in `src/__tests__/` for new API endpoints or utility logic.

---

## 📜 License & Contributor Agreement

By contributing to Health Monitor, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
