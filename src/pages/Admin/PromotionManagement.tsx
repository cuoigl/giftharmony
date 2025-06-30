import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Filter, Edit, Trash2, Eye, Calendar, Percent, Tag, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/toast';
import { apiService } from '../../services/api';

interface PromotionManagementProps {
  onBack: () => void;
}

type PromotionStatus = 'active' | 'inactive' | 'expired' | 'scheduled';

interface Promotion {
  id: number;
  name: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  status: PromotionStatus;
  description: string;
}

interface PromotionForm {
  name: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: string;
  minOrder: string;
  maxDiscount: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  description: string;
  status: PromotionStatus;
}

export const PromotionManagement = ({ onBack }: PromotionManagementProps): JSX.Element => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<PromotionForm>({
    name: '',
    code: '',
    type: 'percentage',
    value: '',
    minOrder: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    description: '',
    status: 'active'
  });

  const [promotions, setPromotions] = useState<Promotion[]>([]);

  React.useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const res: any = await apiService.getPromotions();
        // Map dữ liệu từ API về đúng định dạng Promotion
        const mapped = res.map((p: any) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          type: p.type,
          value: Number(p.value),
          minOrder: Number(p.min_order),
          maxDiscount: p.max_discount ? Number(p.max_discount) : undefined,
          startDate: p.start_date ? p.start_date.slice(0, 10) : '',
          endDate: p.end_date ? p.end_date.slice(0, 10) : '',
          usageLimit: Number(p.usage_limit),
          usageCount: Number(p.usage_count),
          status: p.status,
          description: p.description || '',
        }));
        setPromotions(mapped);
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Lỗi tải danh sách khuyến mãi',
          description: error.message || 'Không thể tải dữ liệu từ server',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, [addToast]);

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Tạm dừng' },
    { value: 'expired', label: 'Đã hết hạn' },
    { value: 'scheduled', label: 'Đã lên lịch' }
  ];

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         promotion.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || promotion.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'inactive':
        return 'Tạm dừng';
      case 'expired':
        return 'Đã hết hạn';
      case 'scheduled':
        return 'Đã lên lịch';
      default:
        return 'Không xác định';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'fixed_amount':
        return <Tag className="h-4 w-4" />;
      case 'free_shipping':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'Phần trăm';
      case 'fixed_amount':
        return 'Số tiền cố định';
      case 'free_shipping':
        return 'Miễn phí ship';
      default:
        return 'Khác';
    }
  };

  const formatValue = (type: string, value: number) => {
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'fixed_amount':
        return `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
      case 'free_shipping':
        return 'Miễn phí';
      default:
        return value.toString();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  function formatDateForSQL(dateStr: string) {
    if (!dateStr) return null;
    // Nếu là yyyy-MM-dd thì trả về luôn
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Nếu là dd/MM/yyyy thì chuyển
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    return null; // Không đúng định dạng
  }

  function isValidDateString(dateStr: string) {
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ||
      /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)
    );
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      addToast({
        type: 'error',
        title: 'Lỗi',
        description: 'Vui lòng nhập tên khuyến mãi',
        duration: 3000
      });
      return false;
    }

    if (!formData.code.trim()) {
      addToast({
        type: 'error',
        title: 'Lỗi',
        description: 'Vui lòng nhập mã khuyến mãi',
        duration: 3000
      });
      return false;
    }

    // Check if code already exists
    const existingPromotion = promotions.find(p => 
      p.code.toLowerCase() === formData.code.toLowerCase() && 
      (!editingPromotion || p.id !== editingPromotion.id)
    );
    
    if (existingPromotion) {
      addToast({
        type: 'error',
        title: 'Lỗi',
        description: 'Mã khuyến mãi đã tồn tại',
        duration: 3000
      });
      return false;
    }

    if (formData.type !== 'free_shipping' && (!formData.value || parseFloat(formData.value) <= 0)) {
      addToast({
        type: 'error',
        title: 'Lỗi',
        description: 'Vui lòng nhập giá trị khuyến mãi hợp lệ',
        duration: 3000
      });
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      addToast({
        type: 'error',
        title: 'Lỗi',
        description: 'Vui lòng chọn ngày bắt đầu và kết thúc',
        duration: 3000
      });
      return false;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      addToast({
        type: 'error',
        title: 'Lỗi',
        description: 'Ngày kết thúc phải sau ngày bắt đầu',
        duration: 3000
      });
      return false;
    }

    return true;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (editingPromotion) {
        // Sửa khuyến mãi
        await apiService.updatePromotion(editingPromotion.id, {
          ...formData,
          value: Number(formData.value),
          min_order: Number(formData.minOrder),
          max_discount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
          usage_limit: Number(formData.usageLimit),
          start_date: formatDateForSQL(formData.startDate),
          end_date: formatDateForSQL(formData.endDate),
        });
        addToast({ type: 'success', title: 'Cập nhật thành công', description: 'Khuyến mãi đã được cập nhật!' });
      } else {
        // Thêm mới khuyến mãi
        await apiService.createPromotion({
          ...formData,
          value: Number(formData.value),
          min_order: Number(formData.minOrder),
          max_discount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
          usage_limit: Number(formData.usageLimit),
          start_date: formatDateForSQL(formData.startDate),
          end_date: formatDateForSQL(formData.endDate),
        });
        addToast({ type: 'success', title: 'Thêm thành công', description: 'Khuyến mãi mới đã được thêm!' });
      }
      setShowAddModal(false);
      setEditingPromotion(null);
      setFormData({
        name: '', code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', startDate: '', endDate: '', usageLimit: '', description: '', status: 'active'
      });
      // Reload danh sách
      const res: any = await apiService.getPromotions();
      const mapped = res.map((p: any) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        type: p.type,
        value: Number(p.value),
        minOrder: Number(p.min_order),
        maxDiscount: p.max_discount ? Number(p.max_discount) : undefined,
        startDate: p.start_date ? p.start_date.slice(0, 10) : '',
        endDate: p.end_date ? p.end_date.slice(0, 10) : '',
        usageLimit: Number(p.usage_limit),
        usageCount: Number(p.usage_count),
        status: p.status,
        description: p.description || '',
      }));
      setPromotions(mapped);
    } catch (error: any) {
      addToast({ type: 'error', title: 'Lỗi', description: error.message || 'Không thể lưu khuyến mãi' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'percentage',
      value: '',
      minOrder: '',
      maxDiscount: '',
      startDate: '',
      endDate: '',
      usageLimit: '',
      description: '',
      status: 'active'
    });
    setEditingPromotion(null);
    setShowAddModal(false);
  };

  const handleInputChange = (field: keyof PromotionForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      code: promotion.code,
      type: promotion.type,
      value: promotion.value.toString(),
      minOrder: promotion.minOrder.toString(),
      maxDiscount: promotion.maxDiscount?.toString() || '',
      startDate: new Date(promotion.startDate.split('/').reverse().join('-')).toISOString().split('T')[0],
      endDate: new Date(promotion.endDate.split('/').reverse().join('-')).toISOString().split('T')[0],
      usageLimit: promotion.usageLimit.toString(),
      description: promotion.description,
      status: promotion.status === 'expired' ? 'active' : promotion.status
    });
    setShowAddModal(true);
  };

  const handleViewPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowDetailModal(true);
  };

  const handleDeletePromotion = async (promotionId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) return;
    try {
      await apiService.deletePromotion(promotionId);
      addToast({ type: 'success', title: 'Đã xóa', description: 'Khuyến mãi đã được xóa!' });
      // Reload danh sách
      const res: any = await apiService.getPromotions();
      const mapped = res.map((p: any) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        type: p.type,
        value: Number(p.value),
        minOrder: Number(p.min_order),
        maxDiscount: p.max_discount ? Number(p.max_discount) : undefined,
        startDate: p.start_date ? p.start_date.slice(0, 10) : '',
        endDate: p.end_date ? p.end_date.slice(0, 10) : '',
        usageLimit: Number(p.usage_limit),
        usageCount: Number(p.usage_count),
        status: p.status,
        description: p.description || '',
      }));
      setPromotions(mapped);
    } catch (error: any) {
      addToast({ type: 'error', title: 'Lỗi', description: error.message || 'Không thể xóa khuyến mãi' });
    }
  };

  const handleToggleStatus = async (promotionId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const promotion = promotions.find(p => p.id === promotionId);
    if (!promotion) return;

    // Kiểm tra ngày hợp lệ
    if (
      !promotion.startDate ||
      !promotion.endDate ||
      !isValidDateString(promotion.startDate) ||
      !isValidDateString(promotion.endDate)
    ) {
      addToast({
        type: 'error',
        title: 'Thiếu hoặc sai định dạng ngày',
        description: 'Khuyến mãi này chưa có ngày bắt đầu/kết thúc hợp lệ. Vui lòng cập nhật đầy đủ trước khi đổi trạng thái.',
        duration: 4000
      });
      return;
    }

    const updatePayload = {
      name: promotion.name,
      code: promotion.code,
      type: promotion.type,
      value: promotion.value,
      min_order: promotion.minOrder,
      max_discount: promotion.maxDiscount || null,
      start_date: formatDateForSQL(promotion.startDate),
      end_date: formatDateForSQL(promotion.endDate),
      usage_limit: promotion.usageLimit,
      description: promotion.description,
      status: newStatus
    };

    try {
      await apiService.updatePromotion(promotionId, updatePayload);
      addToast({
        type: 'success',
        title: 'Cập nhật trạng thái',
        description: `Khuyến mãi #${promotionId} đã được ${newStatus === 'active' ? 'kích hoạt' : 'tạm dừng'}`,
        duration: 3000
      });
      // Reload danh sách
      const res: any = await apiService.getPromotions();
      const mapped = res.map((p: any) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        type: p.type,
        value: Number(p.value),
        minOrder: Number(p.min_order),
        maxDiscount: p.max_discount ? Number(p.max_discount) : undefined,
        startDate: p.start_date ? p.start_date.slice(0, 10) : '',
        endDate: p.end_date ? p.end_date.slice(0, 10) : '',
        usageLimit: Number(p.usage_limit),
        usageCount: Number(p.usage_count),
        status: p.status,
        description: p.description || '',
      }));
      setPromotions(mapped);
    } catch (error: any) {
      addToast({ type: 'error', title: 'Lỗi', description: error.message || 'Không thể cập nhật trạng thái' });
    }
  };

  const activePromotions = promotions.filter(p => p.status === 'active').length;
  const totalUsage = promotions.reduce((sum, p) => sum + p.usageCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49bbbd] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách khuyến mãi...</p>
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
              Quản lý khuyến mãi
            </h1>
            <div className="ml-auto">
              <Button 
                className="bg-[#49bbbd] hover:bg-[#3a9a9c] text-white"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo khuyến mãi
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
                  <p className="text-sm font-medium text-gray-600">Tổng khuyến mãi</p>
                  <p className="text-2xl font-bold text-gray-900">{promotions.length}</p>
                </div>
                <Tag className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-green-600">{activePromotions}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lượt sử dụng</p>
                  <p className="text-2xl font-bold text-purple-600">{totalUsage}</p>
                </div>
                <Percent className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tiết kiệm khách hàng</p>
                  <p className="text-2xl font-bold text-orange-600">45.2M</p>
                </div>
                <Tag className="h-8 w-8 text-orange-600" />
              </div>
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
                  placeholder="Tìm theo tên hoặc mã khuyến mãi..."
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

        {/* Promotions List */}
        <div className="space-y-4">
          {filteredPromotions.map((promotion) => (
            <Card key={promotion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{promotion.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(promotion.status)}`}>
                        {getStatusText(promotion.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{promotion.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Mã: <strong>{promotion.code}</strong></span>
                      <span>•</span>
                      <span>{promotion.startDate} - {promotion.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      {getTypeIcon(promotion.type)}
                      <span className="ml-1">Loại khuyến mãi</span>
                    </h4>
                    <p className="text-sm text-gray-600">{getTypeText(promotion.type)}</p>
                    <p className="text-lg font-bold text-[#49bbbd]">{formatValue(promotion.type, promotion.value)}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Điều kiện</h4>
                    <p className="text-sm text-gray-600">Đơn tối thiểu: {formatPrice(promotion.minOrder)}</p>
                    {promotion.maxDiscount && (
                      <p className="text-sm text-gray-600">Giảm tối đa: {formatPrice(promotion.maxDiscount)}</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Sử dụng</h4>
                    <p className="text-sm text-gray-600">
                      {promotion.usageCount} / {promotion.usageLimit}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-[#49bbbd] h-2 rounded-full" 
                        style={{ width: `${(promotion.usageCount / promotion.usageLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Hiệu suất</h4>
                    <p className="text-sm text-gray-600">
                      Tỷ lệ sử dụng: {Math.round((promotion.usageCount / promotion.usageLimit) * 100)}%
                    </p>
                    <p className="text-sm text-green-600">Tiết kiệm: ~{formatPrice(promotion.usageCount * promotion.value * 1000)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    ID: #{promotion.id}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewPromotion(promotion)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Chi tiết
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditPromotion(promotion)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Sửa
                    </Button>
                    
                    {promotion.status !== 'expired' && (
                      <Button 
                        size="sm"
                        onClick={() => handleToggleStatus(promotion.id, promotion.status)}
                        className={promotion.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} 
                      >
                        {promotion.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeletePromotion(promotion.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPromotions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Không tìm thấy khuyến mãi nào</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Promotion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-['Poppins',Helvetica]">
                {editingPromotion ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi mới'}
              </h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khuyến mãi *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nhập tên khuyến mãi"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã khuyến mãi *
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    placeholder="VD: VALENTINE20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại khuyến mãi *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                    required
                  >
                    <option value="percentage">Giảm theo phần trăm (%)</option>
                    <option value="fixed_amount">Giảm số tiền cố định (VNĐ)</option>
                    <option value="free_shipping">Miễn phí vận chuyển</option>
                  </select>
                </div>
                
                {formData.type !== 'free_shipping' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá trị {formData.type === 'percentage' ? '(%)' : '(VNĐ)'} *
                    </label>
                    <Input
                      type="number"
                      value={formData.value}
                      onChange={(e) => handleInputChange('value', e.target.value)}
                      placeholder={formData.type === 'percentage' ? '20' : '100000'}
                      min="0"
                      max={formData.type === 'percentage' ? '100' : undefined}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đơn hàng tối thiểu (VNĐ)
                  </label>
                  <Input
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => handleInputChange('minOrder', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                {formData.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giảm tối đa (VNĐ)
                    </label>
                    <Input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => handleInputChange('maxDiscount', e.target.value)}
                      placeholder="200000"
                      min="0"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu *
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc *
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới hạn sử dụng
                  </label>
                  <Input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => handleInputChange('usageLimit', e.target.value)}
                    placeholder="1000"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm dừng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Mô tả chi tiết về khuyến mãi..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-[#49bbbd] hover:bg-[#3a9a9c] text-white"
                >
                  {editingPromotion ? 'Cập nhật' : 'Tạo khuyến mãi'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promotion Detail Modal */}
      {showDetailModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-['Poppins',Helvetica]">
                Chi tiết khuyến mãi
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDetailModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Thông tin cơ bản</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Tên:</strong> {selectedPromotion.name}</p>
                    <p><strong>Mã:</strong> {selectedPromotion.code}</p>
                    <p><strong>Loại:</strong> {getTypeText(selectedPromotion.type)}</p>
                    <p><strong>Giá trị:</strong> {formatValue(selectedPromotion.type, selectedPromotion.value)}</p>
                    <p><strong>Trạng thái:</strong> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPromotion.status)}`}>
                        {getStatusText(selectedPromotion.status)}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Điều kiện & Thống kê</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Đơn tối thiểu:</strong> {formatPrice(selectedPromotion.minOrder)}</p>
                    {selectedPromotion.maxDiscount && (
                      <p><strong>Giảm tối đa:</strong> {formatPrice(selectedPromotion.maxDiscount)}</p>
                    )}
                    <p><strong>Thời gian:</strong> {selectedPromotion.startDate} - {selectedPromotion.endDate}</p>
                    <p><strong>Sử dụng:</strong> {selectedPromotion.usageCount} / {selectedPromotion.usageLimit}</p>
                    <p><strong>Tỷ lệ:</strong> {Math.round((selectedPromotion.usageCount / selectedPromotion.usageLimit) * 100)}%</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Mô tả</h3>
                <p className="text-sm text-gray-600">{selectedPromotion.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Tiến độ sử dụng</h3>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-[#49bbbd] h-4 rounded-full flex items-center justify-center text-xs text-white font-medium" 
                    style={{ width: `${(selectedPromotion.usageCount / selectedPromotion.usageLimit) * 100}%` }}
                  >
                    {Math.round((selectedPromotion.usageCount / selectedPromotion.usageLimit) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};