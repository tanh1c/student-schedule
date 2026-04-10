import {
  Brain,
  Files,
  NotebookText,
  Send,
} from "lucide-react";

export const toolsCatalog = [
  {
    id: "anki",
    name: "Anki",
    category: "Ghi nhớ",
    icon: Brain,
    websiteUrl: "https://apps.ankiweb.net/",
    githubUrl: "https://github.com/ankitects/anki",
    badges: ["Open source", "Desktop", "Flashcards"],
    description:
      "Phù hợp để ôn công thức, thuật ngữ, từ vựng và các môn cần lặp lại dài hạn.",
    highlights: [
      "Spaced repetition giúp nhớ lâu hơn",
      "Sync giữa nhiều thiết bị qua AnkiWeb",
      "Có hệ sinh thái deck và add-on rất lớn",
    ],
    installSteps: [
      "Mở trang chủ Anki và tải bản phù hợp với hệ điều hành.",
      "Cài ứng dụng desktop, tạo tài khoản AnkiWeb nếu muốn đồng bộ.",
      "Tạo deck riêng cho từng môn hoặc import deck có sẵn.",
    ],
    credit: "Maintained by Ankitects and the Anki open-source community.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "zotero",
    name: "Zotero",
    category: "Tài liệu",
    icon: Files,
    websiteUrl: "https://www.zotero.org/",
    githubUrl: "https://github.com/zotero/zotero",
    badges: ["Open source", "Desktop", "Reference manager"],
    description:
      "Rất hữu ích nếu bạn hay lưu PDF, paper, slide hoặc cần trích dẫn tài liệu cho báo cáo.",
    highlights: [
      "Quản lý thư viện tài liệu và PDF gọn gàng",
      "Có browser connector để lưu tài liệu cực nhanh",
      "Hỗ trợ citation cho Word và Google Docs",
    ],
    installSteps: [
      "Tải Zotero desktop từ trang chủ chính thức.",
      "Cài thêm Zotero Connector cho trình duyệt bạn dùng.",
      "Tạo collection theo môn học hoặc đề tài để quản lý tài liệu.",
    ],
    credit:
      "Developed by the Corporation for Digital Scholarship and the Zotero community.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "logseq",
    name: "Logseq",
    category: "Ghi chú",
    icon: NotebookText,
    websiteUrl: "https://logseq.com/",
    githubUrl: "https://github.com/logseq/logseq",
    badges: ["Open source", "Desktop", "Knowledge graph"],
    description:
      "Phù hợp để ghi chú học tập theo kiểu linked notes, daily journal và xây hệ thống kiến thức cá nhân.",
    highlights: [
      "Ghi chú theo block nên rất nhanh để capture ý tưởng",
      "Liên kết nội dung giữa các môn học rất tốt",
      "Hữu ích cho note học, project, thesis và daily planning",
    ],
    installSteps: [
      "Tải Logseq từ trang chủ hoặc release page.",
      "Mở hoặc tạo một local graph mới trên máy.",
      "Tổ chức note theo course, semester hoặc topic để dễ truy xuất.",
    ],
    credit: "Built by the Logseq team and open-source contributors.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "localsend",
    name: "LocalSend",
    category: "Chia sẻ file",
    icon: Send,
    websiteUrl: "https://localsend.org/",
    githubUrl: "https://github.com/localsend/localsend",
    badges: ["Open source", "Cross-platform", "LAN transfer"],
    description:
      "Dùng để chuyển file giữa laptop và điện thoại trong cùng mạng Wi-Fi mà không cần cáp hay upload cloud.",
    highlights: [
      "Chuyển file nhanh trong mạng nội bộ",
      "Hỗ trợ Windows, macOS, Linux, Android, iOS",
      "Tiện để gửi slide, PDF, ảnh scan và file project",
    ],
    installSteps: [
      "Cài LocalSend trên các thiết bị bạn muốn dùng.",
      "Đảm bảo các thiết bị cùng mạng nội bộ.",
      "Mở app, chọn thiết bị đích rồi gửi file trực tiếp.",
    ],
    credit: "Maintained by the LocalSend community.",
    gradient: "from-amber-500 to-orange-600",
  },
];
