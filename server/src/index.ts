import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { aiService } from './services/ai.service';
import { gameService } from './services/game.service';
import { authService } from './services/auth.service';
import { configService } from './services/config.service';

const FRONTEND_URL = process.env['FRONTEND_URL'] || 'http://localhost:4200';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
        // In production, we allow same-origin (proxied) or explicit FRONTEND_URL
        if (!origin || origin === FRONTEND_URL || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            callback(null, true);
        } else {
            // For VPS access via IP, we accept all origins to ensure handshake stability
            callback(null, true);
        }
    },
    methods: ["GET", "POST"]
  }
});

const port = process.env['PORT'] || 3000;

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());
app.use(session({
    secret: process.env['SESSION_SECRET'] || 'DARKNET_SESSION',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// --- CONFIG WIZARD ---
app.get('/api/config/status', async (req, res) => {
    const configured = await configService.isConfigured();
    res.json({ configured });
});

app.post('/api/config/setup', async (req, res) => {
    await configService.saveConfig(req.body);
    res.json({ success: true });
});

app.post('/api/config/skip', async (req, res) => {
    await configService.skipConfig();
    res.json({ success: true });
});

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

// --- Google ---
if (process.env['GOOGLE_CLIENT_ID']) {
  passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET']!,
    callbackURL: "/api/auth/google/callback"
  }, async (_at: string, _rt: string, profile: any, done: any) => {
    done(null, await authService.validateOAuthUser(profile, 'google'));
  }));
}

// --- Facebook ---
if (process.env['FACEBOOK_APP_ID']) {
  passport.use(new FacebookStrategy({
    clientID: process.env['FACEBOOK_APP_ID'],
    clientSecret: process.env['FACEBOOK_APP_SECRET']!,
    callbackURL: "/api/auth/facebook/callback"
  }, async (_at: string, _rt: string, profile: any, done: any) => {
    done(null, await authService.validateOAuthUser(profile, 'facebook'));
  }));
}

// --- Twitter ---
if (process.env['TWITTER_CONSUMER_KEY']) {
  passport.use(new TwitterStrategy({
    consumerKey: process.env['TWITTER_CONSUMER_KEY'],
    consumerSecret: process.env['TWITTER_CONSUMER_SECRET']!,
    callbackURL: "/api/auth/twitter/callback"
  }, async (_t: string, _ts: string, profile: any, done: any) => {
    done(null, await authService.validateOAuthUser(profile, 'twitter'));
  }));
}

// --- GitHub ---
if (process.env['GITHUB_CLIENT_ID']) {
  passport.use(new GithubStrategy({
    clientID: process.env['GITHUB_CLIENT_ID'],
    clientSecret: process.env['GITHUB_CLIENT_SECRET']!,
    callbackURL: "/api/auth/github/callback"
  }, async (_at: string, _rt: string, profile: any, done: any) => {
    done(null, await authService.validateOAuthUser(profile, 'github'));
  }));
}

// --- Discord ---
if (process.env['DISCORD_CLIENT_ID']) {
  passport.use(new DiscordStrategy({
    clientID: process.env['DISCORD_CLIENT_ID'],
    clientSecret: process.env['DISCORD_CLIENT_SECRET']!,
    callbackURL: "/api/auth/discord/callback",
    scope: ['identify']
  }, async (_at: string, _rt: string, profile: any, done: any) => {
    done(null, await authService.validateOAuthUser(profile, 'discord'));
  }));
}

// --- Microsoft ---
if (process.env['MICROSOFT_CLIENT_ID']) {
  passport.use(new MicrosoftStrategy({
    clientID: process.env['MICROSOFT_CLIENT_ID'],
    clientSecret: process.env['MICROSOFT_CLIENT_SECRET']!,
    callbackURL: "/api/auth/microsoft/callback",
    scope: ['user.read']
  }, async (_at: string, _rt: string, profile: any, done: any) => {
    done(null, await authService.validateOAuthUser(profile, 'microsoft'));
  }));
}

// OAuth Routes Factory
const authRoutes = ['google', 'facebook', 'twitter', 'github', 'discord', 'microsoft'];
authRoutes.forEach(provider => {
  app.get(`/api/auth/${provider}`, passport.authenticate(provider, provider === 'google' ? { scope: ['profile'] } : {}));
  app.get(`/api/auth/${provider}/callback`, passport.authenticate(provider, { failureRedirect: '/login' }), (req, res) => {
    const { token } = req.user as any;
    res.redirect(`${FRONTEND_URL}/login?token=${token}`);
  });
});

// Initialize Game Logic
gameService.init(io);

// AI Endpoints
app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });
  const result = await aiService.processQuery(prompt);
  return res.json(result);
});

app.post('/api/hijack', async (req, res) => {
  const { handle, chatHistory, shards } = req.body;
  const result = await aiService.processHijack(handle, chatHistory, shards);
  return res.json({ response: result });
});

app.get('/health', (req, res) => res.json({ status: 'UP' }));

server.listen(port, () => {
  console.log(`VOID_RUNNER Backend listening on port ${port}`);
});
