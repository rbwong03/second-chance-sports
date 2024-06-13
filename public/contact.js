/**
 * Ryan Wong
 * June 2024
 *
 * This is the .js file that handles the contact page.
 */

(function () {
  'use strict';

  function init() {
    document
      .getElementById('contactForm')
      .addEventListener('submit', handleFormSubmission);
  }

  /**
   * This functions handles the form submission.
   */
  function handleFormSubmission(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    const feedback = {
      name,
      email,
      subject,
      message,
    };

    submitFeedback(feedback);
  }

  /**
   * This function submits the feedback.
   */
  async function submitFeedback(feedback) {
    try {
      const response = await fetch('/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      const formResponse = document.getElementById('formResponse');
      checkStatus(response);
      formResponse.textContent = 'Thank you for your feedback!';
      formResponse.classList.remove('hidden');
      formResponse.classList.add('visible');
      document.getElementById('contactForm').reset();
    } catch (error) {
      const formResponse = document.getElementById('formResponse');
      formResponse.textContent =
        'Failed to submit feedback. Please try again later.';
      formResponse.classList.remove('hidden');
      formResponse.classList.add('visible');
    } finally {
      setTimeout(() => {
        const formResponse = document.getElementById('formResponse');
        formResponse.classList.remove('visible');
        formResponse.classList.add('hidden');
      }, 1000);
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

  init();
})();
