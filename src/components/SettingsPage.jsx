import React, { useState } from "react";
import { Shield, History, Award, Settings, HardDrive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";

// Import các component con
import SecurityPage from "./SecurityPage";
import ChangelogPage from "./ChangelogPage";
import HonorWallPage from "./HonorWallPage";
import LocalStorageViewer from "./LocalStorageViewer";

// Tab configuration
const tabConfig = [
    {
        id: "storage",
        label: "Bộ nhớ",
        shortLabel: "Nhớ",
        icon: HardDrive,
        color: "from-emerald-500 to-teal-600"
    },
    {
        id: "security",
        label: "Bảo mật",
        shortLabel: "BM",
        icon: Shield,
        color: "from-blue-500 to-indigo-600"
    },
    {
        id: "changelog",
        label: "Changelog",
        shortLabel: "Log",
        icon: History,
        color: "from-violet-500 to-purple-600"
    },
    {
        id: "honor",
        label: "Honor Wall",
        shortLabel: "Honor",
        icon: Award,
        color: "from-amber-500 to-orange-600"
    }
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("storage");

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            {/* Header with Tabs */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b flex-shrink-0">
                <div className="p-3 sm:p-4">
                    {/* Title - Compact on mobile */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-lg flex-shrink-0">
                            <Settings className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 truncate">
                                Cài đặt & Thông tin
                            </h2>
                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                Bộ nhớ, bảo mật, lịch sử & đóng góp
                            </p>
                        </div>
                    </div>

                    {/* Tab List - 4 columns, optimized for mobile */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full grid grid-cols-4 h-14 sm:h-12 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl gap-0.5 sm:gap-1">
                            {tabConfig.map((tab) => {
                                const IconComponent = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 px-0.5 sm:px-2 py-1
                                            ${isActive
                                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                                                : 'text-muted-foreground hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                                            }
                                        `}
                                    >
                                        <div className={`p-1.5 sm:p-1.5 rounded-md transition-all ${isActive
                                                ? `bg-gradient-to-br ${tab.color} shadow-sm`
                                                : 'bg-slate-200/80 dark:bg-slate-700/80'
                                            }`}>
                                            <IconComponent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : ''}`} />
                                        </div>
                                        <span className="leading-tight truncate max-w-full">{tab.shortLabel}</span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Tab Content - Scrollable area */}
            <div className="flex-1 overflow-auto">
                {activeTab === "storage" && <LocalStorageViewer />}
                {activeTab === "security" && <SecurityPage />}
                {activeTab === "changelog" && <ChangelogPage />}
                {activeTab === "honor" && <HonorWallPage />}
            </div>
        </div>
    );
}
