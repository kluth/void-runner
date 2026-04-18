"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const vector_service_1 = require("./vector.service");
const { mockGetOrCreateCollection, mockGetCollection } = vitest_1.vi.hoisted(() => ({
    mockGetOrCreateCollection: vitest_1.vi.fn().mockResolvedValue({}),
    mockGetCollection: vitest_1.vi.fn().mockResolvedValue({
        add: vitest_1.vi.fn().mockResolvedValue({})
    })
}));
vitest_1.vi.mock('chromadb', () => {
    return {
        ChromaClient: vitest_1.vi.fn().mockImplementation(function () {
            return {
                getOrCreateCollection: mockGetOrCreateCollection,
                getCollection: mockGetCollection
            };
        })
    };
});
(0, vitest_1.describe)('VectorService', () => {
    let vectorService;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vectorService = new vector_service_1.VectorService();
    });
    (0, vitest_1.it)('should store embeddings', async () => {
        const id = 'test-id';
        const text = 'test-text';
        await vectorService.storeEmbedding(id, text);
        (0, vitest_1.expect)(mockGetCollection).toHaveBeenCalled();
    });
});
