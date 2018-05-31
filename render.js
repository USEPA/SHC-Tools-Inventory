var shell = require('electron').shell;
jQuery(document).on('click', 'a[href^="http"]', function(event) {
    console.log("catch link");
    event.preventDefault();
    shell.openExternal(this.href);
});

jQuery('form.epa-search').remove();