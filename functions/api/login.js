export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 只接受 POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const username = body.username;
    const password = body.password;
    
    // 驗證帳密
    const adminUser = env.ADMIN_USER || 'admin';
    const adminPass = env.ADMIN_PASS || '';
    
    if (username === adminUser && password === adminPass) {
      // 生成簡單 token (base64 編碼)
      const token = btoa(JSON.stringify({ user: username, time: Date.now() }));
      return new Response(JSON.stringify({ success: true, token }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: '帳號或密碼錯誤' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: e.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}