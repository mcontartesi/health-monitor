# 🔔 Alerting & Notification Channels

Health Monitor supports instant multi-channel notifications when a monitor goes **DOWN** or recovers back to **UP**.

---

## 📢 Supported Integration Channels

### 1. Discord Webhooks
- **Config**: Paste your Discord Webhook URL.
- **Payload**: Rich color-coded embed messages (Red for DOWN, Green for RECOVERY) with monitor slug, duration, and timestamp.

### 2. Slack Webhooks
- **Config**: Paste your Slack Incoming Webhook URL.
- **Payload**: Formatted block kit notification message with action links.

### 3. Telegram Bot
- **Config**: Provide `bot_token` and `chat_id`.
- **Payload**: Instant HTML message sent directly to a Telegram channel or group.

### 4. Custom HTTP Webhooks
- **Config**: Provide target Endpoint URL, HTTP Method (`POST` / `PUT`), and optional secret headers.
- **Payload**: Standardized JSON event payload:
  ```json
  {
    "event": "MONITOR_DOWN",
    "monitor": {
      "name": "Database Nightly Backup",
      "slug": "db-backup",
      "status": "down"
    },
    "timestamp": "2026-07-31T19:30:00.000Z"
  }
  ```

---

## ⚙️ How to Configure Notifications

1. Open your Health Monitor Dashboard.
2. Click **Manage Alerts** or open **Settings** -> **Alert Integrations**.
3. Click **Add Channel**, select your integration type, and paste your webhook parameters.
4. Use the **Test Channel** button to send a verification alert!
