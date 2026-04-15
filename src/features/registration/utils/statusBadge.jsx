import { CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function getRegistrationStatusBadge(status) {
    switch (status) {
        case "open":
            return (
                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Đang mở
                </Badge>
            );
        case "upcoming":
            return (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Sắp mở
                </Badge>
            );
        case "closed":
            return (
                <Badge variant="secondary" className="bg-gray-100 text-gray-500 hover:bg-gray-100 text-xs">
                    Đã đóng
                </Badge>
            );
        default:
            return null;
    }
}
