import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VectorService } from './vector.service';

const { mockGetOrCreateCollection, mockGetCollection } = vi.hoisted(() => ({
  mockGetOrCreateCollection: vi.fn().mockResolvedValue({}),
  mockGetCollection: vi.fn().mockResolvedValue({
    add: vi.fn().mockResolvedValue({})
  })
}));

vi.mock('chromadb', () => {
  return {
    ChromaClient: vi.fn().mockImplementation(function() {
      return {
        getOrCreateCollection: mockGetOrCreateCollection,
        getCollection: mockGetCollection
      };
    })
  };
});

describe('VectorService', () => {
  let vectorService: VectorService;

  beforeEach(() => {
    vi.clearAllMocks();
    vectorService = new VectorService();
  });

  it('should store embeddings', async () => {
    const id = 'test-id';
    const text = 'test-text';
    await vectorService.storeEmbedding(id, text);
    expect(mockGetCollection).toHaveBeenCalled();
  });
});
