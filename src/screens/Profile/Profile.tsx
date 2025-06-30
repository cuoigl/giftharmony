import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Package,
  Heart,
  Settings,
  Edit3,
  Camera,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/ui/toast";
import { apiService } from "../../services/api";
import { User, UserProfile } from "../../types";
import { useVietnamAddress } from "../../hooks/useVietnamAddress";

interface ProfileProps {
  onBack: () => void;
  onViewSettings?: () => void;
  onViewOrderHistory?: () => void;
  onViewWishlist?: () => void;
}

export const Profile = ({
  onBack,
  onViewSettings,
  onViewOrderHistory,
  onViewWishlist,
}: ProfileProps): JSX.Element => {
  const { user, updateProfile, loadCurrentUser, isLoading } = useAuth();
  const { addToast } = useToast();
  const {
    provinces,
    districts,
    wards,
    selectedProvince,
    setSelectedProvince,
    selectedDistrict,
    setSelectedDistrict,
    selectedWard,
    setSelectedWard,
  } = useVietnamAddress();

  const [isEditing, setIsEditing] = useState(false);
  // Khởi tạo profile rỗng, chỉ set khi user context thay đổi
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    birthDate: "",
    gender: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [memberSince, setMemberSince] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const response = await apiService.getOrders();
        // Đảm bảo response là mảng đơn hàng đúng format backend trả về
        const ordersArray = Array.isArray(response)
          ? response
          : (response && typeof response === 'object' && Array.isArray((response as any).orders))
          ? (response as any).orders
          : [];
        const statusMap: Record<string, string> = {
          pending: "Đang xử lý",
          shipped: "Đang giao",
          delivered: "Đã giao",
          cancelled: "Đã hủy",
        };
        const mapped = ordersArray.map((order: any) => ({
          id: String(order.id),
          date: order.created_at || order.date || "",
          total: order.total_amount || order.total || 0,
          status: statusMap[order.status] || order.status || "",
          items: (order.items || [])
            .map(
              (item: any) =>
                `${item.product_name || item.name} x${item.quantity}`
            )
            .join(", "),
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

  // Lấy số lượng đơn hàng và wishlist khi load trang
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Lấy tổng số đơn hàng
        const ordersRes = await apiService.getOrders();
        const ordersArray = Array.isArray(ordersRes) ? ordersRes : [];
        setOrderCount(ordersArray.length);

        // Lấy tổng số sản phẩm yêu thích (nếu có API)
        if (apiService.getWishlist) {
          const wishlistRes = await apiService.getWishlist();
          const wishlistArray = Array.isArray(wishlistRes) ? wishlistRes : [];
          setWishlistCount(wishlistArray.length);
        }

        // Lấy năm thành viên từ user context
        if (user?.created_at) {
          const year = new Date(user.created_at).getFullYear();
          setMemberSince(year.toString());
        } else {
          setMemberSince("");
        }
      } catch (e) {
        setOrderCount(0);
        setWishlistCount(0);
        setMemberSince("");
      }
    };
    fetchStats();
    // eslint-disable-next-line
  }, [user]);

  const stats = [
    {
      label: "Đơn hàng",
      value: orderCount.toString(),
      icon: <Package className="h-5 w-5" />,
      onClick: onViewOrderHistory,
    },
    {
      label: "Yêu thích",
      value: wishlistCount.toString(),
      icon: <Heart className="h-5 w-5" />,
      onClick: onViewWishlist,
    },
    {
      label: "Điểm tích lũy",
      value: user?.points?.toLocaleString() || "0",
      icon: <Star className="h-5 w-5" />,
    },
    {
      label: "Thành viên từ",
      value: memberSince || "-",
      icon: <Calendar className="h-5 w-5" />,
    },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profile.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }

    if (!profile.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!profile.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(profile.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    // Nếu là trường gender, cho phép mapping cả tiếng Việt và tiếng Anh
    let mappedValue = value;
    if (field === "gender") {
      if (["Nam", "male", "nam"].includes(value)) mappedValue = "Nam";
      else if (["Nữ", "female", "nữ"].includes(value)) mappedValue = "Nữ";
      else mappedValue = "Khác";
    }
    setProfile((prev) => ({ ...prev, [field]: mappedValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async () => {
    setErrors({});
    if (!validateForm()) return;
    try {
      if (updateProfile) {
        await updateProfile({
          first_name: profile.fullName.split(" ")[0] || "",
          last_name: profile.fullName.split(" ").slice(1).join(" ") || "",
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          district: profile.district,
          ward: profile.ward,
          birthDate: profile.birthDate ? profile.birthDate : null,
          gender: profile?.gender || "Khác",
        });
      }
      // Sau khi cập nhật, nên reload lại user từ backend (nếu cần)
      addToast({ title: "Cập nhật thành công", type: "success" });
      setIsEditing(false);
    } catch (error) {
      addToast({ title: "Cập nhật thất bại", type: "error" });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setProfile({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      district: "",
      ward: "",
      birthDate: "",
      gender: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã giao":
        return "bg-green-100 text-green-800";
      case "Đang giao":
        return "bg-blue-100 text-blue-800";
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-800";
      case "Đã hủy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Always fetch latest user info when entering profile
  useEffect(() => {
    if (loadCurrentUser) {
      loadCurrentUser();
    }
    // eslint-disable-next-line
  }, []);

  // Đồng bộ state profile với hook địa chỉ khi user context thay đổi
  useEffect(() => {
    if (user) {
      setProfile({
        fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        district: user.district || "",
        ward: user.ward || "",
        birthDate: user.birthDate || "",
        gender: user.gender || "",
      });
      // Nếu có city/district/ward thì set code tương ứng cho hook
      if (user.city) {
        const foundProvince = provinces.find((p) => p.name === user.city);
        if (foundProvince) setSelectedProvince(foundProvince.code);
      }
      if (user.district) {
        const foundDistrict = districts.find((d) => d.name === user.district);
        if (foundDistrict) setSelectedDistrict(foundDistrict.code);
      }
      if (user.ward) {
        const foundWard = wards.find((w) => w.name === user.ward);
        if (foundWard) setSelectedWard(foundWard.code);
      }
    }
    // eslint-disable-next-line
  }, [user, provinces, districts, wards]);

  // Mốc điểm các hạng thành viên
  const levelThresholds = [
    { level: "Silver", min: 0, next: 1000 },
    { level: "Gold", min: 1000, next: 3000 },
    { level: "Platinum", min: 3000, next: null },
  ];

  // Tính số điểm còn lại để lên hạng tiếp theo
  let nextLevel = null;
  let pointsToNext = null;
  if (user?.points !== undefined && user?.level) {
    const current = levelThresholds.find((l) => l.level === user.level);
    if (current && current.next !== null) {
      nextLevel = levelThresholds.find((l) => l.min === current.next)?.level;
      pointsToNext = current.next - user.points;
      if (pointsToNext < 0) pointsToNext = 0;
    }
  }

  if (isLoading || !user) {
    return (
      <div className="text-center py-12 text-gray-500">
        Đang tải thông tin cá nhân...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffefc]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#49bbbd] to-[#3a9a9c] shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white font-['Poppins',Helvetica] tracking-wide drop-shadow-lg">
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
            <Card className="overflow-visible">
              <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8 bg-gradient-to-br from-[#f0fdfa] to-[#fffefc] rounded-2xl shadow-lg">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#49bbbd] shadow-xl overflow-hidden bg-gradient-to-br from-[#49bbbd] to-[#3a9a9c] flex items-center justify-center transition-transform group-hover:scale-105">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.first_name || ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-20 w-20 md:h-28 md:w-28 text-white/70" />
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute bottom-2 right-2 bg-white/80 shadow-md hover:bg-gray-50 h-10 w-10 border border-[#49bbbd] group-hover:scale-110 transition-transform"
                    title="Đổi ảnh đại diện"
                  >
                    <Camera className="h-5 w-5 text-[#49bbbd]" />
                  </Button>
                </div>
                <div className="flex-1 flex flex-col gap-2 items-center md:items-start">
                  <h2 className="text-3xl font-bold text-gray-900 font-['Poppins',Helvetica] tracking-wide">
                    {user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : ""}
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2"><Mail className="h-4 w-4 mr-1 text-[#49bbbd]" />{user?.email}</p>
                  <div className="flex items-center mt-2 gap-2">
                    <span className="inline-block px-4 py-1 bg-gradient-to-r from-[#49bbbd] to-[#3a9a9c] text-white text-base rounded-full font-semibold shadow-md animate-pulse">
                      <Star className="inline h-4 w-4 mr-1 -mt-1" />{user?.level}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "ghost"}
                  className="flex items-center mt-4 md:mt-0"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isEditing ? "Hủy" : "Chỉnh sửa"}
                </Button>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica] flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
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
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        className={errors.fullName ? "border-red-500" : ""}
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{profile.fullName}</p>
                    )}
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fullName}
                      </p>
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
                        disabled
                        className={
                          errors.email
                            ? "border-red-500"
                            : "bg-gray-100 cursor-not-allowed"
                        }
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{profile.email}</p>
                    )}
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    {isEditing ? (
                      <Input
                        value={profile.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className={errors.phone ? "border-red-500" : ""}
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{profile.phone}</p>
                    )}
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh
                    </label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={
                          profile.birthDate
                            ? profile.birthDate.slice(0, 10)
                            : ""
                        }
                        onChange={(e) =>
                          handleInputChange("birthDate", e.target.value)
                        }
                      />
                    ) : (
                      <p className="py-2 text-gray-900">
                        {profile.birthDate
                          ? new Date(profile.birthDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : ""}
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
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
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
                        value={selectedProvince}
                        onChange={(e) => {
                          setSelectedProvince(e.target.value);
                          const province = provinces.find((p) => p.code === e.target.value);
                          handleInputChange("city", province ? province.name : "");
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
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
                    <>
                      <Input
                        placeholder="Số nhà, tên đường"
                        value={profile.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className="mb-2"
                      />
                      {isEditing ? (
                        <select
                          value={selectedWard}
                          onChange={(e) => {
                            setSelectedWard(e.target.value);
                            const ward = wards.find((w) => w.code === e.target.value);
                            handleInputChange("ward", ward ? ward.name : "");
                          }}
                          className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                          disabled={!selectedDistrict}
                        >
                          <option value="">Chọn phường/xã</option>
                          {wards.map((ward) => (
                            <option key={ward.code} value={ward.code}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                      ) : null}
                      {isEditing ? (
                        <select
                          value={selectedDistrict}
                          onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            const district = districts.find((d) => d.code === e.target.value);
                            handleInputChange("district", district ? district.name : "");
                          }}
                          className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#49bbbd]"
                          disabled={!selectedProvince}
                        >
                          <option value="">Chọn quận/huyện</option>
                          {districts.map((district) => (
                            <option key={district.code} value={district.code}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </>
                  ) : (
                    <p className="py-2 text-gray-900">
                      {profile.address}, {profile.ward}, {profile.district},{" "}
                      {profile.city}
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
                    <Button onClick={handleCancel} variant="outline">
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
                    <div className="text-center text-gray-500 py-8">
                      Đang tải...
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      Chưa có đơn hàng nào
                    </div>
                  ) : (
                    recentOrders.map((order) => (
                      <Card
                        key={order.id}
                        className="border border-gray-200 rounded-lg"
                      >
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              Đơn hàng #{order.id}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.date
                              ? new Date(order.date).toLocaleDateString("vi-VN")
                              : ""}
                          </div>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                          <div className="text-sm text-gray-700 mb-1">
                            {order.items}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              Tổng cộng:
                            </span>
                            <span className="font-semibold text-[#49bbbd]">
                              {order.total?.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
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
                <CardTitle className="font-['Poppins',Helvetica]">
                  Thống kê
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className={`text-center p-4 bg-gray-50 rounded-lg ${
                        stat.onClick
                          ? "cursor-pointer hover:bg-gray-100 transition-colors"
                          : ""
                      }`}
                      onClick={stat.onClick}
                    >
                      <div className="flex justify-center mb-2 text-[#49bbbd]">
                        {stat.icon}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Poppins',Helvetica]">
                  Thao tác nhanh
                </CardTitle>
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
                <CardTitle className="font-['Poppins',Helvetica]">
                  Thành viên
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#49bbbd] to-[#3a9a9c] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {user?.level}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Bạn có {user?.points?.toLocaleString()} điểm tích lũy
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-[#49bbbd] h-2 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {nextLevel && pointsToNext !== null
                      ? `Còn ${pointsToNext.toLocaleString()} điểm để lên hạng ${nextLevel}`
                      : "Bạn đã đạt hạng cao nhất"}
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
