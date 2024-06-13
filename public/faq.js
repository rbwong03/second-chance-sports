/**
 * Ryan Wong
 * June 2024
 *
 * This is the .js file that handles the faq page.
 */

(function () {
  'use strict';

  function init() {
    fetchFaqs();
  }

  /**
   * This function fetches the FAQs from the server.
   */
  async function fetchFaqs() {
    try {
      const response = await fetch('/faqs');
      checkStatus(response);
      const faqs = await response.json();
      displayFaqs(faqs);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * This function displays the FAQs on the page.
   */
  function displayFaqs(faqs) {
    const faqContainer = document.querySelector('.faq');
    faqs.forEach((faq) => {
      const faqItem = document.createElement('div');
      faqItem.classList.add('faq-item');

      const question = document.createElement('h3');
      question.classList.add('faq-question');
      question.textContent = faq.question;

      const answer = document.createElement('div');
      answer.classList.add('faq-answer');
      answer.textContent = faq.answer;

      faqItem.appendChild(question);
      faqItem.appendChild(answer);
      faqContainer.appendChild(faqItem);
    });
    setupFaq();
  }

  /**
   * This function sets up the FAQ items.
   */
  function setupFaq() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
        const answer = item.querySelector('.faq-answer');
        const isVisible = answer.style.display === 'block';

        document.querySelectorAll('.faq-answer').forEach((answer) => {
          answer.style.display = 'none';
        });

        if (!isVisible) {
          answer.style.display = 'block';
        }
      });
    });
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
