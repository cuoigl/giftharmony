import React, { useState } from "react";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Calendar,
  Settings,
  Warehouse,
  Tag,
  MessageCircle,
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

interface AdminDashboardProps {
  onViewProducts: () => void;
  onViewOrders: () => void;
  onViewUsers: () => void;
  onViewAnalytics: () => void;
  onViewInventory?: () => void;
  onViewPromotions?: () => void;
  onViewReviews?: () => void;
  onLogout: () => void;
}

export const AdminDashboard = ({
  onViewProducts,
  onViewOrders,
  onViewUsers,
  onViewAnalytics,
  onViewInventory,
  onViewPromotions,
  onViewReviews,
  onLogout,
}: AdminDashboardProps): JSX.Element => {
  const { addToast } = useToast();

  const stats = [
    {
      title: "Tổng doanh thu",
      value: "125.5M",
      unit: "VNĐ",
      change: "+12.5%",
      changeType: "increase",
      icon: <DollarSign className="h-6 w-6" />,
      color: "text-green-600",
    },
    {
      title: "Đơn hàng",
      value: "1,234",
      change: "+8.2%",
      changeType: "increase",
      icon: <ShoppingCart className="h-6 w-6" />,
      color: "text-blue-600",
    },
    {
      title: "Sản phẩm",
      value: "456",
      change: "+3.1%",
      changeType: "increase",
      icon: <Package className="h-6 w-6" />,
      color: "text-purple-600",
    },
    {
      title: "Khách hàng",
      value: "2,890",
      change: "+15.3%",
      changeType: "increase",
      icon: <Users className="h-6 w-6" />,
      color: "text-orange-600",
    },
  ];

  const recentOrders = [
    {
      id: "GH123456",
      customer: "Nguyễn Văn A",
      total: "299.000đ",
      status: "Đã giao",
      date: "15/01/2025",
    },
    {
      id: "GH123457",
      customer: "Trần Thị B",
      total: "450.000đ",
      status: "Đang giao",
      date: "15/01/2025",
    },
    {
      id: "GH123458",
      customer: "Lê Văn C",
      total: "199.000đ",
      status: "Đang xử lý",
      date: "14/01/2025",
    },
  ];

  const topProducts = [
    {
      id: 1,
      name: "Hoa hồng đỏ cao cấp",
      sold: 156,
      revenue: "46.8M",
      image:
        "https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
    },
    {
      id: 2,
      name: "Đồng hồ thông minh",
      sold: 89,
      revenue: "266.9M",
      image:
        "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
    },
    {
      id: 3,
      name: "Chocolate handmade",
      sold: 234,
      revenue: "105.3M",
      image:
        "https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã giao":
        return "bg-green-100 text-green-800";
      case "Đang giao":
        return "bg-blue-100 text-blue-800";
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#49bbbd] font-['Poppins',Helvetica]">
                GiftHarmony Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="outline" onClick={onLogout}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-['Poppins',Helvetica]">
            Bảng điều khiển
          </h2>
          <p className="text-gray-600">
            Tổng quan về hoạt động kinh doanh hôm nay
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      {stat.unit && (
                        <span className="ml-1 text-sm text-gray-500">
                          {stat.unit}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        so với tháng trước
                      </span>
                    </div>
                  </div>
                  <div className={`${stat.color}`}>{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">
                  Thao tác nhanh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={onViewProducts}
                  >
                    <Package className="h-6 w-6" />
                    <span className="text-sm">Sản phẩm</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={onViewOrders}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    <span className="text-sm">Đơn hàng</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={onViewUsers}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Khách hàng</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={onViewAnalytics}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">Thống kê</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={onViewInventory}
                  >
                    <Warehouse className="h-6 w-6" />
                    <span className="text-sm">Kho hàng</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={onViewPromotions}
                  >
                    <Tag className="h-6 w-6" />
                    <span className="text-sm">Khuyến mãi</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={onViewReviews}
                  >
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-sm">Đánh giá</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Settings className="h-6 w-6" />
                    <span className="text-sm">Cài đặt</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-['Poppins',Helvetica]">
                  Đơn hàng gần đây
                </CardTitle>
                <Button variant="outline" size="sm" onClick={onViewOrders}>
                  Xem tất cả
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            #{order.id}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {order.customer}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{order.date}</span>
                          <span className="font-medium text-[#49bbbd]">
                            {order.total}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">
                  Sản phẩm bán chạy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Đã bán: {product.sold}
                        </p>
                        <p className="text-sm font-medium text-[#49bbbd]">
                          {product.revenue} VNĐ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">
                  Thống kê nhanh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Đơn hàng hôm nay
                  </span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Doanh thu hôm nay
                  </span>
                  <span className="font-medium text-[#49bbbd]">12.5M VNĐ</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Khách hàng mới</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Tỷ lệ chuyển đổi
                  </span>
                  <span className="font-medium text-green-600">3.2%</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">
                  Hoạt động gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">
                        Đơn hàng #GH123456 đã được giao
                      </p>
                      <p className="text-xs text-gray-500">5 phút trước</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">
                        Khách hàng mới đăng ký
                      </p>
                      <p className="text-xs text-gray-500">10 phút trước</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">
                        Sản phẩm sắp hết hàng
                      </p>
                      <p className="text-xs text-gray-500">15 phút trước</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
