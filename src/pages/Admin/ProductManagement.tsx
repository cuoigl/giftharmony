import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useToast } from "../../components/ui/toast";
import { apiService } from "../../services/api";

interface ProductManagementProps {
  onBack: () => void;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  image: string;
  created: string;
  sku: string;
  description: string;
  image_url?: string; // Thêm trường này để fix lỗi mapping FE/BE
  category_id?: number; // Thêm nếu cần mapping với backend
  stock_quantity?: number; // Thêm nếu cần mapping với backend
}

interface ProductForm {
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  image: string;
  status: "active" | "inactive";
}

export const ProductManagement = ({
  onBack,
}: ProductManagementProps): JSX.Element => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    category: "Hoa tươi",
    price: "",
    stock: "",
    description: "",
    image: "",
    status: "active",
  });

  const [products, setProducts] = useState<Product[]>([]);

  React.useEffect(() => {
    // Lấy danh sách sản phẩm từ backend khi load trang
    const fetchProducts = async () => {
      try {
        const data = await apiService.getProducts();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (error: any) {
        addToast({
          type: "error",
          title: "Lỗi tải sản phẩm",
          description: error.message || "Không thể tải danh sách sản phẩm",
          duration: 3000,
        });
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    "all",
    "Hoa tươi",
    "Công nghệ",
    "Đồ ăn",
    "Làm đẹp",
    "Thời trang",
    "Đồ trang sức",
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Tạm dừng";
      case "out_of_stock":
        return "Hết hàng";
      default:
        return "Không xác định";
    }
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const handleDeleteSelected = () => {
    setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.id)));
    addToast({
      type: "success",
      title: "Đã xóa sản phẩm",
      description: `${selectedProducts.length} sản phẩm đã được xóa`,
      duration: 3000,
    });
    setSelectedProducts([]);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: (product.price ?? product.stock_quantity ?? 0).toString(),
      stock: (product.stock ?? product.stock_quantity ?? 0).toString(),
      description: product.description,
      image: product.image || product.image_url || "",
      status: product.status === "out_of_stock" ? "active" : product.status,
    });
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await apiService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      addToast({
        type: "success",
        title: "Đã xóa sản phẩm",
        description: `Sản phẩm #${productId} đã được xóa`,
        duration: 3000,
      });
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Xóa thất bại",
        description: error.message || "Có lỗi xảy ra khi xóa sản phẩm",
        duration: 3000,
      });
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock) {
      addToast({
        type: "error",
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin sản phẩm",
        duration: 3000,
      });
      return;
    }

    const price = parseInt(formData.price);
    const stock = parseInt(formData.stock);

    if (editingProduct) {
      // Update existing product trên backend
      try {
        await apiService.updateProduct(editingProduct.id, {
          name: formData.name,
          description: formData.description,
          price,
          category_id: getCategoryId(formData.category),
          stock_quantity: stock,
          image_url: formData.image || editingProduct.image,
        });
        // Sau khi update thành công, cập nhật lại danh sách sản phẩm (có thể gọi lại API getProducts hoặc cập nhật state như cũ)
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: formData.name,
                  description: formData.description,
                  price,
                  category_id: getCategoryId(formData.category),
                  stock_quantity: stock,
                  image_url: formData.image || p.image_url,
                }
              : p
          )
        );
        addToast({
          type: "success",
          title: "Cập nhật thành công",
          description: `Sản phẩm ${formData.name} đã được cập nhật`,
          duration: 3000,
        });
      } catch (error: any) {
        addToast({
          type: "error",
          title: "Cập nhật thất bại",
          description: error.message || "Có lỗi xảy ra khi cập nhật sản phẩm",
          duration: 3000,
        });
      }
    } else {
      // Add new product lên backend
      try {
        // Map tên trường đúng với backend
        await apiService.createProduct({
          name: formData.name,
          description: formData.description,
          price,
          category_id: getCategoryId(formData.category),
          stock_quantity: stock,
          image_url:
            formData.image ||
            "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
        });
        // Sau khi thêm thành công, gọi lại API lấy danh sách sản phẩm mới nhất
        const data = await apiService.getProducts();
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray((data as any).products)) {
          setProducts((data as any).products);
        } else {
          setProducts([]);
        }
        addToast({
          type: "success",
          title: "Thêm thành công",
          description: `Sản phẩm ${formData.name} đã được thêm`,
          duration: 3000,
        });
      } catch (error: any) {
        addToast({
          type: "error",
          title: "Thêm thất bại",
          description: error.message || "Có lỗi xảy ra khi thêm sản phẩm",
          duration: 3000,
        });
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Hoa tươi",
      price: "",
      stock: "",
      description: "",
      image: "",
      status: "active",
    });
    setEditingProduct(null);
    setShowAddModal(false);
  };

  const handleInputChange = (field: keyof ProductForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper: Lấy category_id từ tên danh mục
  function getCategoryId(categoryName: string): number {
    const map: Record<string, number> = {
      "Hoa tươi": 1,
      "Công nghệ": 2,
      "Đồ ăn": 3,
      "Làm đẹp": 4,
      "Thời trang": 5,
      "Đồ trang sức": 6,
    };
    return map[categoryName] || 1;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 font-['Poppins',Helvetica]">
              Quản lý sản phẩm
            </h1>
            <div className="ml-auto flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Xuất Excel
              </Button>
              <Button
                className="bg-[#49bbbd] hover:bg-[#3a9a9c] text-white"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm sản phẩm
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tổng sản phẩm
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Đang hoạt động
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {products.filter((p) => p.status === "active").length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hết hàng</p>
                  <p className="text-2xl font-bold text-red-600">
                    {products.filter((p) => p.status === "out_of_stock").length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Giá trị kho
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(
                      products.reduce((sum, p) => sum + p.price * p.stock, 0)
                    )}
                  </p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "Tất cả danh mục" : category}
                  </option>
                ))}
              </select>

              <Button variant="outline" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc nâng cao
              </Button>

              {selectedProducts.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleDeleteSelected}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa ({selectedProducts.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-['Poppins',Helvetica]">
                Danh sách sản phẩm ({filteredProducts.length})
              </CardTitle>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={
                    selectedProducts.length === filteredProducts.length &&
                    filteredProducts.length > 0
                  }
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Chọn tất cả</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Sản phẩm
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      SKU
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Danh mục
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Giá
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Tồn kho
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Trạng thái
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="mr-2"
                          />
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {product.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-sm">
                        {product.sku}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {product.category}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`${
                            product.stock > 5
                              ? "text-green-600"
                              : product.stock > 0
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            product.status
                          )}`}
                        >
                          {getStatusText(product.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 font-['Poppins',Helvetica]">
                {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên sản phẩm *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Nhập tên sản phẩm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                      required
                    >
                      {categories.slice(1).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá (VNĐ) *
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      placeholder="Nhập giá sản phẩm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lượng tồn kho *
                    </label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        handleInputChange("stock", e.target.value)
                      }
                      placeholder="Nhập số lượng"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL hình ảnh
                  </label>
                  <Input
                    value={formData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    placeholder="Nhập URL hình ảnh sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả sản phẩm
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Nhập mô tả sản phẩm..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm dừng</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="bg-[#49bbbd] hover:bg-[#3a9a9c] text-white"
                  >
                    {editingProduct ? "Cập nhật" : "Thêm sản phẩm"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Hủy
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
