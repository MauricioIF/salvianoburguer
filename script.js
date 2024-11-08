const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");
const observacoes = document.getElementById("obs");

let cart = [];

// ABRIR CARRINHO
cartBtn.addEventListener("click", function () {
  cartModal.style.display = "flex";
  updateCartModal();
});

// FECHAR CARRINHO
cartModal.addEventListener("click", function (event) {
  if (event.target === cartModal) {
    cartModal.style.display = "none";
  }

  if (event.target === closeModalBtn) {
    cartModal.style.display = "none";
  }
});

menu.addEventListener("click", function (event) {
  let parentButton = event.target.closest(".add-to-cart-btn");
  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));

    addToCart(name, price);
  }
});

// Função para adicionar item no carrinho
function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
    return;
  } else {
    cart.push({
      name,
      price,
      quantity: 1,
    });
  }
  updateCartModal();
}

// Atualizar o modal do carrinho
function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add(
      "flex",
      "justify-between",
      "mb-4",
      "flex-col"
    );
    cartItemElement.innerHTML = `
    <div class = "flex items-center justify-between">
        <div>
            <p class ="font-bold">${item.name}</p>
            <p>Qtd: ${item.quantity}</p>
            <p class = "font-medium mt-2">${item.price.toFixed(2)}</p>
        </div>

            <button class = "remove-from-cart-btn" data-name="${item.name}"> 
                 Remover
            </button>
    </div>`;

    total += item.price * item.quantity;
    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  cartCounter.innerHTML = cart.length;
}

// Função para remover item do carrinho
cartItemsContainer.addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-from-cart-btn")) {
    const name = event.target.getAttribute("data-name");
    removeItemCart(name);
  }
});

function removeItemCart(name) {
  const index = cart.findIndex((item) => item.name === name);
  if (index !== -1) {
    const item = cart[index];
    if (item.quantity > 1) {
      item.quantity -= 1;
      updateCartModal();
      return;
    }

    cart.splice(index, 1);
    updateCartModal();
  }
}

// Verificar e exibir aviso de endereço
addressInput.addEventListener("input", function (event) {
  let inputValue = event.target.value;
  if (inputValue !== "") {
    addressInput.classList.remove("border-red-500");
    addressWarn.classList.add("hidden");
  }
});

// Finalizar pedido
checkoutBtn.addEventListener("click", function () {
  const isOpen = checkoutRestaurantOpen();

  if (!isOpen) {
    Toastify({
      text: "Ops o restaurante está fechado!",
      duration: 3000,
      newWindow: true,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "#ef4444",
      },
    }).showToast();
    return;
  }

  if (cart.length === 0) return;
  if (addressInput.value === "") {
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    return;
  }

  // Enviar pedido para API do WhatsApp
  const cartItems = cart
    .map((item) => {
      return `${item.name} Quantidade: (${item.quantity}) Preço: R$ ${(
        item.price.toFixed(2) * item.quantity
      ).toFixed(2)}|  `;
    })
    .join(" ");

  const message = encodeURIComponent(cartItems);
  const phone = "558499367914";

  window.open(
    `https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}| Obs: ${observacoes.value}|`,
    "_blank"
  );

  // Limpar o carrinho após o pedido
  cart = [];
  updateCartModal();
});

// Verificar se o restaurante está aberto
function checkoutRestaurantOpen() {
  const data = new Date();
  const hora = data.getHours();
  const minutos = data.getMinutes();

  // Verifica se está entre 17:00 e 22:30
  if (
    (hora === 19 && minutos >= 0) || // Restaurante abre às 17:00
    (hora > 19 && hora < 22) || // Até as 22:00
    (hora === 22 && minutos < 30) // Até as 22:30
  ) {
    return true; // Restaurante está aberto
  }

  return false; // Restaurante está fechado
}

const spanItem = document.getElementById("date-span");
const isOpen = checkoutRestaurantOpen();

if (isOpen) {
  spanItem.classList.remove("bg-red-500");
  spanItem.classList.add("bg-green-600");
} else {
  spanItem.classList.remove("bg-green-600");
  spanItem.classList.add("bg-red-500");
}