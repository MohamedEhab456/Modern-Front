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
    let desc = item.desc || "";

    grid.innerHTML += `
      <div class="menu-item"
        data-id="${item.id}"
        data-category="${item.category}"
        data-name="${item.title.replace(/"/g, "&quot;")}"
        data-price="${item.price}"
        data-description="${desc.replace(/"/g, "&quot;")}"
        data-image="${item.image}">


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
          <p>${desc}</p>

    <div class="actions-row"> 
         <span class="more-details">المزيد من التفاصيل</span>
    
          <button class="add-to-cart-btn" data-idx="${
            item.id
          }">أضف إلى السلة</button>
    </div>
 
        </div>
      </div>
    `;
  });

  if (items.length === 1) {
    grid.classList.add("single-item");
  } else {
    grid.classList.remove("single-item");
  }
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

    // اجلب اسم القسم الحالي وضعه في العنوان
    const section = allSections.find((sec) => sec.key === filter);
    if (section) setCategoryTitle(section.label);
  }
}

/*Section Contant UsFunction */

fetch("proudect.json")
  .then((res) => res.json())
  .then((data) => {
    setRestaurantName(data.title, data.logo);
    updateCartIcon();
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

    // أضف هنا بعد ملء allSections
    setCategoryTitle(allSections[0].label);

    // أضف هذا السطر لإظهار العنوان في الفوتر
    const footerTitle = document.getElementById("footer-title");
    if (footerTitle) footerTitle.textContent = data.title;
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

// Make the entire description area clickable
function setupReadMoreListeners() {
  document.querySelectorAll(".cart-item-info").forEach((infoBox) => {
    // Remove any existing event listeners to prevent duplicates
    infoBox.removeEventListener("click", handleDescriptionClick);
    // Add the new event listener
    infoBox.addEventListener("click", handleDescriptionClick);
  });
}

function handleDescriptionClick(e) {
  // Find the read-more button or the description text that was clicked
  const readMoreBtn =
    e.target.closest(".read-more") ||
    (e.target.closest("p.desc") && e.currentTarget.querySelector(".read-more"));

  if (readMoreBtn || e.target.classList.contains("desc")) {
    e.preventDefault();
    e.stopPropagation();

    const infoBox = e.currentTarget;
    const descElement = infoBox.querySelector("p.desc");
    if (!descElement) return;

    // Toggle the expanded class
    const isExpanded = descElement.classList.toggle("expanded");

    // Update the button text if it exists
    const readMoreBtn = infoBox.querySelector(".read-more");
    if (readMoreBtn) {
      readMoreBtn.textContent = isExpanded ? "اقرأ أقل" : "... اقرأ المزيد";
    }

    // Force a reflow to ensure the transition works
    void descElement.offsetWidth;
  }
}

function renderCart() {
  let cartItems = document.getElementById("cartItems");
  let clearCartBtn = document.getElementById("clearCart");
  let checkoutBtn = document.getElementById("checkout");
  let cartTotalSpan = document.getElementById("cartTotal");

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p style="text-align:center;color:#b9af9f;font-size:18px;margin:30px 0;">السلة فارغة</p>';
    if (clearCartBtn) clearCartBtn.style.display = "none";
    if (checkoutBtn) checkoutBtn.style.display = "block";
    if (cartTotalSpan) cartTotalSpan.textContent = "0 EG";
  } else {
    cart.forEach((item) => {
      let desc = item.desc || "";
      let showReadMore = desc.length > 50; // Adjust this number as needed

      cartItems.innerHTML += `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-box">
            <div class="cart-item-actions">

              <span class="cart-item-price">${item.price * item.qty} EG</span>


              <div class="casher">

              <button class="quantity-btn" data-action="decrease">-</button>
              <span class="number">${item.qty}</span>
              <button class="quantity-btn" data-action="increase">+</button>    
              </div>
            </div>

            <div class="cart-item-info">
              <h4>${item.title}</h4>

              <p class="desc">${desc}</p>
              ${
                showReadMore
                  ? '<span class="read-more">... اقرأ المزيد</span>'
                  : ""
              }

            </div>
          </div>
          <span class="close remove-item" title="حذف المنتج">×</span>
        </div>
      `;
    });
    if (clearCartBtn) clearCartBtn.style.display = "block";
    if (checkoutBtn) checkoutBtn.style.display = "block";
    updateCartTotal();
  }
  updateCartIcon();

  // Set up the read more listeners after rendering the cart
  setupReadMoreListeners();
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

// تحسين تحميل روابط التواصل الاجتماعي
function loadSocialLinks() {
  fetch("proudect.json")
    .then((res) => res.json())
    .then((data) => {
      const social = data.social || {};
      // لاحظ هنا: نبحث عن العنصر بواسطة الكلاس وليس id
      const socialLinksDiv = document.querySelector(".social-links");
      if (!socialLinksDiv) return;

      const icons = {
        facebook: "fab fa-facebook-f",
        instagram: "fab fa-instagram",
        twitter: "fab fa-twitter",
        whatsapp: "fab fa-whatsapp",
        tiktok: "fab fa-tiktok",
        youtube: "fab fa-youtube",
        telegram: "fab fa-telegram-plane",
        snapchat: "fab fa-snapchat-ghost",
        linkedin: "fab fa-linkedin-in",
      };

      let html = "";
      Object.keys(social).forEach((key) => {
        if (social[key] && icons[key]) {
          html += `<a href="${social[key]}" target="_blank"><i class="${icons[key]}"></i></a>`;
        }
      });

      socialLinksDiv.innerHTML = html;
    });
}

document.addEventListener("DOMContentLoaded", loadSocialLinks);

function loadContactInfo() {
  fetch("proudect.json")
    .then((res) => res.json())
    .then((data) => {
      const contactDiv = document.getElementById("contact-content");
      if (!contactDiv) return;

      let html = "";

      // الهاتف
      if (data.contact && data.contact.phone) {
        html += `
          <div class="contact-item">
            <div>
              <h3>الهاتف</h3>
              <p>${data.contact.phone}</p>
            </div>
            <a href="tel:${data.contact.phone}" target="_blank">
              <i class="fas fa-phone"></i>
            </a>
          </div>
        `;
      }

      // العنوان
      if (data.contact && data.contact.address) {
        html += `
          <div class="contact-item">
            <div>
              <h3>العنوان</h3>
              <p>${data.contact.address}</p>
            </div>
            <i class="fas fa-map-marker-alt"></i>
          </div>
        `;
      }

      contactDiv.innerHTML = html;
    });
}

document.addEventListener("DOMContentLoaded", loadContactInfo);

// البحث في المنتجات داخل القسم الحالي
document
  .getElementById("product-search")
  .addEventListener("input", function () {
    const searchValue = this.value.trim().toLowerCase();
    // معرفة القسم الحالي
    const activeBtn = document.querySelector(".filter-btn.active");
    if (!activeBtn) return;
    const currentSection = activeBtn.dataset.filter;
    const items = allProducts[currentSection] || [];
    // فلترة المنتجات حسب البحث
    const filtered = items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchValue) ||
        (item.desc && item.desc.toLowerCase().includes(searchValue))
    );
    renderMenuItems(filtered);
  });

