const BASE = "https://my-shop-server-production.up.railway.app/api";

// ─── 상품 ───────────────────────────────────────────

export async function fetchProducts() {
  const res = await fetch(`${BASE}/products`);
  if (!res.ok) throw new Error("상품을 불러오지 못했습니다");
  return res.json();
}

export async function createProduct(product) {
  const res = await fetch(`${BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "상품 추가 실패");
  return data;
}

export async function updateStock(productId, stock) {
  const res = await fetch(`${BASE}/products/${productId}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "재고 수정 실패");
  return data;
}

// ─── 인증 ───────────────────────────────────────────

export async function register(email, password, username) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "회원가입 실패");
  return await login(email, password);
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "로그인 실패");
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("isAdmin", data.isAdmin ? "true" : "false");
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("isAdmin");
}

export function getSavedUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

export function getIsAdmin() {
  return localStorage.getItem("isAdmin") === "true";
}

// ─── 장바구니 ────────────────────────────────────────

export async function updateUsername(username) {
  const user = getSavedUser();
  if (!user) throw new Error("로그인이 필요합니다");
  const res = await fetch(`${BASE}/auth/username`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.id, username }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "아이디 변경 실패");
  // localStorage 업데이트
  const updated = { ...user, username };
  localStorage.setItem("user", JSON.stringify(updated));
  return updated;
}

export async function fetchCart() {
  const user = getSavedUser();
  if (!user) return [];
  const res = await fetch(`${BASE}/cart/${user.id}`);
  if (!res.ok) throw new Error("장바구니를 불러오지 못했습니다");
  return res.json();
}

export async function addToCart(product_id, qty) {
  const user = getSavedUser();
  if (!user) throw new Error("로그인이 필요합니다");
  const res = await fetch(`${BASE}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.id, product_id, qty }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "장바구니 담기 실패");
  return data;
}

export async function updateCartQty(cartId, qty) {
  const res = await fetch(`${BASE}/cart/${cartId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qty }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "수량 변경 실패");
  return data;
}

export async function removeFromCart(cartId) {
  await fetch(`${BASE}/cart/${cartId}`, { method: "DELETE" });
}

// ─── 주문 ───────────────────────────────────────────

export async function createBulkOrder(items, exchange_items, offer_note) {
  const user = getSavedUser();
  if (!user) throw new Error("로그인이 필요합니다");
  const res = await fetch(`${BASE}/orders/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.id, items, exchange_items, offer_note }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "주문 실패");
  return data;
}

export async function fetchOrders() {
  const user = getSavedUser();
  if (!user) return [];
  const res = await fetch(`${BASE}/orders/user/${user.id}`);
  if (!res.ok) throw new Error("주문 내역을 불러오지 못했습니다");
  return res.json();
}

// ─── 관리자 ─────────────────────────────────────────

export async function fetchAllOrders() {
  const res = await fetch(`${BASE}/admin/orders`);
  if (!res.ok) throw new Error("주문 목록을 불러오지 못했습니다");
  return res.json();
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${BASE}/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "상태 변경 실패");
  return data;
}

export async function updateOrderQty(orderId, qty) {
  const res = await fetch(`${BASE}/admin/orders/${orderId}/qty`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qty }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "수량 변경 실패");
  return data;
}

// ─── 채팅 ───────────────────────────────────────────

export async function fetchMessages(orderId) {
  const res = await fetch(`${BASE}/messages/${orderId}`);
  if (!res.ok) throw new Error("메시지를 불러오지 못했습니다");
  return res.json();
}

export async function sendMessage(order_id, content) {
  const user = getSavedUser();
  if (!user) throw new Error("로그인이 필요합니다");
  const res = await fetch(`${BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id, sender_id: user.id, content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "메시지 전송 실패");
  return data;
}