function submitFeedback(event) {
    event.preventDefault();
    var type = jQuery('#feedback-modal input[name="feedback-type"]:checked').val();
    var messageBody = jQuery('#feedback-text').val();
    var path = window.location.pathname;
    var page = path.split("/").pop();
    var subject = encodeURIComponent(page + " feedback: " + type);
    var body = encodeURIComponent(messageBody);
    var mailTo = "mailto:SHCTools@epa.gov?subject=" + subject;
    jQuery('<a>').attr('href', mailTo)[0].click();
  }

/**
 * Display the feedback modal when the link is clicked.
 * @listens click
 */
jQuery('#feedback-link').click(function () {
    jQuery('#feedback-modal').css('display', 'block');
  });
  
  /**
   * Close the feedback modal when the close button is clicked.
   * @listens click
   */
  jQuery('.close').click(function () {
    jQuery('#feedback-modal').css('display', 'none');
  });
  
  /**
   * Close the feedback modal if there is a click registered on the background of the modal.
   * @param {event} e - The click event.
   * @listens click
   */
  jQuery('#feedback-modal').click(function (e) {
    if (e.target === jQuery('#feedback-modal')[0]) {
        jQuery('#feedback-modal').css('display', 'none');
    }
  });
  