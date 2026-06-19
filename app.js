function placeholderImage(text, color = "60a5fa") {
  const encoded = encodeURIComponent(text);
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 260'%3E%3Crect width='260' height='260' fill='%23${color}'/%3E%3Ctext x='50%' y='50%' fill='%23ffffff' font-family='Segoe UI, sans-serif' font-size='28' dominant-baseline='middle' text-anchor='middle'%3E${encoded}%3C/text%3E%3C/svg%3E`;
}

const products = [
  { id: 1, name: "经典白衬衫", barcode: "100100", style: "男装", size: "M", price: 198.0, stock: 12, image: placeholderImage("白衬衫", "60a5fa") },
  { id: 2, name: "牛仔裤", barcode: "100101", style: "男装", size: "L", price: 268.0, stock: 8, image: placeholderImage("牛仔裤", "f97316") },
  { id: 3, name: "连衣裙", barcode: "100102", style: "女装", size: "S", price: 358.0, stock: 5, image: placeholderImage("连衣裙", "ec4899") },
  { id: 4, name: "运动外套", barcode: "100103", style: "休闲", size: "XL", price: 428.0, stock: 6, image: placeholderImage("运动外套", "10b981") },
  { id: 5, name: "针织毛衣", barcode: "100104", style: "女装", size: "M", price: 239.0, stock: 10, image: placeholderImage("针织毛衣", "8b5cf6") },
  { id: 6, name: "休闲短裤", barcode: "100105", style: "男装", size: "M", price: 129.0, stock: 15, image: placeholderImage("短裤", "3b82f6") },
  { id: 7, name: "羊绒大衣", barcode: "100106", style: "女装", size: "L", price: 899.0, stock: 4, image: placeholderImage("大衣", "fb7185") }
];
const cart = new Map();
let nextProductId = products.length + 1;

const productList = document.getElementById("productList");
const cartBody = document.getElementById("cartBody");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const discountInput = document.getElementById("discountInput");
const barcodeInput = document.getElementById("barcodeInput");
const scanButton = document.getElementById("scanButton");
const checkoutButton = document.getElementById("checkoutButton");
const clearCartButton = document.getElementById("clearCartButton");
const receiptModal = document.getElementById("receiptModal");
const receiptText = document.getElementById("receiptText");
const closeReceipt = document.getElementById("closeReceipt");
const searchInput = document.getElementById("searchInput");
const clearFilter = document.getElementById("clearFilter");
const warehouseBarcodeInput = document.getElementById("warehouseBarcodeInput");
const warehouseQtyInput = document.getElementById("warehouseQtyInput");
const warehouseAddButton = document.getElementById("warehouseAddButton");
const warehouseNameInput = document.getElementById("warehouseNameInput");
const warehouseStyleInput = document.getElementById("warehouseStyleInput");
const warehouseSizeInput = document.getElementById("warehouseSizeInput");
const warehousePriceInput = document.getElementById("warehousePriceInput");
const warehouseImageInput = document.getElementById("warehouseImageInput");
const warehouseMessage = document.getElementById("warehouseMessage");

function renderProducts(filter = "") {
  const normalized = filter.trim().toLowerCase();
  productList.innerHTML = "";
  const visible = products.filter((product) => {
    if (!normalized) return true;
    return (
      product.name.toLowerCase().includes(normalized) ||
      product.barcode.includes(normalized) ||
      product.style.toLowerCase().includes(normalized)
    );
  });

  if (visible.length === 0) {
    productList.innerHTML = "<p>未找到匹配商品。</p>";
    return;
  }

  visible.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image"><img src="${product.image}" alt="${product.name}" /></div>
      <h3>${product.name}</h3>
      <p>条码：${product.barcode}</p>
      <p>类别：${product.style} · 尺寸：${product.size}</p>
      <p class="price">¥${product.price.toFixed(2)}</p>
      <p class="stock">库存：${product.stock > 0 ? product.stock : "0（缺货）"}</p>
      <button type="button" data-barcode="${product.barcode}" ${product.stock === 0 ? "disabled" : ""}>加入购物车</button>
    `;
    productList.appendChild(card);
  });
}

function findProductByBarcode(barcode) {
  return products.find((item) => item.barcode === barcode);
}

function setWarehouseMessage(text, type = "info") {
  warehouseMessage.textContent = text;
  warehouseMessage.className = `warehouse-message ${type}`;
}

function addWarehouseItem() {
  const barcode = warehouseBarcodeInput.value.trim();
  const qty = Math.max(1, Number(warehouseQtyInput.value) || 1);
  if (!barcode) {
    alert("请扫码或输入条码后再入库。");
    return;
  }

  const existing = findProductByBarcode(barcode);
  const imageValue = warehouseImageInput.value.trim();
  if (existing) {
    existing.stock += qty;
    if (imageValue) existing.image = imageValue;
    setWarehouseMessage(`已入库 ${existing.name} ${qty} 件，当前库存 ${existing.stock} 件`, "success");
  } else {
    const name = warehouseNameInput.value.trim();
    const style = warehouseStyleInput.value.trim() || "未分类";
    const size = warehouseSizeInput.value.trim() || "均码";
    const price = Number(warehousePriceInput.value);
    if (!name || Number.isNaN(price) || price < 0) {
      alert("新建商品时请填写名称和有效单价。若商品已存在，请填写正确条码。");
      return;
    }
    const image = imageValue || placeholderImage(name, "f97316");
    const product = {
      id: nextProductId++,
      name,
      barcode,
      style,
      size,
      price: Number(price.toFixed(2)),
      stock: qty,
      image,
    };
    products.push(product);
    setWarehouseMessage(`已新增商品 ${name} 并入库 ${qty} 件。`, "success");
  }

  renderProducts(searchInput.value);
  warehouseBarcodeInput.value = "";
  warehouseQtyInput.value = "1";
  warehouseNameInput.value = "";
  warehouseStyleInput.value = "";
  warehouseSizeInput.value = "";
  warehousePriceInput.value = "";
  warehouseImageInput.value = "";
}

function addByBarcode(barcode) {
  const product = findProductByBarcode(barcode);
  if (!product) {
    alert("未找到该条码对应商品，请检查输入。");
    return;
  }
  if (product.stock <= 0) {
    alert("库存不足，无法加入购物车。");
    return;
  }
  const current = cart.get(product.barcode) || { ...product, quantity: 0 };
  current.quantity += 1;
  cart.set(product.barcode, current);
  product.stock -= 1;
  renderProducts(searchInput.value);
  renderCart();
}

function renderCart() {
  cartBody.innerHTML = "";
  let subtotal = 0;
  cart.forEach((item) => {
    const row = document.createElement("tr");
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.barcode}</td>
      <td>¥${item.price.toFixed(2)}</td>
      <td>
        <div class="quantity-control">
          <button type="button" data-action="decrease" data-barcode="${item.barcode}">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-action="increase" data-barcode="${item.barcode}">+</button>
        </div>
      </td>
      <td>¥${itemTotal.toFixed(2)}</td>
      <td><button type="button" class="secondary" data-action="remove" data-barcode="${item.barcode}">删除</button></td>
    `;

    cartBody.appendChild(row);
  });

  subtotalEl.textContent = `¥${subtotal.toFixed(2)}`;
  updateTotal(subtotal);
}

