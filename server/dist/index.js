"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
// Deactivated for lockdown: import { Strategy as FacebookStrategy } from 'passport-facebook';
// Deactivated for lockdown: import { Strategy as TwitterStrategy } from 'passport-twitter';
// Deactivated for lockdown: import { Strategy as GithubStrategy } from 'passport-github2';
// Deactivated for lockdown: import { Strategy as DiscordStrategy } from 'passport-discord';
// Deactivated for lockdown: import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const ai_service_1 = require("./services/ai.service");
const game_service_1 = require("./services/game.service");
const auth_service_1 = require("./services/auth.service");
const config_service_1 = require("./services/config.service");
const FRONTEND_URL = process.env['FRONTEND_URL'] || 'http://localhost:4200';
const app = (0, express_1.default)();
// --- PROXY HARDENING ---
// Enable trust proxy to handle Traefik's X-Forwarded-* headers
app.set('trust proxy', 1);
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || origin === FRONTEND_URL || origin.includes('localhost') || origin.includes('127.0.0.1')) {
                callback(null, true);
            }
            else {
                callback(null, true);
            }
        },
        methods: ["GET", "POST"]
    }
});
const port = process.env['PORT'] || 3000;
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(body_parser_1.default.json());
app.use((0, express_session_1.default)({
    secret: process.env['SESSION_SECRET'] || 'DARKNET_SESSION',
    resave: false,
    saveUninitialized: false,
    proxy: true, // Required for secure cookies behind proxy
    cookie: {
        secure: FRONTEND_URL.startsWith('https'),
        sameSite: 'lax'
    }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// --- CONFIG WIZARD ---
app.get('/api/config/status', async (req, res) => {
    const configured = await config_service_1.configService.isConfigured();
    res.json({ configured });
});
app.post('/api/config/setup', async (req, res) => {
    await config_service_1.configService.saveConfig(req.body);
    res.json({ success: true });
});
app.post('/api/config/skip', async (req, res) => {
    await config_service_1.configService.skipConfig();
    res.json({ success: true });
});
passport_1.default.serializeUser((user, done) => done(null, user));
passport_1.default.deserializeUser((user, done) => done(null, user));
// --- Google (PRIMARY UPLINK) ---
if (process.env['GOOGLE_CLIENT_ID']) {
    // We use the absolute FRONTEND_URL to ensure exact redirect_uri match with Google Console
    const absoluteCallbackURL = `${FRONTEND_URL}/api/auth/google/callback`;
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env['GOOGLE_CLIENT_ID'],
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
        callbackURL: absoluteCallbackURL,
        proxy: true // Tells passport to trust the X-Forwarded-Proto header
    }, async (_at, _rt, profile, done) => {
        done(null, await auth_service_1.authService.validateOAuthUser(profile, 'google'));
    }));
}
// OAuth Routes Factory (Filtered for Google only)
const authRoutes = ['google'];
authRoutes.forEach(provider => {
    app.get(`/api/auth/${provider}`, passport_1.default.authenticate(provider, provider === 'google' ? { scope: ['profile', 'email'] } : {}));
    app.get(`/api/auth/${provider}/callback`, passport_1.default.authenticate(provider, { failureRedirect: '/' }), (req, res) => {
        const { token } = req.user;
        res.redirect(`${FRONTEND_URL}/?token=${token}`);
    });
});
// Initialize Game Logic
game_service_1.gameService.init(io);
// AI Endpoints
app.post('/api/gemini', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt)
        return res.status(400).json({ error: 'No prompt provided' });
    const result = await ai_service_1.aiService.processQuery(prompt);
    return res.json(result);
});
app.post('/api/hijack', async (req, res) => {
    const { handle, chatHistory, shards } = req.body;
    const result = await ai_service_1.aiService.processHijack(handle, chatHistory, shards);
    return res.json({ response: result });
});
app.get('/health', (req, res) => res.json({ status: 'UP' }));
server.listen(port, () => {
    console.log(`VOID_RUNNER Backend listening on port ${port}`);
});
