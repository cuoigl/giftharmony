import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Calendar, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { apiService } from '../../services/api';

interface AnalyticsProps {
  onBack: () => void;
}

export const Analytics = ({ onBack }: AnalyticsProps): JSX.Element => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const periods = [
    { value: 'day', label: '30 ngày qua' },
    { value: 'week', label: '12 tuần qua' },
    { value: 'month', label: '12 tháng qua' },
    { value: 'year', label: '5 năm qua' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, salesRes, productRes] = await Promise.all([
          apiService.getAdminStats(),
          apiService.getSalesAnalytics(selectedPeriod),
          apiService.getProductAnalytics()
        ]);
        setStats((statsRes as any).stats);
        setSales(salesRes as any[]);
        setTopProducts((productRes as any).topProducts || []);
        setTopCategories((productRes as any).categoryPerformance || []);
        setRecentActivity((statsRes as any).activities || []);
      } catch (err: any) {
        setError(err.message || 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedPeriod]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-blue-600" />;
      case 'user':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-purple-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49bbbd] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
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
              Báo cáo & Thống kê
            </h1>
            <div className="ml-auto flex items-center space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards trên cùng */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-gray-900">{stats ? stats.totalRevenue.toLocaleString('vi-VN') : 0}</p>
                    <span className="ml-1 text-sm text-gray-500">VNĐ</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{stats ? stats.todayRevenue.toLocaleString('vi-VN') : 0} hôm nay</span>
                  </div>
                </div>
                <div className="text-green-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đơn hàng</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-gray-900">{stats ? stats.totalOrders : 0}</p>
                  </div>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600">+{stats ? stats.todayOrders : 0} hôm nay</span>
                  </div>
                </div>
                <div className="text-blue-600">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Khách hàng mới</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-gray-900">{stats ? stats.newCustomers : 0}</p>
                  </div>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600">Tỷ lệ chuyển đổi: {stats ? stats.conversionRate : 0}%</span>
                  </div>
                </div>
                <div className="text-purple-600">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sản phẩm bán ra</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-gray-900">{topProducts.reduce((sum, p) => sum + Number(p.total_sold || 0), 0)}</p>
                  </div>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-sm text-orange-600">Top 1: {topProducts[0]?.name || ''}</span>
                  </div>
                </div>
                <div className="text-orange-600">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Grid 2 cột bên dưới */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Biểu đồ doanh thu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-[#49bbbd]/10 to-[#ccb3ac]/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-[#49bbbd] mx-auto mb-4" />
                    <p className="text-gray-600">Biểu đồ doanh thu theo thời gian</p>
                    <p className="text-sm text-gray-500 mt-2">Dữ liệu cho {periods.find(p => p.value === selectedPeriod)?.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Sản phẩm bán chạy nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#49bbbd] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.total_sold} sản phẩm • {Number(product.revenue).toLocaleString('vi-VN')}đ</p>
                        </div>
                      </div>
                      <span className="text-green-600 font-semibold">{Math.round((Number(product.revenue) / (stats?.totalRevenue || 1)) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Column */}
          <div className="space-y-8 flex flex-col h-full">
            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Danh mục bán chạy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{cat.name}</p>
                        <p className="text-sm text-gray-600">{cat.items_sold} sản phẩm • {Number(cat.revenue).toLocaleString('vi-VN')}đ</p>
                      </div>
                      <span className="text-blue-600 font-semibold">{Math.round((Number(cat.revenue) / (stats?.totalRevenue || 1)) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Hoạt động gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length === 0 && <p className="text-gray-500">Không có hoạt động gần đây</p>}
                  {recentActivity.map((act, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      {getActivityIcon(act.type || 'order')}
                      <span className="text-gray-800">{act.message || act.event}</span>
                      {act.amount && <span className="ml-auto text-green-600">{act.amount}</span>}
                      {act.timeAgo && <span className="ml-auto text-gray-400 text-xs">{act.timeAgo}</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Thống kê nhanh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Đơn hàng hôm nay</span>
                    <span className="font-bold text-lg">{stats?.todayOrders ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Doanh thu hôm nay</span>
                    <span className="font-bold text-lg text-[#49bbbd]">{stats?.todayRevenue?.toLocaleString('vi-VN') ?? 0} VNĐ</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Khách hàng mới</span>
                    <span className="font-bold text-lg">{stats?.newCustomers ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tỷ lệ chuyển đổi</span>
                    <span className="font-bold text-lg text-green-600">{stats?.conversionRate ?? 0}%</span>
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