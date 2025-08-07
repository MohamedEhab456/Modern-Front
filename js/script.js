function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

/* Section Header Function */
function setRestaurantName(name, logoUrl) {
  const navContainer = document.querySelector(".nav-container");
  const logo = navContainer.querySelector(".logo");
  const cart = navContainer.querySelector(".cart-icon");

  cart.innerHTML = `<i class="fas fa-shopping-cart"></i>`;

  // لا تكرر الاسم
  if (logoUrl) {
    logo.innerHTML = `
      <img src="${logoUrl}" alt="${name}" class="restaurant-logo-img">
      <span class="restaurant-name">${name}</span>
    `;
  } else {
    logo.innerHTML = `
      <i class="fas fa-utensils"></i>
      <span class="restaurant-name">${name}</span>
    `;
  }

  if (isArabic(name)) {
    navContainer.style.direction = "rtl";
  } else {
    navContainer.style.direction = "ltr";
  }
}

// تأثير سكرول مع الهيدر

window.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById("myHeader");
  const headroom = new Headroom(header);
  headroom.init();
});

/* Section Catgory Function */
let allSections = [];
let allProducts = {};

function renderMenuFilters(sections) {
  const filtersContainer = document.querySelector(".menu-filters");
  filtersContainer.innerHTML = "";

  sections.forEach((section) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.filter = section.key;
    btn.textContent = section.label;

    // لو القسم عروض أضف كلاس خاص
    if (section.key === "offers") {
      btn.classList.add("offers-btn");
      btn.innerHTML += `<span class="sale-tag">SALE</span>`;
    }

    filtersContainer.appendChild(btn);
  });

  // أضف أو أزل كلاس has-scroll حسب عدد الكاتجوري
  if (sections.length > 3) {
    filtersContainer.classList.add("has-scroll");
  } else {
    filtersContainer.classList.remove("has-scroll");
  }

  if (sections.length < 4) {
    filtersContainer.classList.add("few-categories");
  } else {
    filtersContainer.classList.remove("few-categories");
  }
}

/* Section Menu Function */

function renderMenuItems(items) {
  let grid = document.querySelector(".menu-grid");
  grid.innerHTML = "";

  items.forEach((item) => {
    grid.innerHTML += `
      <div class="menu-item" data-id="${item.id}" data-category="${
      item.category
    }">
        <div class="menu-item-image">
          <img src="${item.image}">
          <div class="price-tag">
            ${
              item.oldPrice
                ? `<span class="old-price">${item.oldPrice} EG</span>`
                : ""
            }
            <span class="new-price">${item.price} EG</span>
          </div>
        </div>
        <div class="menu-item-content">
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
          <button class="add-to-cart-btn" data-idx="${
            item.id
          }">أضف إلى السلة</button>
        </div>
      </div>
    `;
  });
}

/*Section Save Menu In Catgory Function */

function handleFilterClick(e) {
  if (e.target.classList.contains("filter-btn")) {
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));

    e.target.classList.add("active");

    let filter = e.target.dataset.filter;
    renderMenuItems(allProducts[filter] || []);
  }
}

/*Section Contant UsFunction */

function renderContact(contact) {
  document.getElementById("contact-phone").textContent = contact.phone;
  document.getElementById("contact-address").textContent = contact.address;
}

fetch("proudect.json")
  .then((res) => res.json())
  .then((data) => {
    setRestaurantName(data.title, data.logo); // مرر رابط اللوجو لو موجود
    updateCartIcon(); // ← هنا بعد رسم الأيقونة مباشرة

    allSections = data.sections;
    allProducts = data.products;

    renderMenuFilters(allSections);

    if (allSections.length > 0) {
      renderMenuItems(allProducts[allSections[0].key] || []);
      document.querySelectorAll(".filter-btn")[0].classList.add("active");
    }

    document
      .querySelector(".menu-filters")
      .addEventListener("click", handleFilterClick);

    renderContact(data.contact);
    renderFooter(data);
  });

/* تشغيل السله */

let cart = [];

function updateCartIcon() {
  let cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelector(".cart-icon").innerHTML = `
    <i class="fas fa-shopping-cart"></i>
    <span class="cart-count">${cartCount}</span>
  `;
}

function renderCart() {
  let cartItems = document.getElementById("cartItems");
  cartItems.innerHTML = "";

  cart.forEach((item) => {
    cartItems.innerHTML += `
      <div class="cart-item" data-id="${item.id}">
        
      <div class="cart-item-box">

              <div class="cart-item-actions">
          <span class="cart-item-price">${item.price * item.qty} EG</span>
          <button class="quantity-btn" data-action="decrease">-</button>
          <span class="number">${item.qty}</span>
          <button class="quantity-btn" data-action="increase">+</button>
        </div>

        <div class="cart-item-info">
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
        </div>

      </div>
        

        <span class="close remove-item" title="حذف المنتج">×</span>
      </div>
    `;
  });
  updateCartIcon();
  updateCartTotal();
}

function updateCartTotal() {
  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("cartTotal").textContent = `${total} EG`;
}

document.querySelector(".menu-grid").addEventListener("click", function (e) {
  if (e.target.classList.contains("add-to-cart-btn")) {
    let parent = e.target.closest(".menu-item");
    let id = parent.dataset.id;
    let title = parent.querySelector("h3").textContent;
    let desc = parent.querySelector("p").textContent;
    let price = Number(
      parent.querySelector(".new-price").textContent.replace(/[^\d]/g, "")
    );
    let found = cart.find((item) => item.id == id);

    if (found) {
      found.qty += 1;
    } else {
      cart.push({ id, title, desc, price, qty: 1 });
    }
    updateCartIcon();
    renderCart();
    updateCartTotal();
    animateFlyingCart(e); // ← أضف هذا السطر هنا

    showAddToCartMessage(title);
  }
});

