"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));

const db = __importStar(require("../src/db/index"));
jest.mock('../src/db/index', () => ({
    getClient: jest.fn(),
    query: jest.fn()
}));
describe('POST /api/receipts', () => {
    let mockClient;
    beforeEach(() => {
        mockClient = {
            query: jest.fn(),
            release: jest.fn()
        };
        db.getClient.mockResolvedValue(mockClient);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should create a receipt successfully', async () => {
        mockClient.query
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({ rows: [{ id: 'mock-uuid-1234' }] })
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({});
        const payload = {
            receipt_number: 'PN001',
            department: 'IT',
            deliverer_name: 'Nguyen Van A',
            details: [
                {
                    item_name: 'Laptop',
                    item_code: 'LT01',
                    unit: 'Cái',
                    doc_quantity: 10,
                    actual_quantity: 10,
                    unit_price: 1000,
                    total_price: 10000
                }
            ]
        };
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/receipts')
            .send(payload);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Tạo phiếu nhập kho thành công');
        expect(response.body.receiptId).toBe('mock-uuid-1234');
        expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
        expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });
    it('should handle database errors and rollback', async () => {
        mockClient.query
            .mockResolvedValueOnce({})
            .mockRejectedValueOnce(new Error('DB Error'));
        const payload = {
            receipt_number: 'PN002'
        };
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/receipts')
            .send(payload);
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Lỗi server khi tạo phiếu nhập kho');
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
});
