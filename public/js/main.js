// Main JavaScript for Best University Registration System

document.addEventListener('DOMContentLoaded', function() {
  // Enable Bootstrap tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Enable Bootstrap popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  // Handle course enrollment form submission
  const enrollmentForm = document.getElementById('enrollment-form');
  if (enrollmentForm) {
    enrollmentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Show loading state
      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
      
      // Submit the form data via fetch API
      fetch(this.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(new FormData(this))),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          window.location.href = data.redirectUrl || '/dashboard';
        } else {
          // Show error message
          const alertDiv = document.createElement('div');
          alertDiv.className = 'alert alert-danger';
          alertDiv.textContent = data.message || 'An error occurred. Please try again.';
          this.prepend(alertDiv);
          
          // Reset button
          submitButton.disabled = false;
          submitButton.innerHTML = originalText;
        }
      })
      .catch(error => {
        console.error('Error:', error);
        // Show error message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger';
        alertDiv.textContent = 'An error occurred. Please try again.';
        this.prepend(alertDiv);
        
        // Reset button
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      });
    });
  }

  // Handle application form submission
  const applicationForm = document.getElementById('application-form');
  if (applicationForm) {
    applicationForm.addEventListener('submit', function(e) {
      // Form validation can be added here
      const requiredFields = this.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('is-invalid');
        } else {
          field.classList.remove('is-invalid');
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger';
        alertDiv.textContent = 'Please fill in all required fields.';
        this.prepend(alertDiv);
      }
    });
  }

  // Handle cart functionality
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  if (addToCartButtons.length > 0) {
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const productId = this.dataset.productId;
        const productName = this.dataset.productName;
        
        // Show loading state
        const originalText = this.innerHTML;
        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        
        // Add to cart via fetch API
        fetch('/shop/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId, quantity: 1 }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Update cart count
            const cartCountElement = document.getElementById('cart-count');
            if (cartCountElement) {
              cartCountElement.textContent = data.cartCount;
              cartCountElement.classList.remove('d-none');
            }
            
            // Show success message
            const toast = document.createElement('div');
            toast.className = 'position-fixed bottom-0 end-0 p-3';
            toast.style.zIndex = '11';
            toast.innerHTML = `
              <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                  <strong class="me-auto">Shopping Cart</strong>
                  <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                  ${productName} has been added to your cart.
                </div>
              </div>
            `;
            document.body.appendChild(toast);
            
            // Auto remove toast after 3 seconds
            setTimeout(() => {
              toast.remove();
            }, 3000);
          } else {
            alert(data.message || 'Failed to add item to cart');
          }
          
          // Reset button
          this.disabled = false;
          this.innerHTML = originalText;
        })
        .catch(error => {
          console.error('Error:', error);
          alert('An error occurred. Please try again.');
          
          // Reset button
          this.disabled = false;
          this.innerHTML = originalText;
        });
      });
    });
  }

  // Handle admin application approval/rejection
  const approveButtons = document.querySelectorAll('.approve-application');
  const rejectButtons = document.querySelectorAll('.reject-application');
  
  if (approveButtons.length > 0) {
    approveButtons.forEach(button => {
      button.addEventListener('click', function() {
        const applicationId = this.dataset.applicationId;
        
        if (confirm('Are you sure you want to approve this application? This will create a student account.')) {
          fetch(`/admin/applications/${applicationId}/approve`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert(`Application approved! A student account has been created.\nTemporary password: ${data.tempPassword}`);
              location.reload();
            } else {
              alert(data.message || 'Failed to approve application');
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
          });
        }
      });
    });
  }
  
  if (rejectButtons.length > 0) {
    rejectButtons.forEach(button => {
      button.addEventListener('click', function() {
        const applicationId = this.dataset.applicationId;
        const reason = prompt('Please provide a reason for rejection:');
        
        if (reason) {
          fetch(`/admin/applications/${applicationId}/reject`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reason })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert('Application rejected successfully');
              location.reload();
            } else {
              alert(data.message || 'Failed to reject application');
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
          });
        }
      });
    });
  }
});
