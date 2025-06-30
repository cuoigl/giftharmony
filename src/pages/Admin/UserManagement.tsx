import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Eye, Edit, Ban, UserCheck, Mail, Phone, X, User, Calendar, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/toast';
import { apiService } from '../../services/api';

interface UserManagementProps {
  onBack: () => void;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'active' | 'inactive' | 'banned';
  level: string;
  points: number;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  lastLogin: string;
  address?: string;
  birthDate?: string;
  gender?: string;
  role?: string;
}

export const UserManagement = ({ onBack }: UserManagementProps): JSX.Element => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<User[]>([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res: any = await apiService.getAllUsers();
        // Map dữ liệu từ API về đúng định dạng User
        const mapped = res.map((u: any) => ({
          id: u.id,
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
          email: u.email,
          phone: u.phone || '',
          avatar: u.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${u.first_name || ''} ${u.last_name || ''}`),
          status: u.is_active ? 'active' : 'inactive',
          level: u.level || 'New Member',
          points: u.points || 0,
          totalOrders: u.total_orders || 0,
          totalSpent: u.total_spent || 0,
          joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '',
          lastLogin: u.last_login ? new Date(u.last_login).toLocaleDateString('vi-VN') : '',
          address: u.address || '',
          birthDate: u.birthDate || '',
          gender: u.gender || '',
          role: u.role || '',
        }));
        setUsers(mapped);
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Lỗi tải danh sách người dùng',
          description: error.message || 'Không thể tải dữ liệu từ server',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [addToast]);

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
    { value: 'banned', label: 'Bị cấm' }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone.includes(searchQuery);
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    const isNotAdmin = user.level !== 'admin' && user.role !== 'admin';
    return matchesSearch && matchesStatus && isNotAdmin;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'banned':
        return 'Bị cấm';
      default:
        return 'Không xác định';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Gold Member':
        return 'text-yellow-600';
      case 'Silver Member':
        return 'text-gray-600';
      case 'Bronze Member':
        return 'text-orange-600';
      default:
        return 'text-blue-600';
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      setShowEditModal(false);
      setEditingUser(null);
      addToast({
        type: 'success',
        title: 'Cập nhật thành công',
        description: `Thông tin người dùng ${editingUser.name} đã được cập nhật`,
        duration: 3000
      });
    }
  };

  const handleToggleStatus = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    addToast({
      type: 'success',
      title: 'Cập nhật trạng thái',
      description: `Người dùng #${userId} đã được ${newStatus === 'active' ? 'kích hoạt' : 'cấm'}`,
      duration: 3000
    });
  };

  const handleSendEmail = (userEmail: string) => {
    addToast({
      type: 'info',
      title: 'Gửi email',
      description: `Đã mở form gửi email đến ${userEmail}`,
      duration: 3000
    });
  };

  const handleUpdateEditingUser = (field: keyof User, value: any) => {
    if (editingUser) {
      setEditingUser(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49bbbd] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách người dùng...</p>
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
              Quản lý khách hàng
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-600">Tổng khách hàng</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Đang hoạt động</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {users.filter(u => u.status === 'inactive').length}
              </p>
              <p className="text-sm text-gray-600">Không hoạt động</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => u.status === 'banned').length}
              </p>
              <p className="text-sm text-gray-600">Bị cấm</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Tìm theo tên, email hoặc số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
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

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins',Helvetica]">
              Danh sách khách hàng ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Khách hàng</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Liên hệ</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Hạng thành viên</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Đơn hàng</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tổng chi tiêu</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">ID: {user.id}</p>
                            <p className="text-sm text-gray-500">Tham gia: {user.joinDate}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">{user.email}</p>
                        <p className="text-sm text-gray-600">{user.phone}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className={`font-medium ${getLevelColor(user.level)}`}>{user.level}</p>
                        <p className="text-sm text-gray-600">{user.points} điểm</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">{user.totalOrders}</p>
                        <p className="text-sm text-gray-600">đơn hàng</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">{formatPrice(user.totalSpent)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                          {getStatusText(user.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleSendEmail(user.email)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            className={user.status === 'active' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}
                          >
                            {user.status === 'active' ? <Ban className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Không tìm thấy khách hàng nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-['Poppins',Helvetica]">
                Chi tiết khách hàng
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDetailModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(selectedUser.status)}`}>
                    {getStatusText(selectedUser.status)}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Thông tin liên hệ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-3" />
                    <span>{selectedUser.phone}</span>
                  </div>
                  {selectedUser.address && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                      <span>{selectedUser.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Thông tin cá nhân
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedUser.birthDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                      <span>Ngày sinh: {new Date(selectedUser.birthDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  {selectedUser.gender && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-3" />
                      <span>Giới tính: {selectedUser.gender}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-3">Hạng thành viên:</span>
                    <span className={`font-medium ${getLevelColor(selectedUser.level)}`}>
                      {selectedUser.level}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-3">Điểm tích lũy:</span>
                    <span className="font-medium">{selectedUser.points} điểm</span>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thống kê mua hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-[#49bbbd]">{selectedUser.totalOrders}</div>
                      <div className="text-sm text-gray-600">Tổng đơn hàng</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-[#49bbbd]">{formatPrice(selectedUser.totalSpent)}</div>
                      <div className="text-sm text-gray-600">Tổng chi tiêu</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-['Poppins',Helvetica]">
                Chỉnh sửa khách hàng
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowEditModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <Input
                    value={editingUser.name}
                    onChange={(e) => handleUpdateEditingUser('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => handleUpdateEditingUser('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <Input
                    value={editingUser.phone}
                    onChange={(e) => handleUpdateEditingUser('phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => handleUpdateEditingUser('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="banned">Bị cấm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <Input
                  value={editingUser.address || ''}
                  onChange={(e) => handleUpdateEditingUser('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hạng thành viên
                  </label>
                  <select
                    value={editingUser.level}
                    onChange={(e) => handleUpdateEditingUser('level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                  >
                    <option value="New Member">New Member</option>
                    <option value="Bronze Member">Bronze Member</option>
                    <option value="Silver Member">Silver Member</option>
                    <option value="Gold Member">Gold Member</option>
                    <option value="Platinum Member">Platinum Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điểm tích lũy
                  </label>
                  <Input
                    type="number"
                    value={editingUser.points}
                    onChange={(e) => handleUpdateEditingUser('points', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSaveUser}
                  className="bg-[#49bbbd] hover:bg-[#3a9a9c] text-white"
                >
                  Lưu thay đổi
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};