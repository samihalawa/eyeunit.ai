document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const submitButton = document.getElementById('submitButton');
  const buttonText = document.getElementById('buttonText');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const formMessage = document.getElementById('formMessage');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Reset messages
      successMessage.classList.add('hidden');
      errorMessage.classList.add('hidden');
      formMessage.classList.add('hidden');

      // Show loading state
      buttonText.textContent = 'Sending...';
      loadingSpinner.classList.remove('hidden');
      submitButton.disabled = true;

      try {
        const formData = {
          name: contactForm.name.value,
          email: contactForm.email.value,
          organization: contactForm.organization.value,
          subject: contactForm.subject.value,
          message: contactForm.message.value
        };

        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
          // Show success message
          successMessage.classList.remove('hidden');
          formMessage.classList.remove('hidden');
          contactForm.reset();
        } else {
          // Show error message
          errorMessage.textContent = result.message || 'Failed to send message. Please try again later.';
          errorMessage.classList.remove('hidden');
          formMessage.classList.remove('hidden');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        errorMessage.textContent = 'Failed to send message. Please try again later.';
        errorMessage.classList.remove('hidden');
        formMessage.classList.remove('hidden');
      } finally {
        // Reset button state
        buttonText.textContent = 'Send Message';
        loadingSpinner.classList.add('hidden');
        submitButton.disabled = false;
      }
    });
  }
}); 