import { Request, Response } from 'express';
import { getClient } from '../db/index';

export const createReceipt = async (req: Request, res: Response) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const {
      receipt_number,
      receipt_date,
      department,
      part,
      debit,
      credit,
      deliverer_name,
      doc_number,
      doc_date,
      doc_issuer,
      warehouse,
      location,
      total_amount,
      total_amount_words,
      attached_docs,
      details
    } = req.body;

    const receiptQuery = `
      INSERT INTO receipts (
        receipt_number, receipt_date, department, part, debit, credit, deliverer_name, 
        doc_number, doc_date, doc_issuer, warehouse, location, 
        total_amount, total_amount_words, attached_docs
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id
    `;
    const receiptValues = [
      receipt_number, receipt_date || null, department, part, debit, credit, deliverer_name,
      doc_number, doc_date || null, doc_issuer, warehouse, location,
      total_amount, total_amount_words, attached_docs
    ];

    const receiptResult = await client.query(receiptQuery, receiptValues);
    const receiptId = receiptResult.rows[0].id;

    if (details && details.length > 0) {
      const detailQuery = `
        INSERT INTO receipt_details (
          receipt_id, item_name, item_code, unit, doc_quantity, 
          actual_quantity, unit_price, total_price
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      for (const detail of details) {
        const detailValues = [
          receiptId, detail.item_name, detail.item_code, detail.unit,
          detail.doc_quantity, detail.actual_quantity, detail.unit_price, detail.total_price
        ];
        await client.query(detailQuery, detailValues);
      }
    }

    await client.query('COMMIT');
    console.log(`[RECEIPT_CREATED] ID: ${receiptId}, Receipt Number: ${receipt_number}, By User: ${(req as any).user ? (req as any).user.username : 'Unknown'}`);
    res.status(201).json({ message: 'Tạo phiếu nhập kho thành công', receiptId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`[RECEIPT_CREATE_ERROR] By User: ${(req as any).user ? (req as any).user.username : 'Unknown'}. Error:`, error);
    res.status(500).json({ error: 'Lỗi server khi tạo phiếu nhập kho' });
  } finally {
    client.release();
  }
};

export const getReceipts = async (req: Request, res: Response) => {
  const client = await getClient();
  try {
    const { startDate, endDate } = req.query;
    let queryText = 'SELECT * FROM receipts';
    let queryParams: any[] = [];

    if (startDate && endDate) {
      queryText += ' WHERE receipt_date >= $1 AND receipt_date <= $2';
      queryParams.push(startDate, endDate);
    }
    
    queryText += ' ORDER BY created_at DESC';

    const result = await client.query(queryText, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách phiếu nhập kho' });
  } finally {
    client.release();
  }
};

export const getReceiptById = async (req: Request, res: Response) => {
  const client = await getClient();
  try {
    const { id } = req.params;
    
    const receiptResult = await client.query('SELECT * FROM receipts WHERE id = $1', [id]);
    
    if (receiptResult.rows.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy phiếu nhập kho' });
      return;
    }
    
    const receipt = receiptResult.rows[0];
    
    const detailsResult = await client.query('SELECT * FROM receipt_details WHERE receipt_id = $1 ORDER BY id ASC', [id]);
    receipt.details = detailsResult.rows;
    
    res.status(200).json(receipt);
  } catch (error) {
    console.error('Error fetching receipt details:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy chi tiết phiếu nhập kho' });
  } finally {
    client.release();
  }
};

export const deleteReceipt = async (req: Request, res: Response) => {
  const client = await getClient();
  try {
    const { id } = req.params;
    
    const receiptResult = await client.query('SELECT id FROM receipts WHERE id = $1', [id]);
    if (receiptResult.rows.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy phiếu nhập kho để xóa' });
      return;
    }

    // Xóa phiếu nhập kho
    await client.query('DELETE FROM receipts WHERE id = $1', [id]);
    
    console.log(`[RECEIPT_DELETED] ID: ${id}, By User: ${(req as any).user ? (req as any).user.username : 'Unknown'}`);
    res.status(200).json({ message: 'Đã xóa phiếu nhập kho thành công' });
  } catch (error) {
    console.error(`[RECEIPT_DELETE_ERROR] ID: ${req.params.id}, By User: ${(req as any).user ? (req as any).user.username : 'Unknown'}. Error:`, error);
    res.status(500).json({ error: 'Lỗi server khi xóa phiếu nhập kho' });
  } finally {
    client.release();
  }
};

