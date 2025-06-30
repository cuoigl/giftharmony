const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

async function seedDatabase() {
  try {
    // Seed categories
    const categories = [
      { name: "Hoa tươi", description: "Hoa tươi và cây cảnh" },
      { name: "Công nghệ", description: "Thiết bị điện tử và công nghệ" },
      { name: "Đồ ăn", description: "Thực phẩm và đồ uống" },
      { name: "Làm đẹp", description: "Mỹ phẩm và chăm sóc sắc đẹp" },
      { name: "Thời trang", description: "Quần áo và phụ kiện thời trang" },
    ];

    for (const category of categories) {
      await pool.query(
        "INSERT INTO categories (name, description) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [category.name, category.description]
      );
    }

    // Seed admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await pool.query(
      "INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING",
      ["admin@example.com", hashedPassword, "Admin", "User", "admin"]
    );

    // Get category IDs for products
    const categoryResult = await pool.query("SELECT id, name FROM categories");
    const categoryMap = {};
    categoryResult.rows.forEach((cat) => {
      categoryMap[cat.name] = cat.id;
    });

    // Seed sample products
    const products = [
      {
        name: "Hoa hồng đỏ cao cấp",
        description:
          "Bó hoa hồng đỏ cao cấp được tuyển chọn từ những bông hoa tươi nhất",
        price: 299000,
        category_id: categoryMap["Hoa tươi"],
        stock_quantity: 50,
        image_url:
          "https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1",
      },
      {
        name: "Đồng hồ thông minh",
        description: "Đồng hồ thông minh với nhiều tính năng hiện đại",
        price: 2999000,
        category_id: categoryMap["Công nghệ"],
        stock_quantity: 30,
        image_url:
          "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1",
      },
      {
        name: "Chocolate handmade",
        description: "Chocolate handmade cao cấp với hương vị đậm đà",
        price: 450000,
        category_id: categoryMap["Đồ ăn"],
        stock_quantity: 100,
        image_url:
          "https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1",
      },
      {
        name: "Nước hoa nữ cao cấp",
        description: "Nước hoa nữ cao cấp với hương thơm quyến rũ",
        price: 1200000,
        category_id: categoryMap["Làm đẹp"],
        stock_quantity: 25,
        image_url:
          "https://images.pexels.com/photos/1190829/pexels-photo-1190829.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1",
      },
      {
        name: "Túi xách da thật",
        description: "Túi xách da thật cao cấp, thiết kế sang trọng",
        price: 850000,
        category_id: categoryMap["Thời trang"],
        stock_quantity: 15,
        image_url:
          "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1",
      },
    ];

    for (const product of products) {
      if (product.category_id) {
        await pool.query(
          "INSERT INTO products (name, description, price, category_id, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING",
          [
            product.name,
            product.description,
            product.price,
            product.category_id,
            product.stock_quantity,
            product.image_url,
          ]
        );
      }
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

async function seedPromotions() {
  await pool.query(`
    INSERT INTO promotions (name, code, type, value, min_order, max_discount, start_date, end_date, usage_limit, usage_count, status, description)
    VALUES
      ('Valentine Sale 2025', 'VALENTINE20', 'percentage', 20, 500000, 200000, '2025-02-10', '2025-02-20', 1000, 234, 'active', 'Giảm 20% cho tất cả sản phẩm nhân dịp Valentine'),
      ('Miễn phí vận chuyển', 'FREESHIP', 'free_shipping', 0, 300000, NULL, '2025-01-01', '2025-12-31', 5000, 1567, 'active', 'Miễn phí vận chuyển cho đơn hàng từ 300k'),
      ('Khách hàng mới', 'NEWUSER15', 'percentage', 15, 200000, 150000, '2025-01-01', '2025-03-31', 2000, 456, 'active', 'Giảm 15% cho khách hàng đăng ký mới'),
      ('Tết Nguyên Đán', 'TET2025', 'fixed_amount', 100000, 1000000, NULL, '2025-01-25', '2025-02-05', 500, 89, 'expired', 'Giảm 100k cho đơn hàng từ 1 triệu')
    ON CONFLICT (code) DO NOTHING;
  `);
}

async function seed() {
  await seedDatabase();
  await seedPromotions();
}

seed();
