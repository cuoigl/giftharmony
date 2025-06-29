import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Package,
  Search,
  Filter,
  Eye,
  RotateCcw,
  MessageCircle,
  X,
  MapPin,
  User,
  Phone,
  Mail,
  Truck,
  CheckCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { EmptyState } from "../../components/common";
import { useToast } from "../../components/ui/toast";
import { formatPrice, getStatusColor } from "../../utils/formatters";
import { apiService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

interface OrderHistoryProps {
  onBack: () => void;
  onViewOrderDetail: (orderId: string) => void;
}

interface OrderItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: "Đang xử lý" | "Đã xác nhận" | "Đang giao" | "Đã giao" | "Đã hủy";
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingFee: number;
  discount?: number;
  notes?: string;
  deliveryDate?: string;
}

export const OrderHistory = ({
  onBack,
  onViewOrderDetail,
}: OrderHistoryProps): JSX.Element => {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getOrders();
        setOrders(
          (Array.isArray(response) ? response : []).map((order: any) => {
            // Lấy thông tin khách hàng từ response nếu có, fallback từ user context
            let customer = { name: "", email: "", phone: "" };
            if (
              order.first_name ||
              order.last_name ||
              order.email ||
              order.phone
            ) {
              customer = {
                name: `${order.first_name || ""} ${
                  order.last_name || ""
                }`.trim(),
                email: order.email || "",
                phone: order.phone || "",
              };
            } else if (user) {
              customer = {
                name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
                email: user.email || "",
                phone: user.phone || "",
              };
            }
            return {
              id: String(order.id),
              date: order.created_at || order.date || "",
              items: (order.items || []).map((item: any) => ({
                id: item.product_id,
                name: item.product_name,
                image: "",
                quantity: item.quantity,
                price: item.price,
              })),
              total: order.total_amount,
              status: order.status || "Đang xử lý",
              shippingAddress: order.shipping_address,
              paymentMethod: order.payment_method || "COD",
              trackingNumber: order.tracking_number || "",
              customer,
              shippingFee: order.shipping_fee || 0,
              discount: order.discount || 0,
              notes: order.notes || "",
              deliveryDate: order.delivery_date || "",
            };
          })
        );
      } catch (error) {
        addToast({
          title: "Lỗi",
          description: "Không thể tải lịch sử đơn hàng",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    const matchesDate =
      dateFilter === "all" ||
      (() => {
        const orderDate = new Date(order.date);
        const now = new Date();
        const diffTime = now.getTime() - orderDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "7days":
            return diffDays <= 7;
          case "30days":
            return diffDays <= 30;
          case "90days":
            return diffDays <= 90;
          default:
            return true;
        }
      })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleReorder = (order: Order) => {
    addToast({
      type: "success",
      title: "Đã thêm vào giỏ hàng",
      description: `${order.items.length} sản phẩm từ đơn hàng #${order.id} đã được thêm vào giỏ hàng`,
      duration: 3000,
    });
  };

  const handleContactSupport = (orderId: string) => {
    addToast({
      type: "info",
      title: "Đang chuyển đến hỗ trợ",
      description: `Liên hệ hỗ trợ cho đơn hàng #${orderId}`,
      duration: 3000,
    });
  };

  const handleViewOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
    onViewOrderDetail(order.id);
  };

  const calculateSubtotal = (order: Order) => {
    return order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Đang xử lý":
        return <Package className="h-4 w-4" />;
      case "Đã xác nhận":
        return <CheckCircle className="h-4 w-4" />;
      case "Đang giao":
        return <Truck className="h-4 w-4" />;
      case "Đã giao":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "Đang xử lý", label: "Đang xử lý" },
    { value: "Đã xác nhận", label: "Đã xác nhận" },
    { value: "Đang giao", label: "Đang giao" },
    { value: "Đã giao", label: "Đã giao" },
    { value: "Đã hủy", label: "Đã hủy" },
  ];

  const dateOptions = [
    { value: "all", label: "Tất cả thời gian" },
    { value: "7days", label: "7 ngày qua" },
    { value: "30days", label: "30 ngày qua" },
    { value: "90days", label: "3 tháng qua" },
  ];

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
            <div className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900 font-['Poppins',Helvetica]">
                Lịch sử đơn hàng
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Tìm theo mã đơn hàng hoặc tên sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
              >
                {dateOptions.map((option) => (
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

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Đang tải đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={<Package className="h-24 w-24" />}
            title="Không tìm thấy đơn hàng"
            description="Không có đơn hàng nào phù hợp với tiêu chí tìm kiếm của bạn"
            actionLabel="Xóa bộ lọc"
            onAction={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setDateFilter("all");
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <CardTitle className="font-['Poppins',Helvetica]">
                        Đơn hàng #{order.id}
                      </CardTitle>
                      <span
                        className={`px-3 py-1 text-sm rounded-full flex items-center ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString("vi-VN")}
                      </p>
                      <p className="font-semibold text-[#49bbbd]">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Số lượng: {item.quantity} ×{" "}
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">
                        Địa chỉ giao hàng:
                      </p>
                      <p className="font-medium">{order.shippingAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Phương thức thanh toán:
                      </p>
                      <p className="font-medium">{order.paymentMethod}</p>
                    </div>
                    {order.trackingNumber && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Mã vận đơn:</p>
                        <p className="font-medium text-[#49bbbd]">
                          {order.trackingNumber}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrderDetail(order)}
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </Button>

                    {order.status === "Đã giao" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorder(order)}
                        className="flex items-center"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Mua lại
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContactSupport(order.id)}
                      className="flex items-center"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Hỗ trợ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {orders.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-['Poppins',Helvetica]">
                Thống kê đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#49bbbd]">
                    {orders.length}
                  </div>
                  <div className="text-sm text-gray-600">Tổng đơn hàng</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {orders.filter((o) => o.status === "Đã giao").length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Đã giao thành công
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      orders.filter((o) =>
                        ["Đang xử lý", "Đã xác nhận", "Đang giao"].includes(
                          o.status
                        )
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Đang xử lý</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#49bbbd]">
                    {formatPrice(
                      orders.reduce((sum, order) => sum + order.total, 0)
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Tổng giá trị</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-['Poppins',Helvetica]">
                Chi tiết đơn hàng #{selectedOrder.id}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetailModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Order Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Trạng thái đơn hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-4 py-2 rounded-full flex items-center ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-2 font-medium">
                          {selectedOrder.status}
                        </span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Ngày đặt hàng:</p>
                        <p className="font-medium">
                          {new Date(selectedOrder.date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                      {selectedOrder.deliveryDate && (
                        <div>
                          <p className="text-gray-600">Ngày giao hàng:</p>
                          <p className="font-medium">
                            {selectedOrder.deliveryDate}
                          </p>
                        </div>
                      )}
                      {selectedOrder.trackingNumber && (
                        <div>
                          <p className="text-gray-600">Mã vận đơn:</p>
                          <p className="font-medium text-[#49bbbd]">
                            {selectedOrder.trackingNumber}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600">Phương thức thanh toán:</p>
                        <p className="font-medium">
                          {selectedOrder.paymentMethod}
                        </p>
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
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{selectedOrder.customer.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{selectedOrder.customer.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{selectedOrder.customer.phone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Địa chỉ giao hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      {selectedOrder.shippingAddress}
                    </p>
                    {selectedOrder.notes && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Ghi chú:</strong> {selectedOrder.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sản phẩm đặt hàng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Số lượng: {item.quantity}
                            </p>
                            <p className="text-sm text-gray-600">
                              Đơn giá: {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#49bbbd]">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tạm tính:</span>
                        <span>
                          {formatPrice(calculateSubtotal(selectedOrder))}
                        </span>
                      </div>

                      {selectedOrder.discount && (
                        <div className="flex justify-between text-green-600">
                          <span>Giảm giá:</span>
                          <span>-{formatPrice(selectedOrder.discount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span>{formatPrice(selectedOrder.shippingFee)}</span>
                      </div>

                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Tổng cộng:</span>
                          <span className="text-[#49bbbd]">
                            {formatPrice(selectedOrder.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thao tác</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedOrder.status === "Đã giao" && (
                      <Button
                        className="w-full bg-[#49bbbd] hover:bg-[#3a9a9c] text-white"
                        onClick={() => {
                          handleReorder(selectedOrder);
                          setShowDetailModal(false);
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Mua lại
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleContactSupport(selectedOrder.id);
                        setShowDetailModal(false);
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Liên hệ hỗ trợ
                    </Button>

                    <Button variant="outline" className="w-full">
                      In hóa đơn
                    </Button>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lịch sử đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-[#49bbbd] rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">
                            Đơn hàng được tạo
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedOrder.date).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </div>

                      {selectedOrder.status !== "Đang xử lý" && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#49bbbd] rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">
                              Đơn hàng được xác nhận
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(selectedOrder.date).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {(selectedOrder.status === "Đang giao" ||
                        selectedOrder.status === "Đã giao") && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#49bbbd] rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">
                              Đang giao hàng
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(selectedOrder.date).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedOrder.status === "Đã giao" && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">Đã giao hàng</p>
                            <p className="text-xs text-gray-500">
                              {selectedOrder.deliveryDate}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
