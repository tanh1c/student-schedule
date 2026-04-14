import React, { useMemo, useState } from "react";
import {
  Filter,
  Github,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import ToolCard from "./ToolCard";
import { toolsCatalog } from "../constants/toolsCatalog";

export default function UsefulToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const categories = useMemo(
    () => ["Tất cả", ...new Set(toolsCatalog.map((tool) => tool.category))],
    [],
  );

  const filteredTools = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return toolsCatalog.filter((tool) => {
      const matchesCategory =
        activeCategory === "Tất cả" || tool.category === activeCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        tool.name,
        tool.category,
        tool.description,
        tool.credit,
        ...tool.badges,
        ...tool.highlights,
        ...tool.installSteps,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-6 shadow-sm dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Curated by StuSpace
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Công cụ
              </h1>
            </div>
          </div>

          <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Đây là góc tổng hợp các công cụ bên ngoài mà sinh viên có thể cài
            thêm để học tập, quản lý tài liệu, ghi chú và tối ưu workflow. Mỗi
            tool đều có link GitHub, cách cài nhanh và credit rõ ràng để bạn
            tiện bắt đầu.
          </p>
        </div>
      </div>

      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="h-4 w-4 text-primary" />
                Tìm nhanh theo nhu cầu
              </div>
              <p className="text-sm text-muted-foreground">
                Lọc theo category hoặc gõ tên tool, công dụng, nền tảng để tìm
                nhanh hơn.
              </p>
            </div>
            <Badge
              variant="secondary"
              className="w-fit rounded-full border border-border/50 bg-muted/60 px-3 py-1 text-xs"
            >
              {filteredTools.length}/{toolsCatalog.length} công cụ
            </Badge>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm theo tên tool, category, công dụng..."
                className="h-11 pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = activeCategory === category;
                const count =
                  category === "Tất cả"
                    ? toolsCatalog.length
                    : toolsCatalog.filter((tool) => tool.category === category)
                        .length;

                return (
                  <Button
                    key={category}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    className="h-10 rounded-full px-4"
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                    <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-[11px] dark:bg-white/10">
                      {count}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredTools.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-border/70 bg-card/70 shadow-sm">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Search className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                Không tìm thấy công cụ phù hợp
              </h2>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                Thử đổi từ khóa tìm kiếm hoặc chuyển sang category khác để xem
                thêm các công cụ phù hợp với workflow học tập của bạn.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Muốn đề xuất thêm tool?
            </h2>
            <p className="text-sm text-muted-foreground">
              Nếu bạn có tool học tập hay ho muốn đưa vào StuSpace, có thể mở
              issue hoặc gửi góp ý để mình bổ sung vào danh sách curated này.
            </p>
          </div>
          <a
            href="https://github.com/tanh1c/student-schedule/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-2">
              <Github className="h-4 w-4" />
              Mở GitHub Issues
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
