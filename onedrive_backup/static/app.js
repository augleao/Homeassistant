async function readJsonOrThrow(response) {
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_e) {
    throw new Error(`Resposta invalida do servidor (HTTP ${response.status}): ${text.slice(0, 180)}`);
  }
  if (!response.ok) {
    throw new Error(data.message || data.error || `Erro HTTP ${response.status}`);
  }
  return data;
}

async function status() {
  try {
    const r = await fetch('api/status');
    const j = await readJsonOrThrow(r);
    document.getElementById('status').innerText = j.authenticated ? 'Authenticated' : 'Not authenticated';
  } catch (e) {
    document.getElementById('status').innerText = `Erro: ${e.message}`;
  }
}

async function authStatusPoll() {
  let j;
  try {
    const r = await fetch('api/auth/device/status');
    j = await readJsonOrThrow(r);
  } catch (e) {
    document.getElementById('auth_message').innerText = `Falha ao consultar status: ${e.message}`;
    return;
  }

  const box = document.getElementById('authbox');
  const msg = document.getElementById('auth_message');
  if (j.verification_uri && j.user_code) {
    box.style.display = 'block';
    const link = document.getElementById('auth_url');
    link.href = j.verification_uri;
    link.innerText = j.verification_uri;
    document.getElementById('auth_code').innerText = j.user_code;
  }

  if (j.status === 'authenticated') {
    msg.innerText = 'Conta vinculada com sucesso.';
    await status();
    return;
  }
  if (j.status === 'error') {
    msg.innerText = 'Falha na autenticacao: ' + (j.message || 'erro desconhecido');
    return;
  }
  if (j.status === 'pending') {
    msg.innerText = j.message || 'Aguardando conclusao do login...';
    setTimeout(authStatusPoll, 3000);
  }
}

document.getElementById('login').addEventListener('click', async () => {
  let j;
  try {
    const r = await fetch('api/auth/device/start', { method: 'POST' });
    j = await readJsonOrThrow(r);
  } catch (e) {
    document.getElementById('authbox').style.display = 'block';
    document.getElementById('auth_message').innerText = `Falha ao iniciar login: ${e.message}`;
    return;
  }

  const box = document.getElementById('authbox');
  box.style.display = 'block';
  if (j.verification_uri && j.user_code) {
    const link = document.getElementById('auth_url');
    link.href = j.verification_uri;
    link.innerText = j.verification_uri;
    document.getElementById('auth_code').innerText = j.user_code;
  }
  document.getElementById('auth_message').innerText = j.message || 'Aguardando conclusao do login...';
  setTimeout(authStatusPoll, 3000);
});

document.getElementById('backup').addEventListener('click', async () => {
  try {
    const r = await fetch('api/backup', { method: 'POST' });
    const j = await readJsonOrThrow(r);
    alert('Backup started: ' + JSON.stringify(j));
  } catch (e) {
    alert('Falha ao iniciar backup: ' + e.message);
  }
});

status();
