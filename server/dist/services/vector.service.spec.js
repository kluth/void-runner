"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const vector_service_1 = require("./vector.service");
const { mockGetOrCreateCollection, mockGetCollection, mockUpsert } = vitest_1.vi.hoisted(() => {
    const upsert = vitest_1.vi.fn().mockResolvedValue({});
    return {
        mockGetOrCreateCollection: vitest_1.vi.fn().mockResolvedValue({}),
        mockUpsert: upsert,
        mockGetCollection: vitest_1.vi.fn().mockResolvedValue({
            upsert: upsert
        })
    };
});
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
    (0, vitest_1.it)('should store case files in operative_dossiers collection', async () => {
        const id = 'test-player';
        const text = 'test-dossier';
        await vectorService.storeCaseFile(id, text, {});
        (0, vitest_1.expect)(mockGetCollection).toHaveBeenCalledWith({ name: 'operative_dossiers' });
        (0, vitest_1.expect)(mockUpsert).toHaveBeenCalled();
    });
});
