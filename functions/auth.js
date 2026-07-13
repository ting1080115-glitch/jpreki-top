// Cloudflare Pages Function - GitHub OAuth for Decap CMS
// 處理 Decap CMS 的 GitHub OAuth 認證流程

// 環境變量需要在 Cloudflare Pages 後台設置：
// GITHUB_CLIENT_ID - GitHub OAuth App 的 Client ID
// GITHUB_CLIENT_SECRET - GitHub OAuth App 的 Client Secret
// ORIGIN - 站點 URL（如 https://jpreki.top）

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Step 1: 重定向用戶到 GitHub 授權頁面
  if (!url.searchParams.has('code')) {
    const redirectUri = `${env.ORIGIN}/api/auth/callback`;
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
    githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
    githubAuthUrl.searchParams.set('scope', 'repo,user');
    githubAuthUrl.searchParams.set('state', url.searchParams.get('state') || '');
    return Response.redirect(githubAuthUrl.toString(), 302);
  }

  // Step 2: 處理 GitHub 回調，交換 authorization code 為 access token
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return new Response(`OAuth Error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
  }

  // Step 3: 返回 HTML 頁面，將 token 傳遞給 Decap CMS
  const contentPage = `
<!DOCTYPE html>
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
          'authorization:${tokenData.access_token}:${state || ''}',
          e.origin
        );
        window.close();
      }
      window.addEventListener('message', receiveMessage, false);
      // 如果父窗口沒有監聽 message，直接跳轉回去
      window.opener.location.href = '${env.ORIGIN}/admin/';
      window.close();
    })();
  </script>
</body>
</html>`;

  return new Response(contentPage, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}