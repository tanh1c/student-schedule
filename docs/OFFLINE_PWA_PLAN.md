# Offline & PWA Plan

## Goal

Đưa StuSpace lên mức:

- mở lại được app shell khi mất mạng
- dùng được các dữ liệu local/offline cache đã có
- cập nhật phiên bản mới an toàn, không bị giữ layout cũ quá lâu

## Current State

Hiện repo đã có một phần offline ở tầng dữ liệu:

- LMS messages có fallback cache
- LMS deadlines có fallback cache
- một số tab đọc từ `localStorage` nên vẫn còn dữ liệu nếu app đã mở trước đó

Nhưng app chưa offline-ready hoàn toàn vì:

- chưa có service worker
- chưa có app-shell caching
- chưa có manifest/PWA flow hoàn chỉnh
- chưa có update flow rõ ràng để tránh stale CSS/layout

## Non-Goals

Những phần chưa nên làm ngay ở phase đầu:

- cache toàn bộ API động
- background sync phức tạp
- offline login
- full offline mode cho mọi tab

## Phase 1: Safe App Shell Caching

- [ ] thêm service worker mức tối thiểu
- [ ] cache `index.html`, JS/CSS build và các asset quan trọng
- [ ] bảo đảm landing/app shell mở lại được khi mất mạng
- [ ] thêm manifest cơ bản cho mobile installability
- [ ] giữ data logic hiện tại dựa trên `localStorage`/cache sẵn có

### Exit Criteria

- [ ] đã từng mở app thì có thể mở lại khi mất mạng
- [ ] dashboard và các tab đọc local data vẫn render được app shell
- [ ] không có lỗi trắng trang khi offline

## Phase 2: Update Safety

- [ ] version cache rõ ràng theo release
- [ ] xóa cache cũ an toàn khi có bản mới
- [ ] thêm UI `Có phiên bản mới` hoặc `Làm mới giao diện`
- [ ] tránh giữ stale CSS/layout quá lâu trên mobile

### Exit Criteria

- [ ] release mới không dễ bị kẹt layout cũ
- [ ] người dùng có cách refresh/update rõ ràng

## Phase 3: Smart Runtime Caching

- [ ] đánh giá các API GET nào đủ an toàn để cache
- [ ] chỉ cache read-only endpoints thật sự đáng tiền
- [ ] ưu tiên `stale-while-revalidate` cho dữ liệu public/an toàn
- [ ] không cache bừa các flow nhạy cảm như login/session write

### Exit Criteria

- [ ] các tab dùng nhiều có cảm giác mở nhanh hơn
- [ ] hành vi offline/online không gây nhầm dữ liệu

## Suggested Technical Direction

- frontend: `vite-plugin-pwa` hoặc service worker tùy biến nhẹ
- cache strategy:
  - app shell: `Cache First`
  - public assets: hashed static cache
  - selected GET data: `Stale While Revalidate`
- update strategy:
  - explicit cache versioning
  - clear outdated caches on activate
  - lightweight update prompt in app shell

## Risks To Watch

- stale CSS hoặc stale layout trên mobile
- cache nhầm API động gây dữ liệu cũ khó hiểu
- service worker nuốt lỗi mạng làm debug khó hơn
- release mới không invalidate được cache cũ

## Suggested Order

1. PWA manifest + minimal service worker
2. app shell caching
3. update prompt + cache invalidation
4. selective runtime caching
5. release checklist cho offline behavior

## Verification Checklist

- [ ] mở app online lần đầu
- [ ] reload khi online
- [ ] tắt mạng rồi mở lại app
- [ ] vào dashboard
- [ ] vào messages/deadlines với cache cũ
- [ ] deploy bản mới và kiểm tra update flow
- [ ] test riêng trên iPhone Safari và Chrome Android