function setCategoryTitle(label) {
  const title = document.getElementById("category-title");
  if (title) title.textContent = label;
}

// Initial setup of read more listeners when the script loads

document.addEventListener("DOMContentLoaded", setupReadMoreListeners);

document.querySelector(".menu-grid").addEventListener("click", function (e) {
  const menuItem = e.target.closest(".menu-item");
  if (!menuItem || e.target.closest(".add-to-cart-btn")) return;

  const modal = document.querySelector(".product-modal");
  const modalImg = document.querySelector(".product-modal-img");
  const modalName = document.querySelector(".modal-Product-Name");
  const modalPrice = document.querySelector(".modal-Product-Price");
  const modalOldPrice = document.querySelector(".modal-Product-OldPrice");
  const modalDesc = document.querySelector(".modal-Product-Description");

  const name = menuItem.getAttribute("data-name");
  const price = menuItem.getAttribute("data-price");
  const desc = menuItem.getAttribute("data-description");
  const img = menuItem.getAttribute("data-image");
  // جلب السعر القديم من العنصر إن وجد
  const oldPrice = menuItem.querySelector(".old-price")?.textContent || "";

  modalImg.src = img;
  modalName.textContent = name;
  modalPrice.textContent = price + " EGP";
  if (oldPrice) {
    modalOldPrice.textContent = oldPrice;
    modalOldPrice.style.display = "inline-block";
  } else {
    modalOldPrice.textContent = "";
    modalOldPrice.style.display = "none";
  }
  modalDesc.textContent = desc;

  modal.classList.add("show", "animate__animated", "animate__zoomIn");
  modal.addEventListener("animationend", function handler() {
    modal.classList.remove("animate__animated", "animate__zoomIn");
    modal.removeEventListener("animationend", handler);
  });
});

// إغلاق المودال
document.querySelector(".product-modal-close").onclick = function () {
  document.querySelector(".product-modal").classList.remove("show");
};
// إغلاق عند الضغط خارج المودال
document.querySelector(".product-modal").onclick = function (e) {
  if (e.target === this) this.classList.remove("show");
};

// إضافة المنتج من المودال إلى السلة
document.querySelector(".add-to-cart-btn.product").onclick = function () {
  const modal = document.querySelector(".product-modal");
  const modalImg = document.querySelector(".product-modal-img");
  const modalName = document.querySelector(".modal-Product-Name");
  const modalPrice = document.querySelector(".modal-Product-Price");
  const modalDesc = document.querySelector(".modal-Product-Description");

  // استخراج البيانات من المودال
  const name = modalName.textContent;
  const desc = modalDesc.textContent;
  const price = Number(modalPrice.textContent.replace(/[^\d]/g, ""));
  const id = name + price; // أو استخدم أي طريقة مناسبة لتوليد id فريد

  let found = cart.find((item) => item.id == id);

  if (found) {
    found.qty += 1;
  } else {
    cart.push({ id, title: name, desc, price, qty: 1 });
  }
  updateCartIcon();
  renderCart();
  updateCartTotal();
  showAddToCartMessage(name);

  // إغلاق المودال بعد الإضافة
  modal.classList.remove("show");
};
