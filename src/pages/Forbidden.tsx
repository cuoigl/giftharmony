import React from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ForbiddenProps {
  onBack?: () => void;
}

export const Forbidden: React.FC<ForbiddenProps> = ({ onBack }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffefc] p-8">
    <div className="text-6xl mb-4 text-[#49bbbd] font-bold">403</div>
    <h1 className="text-2xl font-semibold mb-2">
      Bạn không có quyền truy cập trang này
    </h1>
    <p className="text-gray-600 mb-6">
      Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là nhầm lẫn.
    </p>
    {onBack && (
      <Button onClick={onBack} className="flex items-center">
        <ArrowLeft className="h-5 w-5 mr-2" /> Quay lại
      </Button>
    )}
  </div>
);
