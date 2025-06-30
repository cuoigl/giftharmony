const express = require("express");
const { pool } = require("../config/database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Get reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.productId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create review
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Check if product exists
    const productResult = await pool.query(
      "SELECT id FROM products WHERE id = $1 AND is_active = true",
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const existingReview = await pool.query(
      "SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2",
      [req.user.id, product_id]
    );

    if (existingReview.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    // Create review
    await pool.query(
      "INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4)",
      [req.user.id, product_id, rating, comment]
    );

    res.status(201).json({ message: "Review created successfully" });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update review
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const result = await pool.query(
      "UPDATE reviews SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *",
      [rating, comment, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review updated successfully" });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete review
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all reviews (Admin only)
router.get("/admin", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name, u.email, p.name as product_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN products p ON r.product_id = p.id
       ORDER BY r.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get admin reviews error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete review (Admin only)
router.delete(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        "DELETE FROM reviews WHERE id = $1 RETURNING *",
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Delete review error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Approve review (Admin only)
router.put(
  "/admin/:id/approve",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        "UPDATE reviews SET status = 'approved' WHERE id = $1 RETURNING *",
        [req.params.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json({ message: "Review approved successfully" });
    } catch (error) {
      console.error("Approve review error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Reject review (Admin only)
router.put(
  "/admin/:id/reject",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        "UPDATE reviews SET status = 'rejected' WHERE id = $1 RETURNING *",
        [req.params.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json({ message: "Review rejected successfully" });
    } catch (error) {
      console.error("Reject review error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Reply to review (Admin only)
router.put(
  "/admin/:id/reply",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { reply } = req.body;
      const result = await pool.query(
        "UPDATE reviews SET response = $1 WHERE id = $2 RETURNING *",
        [reply, req.params.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json({ message: "Reply saved successfully" });
    } catch (error) {
      console.error("Reply review error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
