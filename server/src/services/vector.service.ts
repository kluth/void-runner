import { ChromaClient } from 'chromadb';

export class VectorService {
  private client: ChromaClient;

  constructor() {
    this.client = new ChromaClient();
    this.init();
  }

  private async init() {
    try {
      // Create a collection for future game memory / RAG extensions
      await this.client.getOrCreateCollection({ name: 'neural_memories' });
      console.log('[VECTOR] ChromaDB initialized: neural_memories collection ready.');
    } catch (e) {
      console.warn('[VECTOR] Warning: Could not connect to ChromaDB. Ensure vector server is running if features are needed.');
    }
  }

  async storeEmbedding(id: string, text: string) {
    // Stub for later expansion
    try {
      const collection = await this.client.getCollection({ name: 'neural_memories' });
      await collection.add({
        ids: [id],
        documents: [text],
      });
    } catch (e) {
      console.error('[VECTOR] Failed to store embedding:', e);
    }
  }
}

export const vectorService = new VectorService();
