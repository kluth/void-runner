"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const db_service_1 = require("./db.service");
const config_service_1 = require("./config.service");
const jwt = __importStar(require("jsonwebtoken"));
class AuthService {
    async validateOAuthUser(profile, provider) {
        let player = await db_service_1.prisma.player.findUnique({
            where: {
                provider_providerId: {
                    provider,
                    providerId: profile.id
                }
            }
        });
        if (!player) {
            const username = `${provider}_${profile.id}`.toLowerCase();
            player = await db_service_1.prisma.player.create({
                data: {
                    username,
                    name: (profile.displayName || profile.username || username).toUpperCase(),
                    provider,
                    providerId: profile.id,
                    reputation: 0,
                    score: 0
                }
            });
        }
        const secret = await config_service_1.configService.get('JWT_SECRET') || 'VOID_RUNNER_OMEGA_PROTOCOL';
        const token = jwt.sign({ id: player.id, username: player.username }, secret);
        return { token, player };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
