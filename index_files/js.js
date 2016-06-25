(function ($) {

// Remove no-js class
Drupal.behaviors.epa = {
  attach: function (context) {
    $('html.no-js', context).removeClass('no-js');
  }
}

// Accessible skiplinks
Drupal.behaviors.skiplinks = {
  attach: function (context) {
    var isWebkit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1,
        isOpera = navigator.userAgent.toLowerCase().indexOf('opera') > -1;

    // Set tabindex on the skiplink targets so IE knows they are focusable, and
    // so Webkit browsers will focus() them.
    $('#main-content, #site-navigation', context).attr('tabindex', -1);

    // Set focus to skiplink targets in Webkit and Opera.
    if(isWebkit || isOpera) {
      $('.skip-links a[href^="#"]', context).click(function() {
        var clickAnchor = '#' + this.href.split('#')[1];
        $(clickAnchor).focus();
      });
    }
  }
};

// Add 'new' class if content is less than 30 days old.
Drupal.behaviors.epaNew = {
  attach: function (context) {
    var now = new Date();

    $('ins[data-date]', context).each(function() {
      var data = $(this).data(),
          expires = new Date(data.date),
          offset = 30 * 24 * 60 * 60 * 1000;
      expires.setTime(expires.getTime() + offset);
      if (now < expires) {
        $(this).addClass('new');
      }
    });
  }
}

// Use jQuery tablesorter plugin.
Drupal.behaviors.tablesorter = {
  attach: function (context) {
    $('table.tablesorter', context).tablesorter();
  }
}

// Add simple accordion behavior.
Drupal.behaviors.accordion = {
  attach: function (context) {
    $('.accordion', context).each(function () {
      var $titles = $(this).find('.accordion-title'),
          $panes = $titles.next('.accordion-pane');
      $panes.hide();
      $titles.each(function () {
        var $target = $(this).next('.accordion-pane');
        $(this).click(function(e) {
          if(!$(this).hasClass('active')) {
            $titles.removeClass('active');
            $panes.slideUp().removeClass('active');
            $(this).addClass('active');
            $target.slideDown().addClass('active');
          }
          else {
            $(this).removeClass('active');
            $target.slideUp().removeClass('active');
          }
          e.preventDefault();
        });
      });
    });
  }
}

// Move header images before .pane-content.
Drupal.behaviors.headerImages = {
  attach: function (context) {
    $('.image.mode-block_header:not(.caption)', context).each(function () {
      var $image = $(this),
          $parent = $image.parent();

      $image.detach();
      $parent.before($image);
    });
  }
}

// Convert main menu into a mobile menu and move original menu.
Drupal.behaviors.mobileMenu = {
  attach: function (context) {

    // Create mobile menu container, create mobile bar, and clone the main menu.
    var $mobileNav = $('<nav id="mobile-nav" class="mobile-nav"></nav>'),
        $mobileBar = $('<div class="mobile-bar clearfix"><a class="mobile-home" href="http://www2.epa.gov/" rel="home"><span class="mobile-home-icon">Home</span></a> <a class="menu-button" href="#mobile-links">Menu</a></div>'),
        $mobileLinks = $('<div id="mobile-links" class="mobile-links element-hidden"></div>'),
        $mainNav = $('.simple-main-nav', context),
        $secondaryNav = $('.simple-secondary-nav', context),
        $newMenu = $mainNav.find('> .menu').clone();

    // Reset menu list class and remove second level menu items.
    $newMenu.attr('class', 'menu').find('ul').each(function() {
      $(this).attr('class', 'menu sub-menu');
    });
    $newMenu.find('ul').remove();

    // Insert the cloned menus into the mobile menu container.
    $newMenu.appendTo($mobileLinks);

    // Insert the top bar into mobile menu container.
    $mobileBar.prependTo($mobileNav);

    // Insert the mobile links into mobile menu container.
    $mobileLinks.appendTo($mobileNav);

    // Add mobile menu to the page.
    $('.masthead', context).before($mobileNav);

    // Open/Close mobile menu when menu button is clicked.
    var $mobileMenuWrapper = $('#mobile-nav', context).find('.mobile-links'),
        $mobileMenuLinks = $mobileMenuWrapper.find('a');

    $mobileMenuLinks.attr('tabindex', -1);
    $('.mobile-bar .menu-button', context).click(function(e) {
      $(this).toggleClass('menu-button-active');
      $mobileMenuWrapper.toggleClass('element-hidden');
      // Take mobile menu links out of tab flow if hidden.
      if ($mobileMenuWrapper.hasClass('element-hidden')) {
        $mobileMenuLinks.attr('tabindex', -1);
      }
      else {
        $mobileMenuLinks.removeAttr('tabindex');
      }
      e.preventDefault();
    });

    // Set the height of the menu.
    $mobileMenuWrapper.height($(document).height());

    var breakpoint = 640; /* 40em */
    if (document.documentElement.clientWidth >= breakpoint) {

      // Detach original menus and reset classes.
      $mainNav.detach().attr('class', 'nav main-nav clearfix');
      $secondaryNav.detach().attr('class', 'nav secondary-nav');

      // Add pipeline class to secondary menu.
      $secondaryNav.find('.secondary-menu').addClass('pipeline');

      // Move main and secondary menus to the top of the page for wide screens.
      $('.masthead').before($secondaryNav);
      $('.masthead').after($mainNav);
    }

  }
};

// Accessible drop-down menus
Drupal.behaviors.dropDownMenu = {
  attach: function (context) {

    var $mainMenu = $('.main-nav', context).find('> .menu'),
        $topItems = $mainMenu.find('> .menu-item'),
        $topLinks = $topItems.find('> .menu-link'),
        $subLinks = $topItems.find('> .menu > .menu-item > .menu-link');

    // attach dropdown menu links
    $('li#menu-learn').append('<ul class="menu"><li class="menu-item"><a href="http://www2.epa.gov/learn-issues/learn-about-air" class="menu-link">Air</a></li><li class="menu-item"><a href="http://www2.epa.gov/learn-issues/learn-about-chemicals-and-toxics" class="menu-link">Chemicals and Toxics</a></li><li class="menu-item"><a href="http://www.epa.gov/climatechange/" class="menu-link">Climate Change</a></li><li class="menu-item"><a href="http://www2.epa.gov/learn-issues/learn-about-emergencies" class="menu-link">Emergencies</a></li><li class="menu-item"><a href="http://www2.epa.gov/learn-issues/learn-about-greener-living" class="menu-link">Greener Living</a></li><li class="menu-item"><a href="http://www2.epa.gov/learn-issues/learn-about-health-and-safety" class="menu-link">Health and Safety</a></li><li class="menu-item"><a href="http://www2.epa.gov/learn-issues/learn-about-land-and-cleanup" class="menu-link">Land and Cleanup</a></li><li class="menu-item"><a href="http://www2.epa.gov/safepestcontrol" class="menu-link">Pesticides</a></li><li class="menu-item"><a href="http://www2.epa.gov/learn-issues/learn-about-waste" class="menu-link">Waste</a></li><li class="menu-item"><a href="http://www2.epa.gov/learn-issues/learn-about-water" class="menu-link">Water</a></li></ul>');
    $('li#menu-scitech').append('<ul class="menu"><li class="menu-item"><a href="http://www2.epa.gov/science-and-technology/air-science" class="menu-link">Air</a></li><li class="menu-item"><a href="http://www.epa.gov/climatechange/science/" class="menu-link">Climate Change</a></li><li class="menu-item"><a href="http://www2.epa.gov/science-and-technology/ecosystems-science" class="menu-link">Ecosystems</a></li><li class="menu-item"><a href="http://www2.epa.gov/science-and-technology/health-science" class="menu-link">Health</a></li><li class="menu-item"><a href="http://www2.epa.gov/science-and-technology/land-waste-and-cleanup-science" class="menu-link">Land, Waste and Cleanup</a></li><li class="menu-item"><a href="http://www2.epa.gov/science-and-technology/pesticides-science" class="menu-link">Pesticides</a></li><li class="menu-item"><a href="http://www2.epa.gov/science-and-technology/substances-and-toxics-science" class="menu-link">Substances and Toxics</a></li><li class="menu-item"><a href="http://www2.epa.gov/science-and-technology/sustainable-practices-science" class="menu-link">Sustainable Practices</a></li><li class="menu-item"><a href="http://www2.epa.gov/science-and-technology/water-science" class="menu-link">Water</a></li></ul>');
    $('li#menu-lawsregs').append('<ul class="menu"><li class="menu-item"><a href="http://www2.epa.gov/regulatory-information-sector" class="menu-link">By Business Sector</a></li><li class="menu-item"><a href="http://www2.epa.gov/regulatory-information-topic" class="menu-link">By Topic</a></li><li class="menu-item"><a href="http://www2.epa.gov/laws-regulations/compliance" class="menu-link">Compliance</a></li><li class="menu-item"><a href="http://www.epa.gov/enforcement/" class="menu-link">Enforcement</a></li><li class="menu-item"><a href="http://www2.epa.gov/laws-regulations/laws-and-executive-orders" class="menu-link">Laws and Executive Orders</a></li><li class="menu-item"><a href="http://www2.epa.gov/laws-regulations/policy-guidance" class="menu-link">Policy and Guidance</a></li><li class="menu-item"><a href="http://www2.epa.gov/laws-regulations/regulations" class="menu-link">Regulations</a></li></ul>');
    $('li#menu-about').append('<ul class="menu"><li class="menu-item"><a href="http://www2.epa.gov/aboutepa/administrator-gina-mccarthy" class="menu-link">Administrator Gina McCarthy</a></li><li class="menu-item"><a href="http://www2.epa.gov/aboutepa/current-leadership" class="menu-link">Current Leadership</a></li><li class="menu-item"><a href="http://www2.epa.gov/aboutepa/epa-organization-chart" class="menu-link">Organization Chart</a></li><li class="menu-item"><a href="http://cfpub.epa.gov/locator/index.cfm" class="menu-link">Staff Directory</a></li><li class="menu-item"><a href="http://www2.epa.gov/planandbudget" class="menu-link">Planning, Budget and Results</a></li><li class="menu-item"><a href="http://www.epa.gov/careers/" class="menu-link">Jobs and Internships</a></li><li class="menu-item"><a href="http://www2.epa.gov/aboutepa/#pane-2" class="menu-link">Headquarters Offices</a></li><li class="menu-item"><a href="http://www2.epa.gov/aboutepa/#pane-4" class="menu-link">Regional Offices</a></li><li class="menu-item"><a href="http://www2.epa.gov/aboutepa/#pane-5" class="menu-link">Labs and Research Centers</a></li></ul>');

    // Add show-menu class when top links are focused.
    $topLinks.focusin(function() {
      $(this).parent().addClass('show-menu');
    });
    $topLinks.focusout(function() {
      $(this).parent().removeClass('show-menu');
    });

    // Add show-menu class when links are focused.
    $subLinks.focusin(function() {
      $(this).parent().parent().parent().addClass('show-menu');
    });
    $subLinks.focusout(function() {
      $(this).parent().parent().parent().removeClass('show-menu');
    });
  }
};

// Share Links
Drupal.behaviors.shareLinks = {
  attach: function (context) {
    var popURL = encodeURIComponent(window.location.href),
        title = encodeURIComponent(document.title),
        fb = 'https://www.facebook.com/sharer.php?u=' + popURL + '&t=' + title,
        twitter = 'https://twitter.com/intent/tweet?original_referer=' + popURL + '&text=' + title + '&url=' + popURL + '&via=EPA&count=none&lang=en',
        gplus = 'https://plus.google.com/share&url=' + popURL,
        pin = 'http://pinterest.com/pin/create/button/?url=' + popURL + '&description=' + title,
        $shareLinks = $('<li id="share" class="menu-item"><button class="share-button">Share</button><ul><li class="share-facebook"><a class="share-link" href="' + fb + '" title="Share this page">Facebook</a></li><li class="share-twitter"><a class="share-link" href="'+ twitter + '" title="Tweet this page">Twitter</a></li><li class="share-googleplus"><a class="share-link" href="' + gplus + '" title="Plus 1 this page">Google+</a></li><li class="share-pinterest"><a class="share-link" href="' + pin + '" title="Pin this page">Pinterest</a></li></ul></li>');

    // Add dropdown effect.
    $shareLinks.find('.share-button').click(function () {
      $(this).toggleClass('on');
    });

    // Add share links to utility menu.
    $('#block-epa-og-connect .utility-menu', context).append($shareLinks);
  }
};

})(jQuery);
