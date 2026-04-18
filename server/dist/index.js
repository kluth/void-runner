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
const passport_facebook_1 = require("passport-facebook");
const passport_twitter_1 = require("passport-twitter");
const passport_github2_1 = require("passport-github2");
const passport_discord_1 = require("passport-discord");
const passport_microsoft_1 = require("passport-microsoft");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const ai_service_1 = require("./services/ai.service");
const game_service_1 = require("./services/game.service");
const auth_service_1 = require("./services/auth.service");
const config_service_1 = require("./services/config.service");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});
const port = process.env['PORT'] || 3000;
app.use((0, cors_1.default)({
    origin: "http://localhost:4200",
    credentials: true
}));
app.use(body_parser_1.default.json());
app.use((0, express_session_1.default)({
    secret: process.env['SESSION_SECRET'] || 'DARKNET_SESSION',
    resave: false,
    saveUninitialized: false
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
// --- Google ---
if (process.env['GOOGLE_CLIENT_ID']) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env['GOOGLE_CLIENT_ID'],
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
        callbackURL: "/api/auth/google/callback"
    }, async (_at, _rt, profile, done) => {
        done(null, await auth_service_1.authService.validateOAuthUser(profile, 'google'));
    }));
}
// --- Facebook ---
if (process.env['FACEBOOK_APP_ID']) {
    passport_1.default.use(new passport_facebook_1.Strategy({
        clientID: process.env['FACEBOOK_APP_ID'],
        clientSecret: process.env['FACEBOOK_APP_SECRET'],
        callbackURL: "/api/auth/facebook/callback"
    }, async (_at, _rt, profile, done) => {
        done(null, await auth_service_1.authService.validateOAuthUser(profile, 'facebook'));
    }));
}
// --- Twitter ---
if (process.env['TWITTER_CONSUMER_KEY']) {
    passport_1.default.use(new passport_twitter_1.Strategy({
        consumerKey: process.env['TWITTER_CONSUMER_KEY'],
        consumerSecret: process.env['TWITTER_CONSUMER_SECRET'],
        callbackURL: "/api/auth/twitter/callback"
    }, async (_t, _ts, profile, done) => {
        done(null, await auth_service_1.authService.validateOAuthUser(profile, 'twitter'));
    }));
}
// --- GitHub ---
if (process.env['GITHUB_CLIENT_ID']) {
    passport_1.default.use(new passport_github2_1.Strategy({
        clientID: process.env['GITHUB_CLIENT_ID'],
        clientSecret: process.env['GITHUB_CLIENT_SECRET'],
        callbackURL: "/api/auth/github/callback"
    }, async (_at, _rt, profile, done) => {
        done(null, await auth_service_1.authService.validateOAuthUser(profile, 'github'));
    }));
}
// --- Discord ---
if (process.env['DISCORD_CLIENT_ID']) {
    passport_1.default.use(new passport_discord_1.Strategy({
        clientID: process.env['DISCORD_CLIENT_ID'],
        clientSecret: process.env['DISCORD_CLIENT_SECRET'],
        callbackURL: "/api/auth/discord/callback",
        scope: ['identify']
    }, async (_at, _rt, profile, done) => {
        done(null, await auth_service_1.authService.validateOAuthUser(profile, 'discord'));
    }));
}
// --- Microsoft ---
if (process.env['MICROSOFT_CLIENT_ID']) {
    passport_1.default.use(new passport_microsoft_1.Strategy({
        clientID: process.env['MICROSOFT_CLIENT_ID'],
        clientSecret: process.env['MICROSOFT_CLIENT_SECRET'],
        callbackURL: "/api/auth/microsoft/callback",
        scope: ['user.read']
    }, async (_at, _rt, profile, done) => {
        done(null, await auth_service_1.authService.validateOAuthUser(profile, 'microsoft'));
    }));
}
// OAuth Routes Factory
const authRoutes = ['google', 'facebook', 'twitter', 'github', 'discord', 'microsoft'];
authRoutes.forEach(provider => {
    app.get(`/api/auth/${provider}`, passport_1.default.authenticate(provider, provider === 'google' ? { scope: ['profile'] } : {}));
    app.get(`/api/auth/${provider}/callback`, passport_1.default.authenticate(provider, { failureRedirect: '/login' }), (req, res) => {
        const { token } = req.user;
        res.redirect(`http://localhost:4200/login?token=${token}`);
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
server.listen(port, () => {
    console.log(`VOID_RUNNER Backend listening at http://localhost:${port}`);
});
