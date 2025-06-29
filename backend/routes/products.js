const express = require("express");
const { pool } = require("../config/database");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { validateRequest, schemas } = require("../middleware/validation");

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    let { category, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Nếu category là tên (string), cần map sang category_id
    let categoryId = null;
    if (category) {
      // Nếu category là số, dùng luôn, nếu là tên thì truy vấn lấy id
      if (!isNaN(category)) {
        categoryId = category;
      } else {
        // Tìm category_id theo tên (hỗ trợ tiếng Việt, encodeURIComponent)
        const catResult = await pool.query(
          "SELECT id FROM categories WHERE name = $1",
          [decodeURIComponent(category)]
        );
        if (catResult.rows.length > 0) {
          categoryId = catResult.rows[0].id;
        } else {
          // Không tìm thấy category, trả về mảng rỗng
          return res.json({
            products: [],
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: 0,
              pages: 0,
            },
          });
        }
      }
    }

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = true
    `;
    const params = [];
    let paramCount = 0;

    if (categoryId) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      params.push(categoryId);
    }

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${
        paramCount + 1
      })`;
      params.push(`%${search}%`, `%${search}%`);
      paramCount++;
    }

    paramCount++;
    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${
      paramCount + 1
    }`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Nếu search là "quà tặng" hoặc category là "quà tặng" thì trả về các sản phẩm nổi bật (ví dụ: rating cao, bán chạy)
    let isGiftSearch = false;
    if (search && search.trim().toLowerCase().includes("quà tặng")) {
      isGiftSearch = true;
    }
    if (
      category &&
      decodeURIComponent(category).trim().toLowerCase() === "quà tặng"
    ) {
      isGiftSearch = true;
    }

    if (isGiftSearch) {
      // Lấy top 20 sản phẩm nổi bật (ví dụ: stock_quantity > 0, order by price desc)
      const giftResult = await pool.query(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.is_active = true AND p.stock_quantity > 0
        ORDER BY p.price DESC, p.created_at DESC
        LIMIT 20
      `);
      return res.json({
        products: giftResult.rows,
        pagination: {
          page: 1,
          limit: 20,
          total: giftResult.rows.length,
          pages: 1,
        },
      });
    }

    // Get total count
    let countQuery =
      "SELECT COUNT(*) as total FROM products WHERE is_active = true";
    const countParams = [];
    let countParamCount = 0;

    if (categoryId) {
      countParamCount++;
      countQuery += ` AND category_id = $${countParamCount}`;
      countParams.push(categoryId);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (name ILIKE $${countParamCount} OR description ILIKE $${
        countParamCount + 1
      })`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", detail: error.message });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1 AND p.is_active = true`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create product (Admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validateRequest(schemas.product),
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category_id,
        stock_quantity,
        image_url,
      } = req.body;

      const result = await pool.query(
        "INSERT INTO products (name, description, price, category_id, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [name, description, price, category_id, stock_quantity, image_url]
      );

      res.status(201).json({
        message: "Product created successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update product (Admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateRequest(schemas.product),
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category_id,
        stock_quantity,
        image_url,
      } = req.body;

      const result = await pool.query(
        "UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, stock_quantity = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
        [
          name,
          description,
          price,
          category_id,
          stock_quantity,
          image_url,
          req.params.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({
        message: "Product updated successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete product (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE products SET is_active = false WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
