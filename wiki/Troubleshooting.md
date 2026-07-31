# 🛠️ Troubleshooting & Frequently Asked Questions

Common issues and solutions for deploying and running **Health Monitor**.

---

## ❓ Common Deployment Issues

### 1. `code: 10099` - Durable Objects KV backing not supported
- **Symptom**: Error when running `wrangler deploy`:
  > `Creating new key-value backed Durable Object namespaces is no longer supported on this account. Please create a namespace using a new_sqlite_classes migration instead.`
- **Solution**: Cloudflare requires SQLite-backed Durable Objects. Ensure your `wrangler.jsonc` uses `new_sqlite_classes` in migrations:
  ```jsonc
  "migrations": [
    {
      "tag": "v1",
      "new_sqlite_classes": ["RealtimeBroadcaster"]
    }
  ]
  ```

### 2. Worker URL disabled in Cloudflare Dashboard
- **Symptom**: Opening `https://<your-worker>.workers.dev` returns a 404 or connection error.
- **Solution**: Ensure `"workers_dev": true` is set in `wrangler.jsonc`. Alternatively, go to **Cloudflare Dashboard** -> **Workers & Pages** -> **health-monitor** -> **Domains** -> toggle **Production** to **ON**.

### 3. Setup Wizard appears on every visit
- **Symptom**: The Setup Wizard keeps launching even after setup completed.
- **Solution**: The Setup Wizard saves an auth token to your browser's `localStorage`. Make sure cookies/local storage are not blocked, or check if D1 database tables were successfully created during setup.

---

## 🔒 Security Best Practices

- Change your admin password regularly via the **Settings** modal or Wrangler secrets:
  ```bash
  npx wrangler secret put ADMIN_PASSWORD
  ```
- For enterprise environments, integrate **Cloudflare Access (Zero Trust)** in front of your Worker URL for seamless single sign-on (SSO).
