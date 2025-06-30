import React from "react";
import {
  CheckCircle,
  Package,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useLocation } from "react-router-dom";

interface OrderSuccessProps {
  onBackToDashboard: () => void;
  onViewOrders: () => void;
}

export const OrderSuccess = ({
  onBackToDashboard,
  onViewOrders,
}: OrderSuccessProps): JSX.Element => {
  const location = useLocation();
  const order = location.state?.order;

  // Fallback nếu không có order (truy cập trực tiếp)
  const orderInfo = order
    ? {
        id: order.id || order.order_code || `GH${Date.now().toString().slice(-6)}`,
        date: order.created_at
          ? new Date(order.created_at).toLocaleDateString("vi-VN")
          : new Date().toLocaleDateString("vi-VN"),
        estimatedDelivery: order.estimated_delivery
          ? new Date(order.estimated_delivery).toLocaleDateString("vi-VN")
          : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN"),
        total:
          typeof order.total_amount === "number"
            ? order.total_amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
            : order.total_amount || "-",
        shipping_fee:
          typeof order.shipping_fee === "number"
            ? order.shipping_fee.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
            : order.shipping_fee || "0đ",
        discount:
          typeof order.discount === "number"
            ? order.discount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
            : order.discount || "0đ",
        promo_code: order.promo_code || "",
        final_total:
          typeof order.final_total === "number"
            ? order.final_total.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
            : order.final_total || order.total || "-",
        items: order.items?.length || order.items_count || 1,
        status: order.status || "Đang xử lý",
      }
    : {
        id: `GH${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString("vi-VN"),
        estimatedDelivery: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("vi-VN"),
        total: "3.748.000đ",
        shipping_fee: "0đ",
        discount: "0đ",
        promo_code: "",
        final_total: "3.748.000đ",
        items: 3,
        status: "Đang xử lý",
      };

  return (
    <div className="min-h-screen bg-[#fffefc] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Success Icon */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-['Poppins',Helvetica]">
            Đặt hàng thành công!
          </h1>
          <p className="text-lg text-gray-600">
            Cảm ơn bạn đã tin tưởng GiftHarmony. Đơn hàng của bạn đã được tiếp
            nhận.
          </p>
        </div>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins',Helvetica] flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Thông tin đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mã đơn hàng</p>
                <p className="font-semibold text-lg text-[#49bbbd]">
                  {orderInfo.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày đặt</p>
                <p className="font-medium">{orderInfo.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng tiền sản phẩm</p>
                <p className="font-semibold text-lg">{orderInfo.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phí vận chuyển</p>
                <p className="font-medium">{orderInfo.shipping_fee}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Giảm giá</p>
                <p className="font-medium">-{orderInfo.discount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mã khuyến mãi</p>
                <p className="font-medium">{orderInfo.promo_code || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số sản phẩm</p>
                <p className="font-medium">{orderInfo.items} sản phẩm</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng thanh toán</p>
                <p className="font-bold text-lg text-[#49bbbd]">{orderInfo.final_total}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Dự kiến giao hàng</p>
                    <p className="font-medium">{orderInfo.estimatedDelivery}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                    {orderInfo.status}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins',Helvetica]">
              Bước tiếp theo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#49bbbd] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Xác nhận đơn hàng</p>
                  <p className="text-sm text-gray-600">
                    Chúng tôi sẽ gọi điện xác nhận trong 30 phút
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Chuẩn bị hàng</p>
                  <p className="text-sm text-gray-600">
                    Đóng gói cẩn thận và kiểm tra chất lượng
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Giao hàng</p>
                  <p className="text-sm text-gray-600">
                    Shipper sẽ liên hệ trước khi giao
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins',Helvetica]">
              Cần hỗ trợ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <Phone className="h-8 w-8 text-[#49bbbd] mb-2" />
                <p className="font-medium">Hotline</p>
                <p className="text-sm text-gray-600">1900 1234</p>
              </div>
              <div className="flex flex-col items-center">
                <Mail className="h-8 w-8 text-[#49bbbd] mb-2" />
                <p className="font-medium">Email</p>
                <p className="text-sm text-gray-600">support@giftharmony.vn</p>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="h-8 w-8 text-[#49bbbd] mb-2" />
                <p className="font-medium">Địa chỉ</p>
                <p className="text-sm text-gray-600">TP. Hồ Chí Minh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onViewOrders}
            className="flex-1 bg-[#49bbbd] hover:bg-[#3a9a9c] text-white h-12"
          >
            Theo dõi đơn hàng
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={onBackToDashboard}
            variant="outline"
            className="flex-1 h-12"
          >
            Tiếp tục mua sắm
          </Button>
        </div>

        {/* Thank You Message */}
        <div className="text-center p-6 bg-gradient-to-r from-[#49bbbd]/10 to-[#ccb3ac]/10 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cảm ơn bạn đã chọn GiftHarmony! 💝
          </h3>
          <p className="text-gray-600">
            Chúng tôi cam kết mang đến cho bạn trải nghiệm mua sắm tuyệt vời
            nhất.
          </p>
        </div>
      </div>
    </div>
  );
};
