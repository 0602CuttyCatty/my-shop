import { useState, useEffect, useRef } from "react";
import { fetchProducts, login, register, logout, getSavedUser, getIsAdmin, fetchCart, addToCart, updateCartQty, removeFromCart, createBulkOrder, fetchOrders, fetchAllOrders, updateOrderStatus, updateOrderQty, updateStock, createProduct, fetchMessages, sendMessage, updateUsername } from "./api";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg: #f9f8f6; --surface: #ffffff; --border: #e8e5e0; --text: #1a1a1a; --muted: #888; --tag-bg: #f0ede8; --radius: 2px; }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }

  .nav { position: sticky; top: 0; z-index: 100; background: var(--bg); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 60px; }
  .nav-logo { font-family: 'DM Serif Display', serif; font-size: 20px; letter-spacing: -0.5px; cursor: pointer; }
  .nav-right { display: flex; gap: 8px; align-items: center; }
  .nav-btn { background: none; border: 1px solid var(--border); border-radius: var(--radius); padding: 7px 16px; font-size: 13px; font-family: inherit; cursor: pointer; color: var(--text); transition: all 0.15s; }
  .nav-btn:hover { background: var(--text); color: white; border-color: var(--text); }
  .nav-btn.primary { background: var(--text); color: white; border-color: var(--text); }
  .nav-btn.primary:hover { opacity: 0.8; }
  .nav-user { font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 12px; }
  .nav-user span { font-weight: 500; color: var(--text); }
  .cart-btn { position: relative; }
  .cart-badge { position: absolute; top: -6px; right: -6px; background: #e65c00; color: white; font-size: 10px; font-weight: 700; border-radius: 100px; padding: 1px 5px; min-width: 16px; text-align: center; }

  .hero { padding: 64px 40px 40px; display: flex; justify-content: center; }
  .search-bar { padding: 0 40px 24px; }
  .search-input { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 16px; font-size: 14px; font-family: inherit; outline: none; background: var(--surface); transition: border-color 0.15s; }
  .search-input:focus { border-color: var(--text); }
  .filter-bar { padding: 0 40px 24px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .filter-hint { font-size: 11px; color: var(--muted); margin-left: 4px; }
  .filter-chip { background: none; border: 1px solid var(--border); border-radius: 100px; padding: 6px 16px; font-size: 12px; font-family: inherit; cursor: pointer; color: var(--muted); transition: all 0.15s; letter-spacing: 0.3px; }
  .filter-chip:hover { border-color: var(--text); color: var(--text); }
  .filter-chip.active { background: var(--text); color: white; border-color: var(--text); }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1px; background: var(--border); border-top: 1px solid var(--border); border-left: 1px solid var(--border); margin: 0 40px 60px; }
  .card { background: var(--surface); cursor: pointer; transition: background 0.15s; display: flex; flex-direction: column; }
  .card:hover { background: #faf9f7; }
  .card-img { width: 100%; aspect-ratio: 1; overflow: hidden; background: var(--tag-bg); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
  .card-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease; }
  .card:hover .card-img img { transform: scale(1.04); }
  .card-img-placeholder { font-size: 48px; }
  .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .cat-tags { display: flex; gap: 4px; flex-wrap: wrap; }
  .cat-tag { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); background: var(--tag-bg); padding: 2px 8px; border-radius: 100px; }
  .card-name { font-size: 15px; font-weight: 500; line-height: 1.3; }
  .card-footer { display: flex; align-items: center; justify-content: flex-end; margin-top: auto; padding-top: 12px; }
  .stock-badge { font-size: 10px; letter-spacing: 0.5px; padding: 3px 8px; border-radius: 100px; font-weight: 500; }
  .stock-ok { background: #e8f4e8; color: #2d7a2d; }
  .stock-low { background: #fff3e0; color: #e65c00; }
  .stock-out { background: #fce8e8; color: #c0392b; }

  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; animation: fadeIn 0.15s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal { background: var(--surface); width: 100%; max-width: 480px; border-radius: 4px; overflow: hidden; animation: slideUp 0.2s ease; }
  @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-header { padding: 24px 28px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .modal-title { font-family: 'DM Serif Display', serif; font-size: 20px; }
  .modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: var(--muted); line-height: 1; }
  .modal-body { padding: 28px; display: flex; flex-direction: column; gap: 16px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field label { font-size: 12px; letter-spacing: 0.5px; color: var(--muted); text-transform: uppercase; }
  .field input, .field textarea { border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 14px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s; resize: vertical; }
  .field input:focus, .field textarea:focus { border-color: var(--text); }
  .submit-btn { width: 100%; background: var(--text); color: white; border: none; padding: 12px; font-size: 14px; font-family: inherit; font-weight: 500; cursor: pointer; border-radius: var(--radius); margin-top: 4px; transition: opacity 0.15s; }
  .submit-btn:hover { opacity: 0.8; }
  .modal-switch { text-align: center; font-size: 13px; color: var(--muted); }
  .modal-switch button { background: none; border: none; color: var(--text); font-size: 13px; font-family: inherit; cursor: pointer; text-decoration: underline; }

  .detail-modal { max-width: 560px; max-height: 90vh; overflow-y: auto; }
  .detail-img { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: var(--tag-bg); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--border); }
  .detail-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .detail-img-placeholder { font-size: 80px; }
  .detail-header { padding: 20px 28px 0; display: flex; justify-content: space-between; align-items: flex-start; }
  .detail-body { padding: 16px 28px 28px; display: flex; flex-direction: column; gap: 14px; }
  .detail-name { font-family: 'DM Serif Display', serif; font-size: 26px; line-height: 1.1; }
  .detail-desc { font-size: 14px; color: var(--muted); line-height: 1.6; font-weight: 300; }
  .stock-warn { font-size: 12px; color: #e65c00; }

  .qty-section { display: flex; flex-direction: column; gap: 10px; padding: 16px 0; border-top: 1px solid var(--border); }
  .qty-label { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); }
  .qty-controls { display: flex; align-items: center; border: 1px solid var(--border); border-radius: var(--radius); width: fit-content; overflow: hidden; }
  .qty-unit-btn { background: none; border: none; border-right: 1px solid var(--border); padding: 8px 14px; font-size: 12px; font-family: inherit; cursor: pointer; color: var(--muted); transition: all 0.12s; }
  .qty-unit-btn:last-child { border-right: none; border-left: 1px solid var(--border); }
  .qty-unit-btn:hover { background: var(--tag-bg); color: var(--text); }
  .qty-display { padding: 8px 20px; font-size: 15px; font-weight: 500; min-width: 72px; text-align: center; background: none; border: none; font-family: inherit; outline: none; color: var(--text); }
  .qty-display::-webkit-inner-spin-button, .qty-display::-webkit-outer-spin-button { -webkit-appearance: none; }

  .add-cart-btn { width: 100%; background: var(--text); color: white; border: none; padding: 12px 28px; font-size: 14px; font-family: inherit; font-weight: 500; cursor: pointer; border-radius: var(--radius); transition: opacity 0.15s; }
  .add-cart-btn:hover:not(:disabled) { opacity: 0.8; }
  .add-cart-btn:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; }

  /* 장바구니 */
  .cart-page { padding: 48px 40px; max-width: 720px; }
  .cart-page h2 { font-family: 'DM Serif Display', serif; font-size: 32px; margin-bottom: 32px; }
  .cart-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); border: 1px solid var(--border); margin-bottom: 28px; }
  .cart-item { background: var(--surface); padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
  .cart-item-img { width: 56px; height: 56px; border-radius: 4px; overflow: hidden; background: var(--tag-bg); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
  .cart-item-info { flex: 1; }
  .cart-item-name { font-size: 15px; font-weight: 500; }
  .cart-item-cats { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .cart-qty-controls { display: flex; align-items: center; gap: 0; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; flex-shrink: 0; }
  .cart-qty-btn { background: none; border: none; padding: 6px 12px; font-size: 14px; cursor: pointer; color: var(--muted); transition: all 0.12s; }
  .cart-qty-btn:hover { background: var(--tag-bg); color: var(--text); }
  .cart-qty-num { padding: 6px 14px; font-size: 14px; font-weight: 500; border-left: 1px solid var(--border); border-right: 1px solid var(--border); min-width: 44px; text-align: center; }
  .cart-remove-btn { background: none; border: none; padding: 6px 10px; font-size: 16px; cursor: pointer; color: var(--muted); transition: color 0.12s; flex-shrink: 0; }
  .cart-remove-btn:hover { color: #c0392b; }

  .cart-offer-section { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
  .cart-offer-title { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); }
  .offer-items { display: flex; flex-direction: column; gap: 8px; }
  .offer-item-row { display: flex; gap: 8px; align-items: center; }
  .offer-item-name { flex: 1; border: 1px solid var(--border); border-radius: var(--radius); padding: 9px 12px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s; }
  .offer-item-name:focus { border-color: var(--text); }
  .offer-item-qty { width: 72px; border: 1px solid var(--border); border-radius: var(--radius); padding: 9px 12px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s; text-align: center; }
  .offer-item-qty:focus { border-color: var(--text); }
  .offer-item-qty::-webkit-inner-spin-button, .offer-item-qty::-webkit-outer-spin-button { -webkit-appearance: none; }
  .offer-remove-btn { background: none; border: 1px solid var(--border); border-radius: var(--radius); width: 34px; height: 34px; cursor: pointer; color: var(--muted); font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.12s; flex-shrink: 0; }
  .offer-remove-btn:hover { border-color: #c0392b; color: #c0392b; }
  .offer-add-btn { background: none; border: 1px dashed var(--border); border-radius: var(--radius); padding: 9px; font-size: 13px; font-family: inherit; cursor: pointer; color: var(--muted); transition: all 0.12s; width: 100%; }
  .offer-add-btn:hover { border-color: var(--text); color: var(--text); }

  .cart-summary { background: var(--tag-bg); border-radius: var(--radius); padding: 16px 20px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
  .cart-summary-row { display: flex; justify-content: space-between; font-size: 13px; }
  .cart-summary-row span:first-child { color: var(--muted); }
  .cart-order-btn { width: 100%; background: var(--text); color: white; border: none; padding: 14px; font-size: 15px; font-family: inherit; font-weight: 500; cursor: pointer; border-radius: var(--radius); transition: opacity 0.15s; }
  .cart-order-btn:hover { opacity: 0.8; }
  .cart-order-btn:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; }

  /* 마이페이지 */
  .mypage { padding: 48px 40px; max-width: 720px; }
  .mypage h2 { font-family: 'DM Serif Display', serif; font-size: 32px; margin-bottom: 8px; }
  .mypage-sub { color: var(--muted); font-size: 14px; margin-bottom: 36px; }
  .section-title { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
  .order-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); margin-bottom: 40px; }
  .order-item { background: var(--surface); padding: 18px 20px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; cursor: pointer; transition: background 0.15s; }
  .order-item:hover { background: #faf9f7; }
  .order-item-left { display: flex; flex-direction: column; gap: 5px; flex: 1; }
  .order-name { font-size: 15px; font-weight: 500; }
  .order-meta { font-size: 12px; color: var(--muted); }
  .order-exchange-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 2px; }
  .order-exchange-tag { font-size: 11px; background: var(--tag-bg); border-radius: 100px; padding: 2px 10px; color: var(--text); }
  .order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .status-badge { font-size: 10px; letter-spacing: 0.5px; padding: 3px 8px; border-radius: 100px; font-weight: 500; }
  .status-pending   { background: #fff3e0; color: #e65c00; }
  .status-confirmed { background: #e8f4e8; color: #2d7a2d; }
  .status-delivered { background: #e8eaf6; color: #3949ab; }
  .status-cancelled { background: #fce8e8; color: #c0392b; }
  .empty-state { text-align: center; padding: 48px 0; color: var(--muted); font-size: 14px; }

  /* 관리자 */
  .admin { padding: 48px 40px; max-width: 900px; }
  .admin h2 { font-family: 'DM Serif Display', serif; font-size: 32px; margin-bottom: 24px; }
  .admin-tabs { display: flex; gap: 0; margin-bottom: 28px; border-bottom: 1px solid var(--border); }
  .admin-tab { background: none; border: none; border-bottom: 2px solid transparent; padding: 10px 20px; font-size: 14px; font-family: inherit; cursor: pointer; color: var(--muted); transition: all 0.15s; margin-bottom: -1px; }
  .admin-tab.active { color: var(--text); border-bottom-color: var(--text); font-weight: 500; }
  .admin-toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; }
  .admin-search { border: 1px solid var(--border); border-radius: var(--radius); padding: 8px 14px; font-size: 13px; font-family: inherit; outline: none; transition: border-color 0.15s; min-width: 180px; }
  .admin-search:focus { border-color: var(--text); }
  .admin-order-item { background: var(--surface); padding: 18px 20px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; cursor: pointer; transition: background 0.15s; }
  .admin-order-item:hover { background: #faf9f7; }
  .admin-order-meta { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .admin-username { font-size: 12px; font-weight: 500; color: var(--text); background: var(--tag-bg); padding: 1px 8px; border-radius: 100px; margin-left: 6px; }
  .status-select { border: 1px solid var(--border); border-radius: var(--radius); padding: 6px 10px; font-size: 12px; font-family: inherit; outline: none; background: var(--surface); cursor: pointer; }
  .qty-edit-row { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
  .qty-edit-input { width: 70px; border: 1px solid var(--border); border-radius: var(--radius); padding: 5px 8px; font-size: 12px; font-family: inherit; outline: none; text-align: center; }
  .qty-edit-btn { background: none; border: 1px solid var(--border); border-radius: var(--radius); padding: 5px 10px; font-size: 11px; font-family: inherit; cursor: pointer; color: var(--muted); transition: all 0.12s; }
  .qty-edit-btn:hover { border-color: var(--text); color: var(--text); }
  .stock-edit-input { width: 70px; border: 1px solid var(--border); border-radius: var(--radius); padding: 5px 8px; font-size: 12px; font-family: inherit; outline: none; text-align: center; }
  .stock-edit-btn { background: none; border: 1px solid var(--border); border-radius: var(--radius); padding: 5px 10px; font-size: 11px; font-family: inherit; cursor: pointer; color: var(--muted); transition: all 0.12s; }
  .stock-edit-btn:hover { border-color: var(--text); color: var(--text); }
  .product-manage-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); margin-bottom: 32px; }
  .product-manage-item { background: var(--surface); padding: 14px 20px; display: flex; align-items: center; gap: 16px; }
  .product-manage-img { width: 48px; height: 48px; border-radius: 4px; background: var(--tag-bg); flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .product-manage-img img { width: 100%; height: 100%; object-fit: cover; }
  .product-manage-info { flex: 1; }
  .product-manage-name { font-size: 14px; font-weight: 500; }
  .product-manage-cats { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .product-manage-stock-row { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .add-product-form { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 24px; display: flex; flex-direction: column; gap: 14px; }
  .add-product-form h3 { font-family: 'DM Serif Display', serif; font-size: 18px; margin-bottom: 4px; }
  .form-row { display: flex; gap: 12px; }
  .form-row .field { flex: 1; }

  /* 채팅 */
  .chat-modal { max-width: 480px; height: 580px; display: flex; flex-direction: column; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; background: var(--bg); }
  .chat-bubble { max-width: 75%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
  .chat-bubble.mine { align-self: flex-end; background: var(--text); color: white; border-bottom-right-radius: 4px; }
  .chat-bubble.theirs { align-self: flex-start; background: var(--surface); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
  .chat-bubble .chat-time { font-size: 10px; opacity: 0.6; margin-top: 4px; text-align: right; }
  .chat-input-row { display: flex; gap: 8px; padding: 16px 20px; border-top: 1px solid var(--border); background: var(--surface); }
  .chat-input { flex: 1; border: 1px solid var(--border); border-radius: var(--radius); padding: 9px 12px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s; }
  .chat-input:focus { border-color: var(--text); }
  .chat-send-btn { background: var(--text); color: white; border: none; border-radius: var(--radius); padding: 9px 16px; font-size: 13px; font-family: inherit; cursor: pointer; transition: opacity 0.15s; white-space: nowrap; }
  .chat-send-btn:hover { opacity: 0.8; }
  .chat-order-info { padding: 12px 20px; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--muted); background: var(--surface); }
  .chat-order-info strong { color: var(--text); }

  .toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: var(--text); color: white; padding: 12px 24px; border-radius: 100px; font-size: 13px; z-index: 999; animation: toastIn 0.2s ease; white-space: nowrap; }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  @media (max-width: 640px) {
    .nav { padding: 0 16px; height: 54px; }
    .nav-logo { font-size: 16px; }
    .nav-btn { padding: 6px 10px; font-size: 12px; }
    .nav-user { gap: 6px; }
    .nav-user span { display: none; }

    .hero { padding: 32px 16px 24px; }
    .hero img { max-width: 200px !important; }

    .search-bar { padding: 0 16px 16px; }
    .filter-bar { padding: 0 16px 16px; gap: 6px; }
    .filter-chip { padding: 5px 12px; font-size: 11px; }

    .grid { margin: 0 0 40px; grid-template-columns: repeat(2, 1fr); }
    .card-body { padding: 12px; }
    .card-name { font-size: 13px; }

    .overlay { padding: 12px; align-items: flex-end; }
    .modal { max-width: 100%; border-radius: 12px 12px 0 0; }
    .detail-modal { max-height: 92vh; border-radius: 12px 12px 0 0; }
    .chat-modal { height: 92vh; border-radius: 12px 12px 0 0; }

    .mypage { padding: 28px 16px; }
    .mypage h2 { font-size: 24px; }
    .cart-page { padding: 28px 16px; }
    .cart-page h2 { font-size: 24px; }
    .admin { padding: 28px 16px; }
    .admin h2 { font-size: 24px; }

    .qty-controls { flex-wrap: wrap; }
    .qty-unit-btn { padding: 8px 10px; font-size: 11px; }

    .cart-item { gap: 10px; }
    .cart-item-img { width: 44px; height: 44px; }
    .cart-item-name { font-size: 13px; }

    .admin-toolbar { gap: 6px; }
    .admin-search { min-width: 120px; width: 100%; }

    .product-manage-item { flex-wrap: wrap; gap: 10px; }
    .product-manage-stock-row { width: 100%; }

    .form-row { flex-direction: column; }

    .offer-item-row { flex-wrap: nowrap; }
    .offer-item-qty { width: 60px; }
  }
`;

const CATEGORIES = ["전체", "2026", "2025", "2024", "2023", "2022", "2021", "잡", "한정", "인기"];
const STATUS_FILTERS = ["전체", "pending", "confirmed", "delivered", "cancelled"];
const STATUS_LABELS = { pending: "신청 대기", confirmed: "주문 확정", delivered: "배송 완료", cancelled: "주문 취소" };

function stockLabel(s) {
  if (s === 0) return { text: "품절", cls: "stock-out" };
  if (s <= 5) return { text: `잔여 ${s}개`, cls: "stock-low" };
  return { text: `재고 ${s}개`, cls: "stock-ok" };
}
function statusLabel(s) {
  const map = { pending: { text: "신청 대기", cls: "status-pending" }, confirmed: { text: "주문 확정", cls: "status-confirmed" }, delivered: { text: "배송 완료", cls: "status-delivered" }, cancelled: { text: "주문 취소", cls: "status-cancelled" } };
  return map[s] || { text: s, cls: "" };
}
function ProductImg({ url, large, small }) {
  const [err, setErr] = useState(false);
  const cls = large ? "detail-img-placeholder" : small ? "" : "card-img-placeholder";
  if (!url || err) return <span className={cls}>📦</span>;
  return <img src={url} alt="" onError={() => setErr(true)} />;
}
function newItem() { return { id: Date.now() + Math.random(), name: "", qty: 1 }; }

export default function App() {
  const [user, setUser] = useState(getSavedUser());
  const [isAdmin, setIsAdmin] = useState(getIsAdmin());
  const [page, setPage] = useState("home");
  const [modal, setModal] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [activeCategories, setActiveCategories] = useState(["전체"]);
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [orders, setOrders] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [chatOrder, setChatOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [adminStatusFilter, setAdminStatusFilter] = useState("전체");
  const [adminUserSearch, setAdminUserSearch] = useState("");
  const [adminTab, setAdminTab] = useState("orders");
  const [newProduct, setNewProduct] = useState({ id: "", name: "", categories: "", stock: "", image_url: "", description: "" });
  const [stockEdits, setStockEdits] = useState({});
  const [qtyEdits, setQtyEdits] = useState({});
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("전체");
  const [usernameEdit, setUsernameEdit] = useState("");
  const [showUsernameEdit, setShowUsernameEdit] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => showToast("상품을 불러오지 못했습니다")).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders().then(setOrders).catch(() => showToast("주문 내역을 불러오지 못했습니다"));
      fetchCart().then(setCart).catch(() => {});
      if (getIsAdmin()) fetchAllOrders().then(setAdminOrders).catch(() => showToast("주문 목록을 불러오지 못했습니다"));
    } else {
      setOrders([]); setAdminOrders([]); setCart([]);
    }
  }, [user]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  function toggleCategory(cat) {
    if (cat === "전체") { setActiveCategories(["전체"]); return; }
    setActiveCategories(prev => {
      const w = prev.filter(c => c !== "전체");
      if (w.includes(cat)) { const n = w.filter(c => c !== cat); return n.length === 0 ? ["전체"] : n; }
      if (w.length >= 3) return prev;
      return [...w, cat];
    });
  }

  const filtered = (activeCategories.includes("전체") ? products : products.filter(p => p.categories?.some(c => activeCategories.includes(c))))
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const filteredAdminOrders = adminOrders
    .filter(o => adminStatusFilter === "전체" || o.status === adminStatusFilter)
    .filter(o => !adminUserSearch || (o.profiles?.username || "").toLowerCase().includes(adminUserSearch.toLowerCase()));

  const filteredManageProducts = products
    .filter(p => productCategoryFilter === "전체" || p.categories?.includes(productCategoryFilter))
    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  async function handleAuth(e) {
    e.preventDefault();
    try {
      const data = authMode === "login"
        ? await login(form.email, form.password)
        : await register(form.email, form.password, form.username);
      setUser(data.user); setIsAdmin(data.isAdmin);
      showToast(authMode === "login" ? "로그인 되었습니다" : "회원가입 완료!");
      setModal(null); setForm({ email: "", password: "", username: "" });
    } catch (err) { showToast(err.message); }
  }

  function handleLogout() { logout(); setUser(null); setIsAdmin(false); setCart([]); setPage("home"); showToast("로그아웃 되었습니다"); }
  function openDetail(product) { setModal(product); setQty(1); }
  function adjustQty(delta) { setQty(prev => Math.max(1, prev + delta)); }

  async function handleUsernameUpdate(e) {
    e.preventDefault();
    if (!usernameEdit.trim()) return showToast("아이디를 입력해주세요");
    try {
      const updated = await updateUsername(usernameEdit.trim());
      setUser(updated);
      setShowUsernameEdit(false);
      setUsernameEdit("");
      if (isAdmin) fetchAllOrders().then(setAdminOrders).catch(() => {});
      showToast("아이디가 변경되었습니다");
    } catch (err) { showToast(err.message); }
  }

  async function handleAddToCart() {
    if (!user) { setModal("auth"); setAuthMode("login"); return; }
    const product = modal;
    try {
      const updated = await addToCart(product.id, qty);
      setCart(prev => {
        const exists = prev.find(c => c.product_id === product.id);
        if (exists) return prev.map(c => c.product_id === product.id ? { ...c, qty: c.qty + qty } : c);
        return [...prev, { ...updated, products: product }];
      });
      setModal(null);
      showToast(`장바구니에 담았어요 (${qty}개)`);
    } catch (err) { showToast(err.message); }
  }

  async function handleCartQty(cartId, newQty) {
    try {
      if (newQty <= 0) {
        await removeFromCart(cartId);
        setCart(prev => prev.filter(c => c.id !== cartId));
      } else {
        await updateCartQty(cartId, newQty);
        setCart(prev => prev.map(c => c.id === cartId ? { ...c, qty: newQty } : c));
      }
    } catch (err) { showToast(err.message); }
  }

  async function handleCartOrder() {
    if (cart.length === 0) return showToast("장바구니가 비어있습니다");
    const validExchange = cartExchangeItems.filter(i => i.name.trim() !== "");
    try {
      const items = cart.map(c => ({ product_id: c.product_id, qty: c.qty, cart_id: c.id }));
      await createBulkOrder(items, validExchange.map(i => ({ name: i.name.trim(), qty: i.qty })));
      setCart([]);
      setCartExchangeItems([newItem()]);
      const updated = await fetchOrders();
      setOrders(updated);
      showToast("주문 신청이 완료되었습니다!");
      setPage("mypage");
    } catch (err) { showToast(err.message); }
  }

  function updateCartExchangeItem(id, field, value) { setCartExchangeItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i)); }
  function addCartExchangeItem() { setCartExchangeItems(prev => [...prev, newItem()]); }
  function removeCartExchangeItem(id) { setCartExchangeItems(prev => prev.length === 1 ? prev : prev.filter(i => i.id !== id)); }

  async function handleStatusChange(orderId, status) {
    try {
      await updateOrderStatus(orderId, status);
      setAdminOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (status === "confirmed" || status === "cancelled") {
        const refreshed = await fetchProducts(); setProducts(refreshed);
      }
      showToast("상태가 변경되었습니다");
    } catch (err) { showToast(err.message); }
  }

  async function handleQtyChange(orderId) {
    const newQty = parseInt(qtyEdits[orderId]);
    if (isNaN(newQty) || newQty < 1) return showToast("올바른 수량을 입력해주세요");
    try {
      await updateOrderQty(orderId, newQty);
      setAdminOrders(prev => prev.map(o => o.id === orderId ? { ...o, qty: newQty } : o));
      setQtyEdits(prev => { const n = { ...prev }; delete n[orderId]; return n; });
      showToast("수량이 변경되었습니다");
    } catch (err) { showToast(err.message); }
  }

  async function handleStockUpdate(productId) {
    const newStock = parseInt(stockEdits[productId]);
    if (isNaN(newStock) || newStock < 0) return showToast("올바른 재고 수량을 입력해주세요");
    try {
      await updateStock(productId, newStock);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      setStockEdits(prev => { const n = { ...prev }; delete n[productId]; return n; });
      showToast("재고가 수정되었습니다");
    } catch (err) { showToast(err.message); }
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    try {
      const product = {
        id: parseInt(newProduct.id),
        name: newProduct.name,
        categories: newProduct.categories.split(",").map(c => c.trim()).filter(Boolean),
        stock: parseInt(newProduct.stock) || 0,
        image_url: newProduct.image_url,
        description: newProduct.description,
      };
      const added = await createProduct(product);
      setProducts(prev => [...prev, added]);
      setNewProduct({ id: "", name: "", categories: "", stock: "", image_url: "", description: "" });
      showToast("상품이 추가되었습니다");
    } catch (err) { showToast(err.message); }
  }

  async function openChat(order) {
    setChatOrder(order);
    try { setMessages(await fetchMessages(order.id)); } catch { setMessages([]); }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    try {
      const msg = await sendMessage(chatOrder.id, chatInput.trim());
      setMessages(prev => [...prev, msg]); setChatInput("");
    } catch (err) { showToast(err.message); }
  }

  const pendingOrders = orders.filter(o => o.status === "pending");
  const doneOrders = orders.filter(o => o.status !== "pending");

  function OrderRow({ o }) {
    const s = statusLabel(o.status);
    const name = o.products?.name || "-";
    const exchangeList = o.exchange_items || [];
    const date = new Date(o.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
    return (
      <div className="order-item" onClick={() => openChat(o)}>
        <div className="order-item-left">
          <div className="order-name">{name} <span style={{ fontWeight: 300, fontSize: 13 }}>× {o.qty}</span></div>
          <div className="order-meta">{date} · #{o.id} · <span style={{ color: "var(--text)" }}>💬 채팅</span></div>
          {exchangeList.length > 0 && <div className="order-exchange-tags">{exchangeList.map((ei, i) => <span key={i} className="order-exchange-tag">↩ {ei.name} × {ei.qty}</span>)}</div>}
        </div>
        <div className="order-right"><span className={`status-badge ${s.cls}`}>{s.text}</span></div>
      </div>
    );
  }

  return (
    <>
      <style>{style}</style>

      <nav className="nav">
        <div className="nav-logo" onClick={() => setPage("home")}>외계별 문구점</div>
        <div className="nav-right">
          {user ? (
            <div className="nav-user">
              <span>{user.username || user.email?.split("@")[0]}</span>
              {isAdmin && <button className="nav-btn primary" onClick={() => setPage("admin")}>관리자</button>}
              <button className="nav-btn cart-btn" onClick={() => setPage("cart")}>
                🛒 장바구니
                {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
              </button>
              <button className="nav-btn" onClick={() => setPage("mypage")}>마이페이지</button>
              <button className="nav-btn" onClick={handleLogout}>로그아웃</button>
            </div>
          ) : (
            <>
              <button className="nav-btn" onClick={() => { setAuthMode("login"); setModal("auth"); }}>로그인</button>
              <button className="nav-btn primary" onClick={() => { setAuthMode("register"); setModal("auth"); }}>회원가입</button>
            </>
          )}
        </div>
      </nav>

      {/* HOME */}
      {page === "home" && (
        <>
          <div className="hero">
            <img src="/malon.png" alt="MALON" style={{ maxWidth: "320px", width: "100%", display: "block" }} />
          </div>
          <div className="search-bar">
            <input className="search-input" placeholder="상품 이름 검색..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-bar">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`filter-chip ${activeCategories.includes(cat) ? "active" : ""}`} onClick={() => toggleCategory(cat)}>{cat}</button>
            ))}
            {!activeCategories.includes("전체") && <span className="filter-hint">{activeCategories.length}/3 선택됨</span>}
          </div>
          <div className="grid">
            {loading
              ? <div style={{ padding: 48, color: "var(--muted)", fontSize: 14 }}>상품을 불러오는 중...</div>
              : filtered.map(product => {
                  const s = stockLabel(product.stock);
                  return (
                    <div key={product.id} className="card" onClick={() => openDetail(product)}>
                      <div className="card-img"><ProductImg url={product.image_url} /></div>
                      <div className="card-body">
                        <div className="cat-tags">{product.categories?.map(c => <span key={c} className="cat-tag">{c}</span>)}</div>
                        <div className="card-name">{product.name}</div>
                        <div className="card-footer"><span className={`stock-badge ${s.cls}`}>{s.text}</span></div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </>
      )}

      {/* 장바구니 */}
      {page === "cart" && user && (
        <div className="cart-page">
          <h2>장바구니</h2>
          {cart.length === 0 ? (
            <div className="empty-state">장바구니가 비어있습니다</div>
          ) : (
            <>
              <div className="cart-list">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-img">
                      {item.products?.image_url ? <img src={item.products.image_url} alt="" onError={e => e.target.style.display="none"} /> : "📦"}
                    </div>
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.products?.name}</div>
                      <div className="cart-item-cats">{item.products?.categories?.join(", ")}</div>
                    </div>
                    <div className="cart-qty-controls">
                      <button className="cart-qty-btn" onClick={() => handleCartQty(item.id, item.qty - 1)}>−</button>
                      <span className="cart-qty-num">{item.qty}</span>
                      <button className="cart-qty-btn" onClick={() => handleCartQty(item.id, item.qty + 1)}>+</button>
                    </div>
                    <button className="cart-remove-btn" onClick={() => handleCartQty(item.id, 0)}>×</button>
                  </div>
                ))}
              </div>

              {/* 교환 아이템 */}
              <div className="cart-offer-section">
                <div className="cart-offer-title">교환 아이템 제시 <span style={{ fontWeight: 300, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>(선택사항)</span></div>
                <div className="offer-items">
                  {cartExchangeItems.map(item => (
                    <div key={item.id} className="offer-item-row">
                      <input className="offer-item-name" placeholder="아이템 이름" value={item.name} onChange={e => updateCartExchangeItem(item.id, "name", e.target.value)} />
                      <input className="offer-item-qty" type="number" min="1" placeholder="개수" value={item.qty} onChange={e => updateCartExchangeItem(item.id, "qty", Math.max(1, parseInt(e.target.value) || 1))} />
                      <button className="offer-remove-btn" onClick={() => removeCartExchangeItem(item.id)}>×</button>
                    </div>
                  ))}
                  <button className="offer-add-btn" onClick={addCartExchangeItem}>+ 아이템 추가</button>
                </div>
              </div>

              {/* 요약 */}
              <div className="cart-summary">
                <div className="cart-summary-row"><span>총 상품 수</span><span>{cart.reduce((s, c) => s + c.qty, 0)}개</span></div>
                <div className="cart-summary-row"><span>교환 제시</span><span>{cartExchangeItems.filter(i => i.name.trim()).length}종</span></div>
              </div>

              <button className="cart-order-btn" onClick={handleCartOrder}>주문 신청하기</button>
            </>
          )}
        </div>
      )}

      {/* 마이페이지 */}
      {page === "mypage" && user && (
        <div className="mypage">
          <h2>안녕하세요,<br />{user.username || user.email?.split("@")[0]}님</h2>
          <div className="mypage-sub">{user.email}</div>

          {/* 아이디 변경 */}
          <div style={{ marginBottom: 36 }}>
            <div className="section-title">계정 설정</div>
            {!showUsernameEdit ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 14 }}>아이디: <strong>{user.username || "-"}</strong></span>
                <button className="nav-btn" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => { setShowUsernameEdit(true); setUsernameEdit(user.username || ""); }}>변경</button>
              </div>
            ) : (
              <form onSubmit={handleUsernameUpdate} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 12px", fontSize: 14, fontFamily: "inherit", outline: "none" }}
                  placeholder="새 아이디"
                  value={usernameEdit}
                  onChange={e => setUsernameEdit(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="nav-btn primary" style={{ fontSize: 12, padding: "5px 12px" }}>저장</button>
                <button type="button" className="nav-btn" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setShowUsernameEdit(false)}>취소</button>
              </form>
            )}
          </div>
          <div className="section-title">주문 신청 대기 ({pendingOrders.length})</div>
          <div className="order-list">
            {pendingOrders.length === 0 ? <div className="empty-state">신청 대기 중인 주문이 없습니다</div> : pendingOrders.map(o => <OrderRow key={o.id} o={o} />)}
          </div>
          <div className="section-title">주문 내역</div>
          <div className="order-list">
            {doneOrders.length === 0 ? <div className="empty-state">주문 내역이 없습니다</div> : doneOrders.map(o => <OrderRow key={o.id} o={o} />)}
          </div>
        </div>
      )}

      {/* 관리자 */}
      {page === "admin" && isAdmin && (
        <div className="admin">
          <h2>관리자</h2>
          <div className="admin-tabs">
            <button className={`admin-tab ${adminTab === "orders" ? "active" : ""}`} onClick={() => setAdminTab("orders")}>주문 관리</button>
            <button className={`admin-tab ${adminTab === "products" ? "active" : ""}`} onClick={() => setAdminTab("products")}>상품 관리</button>
          </div>

          {adminTab === "orders" && (
            <>
              <div className="admin-toolbar">
                {STATUS_FILTERS.map(f => (
                  <button key={f} className={`filter-chip ${adminStatusFilter === f ? "active" : ""}`} onClick={() => setAdminStatusFilter(f)}>
                    {f === "전체" ? "전체" : STATUS_LABELS[f]}
                  </button>
                ))}
                <input className="admin-search" placeholder="아이디로 검색..." value={adminUserSearch} onChange={e => setAdminUserSearch(e.target.value)} />
              </div>
              <div className="order-list">
                {filteredAdminOrders.length === 0
                  ? <div className="empty-state">주문이 없습니다</div>
                  : filteredAdminOrders.map(o => {
                      const s = statusLabel(o.status);
                      const exchangeList = o.exchange_items || [];
                      const username = o.profiles?.username || "-";
                      return (
                        <div key={o.id} className="admin-order-item" onClick={() => openChat(o)}>
                          <div className="order-item-left">
                            <div className="order-name">
                              {o.products?.name} <span style={{ fontWeight: 300, fontSize: 13 }}>× {o.qty}</span>
                              <span className="admin-username">@{username}</span>
                            </div>
                            <div className="admin-order-meta">{new Date(o.created_at).toLocaleDateString("ko-KR")} · #{o.id}</div>
                            {exchangeList.length > 0 && <div className="order-exchange-tags" style={{ marginTop: 6 }}>{exchangeList.map((ei, i) => <span key={i} className="order-exchange-tag">↩ {ei.name} × {ei.qty}</span>)}</div>}
                            {/* 수량 변경 */}
                            <div className="qty-edit-row" onClick={e => e.stopPropagation()}>
                              <span style={{ fontSize: 11, color: "var(--muted)" }}>수량 변경:</span>
                              <input className="qty-edit-input" type="number" min="1" placeholder={String(o.qty)} value={qtyEdits[o.id] ?? ""} onChange={e => setQtyEdits(prev => ({ ...prev, [o.id]: e.target.value }))} />
                              <button className="qty-edit-btn" onClick={() => handleQtyChange(o.id)}>변경</button>
                            </div>
                          </div>
                          <div className="order-right" onClick={e => e.stopPropagation()}>
                            <select className="status-select" value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}>
                              <option value="pending">신청 대기</option>
                              <option value="confirmed">주문 확정</option>
                              <option value="delivered">배송 완료</option>
                              <option value="cancelled">주문 취소</option>
                            </select>
                            <span className={`status-badge ${s.cls}`} style={{ marginTop: 6 }}>{s.text}</span>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </>
          )}

          {adminTab === "products" && (
            <>
              <div className="add-product-form">
                <h3>새 상품 추가</h3>
                <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="form-row">
                    <div className="field"><label>상품 ID (숫자)</label><input placeholder="4600" required value={newProduct.id} onChange={e => setNewProduct(p => ({ ...p, id: e.target.value }))} /></div>
                    <div className="field"><label>재고</label><input type="number" placeholder="100" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))} /></div>
                  </div>
                  <div className="field"><label>상품 이름</label><input placeholder="상품 이름" required value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} /></div>
                  <div className="field"><label>카테고리 (쉼표로 구분)</label><input placeholder="잡, 2026" value={newProduct.categories} onChange={e => setNewProduct(p => ({ ...p, categories: e.target.value }))} /></div>
                  <div className="field"><label>이미지 URL</label><input placeholder="https://..." value={newProduct.image_url} onChange={e => setNewProduct(p => ({ ...p, image_url: e.target.value }))} /></div>
                  <div className="field"><label>설명</label><input placeholder="Created by ..." value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} /></div>
                  <button type="submit" className="submit-btn">상품 추가</button>
                </form>
              </div>

              <div className="admin-toolbar" style={{ marginTop: 24 }}>
                <input className="admin-search" placeholder="상품 이름 검색..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                {CATEGORIES.map(cat => (
                  <button key={cat} className={`filter-chip ${productCategoryFilter === cat ? "active" : ""}`} onClick={() => setProductCategoryFilter(cat)}>{cat}</button>
                ))}
              </div>
              <div className="product-manage-list">
                {filteredManageProducts.map(p => {
                  const s = stockLabel(p.stock);
                  return (
                    <div key={p.id} className="product-manage-item">
                      <div className="product-manage-img">
                        {p.image_url ? <img src={p.image_url} alt="" onError={e => e.target.style.display="none"} /> : "📦"}
                      </div>
                      <div className="product-manage-info">
                        <div className="product-manage-name">{p.name}</div>
                        <div className="product-manage-cats">{p.categories?.join(", ")}</div>
                      </div>
                      <div className="product-manage-stock-row">
                        <span className={`stock-badge ${s.cls}`}>{s.text}</span>
                        <input className="stock-edit-input" type="number" placeholder="새 재고" value={stockEdits[p.id] ?? ""} onChange={e => setStockEdits(prev => ({ ...prev, [p.id]: e.target.value }))} />
                        <button className="stock-edit-btn" onClick={() => handleStockUpdate(p.id)}>수정</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* 로그인/회원가입 모달 */}
      {modal === "auth" && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{authMode === "login" ? "로그인" : "회원가입"}</div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form className="modal-body" onSubmit={handleAuth}>
              {authMode === "register" && <div className="field"><label>아이디</label><input placeholder="사용할 아이디" required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>}
              <div className="field"><label>이메일</label><input type="email" placeholder="hello@example.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="field"><label>비밀번호</label><input type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
              <button type="submit" className="submit-btn">{authMode === "login" ? "로그인" : "가입하기"}</button>
              <div className="modal-switch">
                {authMode === "login"
                  ? <>아직 계정이 없으신가요? <button type="button" onClick={() => setAuthMode("register")}>회원가입</button></>
                  : <>이미 계정이 있으신가요? <button type="button" onClick={() => setAuthMode("login")}>로그인</button></>}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 상품 상세 모달 */}
      {modal && modal !== "auth" && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal detail-modal" onClick={e => e.stopPropagation()}>
            <div className="detail-img"><ProductImg url={modal.image_url} large /></div>
            <div className="detail-header">
              <div className="cat-tags" style={{ paddingTop: 4 }}>{modal.categories?.map(c => <span key={c} className="cat-tag">{c}</span>)}</div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="detail-body">
              <div className="detail-name">{modal.name}</div>
              <div className="detail-desc">{modal.description}</div>
              {modal.stock > 0 && modal.stock <= 5 && <div className="stock-warn">⚠ 잔여 재고 {modal.stock}개</div>}
              <div className="qty-section">
                <div className="qty-label">수량</div>
                <div className="qty-controls">
                  <button className="qty-unit-btn" onClick={() => adjustQty(-100)}>−100</button>
                  <button className="qty-unit-btn" onClick={() => adjustQty(-10)}>−10</button>
                  <button className="qty-unit-btn" onClick={() => adjustQty(-1)}>−1</button>
                  <input className="qty-display" type="number" min="1" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
                  <button className="qty-unit-btn" onClick={() => adjustQty(1)}>+1</button>
                  <button className="qty-unit-btn" onClick={() => adjustQty(10)}>+10</button>
                  <button className="qty-unit-btn" onClick={() => adjustQty(100)}>+100</button>
                </div>
              </div>
              <button className="add-cart-btn" disabled={modal.stock === 0} onClick={handleAddToCart}>
                {modal.stock === 0 ? "품절" : "🛒 장바구니에 담기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 채팅 모달 */}
      {chatOrder && (
        <div className="overlay" onClick={() => setChatOrder(null)}>
          <div className="modal chat-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">채팅</div>
              <button className="modal-close" onClick={() => setChatOrder(null)}>×</button>
            </div>
            <div className="chat-order-info">
              <strong>{chatOrder.products?.name}</strong> × {chatOrder.qty} · 주문 #{chatOrder.id}
              {chatOrder.profiles?.username && <span> · @{chatOrder.profiles.username}</span>}
            </div>
            <div className="chat-messages">
              {messages.length === 0 && <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", marginTop: 20 }}>메시지가 없습니다</div>}
              {messages.map(msg => {
                const isMine = msg.sender_id === user?.id;
                const time = new Date(msg.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={msg.id} className={`chat-bubble ${isMine ? "mine" : "theirs"}`}>
                    {msg.content}
                    <div className="chat-time">{time}</div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-row" onSubmit={handleSendMessage}>
              <input className="chat-input" placeholder="메시지 입력..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
              <button type="submit" className="chat-send-btn">전송</button>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}