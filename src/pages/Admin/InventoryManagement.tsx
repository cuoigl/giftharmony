import React, { useState } from 'react';
import { ArrowLeft, Package, AlertTriangle, TrendingDown, Plus, Search, Filter, Edit, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/toast';
import { apiService } from '../../services/api';

interface InventoryManagementProps {
  onBack: () => void;
}

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  price: number;
  supplier: string;
  lastRestocked: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  image: string;
}

export const InventoryManagement = ({ onBack }: InventoryManagementProps): JSX.Element => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  React.useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const res: any = await apiService.getProducts();
        // Map dữ liệu từ API về đúng định dạng InventoryItem
        const mapped = res.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku || '',
          category: p.category_name || '',
          currentStock: p.stock_quantity ?? 0,
          minStock: p.min_stock ?? 0,
          maxStock: p.max_stock ?? 0,
          price: p.price ?? 0,
          supplier: p.supplier || '',
          lastRestocked: p.last_restocked ? new Date(p.last_restocked).toLocaleDateString('vi-VN') : '',
          status: p.stock_quantity === 0 ? 'out_of_stock' : (p.stock_quantity < (p.min_stock ?? 10) ? 'low_stock' : (p.stock_quantity > (p.max_stock ?? 100) ? 'overstocked' : 'in_stock')),
          image: p.image_url || '',
        }));
        setInventory(mapped);
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Lỗi tải danh sách tồn kho',
          description: error.message || 'Không thể tải dữ liệu từ server',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [addToast]);

  const categories = ['all', 'Hoa tươi', 'Công nghệ', 'Đồ ăn', 'Làm đẹp', 'Thời trang'];
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'in_stock', label: 'Còn hàng' },
    { value: 'low_stock', label: 'Sắp hết' },
    { value: 'out_of_stock', label: 'Hết hàng' },
    { value: 'overstocked', label: 'Dư thừa' }
  ];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      case 'overstocked':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'Còn hàng';
      case 'low_stock':
        return 'Sắp hết';
      case 'out_of_stock':
        return 'Hết hàng';
      case 'overstocked':
        return 'Dư thừa';
      default:
        return 'Không xác định';
    }
  };

  const getStockIcon = (status: string) => {
    switch (status) {
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'out_of_stock':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-green-600" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handleRestock = (itemId: number) => {
    addToast({
      type: 'success',
      title: 'Nhập hàng thành công',
      description: `Sản phẩm #${itemId} đã được nhập thêm hàng`,
      duration: 3000
    });
  };

  const lowStockCount = inventory.filter(item => item.status === 'low_stock').length;
  const outOfStockCount = inventory.filter(item => item.status === 'out_of_stock').length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.price), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49bbbd] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách tồn kho...</p>
        </div>
      </div>
    );
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
              Quản lý kho hàng
            </h1>
            <div className="ml-auto">
              <Button className="bg-[#49bbbd] hover:bg-[#3a9a9c] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nhập hàng
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                  <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sắp hết hàng</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hết hàng</p>
                  <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Giá trị kho</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(totalValue)}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
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
                  placeholder="Tìm theo tên hoặc SKU..."
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
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Tất cả danh mục' : category}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <Button variant="outline" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc nâng cao
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins',Helvetica]">
              Danh sách kho hàng ({filteredInventory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Ảnh</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tên sản phẩm</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Danh mục</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Số lượng tồn kho</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Giá</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{item.category}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getStockIcon(item.status)}
                          <span className={`font-medium ${
                            item.status === 'out_of_stock' ? 'text-red-600' :
                            item.status === 'low_stock' ? 'text-yellow-600' : 'text-gray-900'
                          }`}>
                            {item.currentStock}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">{formatPrice(item.price)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {(item.status === 'low_stock' || item.status === 'out_of_stock') && (
                            <Button 
                              size="sm"
                              onClick={() => handleRestock(item.id)}
                              className="bg-[#49bbbd] hover:bg-[#3a9a9c] text-white"
                            >
                              Nhập hàng
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredInventory.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};