const express = require("express");
const { pool } = require("../config/database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Get user orders
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.email, u.first_name, u.last_name, u.phone,
       json_agg(
         json_build_object(
           'product_id', oi.product_id,
           'product_name', p.name,
           'quantity', oi.quantity,
           'price', oi.price
         )
       ) as items
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id, u.email, u.first_name, u.last_name, u.phone
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create order
router.post("/", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { items, shipping_address, shipping_fee = 0, discount = 0, promo_code = null, final_total = 0 } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Thiếu danh sách sản phẩm (items)" });
    }
    if (!shipping_address) {
      return res
        .status(400)
        .json({ message: "Thiếu địa chỉ giao hàng (shipping_address)" });
    }
    let total_amount = 0;

    // Calculate total and validate stock
    for (const item of items) {
      const productResult = await client.query(
        "SELECT price, stock_quantity FROM products WHERE id = $1 AND is_active = true",
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res
          .status(404)
          .json({ message: `Không tìm thấy sản phẩm ID ${item.product_id}` });
      }

      const product = productResult.rows[0];
      if (product.stock_quantity < item.quantity) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ message: `Sản phẩm ID ${item.product_id} không đủ hàng` });
      }

      total_amount += product.price * item.quantity;
    }

    // Tính tổng cuối cùng
    const finalTotal = Number(total_amount) + Number(shipping_fee) - Number(discount);

    // Create order
    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total_amount, shipping_address, shipping_fee, discount, promo_code, final_total) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [req.user.id, total_amount, shipping_address, shipping_fee, discount, promo_code, finalTotal]
    );

    const order = orderResult.rows[0];
    const orderId = order.id;

    // Create order items and update stock
    for (const item of items) {
      const productResult = await client.query(
        "SELECT price FROM products WHERE id = $1",
        [item.product_id]
      );

      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, item.product_id, item.quantity, productResult.rows[0].price]
      );

      await client.query(
        "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2",
        [item.quantity, item.product_id]
      );
    }

    // Clear user's cart
    await client.query("DELETE FROM cart WHERE user_id = $1", [req.user.id]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order created successfully",
      order: {
        ...order,
        items,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Get all orders (Admin only)
router.get("/admin", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.email, u.first_name, u.last_name,
       json_agg(
         json_build_object(
           'product_id', oi.product_id,
           'product_name', p.name,
           'quantity', oi.quantity,
           'price', oi.price
         )
       ) as items
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       GROUP BY o.id, u.email, u.first_name, u.last_name
       ORDER BY o.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get admin orders error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update order status (Admin only)
router.put("/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
