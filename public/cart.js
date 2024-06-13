/**
 * Ryan Wong
 * June 2024
 *
 * This is the .js file that handles the cart page.
 */

(function () {
  'use strict';

  function init() {
    loadCartItems();
    setupEventListeners();
  }

  /**
   * This functions loads the cart items from local storage.
   */
  function loadCartItems() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutItemsContainer = document.getElementById('checkout-items');
    cartItemsContainer.innerHTML = '';
    checkoutItemsContainer.innerHTML = '';

    let total = 0;

    cartItems.forEach((item) => {
      const cartItem = createCartItemElement(item);
      const checkoutItem = createCheckoutItemElement(item);

      cartItemsContainer.appendChild(cartItem);
      checkoutItemsContainer.appendChild(checkoutItem);

      total += item.price * item.quantity;
    });

    document.getElementById('cart-total').textContent = total.toFixed(2);
    document.getElementById('checkout-total').textContent = total.toFixed(2);
  }

  /**
   * This function creates a cart item element.
   */
  function createCartItemElement(item) {
    const cartItem = document.createElement('li');

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.classList.add('cart-item-image');

    const info = document.createElement('div');
    info.classList.add('cart-item-info');

    const name = document.createElement('span');
    name.textContent = item.name;

    const price = document.createElement('span');
    price.textContent = `$${item.price} x${item.quantity}`;

    info.appendChild(name);
    info.appendChild(price);

    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.value = '1';
    quantityInput.min = '1';
    quantityInput.max = item.quantity;
    quantityInput.classList.add('remove-quantity');

    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-item');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () =>
      removeItem(item.id, parseInt(quantityInput.value, 10), cartItem)
    );

    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    cartItem.appendChild(img);
    cartItem.appendChild(info);
    cartItem.appendChild(quantityInput);
    cartItem.appendChild(removeButton);
    cartItem.appendChild(messageElement);

    return cartItem;
  }

  /**
   * This function creates a checkout item element.
   */
  function createCheckoutItemElement(item) {
    const checkoutItem = document.createElement('li');

    const name = document.createElement('span');
    name.textContent = item.name;

    const price = document.createElement('span');
    price.textContent = `$${item.price} x${item.quantity}`;

    checkoutItem.appendChild(name);
    checkoutItem.appendChild(price);

    return checkoutItem;
  }

  /**
   * This function sets up the event listeners.
   */
  function setupEventListeners() {
    document
      .getElementById('checkout')
      .addEventListener('click', showCheckoutView);
    document
      .getElementById('checkout-form')
      .addEventListener('submit', completePurchase);
  }

  /**
   * This function shows the checkout view.
   */
  function showCheckoutView() {
    document.querySelector('.cart-view').classList.add('hidden');
    document.querySelector('.cart-view').classList.remove('visible');
    document.querySelector('.checkout-view').classList.add('visible');
    document.querySelector('.checkout-view').classList.remove('hidden');
  }

  /**
   * This funcitons completes the purchase and posts it to the server.
   */
  async function completePurchase(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const card = document.getElementById('card').value;
    const expiration = document.getElementById('expiration').value;
    const ccv = document.getElementById('ccv').value;
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    if (name && email && address && card && expiration && ccv) {
      const order = {
        name,
        email,
        address,
        card,
        expiration,
        ccv,
        items: cartItems,
        total: document.getElementById('checkout-total').textContent,
      };

      try {
        const response = await fetch('/submit-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order),
        });
        checkStatus(response);

        localStorage.removeItem('cart');
        loadCartItems();

        document.getElementById('checkout-form').reset();

        document.querySelector('.checkout-view').classList.add('hidden');
        document.querySelector('.checkout-view').classList.remove('visible');
        document.querySelector('.cart-view').classList.add('visible');
        document.querySelector('.cart-view').classList.remove('hidden');
      } catch (error) {
        handleError(error);
      }
    }
  }

  /**
   * This function removes an item from the cart.
   */
  async function removeItem(itemId, quantityToRemove) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex((item) => item.id === itemId);

    if (itemIndex !== -1) {
      const product = cart[itemIndex];

      try {
        const response = await fetch(`/products/${itemId}`);
        checkStatus(response);
        const serverProduct = await response.json();

        if (quantityToRemove >= product.quantity) {
          cart.splice(itemIndex, 1);
        } else {
          product.quantity -= quantityToRemove;
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartItems();

        const newQuantity = serverProduct.quantity + quantityToRemove;
        await updateServerQuantity(product.id, newQuantity);
      } catch (error) {
        handleError(error);
      }
    }
  }

  /**
   * This function updates the server quanity of a product.
   */
  async function updateServerQuantity(productId, quantity) {
    try {
      const response = await fetch('/update-product-quantity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: productId, quantity }),
      });
      checkStatus(response);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * This function checks the status of the response and throws an error if there is one.
   * @param response
   * @returns
   */
  function checkStatus(response) {
    if (!response.ok) {
      throw Error('Error in request: ' + response.statusText);
    }
    return response;
  }

  /**
   * This function handles errors.
   * @param errMsg
   */
  function handleError(errMsg) {
    const messageArea = document.getElementById('message');
    if (typeof errMsg === 'string') {
      messageArea.textContent = errMsg;
    } else {
      messageArea.textContent = 'An error occurred fetching the reviews data.';
    }
    messageArea.classList.remove('hidden');
  }

  init();
})();
