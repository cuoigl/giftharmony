import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Star, Package, Heart, Settings, Edit3, Camera } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/toast';
import { apiService } from '../../services/api';

interface ProfileProps {
  onBack: () => void;
  onViewSettings?: () => void;
  onViewOrderHistory?: () => void;
  onViewWishlist?: () => void;
}

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  birthDate: string;
  gender: string;
}

// Tạm mở rộng type User cho FE nếu backend chưa trả về đủ
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar?: string;
  points?: number;
  level?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  birthDate?: string;
  gender?: string;
}

export const Profile = ({ onBack, onViewSettings, onViewOrderHistory, onViewWishlist }: ProfileProps): JSX.Element => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    district: user?.district || '',
    ward: user?.ward || '',
    birthDate: user?.birthDate || '',
    gender: user?.gender || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const response = await apiService.getOrders();
        // Đảm bảo response là mảng đơn hàng đúng format backend trả về
        const ordersArray = Array.isArray(response) ? response : (Array.isArray(response?.orders) ? response.orders : []);
        const statusMap: Record<string, string> = {
          pending: 'Đang xử lý',
          shipped: 'Đang giao',
          delivered: 'Đã giao',
          cancelled: 'Đã hủy',
        };
        const mapped = ordersArray.map((order: any) => ({
          id: String(order.id),
          date: order.created_at || order.date || '',
          total: order.total_amount || order.total || 0,
          status: statusMap[order.status] || order.status || '',
          items: (order.items || []).map((item: any) => `${item.product_name || item.name} x${item.quantity}`).join(', ')
        }));
        setRecentOrders(mapped.slice(0, 3));
      } catch (e) {
        setRecentOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const stats = [
    { label: 'Đơn hàng', value: '24', icon: <Package className="h-5 w-5" />, onClick: onViewOrderHistory },
    { label: 'Yêu thích', value: '12', icon: <Heart className="h-5 w-5" />, onClick: onViewWishlist },
    { label: 'Điểm tích lũy', value: user?.points?.toLocaleString() || '0', icon: <Star className="h-5 w-5" /> },
    { label: 'Thành viên từ', value: '2024', icon: <Calendar className="h-5 w-5" /> }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profile.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!profile.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!profile.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(profile.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = async () => {
    setErrors({});
    if (!validateForm()) return;
    try {
      if (updateProfile) {
        await updateProfile({
          first_name: profile.fullName.split(' ')[0] || '',
          last_name: profile.fullName.split(' ').slice(1).join(' ') || '',
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          district: profile.district,
          ward: profile.ward,
          birthDate: profile.birthDate,
          gender: profile.gender
        });
      }
      // Sau khi cập nhật, nên reload lại user từ backend (nếu cần)
      addToast({ title: 'Cập nhật thành công', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      addToast({ title: 'Cập nhật thất bại', type: 'error' });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setProfile({
      fullName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      district: user?.district || '',
      ward: user?.ward || '',
      birthDate: user?.birthDate || '',
      gender: user?.gender || ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã giao':
        return 'bg-green-100 text-green-800';
      case 'Đang giao':
        return 'bg-blue-100 text-blue-800';
      case 'Đang xử lý':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#fffefc]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
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
              Hồ sơ cá nhân
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={user?.avatar}
                        alt={user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute -bottom-1 -right-1 bg-white shadow-md hover:bg-gray-50 h-8 w-8"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 font-['Poppins',Helvetica]">
                      {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''}
                    </h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <div className="flex items-center mt-2">
                      <span className="inline-block px-3 py-1 bg-[#49bbbd] text-white text-sm rounded-full">
                        {user?.level}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "outline" : "ghost"}
                    className="flex items-center"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica] flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Thông tin cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    {isEditing ? (
                      <Input
                        value={profile.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={errors.fullName ? 'border-red-500' : ''}
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{profile.fullName}</p>
                    )}
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{profile.email}</p>
                    )}
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    {isEditing ? (
                      <Input
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{profile.phone}</p>
                    )}
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh
                    </label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={profile.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      />
                    ) : (
                      <p className="py-2 text-gray-900">
                        {new Date(profile.birthDate).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính
                    </label>
                    {isEditing ? (
                      <select
                        value={profile.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    ) : (
                      <p className="py-2 text-gray-900">{profile.gender}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thành phố
                    </label>
                    {isEditing ? (
                      <select
                        value={profile.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                      >
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Cần Thơ">Cần Thơ</option>
                      </select>
                    ) : (
                      <p className="py-2 text-gray-900">{profile.city}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  {isEditing ? (
                    <Input
                      value={`${profile.address}, ${profile.ward}, ${profile.district}`}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  ) : (
                    <p className="py-2 text-gray-900">
                      {profile.address}, {profile.ward}, {profile.district}, {profile.city}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSave}
                      className="bg-[#49bbbd] hover:bg-[#3a9a9c] text-white"
                    >
                      Lưu thay đổi
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                    >
                      Hủy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica] flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Đơn hàng gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ordersLoading ? (
                    <div className="text-center text-gray-500 py-8">Đang tải...</div>
                  ) : recentOrders.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">Chưa có đơn hàng nào</div>
                  ) : (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">Mã đơn: <span className="text-[#49bbbd] font-bold">#{order.id}</span></h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{order.items}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{order.date ? new Date(order.date).toLocaleDateString('vi-VN') : ''}</span>
                            <span className="font-medium text-[#49bbbd]">{order.total?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={onViewOrderHistory}
                >
                  Xem tất cả đơn hàng
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Thống kê</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div 
                      key={index} 
                      className={`text-center p-4 bg-gray-50 rounded-lg ${stat.onClick ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
                      onClick={stat.onClick}
                    >
                      <div className="flex justify-center mb-2 text-[#49bbbd]">
                        {stat.icon}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={onViewOrderHistory}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Theo dõi đơn hàng
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={onViewWishlist}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Danh sách yêu thích
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Sổ địa chỉ
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={onViewSettings}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt tài khoản
                </Button>
              </CardContent>
            </Card>

            {/* Membership Info */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">Thành viên</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#49bbbd] to-[#3a9a9c] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{user?.level}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Bạn có {user?.points?.toLocaleString()} điểm tích lũy
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-[#49bbbd] h-2 rounded-full" 
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Còn 250 điểm để lên hạng Platinum
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};