function updateTotal(subtotal) {
  let discount = Number(discountInput.value);
  if (Number.isNaN(discount) || discount <= 0) {
    discount = 100;
  }
  discount = Math.min(100, discount);
  const effective = Math.max(0, subtotal * discount / 100);
  totalEl.textContent = `¥${effective.toFixed(2)}`;
}

function clearCart() {
  cart.forEach((item) => {
    const product = findProductByBarcode(item.barcode);
    if (product) {
      product.stock += item.quantity;
    }
  });
  cart.clear();
  renderProducts(searchInput.value);
  renderCart();
}

function checkout() {
  if (cart.size === 0) {
    alert("购物车为空，无法结算。");
    return;
  }

  let receipt = "服装店结算单\n";
  receipt += `操作时间：${new Date().toLocaleString()}\n`;
  receipt += "----------------------------------------\n";
  let subtotal = 0;
  cart.forEach((item) => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    receipt += `${item.name} (${item.barcode}) x${item.quantity} = ¥${lineTotal.toFixed(2)}\n`;
  });
  receipt += "----------------------------------------\n";
  let discount = Number(discountInput.value);
  if (Number.isNaN(discount) || discount <= 0) {
    discount = 100;
  }
  discount = Math.min(100, discount);
  const total = Math.max(0, subtotal * discount / 100);
  receipt += `原价合计：¥${subtotal.toFixed(2)}\n`;
  receipt += `折扣：${discount.toFixed(0)}折\n`;
  receipt += `实付金额：¥${total.toFixed(2)}\n`;
  receipt += "----------------------------------------\n";
  receipt += "谢谢惠顾，欢迎再次光临！\n";

  receiptText.textContent = receipt;
  receiptModal.classList.remove("hidden");
  cart.clear();
  renderProducts(searchInput.value);
  renderCart();
}

productList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-barcode]");
  if (!button) return;
  addByBarcode(button.dataset.barcode);
});

cartBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const barcode = button.dataset.barcode;
  const action = button.dataset.action;
  const item = cart.get(barcode);
  const product = findProductByBarcode(barcode);
  if (!item || !product) return;

  if (action === "increase") {
    if (product.stock <= 0) {
      alert("库存不足，无法增加数量。");
      return;
    }
    item.quantity += 1;
    product.stock -= 1;
    cart.set(barcode, item);
  } else if (action === "decrease") {
    item.quantity -= 1;
    product.stock += 1;
    if (item.quantity <= 0) {
      cart.delete(barcode);
    } else {
      cart.set(barcode, item);
    }
  } else if (action === "remove") {
    product.stock += item.quantity;
    cart.delete(barcode);
  }
  renderProducts(searchInput.value);
  renderCart();
});

scanButton.addEventListener("click", () => {
  addByBarcode(barcodeInput.value.trim());
  barcodeInput.value = "";
  barcodeInput.focus();
});

barcodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    scanButton.click();
  }
});

discountInput.addEventListener("input", () => renderCart());
checkoutButton.addEventListener("click", checkout);
clearCartButton.addEventListener("click", () => {
  if (confirm("确定要清空购物车吗？")) clearCart();
});
warehouseAddButton.addEventListener("click", addWarehouseItem);
warehouseBarcodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addWarehouseItem();
  }
});
const discountButtons = document.querySelectorAll(".discount-actions button");
discountButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const percent = Number(button.dataset.discount);
    discountInput.value = percent;
    renderCart();
  });
});
closeReceipt.addEventListener("click", () => receiptModal.classList.add("hidden"));
receiptModal.addEventListener("click", (event) => {
  if (event.target === receiptModal) receiptModal.classList.add("hidden");
});
searchInput.addEventListener("input", () => renderProducts(searchInput.value));
clearFilter.addEventListener("click", () => {
  searchInput.value = "";
  renderProducts();
});

renderProducts();
renderCart();
