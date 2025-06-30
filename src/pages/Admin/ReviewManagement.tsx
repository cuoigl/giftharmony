import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Eye, Trash2, Star, ThumbsUp, Flag, MessageCircle, X, User, Calendar, Package } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/toast';
import { apiService } from '../../services/api';

interface ReviewManagementProps {
  onBack: () => void;
}

interface Review {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  helpful: number;
  reported: boolean;
  verified: boolean;
  response?: string;
}

export const ReviewManagement = ({ onBack }: ReviewManagementProps): JSX.Element => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);

  // Fetch reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await apiService.getAllReviews() as any[];
        // Map API data to Review[]
        const mapped = data.map((r: any) => ({
          id: r.id,
          productId: r.product_id,
          productName: r.product_name,
          productImage: r.product_image || '',
          customerName: r.first_name + ' ' + r.last_name,
          customerAvatar: r.customer_avatar || '',
          rating: r.rating,
          title: r.title || '',
          comment: r.comment,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : '',
          status: r.status || 'pending',
          helpful: r.helpful || 0,
          reported: r.reported || false,
          verified: r.verified || false,
          response: r.response || '',
        }));
        setReviews(mapped);
      } catch (err: any) {
        addToast({ type: 'error', title: 'Lỗi', description: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [addToast]);

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'rejected', label: 'Đã từ chối' }
  ];

  const ratingOptions = [
    { value: 'all', label: 'Tất cả đánh giá' },
    { value: '5', label: '5 sao' },
    { value: '4', label: '4 sao' },
    { value: '3', label: '3 sao' },
    { value: '2', label: '2 sao' },
    { value: '1', label: '1 sao' }
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || review.status === selectedStatus;
    const matchesRating = selectedRating === 'all' || review.rating.toString() === selectedRating;
    return matchesSearch && matchesStatus && matchesRating;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return 'Không xác định';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const reloadReviews = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllReviews() as any[];
      const mapped = data.map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        productName: r.product_name,
        productImage: r.product_image || '',
        customerName: r.first_name + ' ' + r.last_name,
        customerAvatar: r.customer_avatar || '',
        rating: r.rating,
        title: r.title || '',
        comment: r.comment,
        date: r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : '',
        status: r.status || 'pending',
        helpful: r.helpful || 0,
        reported: r.reported || false,
        verified: r.verified || false,
        response: r.response || '',
      }));
      setReviews(mapped);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Lỗi', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async (reviewId: number) => {
    try {
      await apiService.approveReview(reviewId);
      addToast({ type: 'success', title: 'Đã duyệt đánh giá', description: `Đánh giá #${reviewId} đã được duyệt` });
      reloadReviews();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Lỗi', description: err.message });
    }
  };

  const handleRejectReview = async (reviewId: number) => {
    try {
      await apiService.rejectReview(reviewId);
      addToast({ type: 'info', title: 'Đã từ chối đánh giá', description: `Đánh giá #${reviewId} đã bị từ chối` });
      reloadReviews();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Lỗi', description: err.message });
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await apiService.deleteReview(reviewId);
      addToast({ type: 'success', title: 'Đã xóa đánh giá', description: `Đánh giá #${reviewId} đã được xóa` });
      reloadReviews();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Lỗi', description: err.message });
    }
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const handleReplyReview = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.response || '');
    setShowReplyModal(true);
  };

  const handleSaveReply = async () => {
    if (selectedReview && replyText.trim()) {
      try {
        await apiService.updateReviewReply(selectedReview.id, replyText.trim());
        addToast({ type: 'success', title: 'Đã lưu phản hồi', description: 'Phản hồi của bạn đã được lưu thành công' });
        setShowReplyModal(false);
        setReplyText('');
        setSelectedReview(null);
        reloadReviews();
      } catch (err: any) {
        addToast({ type: 'error', title: 'Lỗi', description: err.message });
      }
    }
  };

  const handleToggleReport = (reviewId: number) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, reported: !review.reported }
        : review
    ));
    addToast({
      type: 'info',
      title: 'Đã cập nhật trạng thái báo cáo',
      duration: 3000
    });
  };

  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const reportedCount = reviews.filter(r => r.reported).length;

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
              Quản lý đánh giá
            </h1>
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
                  <p className="text-sm font-medium text-gray-600">Tổng đánh giá</p>
                  <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <Eye className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
                  <p className="text-2xl font-bold text-green-600">{averageRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Báo cáo</p>
                  <p className="text-2xl font-bold text-red-600">{reportedCount}</p>
                </div>
                <Flag className="h-8 w-8 text-red-600" />
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
                  placeholder="Tìm theo sản phẩm, khách hàng..."
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

              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
              >
                {ratingOptions.map(option => (
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

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Product Info */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={review.productImage}
                      alt={review.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{review.productName}</h3>
                        <p className="text-sm text-gray-500">ID: #{review.id}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {review.reported && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                            <Flag className="h-3 w-3 mr-1" />
                            Báo cáo
                          </span>
                        )}
                        {review.verified && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Đã xác minh
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(review.status)}`}>
                          {getStatusText(review.status)}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Rating */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                        <img
                          src={review.customerAvatar}
                          alt={review.customerName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{review.customerName}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="mb-4">
                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                      )}
                      <p className="text-gray-700">{review.comment}</p>
                      
                      {/* Admin Response */}
                      {review.response && (
                        <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                          <p className="text-sm font-medium text-blue-800 mb-1">Phản hồi từ shop:</p>
                          <p className="text-sm text-blue-700">{review.response}</p>
                        </div>
                      )}
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{review.helpful} hữu ích</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewReview(review)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReplyReview(review)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {review.response ? 'Sửa phản hồi' : 'Trả lời'}
                        </Button>

                        {review.status === 'pending' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => handleApproveReview(review.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Duyệt
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleRejectReview(review.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Từ chối
                            </Button>
                          </>
                        )}

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Không tìm thấy đánh giá nào</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-['Poppins',Helvetica]">
                Chi tiết đánh giá #{selectedReview.id}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDetailModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Product Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Thông tin sản phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={selectedReview.productImage}
                        alt={selectedReview.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedReview.productName}</h3>
                      <p className="text-sm text-gray-500">ID sản phẩm: {selectedReview.productId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Thông tin khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={selectedReview.customerAvatar}
                        alt={selectedReview.customerName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedReview.customerName}</h3>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{selectedReview.date}</span>
                      </div>
                      {selectedReview.verified && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                          Đã xác minh mua hàng
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Review Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nội dung đánh giá</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">Đánh giá:</span>
                      <div className="flex items-center">
                        {renderStars(selectedReview.rating)}
                      </div>
                      <span className="text-sm text-gray-600">({selectedReview.rating}/5)</span>
                    </div>
                    
                    {selectedReview.title && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Tiêu đề:</span>
                        <p className="font-medium text-gray-900">{selectedReview.title}</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">Nội dung:</span>
                      <p className="text-gray-700 mt-1">{selectedReview.comment}</p>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span>{selectedReview.helpful} người thấy hữu ích</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedReview.status)}`}>
                        {getStatusText(selectedReview.status)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Response */}
              {selectedReview.response && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Phản hồi từ shop</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedReview.response}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                {selectedReview.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => {
                        handleApproveReview(selectedReview.id);
                        setShowDetailModal(false);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Duyệt đánh giá
                    </Button>
                    <Button 
                      onClick={() => {
                        handleRejectReview(selectedReview.id);
                        setShowDetailModal(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Từ chối
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleReplyReview(selectedReview);
                  }}
                >
                  {selectedReview.response ? 'Sửa phản hồi' : 'Trả lời đánh giá'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-['Poppins',Helvetica]">
                {selectedReview.response ? 'Sửa phản hồi' : 'Trả lời đánh giá'}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowReplyModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">Đánh giá từ {selectedReview.customerName}:</p>
                <p className="text-sm text-gray-700">"{selectedReview.comment}"</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phản hồi của bạn:
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập phản hồi của bạn..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                />
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={handleSaveReply}
                  disabled={!replyText.trim()}
                  className="bg-[#49bbbd] hover:bg-[#3a9a9c] text-white"
                >
                  Lưu phản hồi
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReplyModal(false)}
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