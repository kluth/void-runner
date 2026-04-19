import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// Deactivated for lockdown: import { Strategy as FacebookStrategy } from 'passport-facebook';
// Deactivated for lockdown: import { Strategy as TwitterStrategy } from 'passport-twitter';
// Deactivated for lockdown: import { Strategy as GithubStrategy } from 'passport-github2';
// Deactivated for lockdown: import { Strategy as DiscordStrategy } from 'passport-discord';
// Deactivated for lockdown: import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
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
        if (!origin || origin === FRONTEND_URL || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            callback(null, true);
        } else {
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

// --- Google (PRIMARY UPLINK) ---
if (process.env['GOOGLE_CLIENT_ID']) {
  passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET']!,
    callbackURL: "/api/auth/google/callback"
  }, async (_at: string, _rt: string, profile: any, done: any) => {
    done(null, await authService.validateOAuthUser(profile, 'google'));
  }));
}

/* 
DEACTIVATED: STRATEGIC LOCKDOWN ACTIVE
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
... other providers ...
*/

// OAuth Routes Factory (Filtered for Google only)
const authRoutes = ['google'];
authRoutes.forEach(provider => {
  app.get(`/api/auth/${provider}`, passport.authenticate(provider, provider === 'google' ? { scope: ['profile', 'email'] } : {}));
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
