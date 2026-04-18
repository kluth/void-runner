"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorService = exports.VectorService = void 0;
const chromadb_1 = require("chromadb");
class VectorService {
    client;
    constructor() {
        this.client = new chromadb_1.ChromaClient();
        this.init();
    }
    async init() {
        try {
            // Create a collection for future game memory / RAG extensions
            await this.client.getOrCreateCollection({ name: 'neural_memories' });
            console.log('[VECTOR] ChromaDB initialized: neural_memories collection ready.');
        }
        catch (e) {
            console.warn('[VECTOR] Warning: Could not connect to ChromaDB. Ensure vector server is running if features are needed.');
        }
    }
    async storeEmbedding(id, text) {
        // Stub for later expansion
        try {
            const collection = await this.client.getCollection({ name: 'neural_memories' });
            await collection.add({
                ids: [id],
                documents: [text],
            });
        }
        catch (e) {
            console.error('[VECTOR] Failed to store embedding:', e);
        }
    }
}
exports.VectorService = VectorService;
exports.vectorService = new VectorService();
