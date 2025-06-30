const express = require("express");
const { pool } = require("../config/database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Get all promotions (public)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM promotions ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get promotions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create promotion
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      code,
      type,
      value,
      min_order,
      max_discount,
      start_date,
      end_date,
      usage_limit,
      description,
      status
    } = req.body;
    const result = await pool.query(
      `INSERT INTO promotions (name, code, type, value, min_order, max_discount, start_date, end_date, usage_limit, description, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()) RETURNING *`,
      [name, code, type, value, min_order, max_discount, start_date, end_date, usage_limit, description, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create promotion error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update promotion
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      code,
      type,
      value,
      min_order,
      max_discount,
      start_date,
      end_date,
      usage_limit,
      description,
      status
    } = req.body;
    const result = await pool.query(
      `UPDATE promotions SET name=$1, code=$2, type=$3, value=$4, min_order=$5, max_discount=$6, start_date=$7, end_date=$8, usage_limit=$9, description=$10, status=$11, updated_at=NOW() WHERE id=$12 RETURNING *`,
      [name, code, type, value, min_order, max_discount, start_date, end_date, usage_limit, description, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Promotion not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update promotion error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete promotion
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(
      `DELETE FROM promotions WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Promotion not found" });
    }
    res.json({ message: "Promotion deleted successfully" });
  } catch (error) {
    console.error("Delete promotion error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router; 