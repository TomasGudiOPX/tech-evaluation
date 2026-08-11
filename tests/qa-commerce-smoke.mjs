const baseUrl = (process.env.QA_BASE_URL ?? 'http://127.0.0.1:18080').replace(/\/$/, '');
const checks = [];

async function request(path, options = {}) {
  const { token, body, headers = {}, ...fetchOptions } = options;
  const requestHeaders = { ...headers };

  if (body !== undefined) {
    requestHeaders['content-type'] = 'application/json';
  }

  if (token) {
    requestHeaders.authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...fetchOptions,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  return { data, status: response.status };
}

function expectStatus(name, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${expected}, received ${actual}`);
  }

  checks.push(name);
}

async function run() {
  const health = await request('/health');
  expectStatus('health', health.status, 200);

  const unauthenticated = await request('/api/auth/profile');
  expectStatus('unauthenticated profile', unauthenticated.status, 401);

  const products = await request('/api/products');
  expectStatus('public catalog', products.status, 200);
  const product = products.data.products?.find((candidate) => candidate.stock > 0);

  if (!product) {
    throw new Error('public catalog: no in-stock product available');
  }

  const email = `qa-smoke-${Date.now()}@example.com`;
  const registration = await request('/api/auth/register', {
    method: 'POST',
    body: { email, password: 'Password123!' },
  });
  expectStatus('customer registration', registration.status, 201);
  const token = registration.data.accessToken;

  const forbiddenAdminWrite = await request('/api/admin/products', {
    method: 'POST',
    token,
    body: {
      name: 'Unauthorized QA Product',
      description: 'Must be rejected by RBAC',
      priceCents: 1000,
      imageUrl: 'https://example.com/unauthorized-qa.png',
      stock: 1,
    },
  });
  expectStatus('customer admin write forbidden', forbiddenAdminWrite.status, 403);

  const added = await request('/api/cart/items', {
    method: 'POST',
    token,
    body: { productId: product.id, quantity: 1 },
  });
  expectStatus('cart add', added.status, 201);

  const key = `qa-smoke-${Date.now()}`;
  const firstCheckout = await request('/api/orders/checkout', {
    method: 'POST',
    token,
    headers: { 'Idempotency-Key': key },
  });
  expectStatus('checkout', firstCheckout.status, 201);

  const retryCheckout = await request('/api/orders/checkout', {
    method: 'POST',
    token,
    headers: { 'Idempotency-Key': key },
  });
  expectStatus('idempotent checkout retry', retryCheckout.status, 201);

  if (firstCheckout.data.order?.id !== retryCheckout.data.order?.id) {
    throw new Error('idempotent checkout retry: order ids differ');
  }
  checks.push('same order returned for checkout retry');

  const cart = await request('/api/cart', { token });
  expectStatus('cart cleared after checkout', cart.status, 200);
  if (cart.data.cart?.items?.length !== 0) {
    throw new Error('cart cleared after checkout: cart still contains items');
  }
  checks.push('cart empty after checkout');

  const orders = await request('/api/orders', { token });
  expectStatus('order history', orders.status, 200);

  console.log(JSON.stringify({ baseUrl, checks, count: checks.length }, null, 2));
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
