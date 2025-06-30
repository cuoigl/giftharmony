import React, { useState, useEffect } from 'react';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Gift, Truck, CreditCard, Tag, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../components/ui/toast';
import { apiService } from '../../services/api';

interface CartProps {
  onBack: () => void;
  onCheckout: (checkoutData: {
    appliedPromo: PromoCode | null;
    selectedShipping: string;
    discount: number;
    shippingCost: number;
  }) => void;
}

interface PromoCode {
  code: string;
  discount: number;
  minOrder: number;
  freeShipping?: boolean;
  description: string;
  type: string;
}

export const Cart = ({ onBack, onCheckout }: CartProps): JSX.Element => {
  const { items, updateQuantity, removeFromCart } = useCart();
  const { addToast } = useToast();
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const shippingOptions = [
    { id: 'standard', name: 'Giao hàng tiêu chuẩn', time: '2-3 ngày', price: 30000 },
    { id: 'express', name: 'Giao hàng nhanh', time: 'Trong ngày', price: 50000 },
    { id: 'premium', name: 'Giao hàng cao cấp', time: '2-4 giờ', price: 100000 }
  ];

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: number, itemName: string) => {
    removeFromCart(id);
    addToast({
      type: 'success',
      title: 'Đã xóa khỏi giỏ hàng',
      description: `${itemName} đã được xóa khỏi giỏ hàng`,
      duration: 3000
    });
  };

  const applyPromoCode = (selectedPromo?: PromoCode) => {
    const promo = selectedPromo || promoCodes.find((p: PromoCode) => p.code === promoCode.toUpperCase());
    
    if (promo && subtotal >= promo.minOrder) {
      setAppliedPromo(promo);
      setPromoCode('');
      setShowPromoModal(false);
      addToast({
        type: 'success',
        title: 'Áp dụng mã thành công',
        description: `Mã ${promo.code} đã được áp dụng`,
        duration: 3000
      });
    } else if (promo) {
      addToast({
        type: 'error',
        title: 'Không đủ điều kiện',
        description: `Đơn hàng tối thiểu ${formatPrice(promo.minOrder)} để sử dụng mã này`,
        duration: 3000
      });
    } else {
      addToast({
        type: 'error',
        title: 'Mã không hợp lệ',
        description: 'Mã giảm giá không tồn tại hoặc đã hết hạn',
        duration: 3000
      });
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    addToast({
      type: 'info',
      title: 'Đã hủy mã giảm giá',
      duration: 3000
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.discount > 100) {
      // Fixed amount discount
      discount = appliedPromo.discount;
    } else {
      // Percentage discount
      discount = Math.floor(subtotal * appliedPromo.discount / 100);
    }
  }
  
  const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping);
  const shippingCost = appliedPromo?.freeShipping ? 0 : (selectedShippingOption?.price || 0);
  const total = subtotal - discount + shippingCost;

  const inStockItems = items.filter(item => item.inStock);
  const outOfStockItems = items.filter(item => !item.inStock);

  const availablePromoCodes = promoCodes.filter((promo: PromoCode) => subtotal >= promo.minOrder);

  useEffect(() => {
    const fetchPromos = async () => {
      setPromoLoading(true);
      setPromoError(null);
      try {
        const promos = await apiService.getPromotions() as any[];
        // Map API data về đúng định dạng PromoCode
        const mapped = promos.map((p: any) => ({
          code: p.code,
          discount: Number(p.value || 0),
          minOrder: Number(p.min_order || 0),
          freeShipping: p.type === 'free_shipping' || !!p.free_shipping,
          description: p.description || '',
          type: p.type === 'fixed_amount' ? 'fixed' : p.type === 'percentage' ? 'percent' : p.type,
        }));
        setPromoCodes(mapped);
      } catch (err: any) {
        setPromoError('Không thể tải mã khuyến mãi');
      } finally {
        setPromoLoading(false);
      }
    };
    fetchPromos();
  }, []);

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
              Giỏ hàng ({items.length})
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          // Empty Cart
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 font-['Poppins',Helvetica]">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-8">
              Hãy thêm một số sản phẩm vào giỏ hàng để tiếp tục mua sắm
            </p>
            <Button 
              onClick={onBack}
              className="bg-[#49bbbd] hover:bg-[#3a9a9c] text-white"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* In Stock Items */}
              {inStockItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-['Poppins',Helvetica] flex items-center">
                      <Gift className="h-5 w-5 mr-2 text-green-600" />
                      Sản phẩm có sẵn ({inStockItems.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {inStockItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-[#49bbbd]">
                              {formatPrice(item.price)}
                            </span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(item.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateQuantity(Number(item.id), item.quantity - 1)}
                              className="h-8 w-8"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-3 py-1 min-w-[40px] text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateQuantity(Number(item.id), item.quantity + 1)}
                              disabled={item.quantity >= item.maxQuantity}
                              className="h-8 w-8"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(Number(item.id), item.name)}
                            className="text-red-500 hover:text-red-700 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Out of Stock Items */}
              {outOfStockItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-['Poppins',Helvetica] flex items-center text-red-600">
                      <Gift className="h-5 w-5 mr-2" />
                      Sản phẩm hết hàng ({outOfStockItems.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {outOfStockItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border border-red-200 rounded-lg bg-red-50 opacity-60">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          <p className="text-sm text-red-600 font-medium">Hết hàng</p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(Number(item.id), item.name)}
                          className="text-red-500 hover:text-red-700 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Shipping Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-['Poppins',Helvetica] flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Phương thức giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {shippingOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedShipping === option.id
                          ? 'border-[#49bbbd] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={selectedShipping === option.id}
                          onChange={(e) => setSelectedShipping(e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{option.name}</p>
                          <p className="text-sm text-gray-500">{option.time}</p>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">
                        {appliedPromo?.freeShipping ? 'Miễn phí' : formatPrice(option.price)}
                      </span>
                    </label>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-['Poppins',Helvetica] flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Mã giảm giá
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">{appliedPromo.code}</p>
                        <p className="text-sm text-green-600">
                          {appliedPromo.freeShipping ? 'Miễn phí vận chuyển'
                           : (appliedPromo.type === 'fixed' || appliedPromo.type === 'amount') ? `Giảm ${formatPrice(appliedPromo.discount)}`
                           : `Giảm ${appliedPromo.discount}%`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removePromoCode}
                        className="text-red-500 hover:text-red-700"
                      >
                        Xóa
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập mã giảm giá"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => applyPromoCode()}
                          variant="outline"
                          disabled={!promoCode.trim()}
                        >
                          Áp dụng
                        </Button>
                      </div>
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowPromoModal(true)}
                      >
                        Xem mã khuyến mãi có sẵn
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-['Poppins',Helvetica] flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Tóm tắt đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá ({appliedPromo?.code}):</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="font-medium">
                        {shippingCost === 0 ? 'Miễn phí' : formatPrice(shippingCost)}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng:</span>
                        <span className="text-[#49bbbd]">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => onCheckout({
                        appliedPromo,
                        selectedShipping,
                        discount,
                        shippingCost,
                      })}
                      disabled={inStockItems.length === 0}
                      className="w-full bg-[#49bbbd] hover:bg-[#3a9a9c] text-white h-12"
                    >
                      Tiến hành thanh toán
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={onBack}
                      className="w-full"
                    >
                      Tiếp tục mua sắm
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    <p>Bằng việc đặt hàng, bạn đồng ý với</p>
                    <p>
                      <button className="underline hover:text-gray-700">Điều khoản dịch vụ</button>
                      {' và '}
                      <button className="underline hover:text-gray-700">Chính sách bảo mật</button>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <Truck className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-xs text-gray-600">Giao hàng an toàn</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-600">Thanh toán bảo mật</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Promo Codes Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-['Poppins',Helvetica]">
                Mã khuyến mãi có sẵn
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowPromoModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              {promoLoading ? (
                <div className="text-center py-8 text-gray-400">Đang tải mã khuyến mãi...</div>
              ) : promoError ? (
                <div className="text-center py-8 text-red-500">{promoError}</div>
              ) : promoCodes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Hiện không có mã khuyến mãi nào</div>
              ) : (
                promoCodes.map((promo: PromoCode) => {
                  const isEligible = subtotal >= promo.minOrder;
                  const isApplied = appliedPromo?.code === promo.code;
                  return (
                    <div 
                      key={promo.code} 
                      className={`p-4 border rounded-lg ${
                        isEligible ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                      } ${isApplied ? 'ring-2 ring-[#49bbbd]' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#49bbbd] text-lg">{promo.code}</span>
                          {isApplied && (
                            <span className="px-2 py-1 bg-[#49bbbd] text-white text-xs rounded-full">
                              Đã áp dụng
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          {promo.freeShipping ? (
                            <span className="text-green-600 font-medium">Miễn phí ship</span>
                          ) : (promo.type === 'fixed' || promo.type === 'amount') ? (
                            <span className="text-green-600 font-medium">Giảm {formatPrice(promo.discount)}</span>
                          ) : (
                            <span className="text-green-600 font-medium">Giảm {promo.discount}%</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{promo.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Đơn tối thiểu: {formatPrice(promo.minOrder)}
                        </span>
                        {isEligible ? (
                          <Button
                            size="sm"
                            onClick={() => applyPromoCode(promo)}
                            disabled={isApplied}
                            className="bg-[#49bbbd] hover:bg-[#3a9a9c] text-white"
                          >
                            {isApplied ? 'Đã áp dụng' : 'Áp dụng'}
                          </Button>
                        ) : (
                          <span className="text-xs text-red-500">
                            Cần thêm {formatPrice(promo.minOrder - subtotal)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* Nếu có mã nhưng không đủ điều kiện, hiển thị thông báo động viên */}
            {promoCodes.length > 0 && availablePromoCodes.length === 0 && !promoLoading && !promoError && (
              <div className="text-center py-8">
                <p className="text-gray-500">Không có mã khuyến mãi nào phù hợp với đơn hàng hiện tại</p>
                <p className="text-sm text-gray-400 mt-2">
                  Thêm sản phẩm để đủ điều kiện sử dụng mã giảm giá
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};