// زيادة/نقص الكمية

document.getElementById("cartItems").addEventListener("click", function (e) {
  let parent = e.target.closest(".cart-item");
  if (!parent) return;
  let id = parent.dataset.id;
  let item = cart.find((i) => i.id == id);

  // حذف المنتج عند الضغط على ×
  if (e.target.classList.contains("remove-item")) {
    cart = cart.filter((i) => i.id != id);
    updateCartIcon();
    renderCart();
    updateCartTotal();
    return;
  }

  if (e.target.dataset.action === "increase") {
    item.qty += 1;
  }
  if (e.target.dataset.action === "decrease") {
    item.qty -= 1;
    if (item.qty <= 0) cart = cart.filter((i) => i.id != id);
  }
  updateCartIcon();
  renderCart();
  updateCartTotal();
});

document.querySelector(".cart-icon").onclick = () => {
  renderCart();
  const modal = document.getElementById("cartModal");
  const modalContent = modal.querySelector(".modal-content");
  modal.style.display = "block";
  // إزالة الكلاسات القديمة أولاً
  modalContent.classList.remove("animate__animated", "animate__zoomIn");
  // إعادة تفعيل الأنيميشن (إعادة الرسم)
  void modalContent.offsetWidth;
  modalContent.classList.add("animate__animated", "animate__zoomIn");
};

document.querySelector(".close").onclick = () => {
  document.getElementById("cartModal").style.display = "none";
  // يمكنك إزالة كلاس الأنيميشن هنا إذا أردت
};

document.getElementById("clearCart").onclick = () => {
  cart = [];
  updateCartIcon();
  renderCart();
  updateCartTotal(); // أضف هذا السطر هنا (اختياري لأن renderCart تستدعيه)
};

document.getElementById("checkout").onclick = () => {
  document.getElementById("cartModal").style.display = "none";
};

updateCartIcon();

// أنيميشن السلة الطائرة
function animateFlyingCart(event) {
  const flyingIcon = document.querySelector(".flying-cart-icon");
  const cartIcon = document.querySelector(".cart-icon");

  if (!flyingIcon || !cartIcon) return;

  // إعادة تعيين كاملة للأيقونة في البداية
  flyingIcon.style.transition = "none";
  flyingIcon.style.opacity = "0";
  flyingIcon.style.transform = "scale(0.5)";

  // احسب موقع الزر المضغوط بدقة
  const buttonRect = event.target.getBoundingClientRect();
  const startX = buttonRect.left + buttonRect.width / 2;
  const startY = buttonRect.top + buttonRect.height / 2;

  // احسب موقع السلة الرئيسية بدقة
  const cartRect = cartIcon.getBoundingClientRect();
  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  // ضع الأيقونة في موقع الزر المضغوط بالضبط
  flyingIcon.style.left = startX - 25 + "px";
  flyingIcon.style.top = startY - 25 + "px";

  // أعد تفعيل الانتقال بعد فترة قصيرة
  setTimeout(() => {
    flyingIcon.style.transition = "all 1.2s ease";
    flyingIcon.style.opacity = "1";
    flyingIcon.style.transform = "scale(1.3)";
  }, 50);

  // ابدأ الحركة نحو السلة
  setTimeout(() => {
    flyingIcon.style.left = endX - 25 + "px";
    flyingIcon.style.top = endY - 25 + "px";
    flyingIcon.style.transform = "scale(0.2)";
    flyingIcon.style.opacity = "0";
  }, 600);

  // أزل الأيقونة
  setTimeout(() => {
    flyingIcon.style.opacity = "0";
    flyingIcon.style.transform = "scale(0.5)";
    flyingIcon.style.transition = "none";
  }, 1800);
}

/* Toast message */

function showAddToCartMessage(productName) {
  // إزالة الرسالة السابقة إن وجدت
  const existingMessage = document.querySelector(".add-to-cart-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // إنشاء رسالة جديدة
  const message = document.createElement("div");
  message.className = "add-to-cart-message";
  message.innerHTML = `
    <div class="message-content">
      <i class="fas fa-check-circle"></i>
      <span> تم إضافة  "${productName}" إلى السلة</span>
    </div>
  `;
  document.body.appendChild(message);

  // إخفاء الرسالة بعد ثانيتين
  setTimeout(() => {
    message.classList.add("fade-out");
    setTimeout(() => {
      message.remove();
    }, 300); // مدة الأنيميشن
  }, 2000);
}

function renderFooter(data) {
  document.getElementById("footer-title").textContent = data.title;
  document.getElementById("footer-facebook").href =
    data.social?.facebook || "#";
  document.getElementById("footer-instagram").href =
    data.social?.instagram || "#";
}

// Scroll On Top

const scrollBtn = document.getElementById("scroll-to-top");
const circle = document.querySelector(".progress-ring__circle");
const radius = 24; // بدل 20
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = `${circumference}`;
circle.style.strokeDashoffset = `${circumference}`;

function setProgress(percent) {
  const offset = circumference - percent * circumference;
  circle.style.strokeDashoffset = offset;
}

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

  setProgress(percent);

  // إظهار الزر فقط إذا كان النزول أكبر من 250px
  if (scrollTop > 250) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }
});

scrollBtn.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("cartModal").style.display = "none";
});
