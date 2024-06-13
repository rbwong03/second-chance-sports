/**
 * Ryan Wong
 * June 2024
 *
 * This is the .js file that handles the items page.
 */

(function () {
  'use strict';
  const errMsg = 'Error loading products.';

  function init() {
    loadProducts();
  }

  /**
   * This function loads the products.
   */
  function loadProducts() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const type = params.get('type');

    if (!category || !type) {
      handleError(errMsg);
      return;
    }

    fetch(`/filtered-products?category=${category}&type=${type}`)
      .then(checkStatus)
      .then((response) => response.json())
      .then((products) => {
        if (products.length === 0) {
          document.body.innerHTML = `<p>No products found in the ${category} ${type} category.</p>`;
          return;
        }

        const productList = document.querySelector('.product-list');
        if (!productList) {
          handleError(errMsg);
          return;
        }

        productList.innerHTML = '';

        products.forEach((product) => {
          const productSection = document.createElement('section');
          productSection.classList.add('product');

          const img = document.createElement('img');
          img.src = product.image;
          img.alt = product.name;

          const itemDetails = document.createElement('section');
          itemDetails.classList.add('item-details');

          const h2 = document.createElement('h2');
          h2.textContent = product.name;
          itemDetails.appendChild(h2);

          const price = document.createElement('p');
          price.textContent = `$${product.price}`;
          itemDetails.appendChild(price);

          const brand = document.createElement('p');
          brand.textContent = `Brand: ${product.brand}`;
          itemDetails.appendChild(brand);

          const condition = document.createElement('p');
          condition.textContent = `Condition: ${product.condition}`;
          itemDetails.appendChild(condition);

          const color = document.createElement('p');
          color.textContent = `Color: ${product.color}`;
          itemDetails.appendChild(color);

          const yearsUsed = document.createElement('p');
          yearsUsed.textContent = `Years Used: ${product.yearsUsed} years`;
          itemDetails.appendChild(yearsUsed);

          const aboutSection = document.createElement('section');
          aboutSection.classList.add('about');

          const aboutTitle = document.createElement('h3');
          aboutTitle.textContent = 'About This Item';
          aboutSection.appendChild(aboutTitle);

          const description = document.createElement('p');
          description.textContent = product.description;
          aboutSection.appendChild(description);

          itemDetails.appendChild(aboutSection);

          const purchaseInfo = document.createElement('aside');
          purchaseInfo.classList.add('purchase-info');

          const purchasePrice = document.createElement('p');
          purchasePrice.textContent = `$${product.price}`;
          purchaseInfo.appendChild(purchasePrice);

          const quantityLeft = document.createElement('p');
          quantityLeft.textContent = `${product.quantity} left`;
          purchaseInfo.appendChild(quantityLeft);

          const quantityLabel = document.createElement('label');
          quantityLabel.setAttribute('for', `quantity-${product.id}`);
          quantityLabel.textContent = 'Quantity:';
          purchaseInfo.appendChild(quantityLabel);

          const quantityInput = document.createElement('input');
          quantityInput.setAttribute('type', 'number');
          quantityInput.setAttribute('id', `quantity-${product.id}`);
          quantityInput.setAttribute('name', 'quantity');
          quantityInput.setAttribute('min', '1');
          quantityInput.setAttribute('max', product.quantity);
          quantityInput.value = '1';
          purchaseInfo.appendChild(quantityInput);

          const addToCartButton = document.createElement('button');
          addToCartButton.classList.add('add-to-cart');
          addToCartButton.textContent = 'Add to Cart';
          addToCartButton.addEventListener('click', () =>
            addToCart(product, quantityInput.value, purchaseInfo)
          );
          purchaseInfo.appendChild(addToCartButton);

          const messageArea = document.createElement('div');
          messageArea.classList.add('message', 'hidden');
          purchaseInfo.appendChild(messageArea);

          productSection.appendChild(img);
          productSection.appendChild(itemDetails);
          productSection.appendChild(purchaseInfo);

          productList.appendChild(productSection);
        });
      })
      .catch((error) => handleError(error));
  }

  /**
   * This function adds a product to the cart.
   */
  function addToCart(product, quantity, purchaseInfo) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItem = cart.find((item) => item.id === product.id);
    const requestedQuantity = parseInt(quantity, 10);

    if (cartItem) {
      if (requestedQuantity > product.quantity) {
        displayMessage('Not enough stock available', 'error', purchaseInfo);
        return;
      } else {
        cartItem.quantity += requestedQuantity;
      }
    } else {
      if (requestedQuantity > product.quantity) {
        displayMessage(
          'Not enough stock available. Come back another time.',
          'error',
          purchaseInfo
        );
        return;
      } else {
        cart.push({ ...product, quantity: requestedQuantity });
      }
    }

    product.quantity -= requestedQuantity;

    localStorage.setItem('cart', JSON.stringify(cart));
    displayMessage('Item successfully added to cart!', 'success', purchaseInfo);

    const quantityLeft = purchaseInfo.querySelector('p:nth-child(2)');
    quantityLeft.textContent = `${product.quantity} left`;
    updateServerQuantity(product.id, product.quantity);
  }

  /**
   * This function updates the quantity of a product on the server.
   */
  function updateServerQuantity(productId, quantity) {
    fetch('/update-product-quantity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: productId, quantity }),
    })
      .then(checkStatus)
      .catch((error) => {
        handleError('There was a problem with the fetch operation:', error);
      });
  }

  /**
   * This function displays a message to the user.
   */
  function displayMessage(message, type, purchaseInfo) {
    const messageArea = purchaseInfo.querySelector('.message');

    messageArea.textContent = message;

    messageArea.classList.remove('success', 'error', 'hidden');
    messageArea.classList.add(type);

    setTimeout(() => {
      messageArea.classList.add('hidden');
      messageArea.classList.remove(type);
    }, 1000);
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
