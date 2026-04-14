import {
    Shield,
    Lock,
    Eye,
    Server,
    CalendarClock,
    BellRing,
    BadgePercent,
    MessageSquare,
} from 'lucide-react';

export const heroMetrics = [
    {
        value: '12 tab',
        label: 'bao phủ những nhu cầu học vụ và học tập bạn dùng thường xuyên nhất',
        icon: CalendarClock,
        accent: 'text-blue-600 dark:text-blue-400',
    },
    {
        value: 'Open',
        label: 'mã nguồn mở để tự kiểm tra, review hoặc tự host',
        icon: Shield,
        accent: 'text-slate-700 dark:text-slate-300',
    },
];

export const productHighlights = [
    {
        icon: CalendarClock,
        eyebrow: 'Theo dõi lịch học',
        title: 'Một nơi đủ nhanh để mở ra mỗi ngày',
        description: 'Thời khóa biểu, lịch thi và CTĐT được đặt cạnh nhau để bạn đỡ phải chuyển ngữ cảnh.',
        iconGradient: 'from-sky-500 to-blue-500',
        glow: 'from-sky-500/16 via-blue-500/6 to-transparent',
    },
    {
        icon: MessageSquare,
        eyebrow: 'Theo sát LMS',
        title: 'Nhìn deadline và tin nhắn theo cách dễ quét hơn',
        description: 'Các thông tin dễ bị bỏ sót như deadline và hội thoại LMS được gom lại để xử lý nhanh hơn.',
        iconGradient: 'from-indigo-500 to-violet-500',
        glow: 'from-indigo-500/16 via-violet-500/6 to-transparent',
    },
    {
        icon: BadgePercent,
        eyebrow: 'Nhìn dài hạn',
        title: 'GPA và roadmap không còn đứng riêng lẻ',
        description: 'Bạn có thể vừa theo sát học kỳ hiện tại, vừa giữ được góc nhìn về tiến độ học tập lâu dài.',
        iconGradient: 'from-emerald-500 to-cyan-500',
        glow: 'from-emerald-500/16 via-cyan-500/6 to-transparent',
    },
    {
        icon: BellRing,
        eyebrow: 'Điều hướng nhanh',
        title: 'Một workspace vẫn gọn kể cả khi nhiều tính năng',
        description: 'Điều hướng mobile và các tab phụ được tổ chức lại để app vẫn gọn và dễ dùng.',
        iconGradient: 'from-slate-600 to-slate-900',
        glow: 'from-slate-500/14 via-slate-500/6 to-transparent',
    },
];

export const securityPoints = [
    {
        icon: Lock,
        title: 'Không lưu mật khẩu',
    },
    {
        icon: Eye,
        title: 'Minh bạch về dữ liệu',
    },
    {
        icon: Server,
        title: 'Session có vòng đời ngắn',
    },
    {
        icon: Shield,
        title: 'HTTPS và mã nguồn mở',
        description:
            'Kết nối được mã hóa, còn phần mã nguồn đủ minh bạch để cộng đồng có thể tự review hoặc tự host.',
    },
];

export const trustChips = [
    'Không lưu mật khẩu',
    'Thiết kế cho mobile',
    'Mã nguồn mở',
];

export const previewCourses = [
    { code: 'CO3086', name: 'Xử lý NN tự nhiên', meta: '09:00 - 10:50 • B4-302', tone: 'bg-pink-500' },
    { code: 'CO2001', name: 'Kỹ năng Chuyên nghiệp', meta: '09:00 - 10:50 • C6-502', tone: 'bg-emerald-500' },
    { code: 'SP1039', name: 'Lịch sử Đảng Cộng sản', meta: '13:00 - 14:50 • C4-503', tone: 'bg-orange-500' },
];

export const previewSignals = [
    {
        label: 'Deadline gần nhất',
        title: 'Quiz tuần 8',
        meta: 'Còn 19 giờ • LMS',
    },
];

export const heroTitleLines = [
    'StuSpace',
    'workspace công cụ cho sinh viên BK',
];

export const footerYear = '2026';
