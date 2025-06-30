import React, { useState, useEffect } from "react";
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
  Info,
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
import { Skeleton } from "../../components/common/LoadingSpinner";

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

function formatShortNumber(num: number) {
  if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, '') + ' tỷ';
  if (num >= 1e6) return (num / 1e6).toFixed(num % 1e6 === 0 ? 0 : 2).replace(/\.00$/, '') + ' triệu';
  return num.toLocaleString('vi-VN');
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

  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const statsRes: any = await apiService.getAdminStats();
        setStats(statsRes.stats);
        setRecentOrders(statsRes.recentOrders);
        // Lấy top sản phẩm bán chạy
        const productAnalytics: any = await apiService.getProductAnalytics();
        setTopProducts(productAnalytics.topProducts || []);
        setActivities(statsRes.activities || []);
      } catch (error: any) {
        addToast({
          type: "error",
          title: "Lỗi tải dữ liệu dashboard",
          description: error.message || "Không thể tải dữ liệu từ server",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "Chờ xác nhận":
        return "bg-blue-100 text-blue-700";
      case "processing":
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-700";
      case "shipping":
      case "Đang giao":
        return "bg-purple-100 text-purple-700";
      case "delivered":
      case "Đã giao":
        return "bg-green-100 text-green-700";
      case "cancelled":
      case "Đã hủy":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipping":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-8 w-2/3" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl shadow p-6">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow p-6">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#49bbbd] to-[#3a9a9c] shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/30 shadow-lg mr-2">
                <Package className="h-7 w-7 text-[#49bbbd]" />
              </span>
              <h1 className="text-3xl font-extrabold text-white font-['Poppins',Helvetica] tracking-wide drop-shadow-lg">
                GiftHarmony Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-white/20 transition">
                <Settings className="h-6 w-6 text-white" />
              </Button>
              <Button variant="outline" onClick={onLogout} className="bg-white/80 text-[#49bbbd] font-bold border-0 shadow hover:bg-white">
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 font-['Poppins',Helvetica] tracking-tight">
            Bảng điều khiển
          </h2>
          <p className="text-gray-500 text-lg">
            Tổng quan về hoạt động kinh doanh hôm nay
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card: Tổng doanh thu */}
          <Card className="rounded-2xl shadow-xl border-0 bg-gradient-to-br from-[#e0f7fa] via-[#fff] to-[#fff] hover:scale-105 hover:shadow-2xl transition-transform duration-200">
            <CardContent className="p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                    Tổng doanh thu
                    <span className="ml-1" title="Tổng doanh thu toàn hệ thống"><Info className="h-4 w-4 text-gray-400" /></span>
                  </p>
                  <div className="flex items-end">
                    <p className="text-3xl font-extrabold text-gray-900 animate-pulse whitespace-nowrap">
                      {formatShortNumber(stats?.totalRevenue || 0)}
                    </p>
                    <span className="ml-2 text-base text-gray-500 font-semibold">VNĐ</span>
                  </div>
                </div>
                <div className="bg-green-100 p-4 rounded-full shadow-lg">
                  <DollarSign className="h-9 w-9 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Card: Đơn hàng */}
          <Card className="rounded-2xl shadow-xl border-0 bg-gradient-to-br from-[#e3f2fd] via-[#fff] to-[#fff] hover:scale-105 hover:shadow-2xl transition-transform duration-200">
            <CardContent className="p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                    Đơn hàng
                    <span className="ml-1" title="Tổng số đơn hàng"><ShoppingCart className="h-4 w-4 text-gray-400" /></span>
                  </p>
                  <p className="text-4xl font-extrabold text-gray-900 animate-pulse">
                    {stats?.totalOrders?.toLocaleString("vi-VN") || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-4 rounded-full shadow-lg">
                  <ShoppingCart className="h-9 w-9 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Card: Sản phẩm */}
          <Card className="rounded-2xl shadow-xl border-0 bg-gradient-to-br from-[#ede7f6] via-[#fff] to-[#fff] hover:scale-105 hover:shadow-2xl transition-transform duration-200">
            <CardContent className="p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                    Sản phẩm
                    <span className="ml-1" title="Tổng số sản phẩm"><Package className="h-4 w-4 text-gray-400" /></span>
                  </p>
                  <p className="text-4xl font-extrabold text-gray-900 animate-pulse">
                    {stats?.totalProducts?.toLocaleString("vi-VN") || 0}
                  </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-full shadow-lg">
                  <Package className="h-9 w-9 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Card: Khách hàng */}
          <Card className="rounded-2xl shadow-xl border-0 bg-gradient-to-br from-[#fff3e0] via-[#fff] to-[#fff] hover:scale-105 hover:shadow-2xl transition-transform duration-200">
            <CardContent className="p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                    Khách hàng
                    <span className="ml-1" title="Tổng số khách hàng"><Users className="h-4 w-4 text-gray-400" /></span>
                  </p>
                  <p className="text-4xl font-extrabold text-gray-900 animate-pulse">
                    {stats?.totalUsers?.toLocaleString("vi-VN") || 0}
                  </p>
                </div>
                <div className="bg-orange-100 p-4 rounded-full shadow-lg">
                  <Users className="h-9 w-9 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card className="rounded-2xl shadow-xl border-0">
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica] text-lg font-bold text-gray-800">
                  Thao tác nhanh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 border border-gray-200 hover:bg-blue-50 transition"
                    onClick={onViewProducts}
                  >
                    <Package className="h-6 w-6 mb-1 text-blue-600" />
                    <span className="text-sm font-semibold">Sản phẩm</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 border border-gray-200 hover:bg-green-50 transition"
                    onClick={onViewOrders}
                  >
                    <ShoppingCart className="h-6 w-6 mb-1 text-green-600" />
                    <span className="text-sm font-semibold">Đơn hàng</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 border border-gray-200 hover:bg-orange-50 transition"
                    onClick={onViewUsers}
                  >
                    <Users className="h-6 w-6 mb-1 text-orange-600" />
                    <span className="text-sm font-semibold">Khách hàng</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 border border-gray-200 hover:bg-purple-50 transition"
                    onClick={onViewAnalytics}
                  >
                    <BarChart3 className="h-6 w-6 mb-1 text-purple-600" />
                    <span className="text-sm font-semibold">Thống kê</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 border border-gray-200 hover:bg-yellow-50 transition"
                    onClick={onViewInventory}
                  >
                    <Warehouse className="h-6 w-6 mb-1 text-yellow-600" />
                    <span className="text-sm font-semibold">Kho hàng</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 border border-gray-200 hover:bg-pink-50 transition"
                    onClick={onViewPromotions}
                  >
                    <Tag className="h-6 w-6 mb-1 text-pink-600" />
                    <span className="text-sm font-semibold">Khuyến mãi</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 border border-gray-200 hover:bg-gray-50 transition"
                    onClick={onViewReviews}
                  >
                    <MessageCircle className="h-6 w-6 mb-1 text-gray-600" />
                    <span className="text-sm font-semibold">Đánh giá</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 border border-gray-200 hover:bg-gray-100 transition"
                  >
                    <Settings className="h-6 w-6 mb-1 text-gray-500" />
                    <span className="text-sm font-semibold">Cài đặt</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="rounded-2xl shadow-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-['Poppins',Helvetica] text-lg font-bold text-gray-800">
                  Đơn hàng gần đây
                </CardTitle>
                <Button variant="outline" size="sm" onClick={onViewOrders} className="font-semibold">
                  Xem tất cả
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.slice(0, 4).map((order, idx) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50 hover:shadow transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            Đơn hàng: #{order.id}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-bold ${getStatusColor(order.status)}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {order.first_name} {order.last_name} ({order.email})
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {new Date(order.created_at).toLocaleDateString("vi-VN")}
                          </span>
                          <span className="font-semibold text-[#49bbbd]">
                            {order.total_amount?.toLocaleString("vi-VN")} VNĐ
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button size="sm" variant="ghost" className="hover:bg-blue-100">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button size="sm" variant="ghost" className="hover:bg-green-100">
                          <Edit className="h-4 w-4 text-green-600" />
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
            <Card className="rounded-2xl shadow-xl border-0">
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica] text-lg font-bold text-gray-800">
                  Sản phẩm bán chạy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        {/* Nếu có ảnh thì render, không thì để avatar mặc định */}
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Đã bán: <span className="font-bold text-blue-600">{product.total_sold}</span>
                        </p>
                        <p className="text-sm font-semibold text-[#49bbbd]">
                          {Number(product.revenue).toLocaleString("vi-VN")} VNĐ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Quick Stats */}
            <Card className="rounded-2xl shadow-xl border-0">
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica] text-lg font-bold text-gray-800">
                  Thống kê nhanh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Đơn hàng hôm nay</span>
                  <span className="font-bold text-lg">{stats?.todayOrders ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Doanh thu hôm nay</span>
                  <span className="font-bold text-lg text-[#49bbbd]">{stats?.todayRevenue?.toLocaleString("vi-VN") ?? 0} VNĐ</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Khách hàng mới</span>
                  <span className="font-bold text-lg">{stats?.newCustomers ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tỷ lệ chuyển đổi</span>
                  <span className="font-bold text-lg text-green-600">{stats?.conversionRate ?? 0}%</span>
                </div>
              </CardContent>
            </Card>
            {/* Recent Activity */}
            <Card className="rounded-2xl shadow-xl border-0">
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica] text-lg font-bold text-gray-800">
                  Hoạt động gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.slice(0, 3).map((act, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                      <div>
                        <p className="text-sm text-gray-900 font-semibold">{act.message}</p>
                        <p className="text-xs text-gray-500">{act.timeAgo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
