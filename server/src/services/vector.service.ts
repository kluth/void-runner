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
      await this.client.getOrCreateCollection({ name: 'hijack_riddles' });
      console.log('[VECTOR] ChromaDB initialized: operative_dossiers and hijack_riddles collections ready.');
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

  async storeRiddles(riddles: {q: string, a: string}[]) {
    try {
      const collection = await this.client.getCollection({ name: 'hijack_riddles' });
      const ids = riddles.map((_, i) => `riddle_${Date.now()}_${i}`);
      const docs = riddles.map(r => r.q);
      const metadatas = riddles.map(r => ({ answer: r.a }));

      await collection.add({
        ids,
        documents: docs,
        metadatas
      });
      console.log(`[VECTOR] Archived ${riddles.length} riddles.`);
    } catch (e) {
      console.error('[VECTOR] Riddle storage failed:', e);
    }
  }

  async getRandomRiddle(): Promise<{q: string, a: string} | null> {
    try {
        const collection = await this.client.getCollection({ name: 'hijack_riddles' });
        // Query with a random number to get a "random" entry
        const count = await collection.count();
        if (count === 0) return null;
        
        const randomIdx = Math.floor(Math.random() * count);
        const result = await collection.get({
            limit: 1,
            offset: randomIdx
        });

        if (result.documents.length > 0) {
            return {
                q: result.documents[0] as string,
                a: (result.metadatas[0] as any).answer
            };
        }
        return null;
    } catch (e) {
        return null;
    }
  }
}

export const vectorService = new VectorService();
