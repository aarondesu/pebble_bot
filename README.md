# 🧸 Pebble Bot — A Discord Bot

[![Tests](https://github.com/aarondesu/baguio_bot/actions/workflows/main.yml/badge.svg)](https://github.com/aarondesu/baguio_bot/actions/workflows/main.yml)

[![Build & Deploy](https://github.com/aarondesu/baguio_bot/actions/workflows/aws.yml/badge.svg)](https://github.com/aarondesu/baguio_bot/actions/workflows/aws.yml)

A discord bot. Currently in WIP. More features will be developed in the future.

---

## 🧰 Features
-  Reddit feed announcements

---

## ⚙️ Requirements

| Requirement | Version / Example |
|--------------|------------------|
| Node.js | >= 25.x |
| npm | >= 9.x |
| Discord.js | ^14.x |

### 🧾 Example `.env`
```env
# Discord
DISCORD_TOKEN=
DEV_GUILD_ID=

# Reddit
REDDIT_SECRET_KEY=
REDDIT_CLIENT_ID=
REDDIT_USERNAME=
REDDIT_PASSWORD=

# Supabase
SUPABASE_URL=
SUPABASE_KEY=

# Database
DATABASE_URI=

```
---

## 🚀 Setup & Installation
1. Clone the repository
```bash
git clone https://github.com/aarondesu/pebble_bot.git
```

2. Install dependencies
```bash
npm install
```
---
## 🧪 Development
To run the bot in development mode use 
```bash
npm run dev
```
To lint the code use 
```bash
npm run lint
```
---

## 📦 Deployment

### Local
To deploy the bot, first build the sources then run `start` to start the bot
```bash
npm run build
npm run start
```

### Docker
The repository already contains a github action to which it automatically deploys into an Amazon Elastic Container Registry (AWS ECR) which is then triggered by a pull request or a commit to the master branch. More info about the github action here: https://github.com/aws-actions/amazon-ecr-login

---

## 📜 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE.md) file for details.

---