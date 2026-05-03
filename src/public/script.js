document.addEventListener('DOMContentLoaded', () => {
    const detailsBody = document.getElementById('detailsBody');
    const addRowBtn = document.getElementById('addRowBtn');
    const totalAmountSpan = document.getElementById('totalAmount');
    const form = document.getElementById('receiptForm');
    const toast = document.getElementById('toast');

    if (!form) return; // Chỉ chạy script tạo mới trên trang chủ (home.handlebars)

    // Hàm chuyển số thành chữ (đơn giản hoá, có thể dùng thư viện xịn hơn)
    function readNumber(num) {
        if (num === 0) return 'Không đồng';
        return num.toLocaleString('vi-VN') + ' đồng'; // Thực tế cần code đọc số chi tiết
    }

    function calculateTotal() {
        let total = 0;
        const rows = detailsBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.querySelector('.stt').textContent = index + 1;
            const actualQty = parseFloat(row.querySelector('.actual-qty').value) || 0;
            const price = parseFloat(row.querySelector('.price').value) || 0;
            const rowTotal = actualQty * price;
            row.querySelector('.row-total').textContent = rowTotal > 0 ? rowTotal.toLocaleString('en-US') : '';
            row.querySelector('.row-total-input').value = rowTotal;
            total += rowTotal;
        });
        totalAmountSpan.textContent = total > 0 ? total.toLocaleString('en-US') : '0';
        document.getElementById('total_amount_words').value = readNumber(total);
    }

    function createRow() {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="stt">1</td>
            <td><input type="text" class="item-name w-full outline-none" /></td>
            <td><input type="text" class="item-code w-full outline-none text-center" /></td>
            <td><input type="text" class="unit w-full outline-none text-center" /></td>
            <td><input type="number" class="doc-qty w-full outline-none text-center" min="0" step="any" /></td>
            <td><input type="number" class="actual-qty w-full outline-none text-center" min="0" step="any" /></td>
            <td><input type="number" class="price w-full outline-none text-right" min="0" step="any" /></td>
            <td class="text-right pr-2">
                <span class="row-total"></span>
                <input type="hidden" class="row-total-input" value="0">
            </td>
            <td class="border-none bg-white text-center print-hide">
                <button type="button" class="text-red-500 hover:text-red-700 font-bold delete-btn px-2">X</button>
            </td>
        `;

        tr.querySelector('.actual-qty').addEventListener('input', calculateTotal);
        tr.querySelector('.price').addEventListener('input', calculateTotal);
        tr.querySelector('.delete-btn').addEventListener('click', () => {
            tr.remove();
            calculateTotal();
        });

        return tr;
    }

    // Khởi tạo 1 dòng trống
    detailsBody.appendChild(createRow());

    addRowBtn.addEventListener('click', () => {
        detailsBody.appendChild(createRow());
        calculateTotal();
    });

    document.getElementById('printBtn').addEventListener('click', () => {
        window.print();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const getVal = id => document.getElementById(id).value;
        const padZero = num => num.toString().padStart(2, '0');
        
        let receiptDate = null;
        if(getVal('year') && getVal('month') && getVal('day')) {
            receiptDate = `${getVal('year')}-${padZero(getVal('month'))}-${padZero(getVal('day'))}`;
        }

        let docDate = null;
        if(getVal('doc_year') && getVal('doc_month') && getVal('doc_day')) {
            docDate = `${getVal('doc_year')}-${padZero(getVal('doc_month'))}-${padZero(getVal('doc_day'))}`;
        }

        const details = [];
        detailsBody.querySelectorAll('tr').forEach(row => {
            const name = row.querySelector('.item-name').value;
            if (name) {
                details.push({
                    item_name: name,
                    item_code: row.querySelector('.item-code').value,
                    unit: row.querySelector('.unit').value,
                    doc_quantity: parseFloat(row.querySelector('.doc-qty').value) || 0,
                    actual_quantity: parseFloat(row.querySelector('.actual-qty').value) || 0,
                    unit_price: parseFloat(row.querySelector('.price').value) || 0,
                    total_price: parseFloat(row.querySelector('.row-total-input').value) || 0
                });
            }
        });

        const totalAmountStr = totalAmountSpan.textContent.replace(/,/g, '');

        const payload = {
            receipt_number: getVal('receipt_number'),
            receipt_date: receiptDate,
            department: getVal('department'),
            part: getVal('part'),
            debit: getVal('debit'),
            credit: getVal('credit'),
            deliverer_name: getVal('deliverer_name'),
            doc_number: getVal('doc_number'),
            doc_date: docDate,
            doc_issuer: getVal('doc_issuer'),
            warehouse: getVal('warehouse'),
            location: getVal('location'),
            total_amount: parseFloat(totalAmountStr) || 0,
            total_amount_words: getVal('total_amount_words'),
            attached_docs: getVal('attached_docs'),
            details: details
        };

        try {
            const response = await fetch('/api/receipts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const resData = await response.json();
                console.log('Success:', resData);
                // Hiển thị thông báo
                toast.classList.remove('opacity-0');
                setTimeout(() => toast.classList.add('opacity-0'), 3000);
                // Xoá form
                form.reset();
                detailsBody.innerHTML = '';
                detailsBody.appendChild(createRow());
                calculateTotal();
            } else {
                const err = await response.json();
                alert('Lỗi lưu phiếu: ' + (err.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Lỗi kết nối đến server');
        }
    });
});
