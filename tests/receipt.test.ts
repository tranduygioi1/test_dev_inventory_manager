import request from 'supertest';
import app from '../src/app';
import * as db from '../src/db/index';

// Mock DB connection
jest.mock('../src/db/index', () => ({
  getClient: jest.fn(),
  query: jest.fn()
}));

// Mock auth middleware to pass through
jest.mock('../src/middlewares/auth.middleware', () => ({
  authenticateJWT: (req: any, res: any, next: any) => next(),
  requirePermission: () => (req: any, res: any, next: any) => next()
}));

describe('POST /api/receipts', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    (db.getClient as jest.Mock).mockResolvedValue(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a receipt successfully', async () => {
    // Mock the query responses
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 'mock-uuid-1234' }] }) // INSERT receipt
      .mockResolvedValueOnce({}) // INSERT details
      .mockResolvedValueOnce({}); // COMMIT

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

    const response = await request(app)
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
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error('DB Error')); // INSERT receipt fails

    const payload = {
      receipt_number: 'PN002'
    };

    const response = await request(app)
      .post('/api/receipts')
      .send(payload);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Lỗi server khi tạo phiếu nhập kho');
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
  });
});
