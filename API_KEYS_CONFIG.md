# VOID_RUNNER API KEYS CONFIGURATION
# This file contains all API keys and configuration for external services
# Store this file securely and never commit it to version control

## Environment Variables
# Add these to your .env file or environment

# =============================================================================
# AUTHENTICATION & IDENTITY
# =============================================================================

# OAuth 2.0 Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Session Configuration
SESSION_SECRET=your_session_secret_key_here
SESSION_EXPIRES_IN=24h

# =============================================================================
# PAYMENT PROCESSING
# =============================================================================

# Stripe
STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=live  # or sandbox

# Coinbase Commerce
COINBASE_API_KEY=your_coinbase_api_key
COINBASE_WEBHOOK_SECRET=your_webhook_secret

# =============================================================================
# COMMUNICATION SERVICES
# =============================================================================

# Twilio (SMS/Voice)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid (Email)
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=noreply@void-runner.com
SENDGRID_FROM_NAME=VOID_RUNNER

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# =============================================================================
# AI & MACHINE LEARNING
# =============================================================================

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key
OPENAI_ORG_ID=org-your_organization_id

# Hugging Face
HUGGINGFACE_API_TOKEN=hf_your_token

# Google Cloud AI
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_KEY_FILE=path/to/key.json

# TensorFlow Serving
TF_SERVING_URL=http://localhost:8501

# =============================================================================
# VISION & IMAGE ANALYSIS
# =============================================================================

# Google Cloud Vision
GOOGLE_VISION_API_KEY=your_vision_api_key

# Amazon Rekognition
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Azure Computer Vision
AZURE_VISION_ENDPOINT=https://your-region.api.cognitive.microsoft.com
AZURE_VISION_KEY=your_subscription_key

# Clarifai
CLARIFAI_API_KEY=your_clarifai_api_key

# =============================================================================
# SPEECH & AUDIO
# =============================================================================

# Google Cloud Speech
GOOGLE_SPEECH_API_KEY=your_speech_api_key

# Amazon Polly
AWS_POLLY_ACCESS_KEY=your_access_key
AWS_POLLY_SECRET_KEY=your_secret_key

# Azure Speech
AZURE_SPEECH_ENDPOINT=https://your-region.api.cognitive.microsoft.com
AZURE_SPEECH_KEY=your_subscription_key

# Deepgram
DEEPGRAM_API_KEY=your_deepgram_api_key

# AssemblyAI
ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# =============================================================================
# LOCATION & MAPPING
# =============================================================================

# Google Maps
GOOGLE_MAPS_API_KEY=your_maps_api_key

# Mapbox
MAPBOX_ACCESS_TOKEN=your_mapbox_token

# OpenStreetMap
OSM_API_URL=https://api.openstreetmap.org

# =============================================================================
# BLOCKCHAIN & WEB3
# =============================================================================

# Ethereum
INFURA_PROJECT_ID=your_infura_project_id
INFURA_PROJECT_SECRET=your_infura_secret
ALCHEMY_API_KEY=your_alchemy_api_key

# Polygon
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_polygonscan_key

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# IPFS
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_secret
IPFS_API_URL=https://ipfs.infura.io:5001

# Ceramic (Decentralized Identity)
CERAMIC_API_URL=https://your-ceramic-node.com

# Gun.js (Decentralized Database)
GUN_PEERS=https://gun-manhattan.herokuapp.com/gun

# =============================================================================
# SOCIAL & GAMING
# =============================================================================

# Discord Bot
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_guild_id

# Twitch
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret

# YouTube
YOUTUBE_API_KEY=your_youtube_api_key

# Steam
STEAM_API_KEY=your_steam_api_key

# Epic Games
EPIC_CLIENT_ID=your_epic_client_id
EPIC_CLIENT_SECRET=your_epic_client_secret

# =============================================================================
# SECURITY & AUTHENTICATION
# =============================================================================

# Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Okta
OKTA_DOMAIN=https://your-org.okta.com
OKTA_CLIENT_ID=your_client_id
OKTA_CLIENT_SECRET=your_client_secret

# OneLogin
ONELOGIN_CLIENT_ID=your_client_id
ONELOGIN_CLIENT_SECRET=your_client_secret

# =============================================================================
# DATABASE & STORAGE
# =============================================================================

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/database

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password

# =============================================================================
# MONITORING & ANALYTICS
# =============================================================================

# Sentry
SENTRY_DSN=https://your-key@sentry.io/project-id

# Datadog
DATADOG_API_KEY=your_api_key
DATADOG_APP_KEY=your_app_key

# New Relic
NEW_RELIC_LICENSE_KEY=your_license_key
NEW_RELIC_APP_NAME=VOID_RUNNER

# Google Analytics
GA_TRACKING_ID=UA-XXXXXXXXX-X

# Mixpanel
MIXPANEL_TOKEN=your_mixpanel_token

# Amplitude
AMPLITUDE_API_KEY=your_amplitude_key

# =============================================================================
# CDN & HOSTING
# =============================================================================

# Cloudflare
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id

# AWS S3
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=us-east-1

