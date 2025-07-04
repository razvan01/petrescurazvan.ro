/**
* PHP Email Form Validation - v3.10
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function (e) {
    e.addEventListener('submit', function (event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');

      if (!action) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData(thisForm);

      if (recaptcha) {
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.ready(function () {
            try {
              grecaptcha.execute(recaptcha, { action: 'php_email_form_submit' })
                .then(token => {
                  formData.set('recaptcha-response', token);
                  php_email_form_submit(thisForm, action, formData);
                })
            } catch (error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    fetch(action, {
      method: 'POST',
      body: formData,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(response => {
        if (response.ok) {
          // Încercăm să parsăm JSON-ul
          return response.text().then(text => {
            try {
              let json = JSON.parse(text);
              return json;
            } catch (e) {
              // Dacă nu e JSON, returnăm textul normal
              return text;
            }
          });
        } else {
          if (response.status === 422) {
            throw new Error('Please verify that all fields in the form are correctly completed.');
          } else {
            throw new Error(`${response.status} ${response.statusText} ${response.url}`);
          }
        }
      })
      .then(data => {
        thisForm.querySelector('.loading').classList.remove('d-block');

        if (typeof data === 'object' && data.ok) {
          // E JSON valid și ok==true
          thisForm.querySelector('.sent-message').classList.add('d-block');
          thisForm.reset();
        } else if (typeof data === 'string' && data.trim() == 'OK') {
          // E text simplu 'OK'
          thisForm.querySelector('.sent-message').classList.add('d-block');
          thisForm.reset();
        } else {
          // Altceva — tratăm ca eroare
          throw new Error(typeof data === 'object' ? JSON.stringify(data) : data);
        }
      })
      .catch((error) => {
        displayError(thisForm, error);
      });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
