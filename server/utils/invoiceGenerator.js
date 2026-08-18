const generateInvoiceHTML = (order) => {
  const itemsRows = order.orderItems.map((item, index) => `
    <tr>
      <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9;">${index + 1}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9;">
        <strong>${item.name}</strong>
        ${item.variantName ? `<br/><span style="color:#94a3b8; font-size:11px;">Variant: ${item.variantName}</span>` : ''}
        ${item.customMessage ? `<br/><span style="color:#f59e0b; font-size:11px;">💌 ${item.customMessage}</span>` : ''}
      </td>
      <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; text-align:center;">${item.qty}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; text-align:right;">₹${Number(item.price).toFixed(2)}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; text-align:right; font-weight:600;">₹${(Number(item.price) * item.qty).toFixed(2)}</td>
    </tr>
  `).join('');

  const statusColor = order.paymentStatus === 'Paid' || order.paymentStatus === 'Refunded' ? '#166534' : '#92400e';
  const statusBg = order.paymentStatus === 'Paid' || order.paymentStatus === 'Refunded' ? '#dcfce7' : '#fef3c7';
  const gst = order.pricing.itemsTotal ? (order.pricing.itemsTotal * 0.18).toFixed(2) : '0.00';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Tax Invoice – #${order.orderNumber} | ShriMaruti Giftings</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter', sans-serif; background:#f8fafc; color:#1e293b; padding:24px; }
    .page { max-width:820px; margin:auto; background:#fff; border-radius:16px; box-shadow:0 4px 40px rgba(0,0,0,0.08); overflow:hidden; }
    .header { background:linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding:32px 40px; color:#fff; display:flex; justify-content:space-between; align-items:flex-start; }
    .brand { display:flex; flex-direction:column; gap:4px; }
    .brand-name { font-size:24px; font-weight:800; letter-spacing:-0.5px; }
    .brand-sub { font-size:12px; color:#a5b4fc; }
    .invoice-meta { text-align:right; }
    .invoice-title { font-size:22px; font-weight:700; color:#c7d2fe; }
    .invoice-num { font-size:14px; color:#a5b4fc; margin-top:4px; }
    .invoice-date { font-size:12px; color:#818cf8; margin-top:2px; }
    .body { padding:32px 40px; }
    .section-2col { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:28px; }
    .info-card { background:#f8fafc; border-radius:10px; padding:16px 20px; border:1px solid #e2e8f0; }
    .info-card h4 { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; margin-bottom:10px; }
    .info-card p { font-size:13px; color:#334155; line-height:1.7; }
    .gift-msg { background:#fffbeb; border:1px solid #fcd34d; border-radius:10px; padding:14px 20px; margin-bottom:24px; }
    .gift-msg h4 { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:#d97706; margin-bottom:6px; }
    .gift-msg p { font-size:13px; color:#92400e; font-style:italic; }
    table.items { width:100%; border-collapse:collapse; margin-bottom:24px; }
    table.items thead tr { background:#f1f5f9; }
    table.items thead th { padding:10px 12px; text-align:left; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; }
    table.items thead th:nth-child(3), table.items thead th:nth-child(4), table.items thead th:nth-child(5) { text-align:center; }
    table.items thead th:nth-child(4), table.items thead th:nth-child(5) { text-align:right; }
    .totals-row { display:flex; justify-content:flex-end; }
    .totals-table { width:300px; }
    .totals-table td { padding:6px 0; font-size:13px; color:#475569; }
    .totals-table td:last-child { text-align:right; }
    .totals-table tr.discount td { color:#16a34a; }
    .totals-table tr.total-row td { font-size:17px; font-weight:700; color:#1e293b; padding-top:12px; border-top:2px solid #e2e8f0; }
    .totals-table tr.total-row td:last-child { color:#4338ca; }
    .status-badge { display:inline-block; background:${statusBg}; color:${statusColor}; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:600; margin-top:6px; }
    .footer { text-align:center; padding:20px 40px 28px; font-size:12px; color:#94a3b8; border-top:1px solid #f1f5f9; margin-top:24px; }
    .footer a { color:#6366f1; text-decoration:none; }
    .return-banner { background:#fef2f2; border:1px solid #fca5a5; border-radius:10px; padding:14px 20px; margin-bottom:24px; font-size:13px; color:#991b1b; }
    .refund-banner { background:#f0fdf4; border:1px solid #86efac; border-radius:10px; padding:14px 20px; margin-bottom:24px; font-size:13px; color:#166534; }
    .print-btn { display:block; margin:0 auto 24px; padding:12px 32px; background:linear-gradient(135deg,#6366f1,#4338ca); color:#fff; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; letter-spacing:0.3px; }
    .print-btn:hover { background:linear-gradient(135deg,#4f46e5,#3730a3); }
    @media print {
      body { background:#fff; padding:0; }
      .page { box-shadow:none; border-radius:0; }
      .print-btn { display:none; }
      .no-print { display:none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <div class="brand-name">🎁 ShriMaruti Giftings</div>
        <div class="brand-sub">India's Premier Online Gifting Store</div>
        <div class="brand-sub" style="margin-top:4px;">GSTIN: 27AABCS1429B1ZB | support@shrimaruti.com</div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">TAX INVOICE</div>
        <div class="invoice-num">Order #${order.orderNumber}</div>
        <div class="invoice-date">Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</div>
        ${order.deliveredAt ? `<div class="invoice-date">Delivered: ${new Date(order.deliveredAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</div>` : ''}
        <div class="status-badge">${order.paymentStatus} · ${order.paymentMethod}</div>
      </div>
    </div>
    <div class="body">
      <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
      <div class="section-2col">
        <div class="info-card">
          <h4>Billed To / Sender</h4>
          <p>
            <strong>${order.senderDetails.name}</strong><br/>
            📞 ${order.senderDetails.phone}<br/>
            ✉️ ${order.senderDetails.email}
          </p>
        </div>
        <div class="info-card">
          <h4>Ship To / Recipient</h4>
          <p>
            <strong>${order.shippingAddress.fullName}</strong><br/>
            ${order.shippingAddress.street}${order.shippingAddress.landmark ? ', ' + order.shippingAddress.landmark : ''}<br/>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} – ${order.shippingAddress.pincode}<br/>
            📞 ${order.shippingAddress.phone}
          </p>
        </div>
      </div>
      ${order.giftOptions && order.giftOptions.giftMessage ? `
      <div class="gift-msg">
        <h4>💌 Personalized Gift Card Message</h4>
        <p>"${order.giftOptions.giftMessage}"</p>
      </div>
      ` : ''}
      ${order.returnRequest && order.returnRequest.status === 'Completed' ? `
      <div class="refund-banner">
        ✅ <strong>Refund Completed</strong> — ₹${order.returnRequest.refundAmount} has been refunded. 
        Transaction ID: <strong>${order.returnRequest.refundTransactionId}</strong> · 
        Date: ${order.returnRequest.refundedAt ? new Date(order.returnRequest.refundedAt).toLocaleDateString('en-IN') : 'N/A'}
      </div>
      ` : ''}
      ${order.orderStatus === 'Returned' && (!order.returnRequest || order.returnRequest.status !== 'Completed') ? `
      <div class="return-banner">⚠️ This order has been returned. Refund process underway.</div>
      ` : ''}
      <table class="items">
        <thead>
          <tr>
            <th>#</th>
            <th>Item Description</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      <div class="totals-row">
        <table class="totals-table">
          <tr><td>Items Subtotal</td><td>₹${Number(order.pricing.itemsTotal || 0).toFixed(2)}</td></tr>
          <tr><td style="color:#94a3b8; font-size:12px;">GST @ 18% (incl.)</td><td style="color:#94a3b8; font-size:12px;">₹${gst}</td></tr>
          ${(order.pricing.giftWrapFee || 0) > 0 ? `<tr><td>Gift Wrap Fee</td><td>+₹${Number(order.pricing.giftWrapFee).toFixed(2)}</td></tr>` : ''}
          <tr><td>Delivery Charges</td><td>${(order.pricing.deliveryFee || 0) === 0 ? '<span style="color:#16a34a; font-weight:600;">FREE</span>' : `₹${Number(order.pricing.deliveryFee).toFixed(2)}`}</td></tr>
          ${(order.pricing.couponDiscount || 0) > 0 ? `<tr class="discount"><td>Coupon Discount (${order.pricing.couponCode || ''})</td><td>−₹${Number(order.pricing.couponDiscount).toFixed(2)}</td></tr>` : ''}
          ${(order.pricing.giftCardDiscount || 0) > 0 ? `<tr class="discount"><td>Gift Card Discount</td><td>−₹${Number(order.pricing.giftCardDiscount).toFixed(2)}</td></tr>` : ''}
          ${(order.pricing.loyaltyDiscount || 0) > 0 ? `<tr class="discount"><td>Loyalty Points Redeemed</td><td>−₹${Number(order.pricing.loyaltyDiscount).toFixed(2)}</td></tr>` : ''}
          <tr class="total-row"><td>Total Paid</td><td>₹${Number(order.pricing.totalAmount || 0).toFixed(2)}</td></tr>
        </table>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for spreading love with ShriMaruti Giftings! 💖</p>
      <p style="margin-top:6px;">For support, email <a href="mailto:support@shrimaruti.com">support@shrimaruti.com</a> or visit <a href="https://www.shrimaruti.com">www.shrimaruti.com</a></p>
      <p style="margin-top:8px; color:#cbd5e1;">This is a computer-generated invoice and does not require a physical signature.</p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = { generateInvoiceHTML };
