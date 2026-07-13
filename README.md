---
💡 功能：JPREKI Top 項目說明
---

# JPREKI Top

一個匯集 JP 產品資訊的樞紐站點，跨鏈接 5 個子站。

## 目錄結構

```
src/pages/           # 頁面
content/posts/       # 文章（通過 Decap CMS 管理）
content/categories/  # 分類（通過 Decap CMS 管理）
functions/           # Cloudflare Functions
assets/images/       # 圖片上傳
```

## 5 個分類

| 分類 | 對應站點 |
|------|---------|
| 保健養生 | jpantao.com |
| 遊戲服務 | 77jpchu.com / 777dai.com |
| 代購服務 | 77jpchu.com / 777dai.com |
| Apple 服務 | donaa.org |
| 跨境購物 | jpchu.com |

## 部署

- Cloudflare Pages 自動部署
- 內容管理：`/admin/` 路徑打開 Decap CMS

## 開發

```bash
npm run dev      # 本地開發
npm run build    # 構建靜態文件
```