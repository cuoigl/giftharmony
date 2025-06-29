import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Edit,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  X,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
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

interface OrderManagementProps {
  onBack: () => void;
}

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  shippingAddress: string;
  orderDate: string;
  deliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
  discount?: number;
  shippingFee: number;
}

export const OrderManagement = ({
  onBack,
}: OrderManagementProps): JSX.Element => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getAllOrders();
        // Map API data về đúng shape Order
        const mapped = ((data as any).orders || (data as any)).map(
          (o: any) => ({
            id: String(o.id || o.order_id || o.code || ""),
            customer: {
              name:
                o.customer_name ||
                o.customer?.name ||
                `${o.first_name || ""} ${o.last_name || ""}`.trim(),
              email: o.customer_email || o.customer?.email || o.email,
              phone: o.customer_phone || o.customer?.phone || o.phone,
            },
            items: o.items || o.products || [],
            total:
              typeof o.total_amount !== "undefined" &&
              !isNaN(Number(o.total_amount))
                ? Number(o.total_amount)
                : 0,
            status: o.status,
            paymentMethod: o.payment_method || o.paymentMethod || "---",
            paymentStatus: o.payment_status || o.paymentStatus || "pending",
            shippingAddress: o.shipping_address || o.shippingAddress,
            orderDate: o.order_date || o.orderDate || o.created_at,
            deliveryDate: o.delivery_date || o.deliveryDate,
            trackingNumber: o.tracking_number || o.trackingNumber,
            notes: o.notes,
            discount: o.discount,
            shippingFee: o.shipping_fee || o.shippingFee || 0,
          })
        );
        setOrders(mapped);
      } catch (err: any) {
        setError("Không thể tải danh sách đơn hàng");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "shipping", label: "Đang giao" },
    { value: "delivered", label: "Đã giao" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  const filteredOrders = orders.filter((order) => {
    const idStr = String(order.id || "");
    const nameStr = String(order.customer?.name || "");
    const matchesSearch =
      idStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nameStr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
      case "processing": // backend trả về
        return "bg-blue-100 text-blue-800";
      case "shipping":
      case "shipped": // backend trả về
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "confirmed":
      case "processing":
        return "Đã xác nhận";
      case "shipping":
      case "shipped":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán";
      case "pending":
        return "Chờ thanh toán";
      case "failed":
        return "Thanh toán thất bại";
      default:
        return "Không xác định";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Package className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "shipping":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  // Map status UI -> status API đúng với backend
  const mapStatusToApi = (status: string) => {
    switch (status) {
      case "pending":
        return "pending";
      case "confirmed":
        return "processing"; // confirmed UI -> processing API
      case "shipping":
        return "shipped";
      case "delivered":
        return "delivered";
      case "cancelled":
        return "cancelled";
      default:
        return status;
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiService.updateOrderStatus(
        Number(orderId),
        mapStatusToApi(newStatus)
      );
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus as any,
                deliveryDate:
                  newStatus === "delivered"
                    ? new Date().toLocaleDateString("vi-VN")
                    : order.deliveryDate,
                trackingNumber:
                  newStatus === "shipping" && !order.trackingNumber
                    ? `VN${Date.now().toString().slice(-9)}`
                    : order.trackingNumber,
              }
            : order
        )
      );
      addToast({
        type: "success",
        title: "Cập nhật trạng thái",
        description: `Đơn hàng ${orderId} đã được cập nhật trạng thái`,
        duration: 3000,
      });
    } catch (err: any) {
      console.error("[OrderManagement] updateOrderStatus error:", err);
      addToast({
        type: "error",
        title: "Lỗi",
        description: err.message || "Cập nhật trạng thái thất bại",
        duration: 3000,
      });
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const calculateSubtotal = (order: Order) => {
    return order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  // Format ISO date string to 'dd/MM/yyyy HH:mm' for UI
  const formatDateTime = (iso: string | undefined) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(
      d.getMonth() + 1
    )}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

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
              Quản lý đơn hàng
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Đang tải đơn hàng...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {statusOptions.slice(1).map((status) => {
                const count = orders.filter(
                  (order) => order.status === status.value
                ).length;
                return (
                  <Card key={status.value}>
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        {getStatusIcon(status.value)}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {count}
                      </p>
                      <p className="text-sm text-gray-600">{status.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng..."
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
                    {statusOptions.map((option) => (
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
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Đơn hàng #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(order.orderDate)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 text-sm rounded-full flex items-center ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1">
                            {getStatusText(order.status)}
                          </span>
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {getPaymentStatusText(order.paymentStatus)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Thông tin khách hàng
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.customer.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.customer.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.customer.phone}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Sản phẩm
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.items && order.items.length > 0
                            ? order.items
                                .map((item) => {
                                  const name =
                                    item?.name ||
                                    (item as any)?.product_name ||
                                    "Sản phẩm chưa đặt tên";
                                  return `${name} x${item?.quantity || 0}`;
                                })
                                .join(", ")
                            : "Không có sản phẩm"}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Thanh toán & Giao hàng
                        </h4>
                        <p className="text-sm text-gray-600">
                          Phương thức: {order.paymentMethod || "---"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Tổng tiền:{" "}
                          {formatPrice(
                            typeof order.total === "number" &&
                              !isNaN(order.total)
                              ? order.total
                              : 0
                          )}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-sm text-gray-600">
                            Mã vận đơn: {order.trackingNumber}
                          </p>
                        )}
                        {order.deliveryDate && (
                          <p className="text-sm text-gray-600">
                            Đã giao: {formatDateTime(order.deliveryDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 max-w-md truncate">
                        Địa chỉ: {order.shippingAddress}
                      </p>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem chi tiết
                        </Button>

                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(order.id, "confirmed")
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Xác nhận
                          </Button>
                        )}

                        {order.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(order.id, "shipping")
                            }
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Giao hàng
                          </Button>
                        )}

                        {/* Nút Hoàn thành cho shipping/shipped */}
                        {["shipping", "shipped"].includes(order.status) && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(order.id, "delivered")
                            }
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Hoàn thành
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
                </CardContent>
              </Card>
            )}
          </>
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
                          {getStatusText(selectedOrder.status)}
                        </span>
                      </span>
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${getPaymentStatusColor(
                          selectedOrder.paymentStatus
                        )}`}
                      >
                        {getPaymentStatusText(selectedOrder.paymentStatus)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Ngày đặt hàng:</p>
                        <p className="font-medium">
                          {formatDateTime(selectedOrder.orderDate)}
                        </p>
                      </div>
                      {selectedOrder.deliveryDate && (
                        <div>
                          <p className="text-gray-600">Ngày giao hàng:</p>
                          <p className="font-medium">
                            {formatDateTime(selectedOrder.deliveryDate)}
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
                      {selectedOrder.items.map((item, index) => (
                        <div
                          key={`${item.id}-${index}`}
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
                    {/* Hiển thị nút Bắt đầu giao hàng nếu status là 'pending', 'confirmed', 'processing' */}
                    {["pending", "confirmed", "processing"].includes(
                      selectedOrder.status
                    ) && (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                          handleUpdateStatus(selectedOrder.id, "shipping");
                          setShowDetailModal(false);
                        }}
                      >
                        Bắt đầu giao hàng
                      </Button>
                    )}
                    {/* Hiển thị nút Hoàn thành đơn hàng nếu status là 'shipping', 'shipped' */}
                    {["shipping", "shipped"].includes(selectedOrder.status) && (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          handleUpdateStatus(selectedOrder.id, "delivered");
                          setShowDetailModal(false);
                        }}
                      >
                        Hoàn thành đơn hàng
                      </Button>
                    )}
                    <Button variant="outline" className="w-full">
                      In hóa đơn
                    </Button>
                    <Button variant="outline" className="w-full">
                      Gửi email khách hàng
                    </Button>
                    {selectedOrder.status !== "delivered" &&
                      selectedOrder.status !== "cancelled" && (
                        <Button
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700"
                          onClick={() => {
                            handleUpdateStatus(selectedOrder.id, "cancelled");
                            setShowDetailModal(false);
                          }}
                        >
                          Hủy đơn hàng
                        </Button>
                      )}
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
                            {formatDateTime(selectedOrder.orderDate)}
                          </p>
                        </div>
                      </div>

                      {selectedOrder.status !== "pending" && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#49bbbd] rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">
                              Đơn hàng được xác nhận
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(selectedOrder.orderDate)}
                            </p>
                          </div>
                        </div>
                      )}

                      {(selectedOrder.status === "shipping" ||
                        selectedOrder.status === "delivered") && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#49bbbd] rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">
                              Đang giao hàng
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(selectedOrder.orderDate)}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedOrder.status === "delivered" && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">Đã giao hàng</p>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(selectedOrder.deliveryDate)}
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
