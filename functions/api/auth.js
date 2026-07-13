// Cloudflare Pages Function - GitHub OAuth for Decap CMS
// 直接使用 PAT 認證，跳過 GitHub OAuth App
// 環境變量：GITHUB_PAT

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const state = url.searchParams.get('state') || '';
  const pat = env.GITHUB_PAT;
  const origin = url.origin;  // 動態獲取當前域名

  // 返回 HTML 頁面，直接將 PAT 傳遞給 Decap CMS
  const contentPage = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8">
  <title>GitHub Auth - JPREKI</title>
</head>
<body>
  <p>認證成功，正在跳轉回管理後台...</p>
  <script>
    (function() {
      function receiveMessage(e) {
        window.opener.postMessage(
          'authorization:${pat}:${state}',
          e.origin
        );
        window.close();
      }
      window.addEventListener('message', receiveMessage, false);
      window.opener.location.href = '${origin}/admin/';
      setTimeout(function() { window.close(); }, 1000);
    })();
  </script>
</body>
</html>`;

  return new Response(contentPage, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}