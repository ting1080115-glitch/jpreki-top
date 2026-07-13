// /api/save — 儲存文章到 GitHub
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { token, filename, content } = await request.json();
    
    // 驗證 token
    let user;
    try { user = JSON.parse(atob(token)).user; } catch(e) { user = null; }
    const expectedUser = env.ADMIN_USER || 'admin';
    if (!user || user !== expectedUser) {
      return new Response(JSON.stringify({ success: false, message: '未授權' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    // 寫入 GitHub
    const pat = env.GITHUB_PAT;
    if (!pat) {
      return new Response(JSON.stringify({ success: false, message: 'GITHUB_PAT 未設置' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const repo = 'ting1080115-glitch/jpreki-top';
    const branch = 'main';
    const path = 'content/posts/' + filename;
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    // 先檢查文件是否存在
    const getResp = await fetch(url + '?ref=' + branch, {
      headers: { 'Authorization': 'Bearer ' + pat, 'Accept': 'application/vnd.github.v3+json' }
    });
    let sha = null;
    if (getResp.ok) {
      const existing = await getResp.json();
      sha = existing.sha;
    }

    // 寫入
    const putResp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + pat,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: `feat: ${sha ? 'update' : 'add'} article ${filename}`,
        content: btoa(unescape(encodeURIComponent(content))),
        branch: branch,
        ...(sha ? { sha } : {})
      })
    });

    const result = await putResp.json();
    if (putResp.ok) {
      return new Response(JSON.stringify({ success: true, sha: result.content.sha }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: result.message || 'GitHub API 錯誤' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}