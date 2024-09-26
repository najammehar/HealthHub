// Back to top Button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  var button = document.getElementById("back-to-top-btn");
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    button.style.display = "block";
    button.style.opacity = 1;
  } else {
    button.style.display = "none";
    button.style.opacity = 0;
  }
}

function scrollToTop() {
  var currentPosition = document.documentElement.scrollTop || document.body.scrollTop;
  if (currentPosition > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, currentPosition - currentPosition / 8);
  }
}


// On Card-Click
function navigateToPage(url) {
        window.location.href = url;
    }


$(document).ready(function() {
  // Function to handle form display based on button click
  function handleFormDisplay(button) {
      let formType = button.data('form-type');
      let formName = button.data('form-name');

      // Hide all forms
      $('form').hide();

      // Show the selected form
      $(`form[data-form-type="${formType}"][data-form-name="${formName}"]`).show();

      // Remove selected class from all buttons
      $('.unit-buttons span').removeClass('selected');

      // Add selected class to the clicked button
      button.addClass('selected');
  }

  // Event listener for button clicks
  $('.unit-buttons span').on('click', function() {
      handleFormDisplay($(this));
  });

  // Trigger click on the add button to show the add form by default
  let defaultAddButton = $('.unit-buttons span[data-form-type="add"]').first();
  handleFormDisplay(defaultAddButton);
});

$('#staffHome').on('click', function() {
  window.location.href = 'staffhms';
});
$('#adminHome').on('click', function() {
  window.location.href = 'admin';
});

const options = {
  threshhold: 0.1,
};
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if(entry.isIntersecting){
      entry.target.classList.add('show');
    }else{
      entry.target.classList.remove('show')
    }
  })
}, options);
const cards = document.querySelectorAll('.card-pack');
cards.forEach((card) => {
  observer.observe(card);
})
const card = document.querySelectorAll('.card');
card.forEach((card) => {
  observer.observe(card);
})