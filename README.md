# JPREKI Top - 日本好物推薦平台

## 項目概述
這是一個信息聚合網站，專門推薦和串聯5個優質日本服務網站：

1. **jpantao.com** - 日本保健品代購
2. **donaa.org** - 遊戲實名認證服務
3. **jpchu.com** - 日本代購服務
4. **777dai.com** - Apple ID 實名認證
5. **77jpchu.com** - 日本跨境購物

## 技術棧
- **框架**: Astro 5.x
- **部署**: Cloudflare Pages
- **域名**: jpreki.top
- **後台**: Keystatic CMS

## 網站架構
```
/                    - 首頁（5站推薦）
/jpantao-rec         - jpantao.com 推薦頁面
/donaa-rec           - donaa.org 推薦頁面
/jpchurec            - jpchu.com 推薦頁面
/777dairec           - 777dai.com 推薦頁面
/77jpchurec          - 77jpchu.com 推薦頁面
/sitemap             - 網站地圖
```

## SEO 優化策略
1. **內部鏈接** - 所有頁面互相鏈接，形成站群網絡
2. **外鏈建設** - 為5個主站提供高質量反向鏈接
3. **內容豐富** - 每個推薦頁面包含詳細的SEO優化內容
4. **技術SEO** - sitemap.xml、robots.txt、規範化鏈接

## 部署步驟
1. 創建 GitHub 倉庫
2. 連接 Cloudflare Pages
3. 配置構建命令：`npm run build`
4. 配置輸出目錄：`dist`
5. 綁定自定義域名：jpreki.top

## 維護計劃
- 定期更新文章內容
- 監控 SEO 指標
- 優化內部鏈接結構
- 擴展更多推薦內容