# Google Cloud Storage
GCS_BUCKET=your-bucket-name
GCS_KEY_FILE=path/to/key.json

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT=your_account_name
AZURE_STORAGE_KEY=your_storage_key

# =============================================================================
# DEVELOPMENT & TESTING
# =============================================================================

# GitHub
GITHUB_TOKEN=ghp_your_github_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# GitLab
GITLAB_TOKEN=glpat-your_gitlab_token

# Bitbucket
BITBUCKET_USERNAME=your_username
BITBUCKET_APP_PASSWORD=your_app_password

# =============================================================================
# GAME-SPECIFIC APIS
# =============================================================================

# Neural Interface (Custom)
NEURAL_API_URL=https://api.void-runner.com/neural
NEURAL_API_KEY=your_neural_api_key

# Surveillance System (Custom)
SURVEILLANCE_API_URL=https://api.void-runner.com/surveillance
SURVEILLANCE_API_KEY=your_surveillance_api_key

# PVP Matchmaking (Custom)
PVP_API_URL=https://api.void-runner.com/pvp
PVP_API_KEY=your_pvp_api_key

# Darknet Marketplace (Custom)
DARKNET_API_URL=https://api.void-runner.com/darknet
DARKNET_API_KEY=your_darknet_api_key

# Faction System (Custom)
FACTION_API_URL=https://api.void-runner.com/faction
FACTION_API_KEY=your_faction_api_key

# Bounty System (Custom)
BOUNTY_API_URL=https://api.void-runner.com/bounty
BOUNTY_API_KEY=your_bounty_api_key

# =============================================================================
# MOBILE & PUSH NOTIFICATIONS
# =============================================================================

# Apple Push Notification Service
APNS_KEY_ID=your_key_id
APNS_TEAM_ID=your_team_id
APNS_BUNDLE_ID=com.void-runner.app
APNS_PRIVATE_KEY=your_private_key

# Firebase Cloud Messaging
FCM_SERVER_KEY=your_server_key
FCM_SENDER_ID=your_sender_id

# OneSignal
ONESIGNAL_APP_ID=your_app_id
ONESIGNAL_REST_API_KEY=your_rest_api_key

# =============================================================================
# WEBRTC & REAL-TIME
# =============================================================================

# Twilio Video
TWILIO_VIDEO_API_KEY=your_api_key
TWILIO_VIDEO_API_SECRET=your_api_secret

# Agora
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate

# Daily.co
DAILY_API_KEY=your_api_key

# =============================================================================
# FILE SHARING & P2P
# =============================================================================

# WebTorrent
WEBTORRENT_TRACKER=wss://tracker.webtorrent.io

# ShareDrop (WebRTC file sharing)
SHAREDROP_URL=https://sharedrop.io

# =============================================================================
# MISCELLANEOUS
# =============================================================================

# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your_signing_secret

# Microsoft Teams
MS_TEAMS_WEBHOOK_URL=https://your-webhook-url

# Zapier
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-id

# IFTTT
IFTTT_WEBHOOK_KEY=your_webhook_key

# Make (formerly Integromat)
MAKE_WEBHOOK_URL=https://hook.integromat.com/your-webhook

# =============================================================================
# LOCAL DEVELOPMENT
# =============================================================================

# Development mode flags
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug

# Local services
LOCAL_API_URL=http://localhost:3000
LOCAL_WS_URL=ws://localhost:3000
LOCAL_WEBRTC_URL=ws://localhost:3001

# Test credentials
TEST_USER_EMAIL=test@void-runner.com
TEST_USER_PASSWORD=test_password_123
TEST_ADMIN_EMAIL=admin@void-runner.com
TEST_ADMIN_PASSWORD=admin_password_123

# =============================================================================
# PRODUCTION OVERRIDES
# =============================================================================

# Production settings (override in production environment)
# NODE_ENV=production
# DEBUG=false
# LOG_LEVEL=error
# API_URL=https://api.void-runner.com
# WS_URL=wss://api.void-runner.com
# WEBRTC_URL=wss://rtc.void-runner.com

# =============================================================================
# SECURITY NOTES
# =============================================================================
# 1. Never commit this file to version control
# 2. Use environment variables in production
# 3. Rotate keys regularly
# 4. Use different keys for development/production
# 5. Monitor API usage and set up alerts
# 6. Implement rate limiting
# 7. Use HTTPS everywhere
# 8. Enable CORS only for trusted domains
# 9. Validate all input data
# 10. Log security events

# =============================================================================
# SETUP INSTRUCTIONS
# =============================================================================
# 1. Copy this file to .env
# 2. Fill in your API keys
# 3. Set appropriate permissions (chmod 600 .env)
# 4. Add .env to .gitignore
# 5. Use a secrets manager in production
# 6. Set up monitoring for API usage
# 7. Configure alerts for unusual activity
# 8. Document any custom integrations
# 9. Test all integrations in development
# 10. Deploy with proper security measures

# =============================================================================
# CONTACT INFORMATION
# =============================================================================
# For API key issues or security concerns:
# Email: security@void-runner.com
# Discord: https://discord.gg/void-runner
# GitHub: https://github.com/kluth/void-runner/issues
# Documentation: https://docs.void-runner.com
