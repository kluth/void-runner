import { ChromaClient } from 'chromadb';

export class VectorService {
  private client: ChromaClient;

  constructor() {
    const host = process.env['CHROMA_HOST'] || 'http://chroma:8000';
    this.client = new ChromaClient({ path: host });
    this.init();
  }

  private async init() {
    try {
      await this.client.getOrCreateCollection({ name: 'operative_dossiers' });
      console.log('[VECTOR] ChromaDB initialized: operative_dossiers collection ready.');
    } catch (e) {
      console.warn('[VECTOR] Warning: Could not connect to ChromaDB.');
    }
  }

  async storeCaseFile(playerId: string, dossier: string, metadata: any) {
    try {
      const collection = await this.client.getCollection({ name: 'operative_dossiers' });
      await collection.upsert({
        ids: [playerId],
        documents: [dossier],
        metadatas: [metadata]
      });
      console.log(`[VECTOR] Case File archived for Operative ${playerId}`);
    } catch (e) {
      console.error('[VECTOR] Archive failure:', e);
    }
  }

  async getCaseFile(playerId: string) {
    try {
      const collection = await this.client.getCollection({ name: 'operative_dossiers' });
      const result = await collection.get({ ids: [playerId] });
      return result.documents.length > 0 ? result.documents[0] : null;
    } catch (e) {
      return null;
    }
  }
}

export const vectorService = new VectorService();
