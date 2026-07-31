# Security Policy

## 🛡️ Supported Versions

We actively maintain and release security updates for **Health Monitor**. The latest major release on the `main` branch is actively supported.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## 📩 Reporting a Vulnerability

The security of **Health Monitor** and its edge infrastructure is a top priority. If you discover a security vulnerability, please report it responsibly.

### How to Report

- **Email**: Send a detailed security report directly to **[maxiconta@gmail.com](mailto:maxiconta@gmail.com)**.
- **GitHub Private Advisory**: Submit a report via GitHub's [Private Vulnerability Reporting](https://github.com/mcontartesi/health-monitor/security/advisories/new).

### Please Include in Your Report:
- A clear description of the vulnerability and its potential impact.
- Step-by-step instructions or proof-of-concept (PoC) to reproduce the issue.
- Any suggested mitigations or patches, if available.

### Guidelines:
- **Do not open public GitHub Issues** or public discussions for unpatched security vulnerabilities.
- Please allow a reasonable response window before public disclosure.

---

## ⚡ Security Architecture & Edge Isolation

Health Monitor is built on security-first design principles for the Cloudflare ecosystem:

1. **SQL Injection Prevention**: All Cloudflare D1 database queries use strictly parameterized prepared statements (`env.DB.prepare(...).bind(...)`).
2. **Secrets & Environment Isolation**: Sensitive keys and webhook credentials (Discord, Slack, Telegram, Webhook URLs) are passed via Cloudflare Worker bindings or `.dev.vars` environment secrets.
3. **Sandbox Isolation**: Runs 100% serverless within Cloudflare Workers V8 isolated runtimes — zero persistent OS or host server attack surface.
4. **Input Sanitization**: Request bodies, user agents, and ping payload snippets are sanitized before persistence.

---

## ⏱️ Response & Disclosure Timeline

- **Initial Response**: Within 24-48 hours of receiving your report.
- **Triage & Assessment**: Within 3-5 business days.
- **Patch & Public Advisory**: Typically within 7-14 business days depending on issue complexity and severity.

Thank you for helping keep Health Monitor and the open-source community secure! 💚
