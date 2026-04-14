import React, { useState } from "react";
import {
  History,
  LayoutGrid,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import {
  menuItems,
  mobileMenuGroups,
  mobileNavMenuItems,
} from "@app/menuConfig";
import { Badge } from "@shared/ui/badge";
import { Input } from "@components/ui/input";
import { Separator } from "@components/ui/separator";
import { Sheet, SheetContent } from "@components/ui/sheet";

const mobileSheetBottomPadding = {
  paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
};

function MobileSheetSection({ icon, title, description, children, count }) {
  const IconComponent = icon;

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <IconComponent className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {typeof count === "number" ? (
            <Badge
              variant="secondary"
              className="rounded-full border border-border/50 bg-muted/60 px-2 py-0.5 text-[10px]"
            >
              {count}
            </Badge>
          ) : null}
        </div>
        {description ? (
          <p className="text-xs leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function MobileSheetTabButton({
  item,
  isActive,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) {
  const Icon = item.icon;

  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border px-2 py-2 shadow-sm transition-colors ${
        isActive
          ? "border-primary/40 bg-primary/5"
          : "border-border/60 bg-card/70 hover:bg-accent/50"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1 text-left"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {item.label}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {item.shortLabel}
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onToggleFavorite(item.id)}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
          isFavorite
            ? "border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
            : "border-border/60 bg-background text-muted-foreground hover:bg-accent"
        }`}
        aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
        title={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
      >
        <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}

export default function MobileMoreSheet({
  open,
  onOpenChange,
  activeTab,
  favoriteTabIds,
  recentTabIds,
  onTabSelect,
  onToggleFavorite,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filterItems = (items) =>
    items.filter((item) => {
      if (!normalizedQuery) {
        return true;
      }

      return [item.label, item.shortLabel]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });

  const favoriteItems = filterItems(
    favoriteTabIds
      .map((tabId) => menuItems.find((item) => item.id === tabId))
      .filter(Boolean),
  );

  const primaryIds = new Set(mobileNavMenuItems.map((item) => item.id));
  const recentItems = filterItems(
    recentTabIds
      .filter((tabId) => !primaryIds.has(tabId))
      .map((tabId) => menuItems.find((item) => item.id === tabId))
      .filter(Boolean),
  );

  const groupedSections = mobileMenuGroups
    .map((group) => ({
      ...group,
      items: filterItems(
        group.itemIds
          .map((tabId) => menuItems.find((item) => item.id === tabId))
          .filter(Boolean),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const hasAnyResults =
    favoriteItems.length > 0 ||
    recentItems.length > 0 ||
    groupedSections.length > 0;

  const handleSelect = (tabId) => {
    onTabSelect(tabId);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        title="Điều hướng nhanh"
        className="max-h-[82vh] px-0"
        bodyClassName="flex min-h-0 flex-col overflow-hidden px-0 pb-0"
      >
        <div className="px-4 pb-3">
          <div className="mb-3 h-1.5 w-12 rounded-full bg-border/80 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Mở nhanh các khu vực trong StuSpace
            </p>
            <p className="text-xs leading-6 text-muted-foreground">
              Ghim tab bạn dùng nhiều vào mục yêu thích để lần sau mở nhanh hơn.
            </p>
          </div>
        </div>

        <Separator className="mb-3" />

        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm tab nhanh..."
              className="h-11 rounded-2xl pl-10"
            />
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-4 overscroll-contain"
          style={mobileSheetBottomPadding}
        >
          <div className="space-y-5 pb-4">
            {favoriteItems.length > 0 ? (
              <MobileSheetSection
                icon={Star}
                title="Yêu thích"
                description="Các tab bạn ghim để truy cập nhanh."
                count={favoriteItems.length}
              >
                {favoriteItems.map((item) => (
                  <MobileSheetTabButton
                    key={`favorite-${item.id}`}
                    item={item}
                    isActive={activeTab === item.id}
                    isFavorite={favoriteTabIds.includes(item.id)}
                    onSelect={handleSelect}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </MobileSheetSection>
            ) : (
              <MobileSheetSection
                icon={Sparkles}
                title="Mẹo nhanh"
                description="Nhấn dấu sao ở mỗi tab để ghim vào đây."
              >
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-4 text-sm leading-7 text-muted-foreground">
                  Bạn chưa có tab yêu thích nào. Hãy ghim những tab dùng thường
                  xuyên như `ĐKMH`, `Tin nhắn LMS` hoặc `Công cụ`.
                </div>
              </MobileSheetSection>
            )}

            {recentItems.length > 0 ? (
              <MobileSheetSection
                icon={History}
                title="Gần đây"
                description="Những tab bạn vừa mở gần nhất."
                count={recentItems.length}
              >
                {recentItems.map((item) => (
                  <MobileSheetTabButton
                    key={`recent-${item.id}`}
                    item={item}
                    isActive={activeTab === item.id}
                    isFavorite={favoriteTabIds.includes(item.id)}
                    onSelect={handleSelect}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </MobileSheetSection>
            ) : null}

            {groupedSections.map((group) => (
              <MobileSheetSection
                key={group.id}
                icon={LayoutGrid}
                title={group.label}
                description={group.description}
                count={group.items.length}
              >
                {group.items.map((item) => (
                  <MobileSheetTabButton
                    key={`${group.id}-${item.id}`}
                    item={item}
                    isActive={activeTab === item.id}
                    isFavorite={favoriteTabIds.includes(item.id)}
                    onSelect={handleSelect}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </MobileSheetSection>
            ))}

            {!hasAnyResults ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-foreground">
                  Không tìm thấy tab phù hợp
                </p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  Thử đổi từ khóa tìm kiếm để xem lại toàn bộ danh mục điều hướng.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
