import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VectorService } from './vector.service';

const { mockGetOrCreateCollection, mockGetCollection, mockUpsert } = vi.hoisted(() => {
  const upsert = vi.fn().mockResolvedValue({});
  return {
    mockGetOrCreateCollection: vi.fn().mockResolvedValue({}),
    mockUpsert: upsert,
    mockGetCollection: vi.fn().mockResolvedValue({
      upsert: upsert
    })
  };
});

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

  it('should store case files in operative_dossiers collection', async () => {
    const id = 'test-player';
    const text = 'test-dossier';
    await vectorService.storeCaseFile(id, text, {});
    expect(mockGetCollection).toHaveBeenCalledWith({ name: 'operative_dossiers' });
    expect(mockUpsert).toHaveBeenCalled();
  });
});
