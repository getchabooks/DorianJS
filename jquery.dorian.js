/** Dorian.js
 * Michael Lazer-Walker
 * https://github.com/lazerwalker/jquery-modal
 * Licensed under the MIT License
 *
 * Another jQuery modal plugin.
 *
 * Open a modal by calling $.modal({options});
 * Close the current modal by calling $.modal.close();
 * If you open a modal while one is already open, the old one will auto-close.
 * See inline comments on the 'defaults' object below for available options.
 *
 * You will want to include dorian.min.css or dorian.scss for proper rendering.
 * dorian-default provides some basic styling, but is not required.
 **/

;(function($, window, undefined) {
  var opts = {};
  var $el, $shade, $wrapper;

  $.modal = function(options) {
    var defaults = {
      //------------------------------------------------------------
      // Content variables
      //------------------------------------------------------------
      // The contents of the modal itself.
      // Either an HTML string or a function that returns a string.
      html: '',

      // A space-separated string of classes to be applied
      classString: '',

      // You can manually specify the width and height in px
      // (this can also be done via CSS)
      height: '',
      width: '',


      //------------------------------------------------------------
      // Callback functions
      //------------------------------------------------------------
      onCreate: function() {},
      onDestroy: function() {},


      //------------------------------------------------------------
      // Behavioral flags
      //------------------------------------------------------------
      // Show/hide using jQuery fade animations
      fade: true,

      // Allow to be dismissed by pressing the 'esc' key
      keyboardDismiss: true,

      // Allow to be dismissed by clicking the shade outside the modal
      clickToDismiss: true,

      // Position the modal relative to the current scroll position,
      // rather than the absolute top of the page
      // (you probably don't want to set this to false)
      respectScroll: true,

      // If clickToDismiss is enabled, there is a bug that precludes it from
      // working on touch devices. Set this to true on touch devices to enable a
      // workaround.
      touch: false,


      //-------------------------------------------------------------
      // Element IDs. You shouldn't need to modify these
      // unless you have namespace collisions with your markup.
      //-------------------------------------------------------------
      // Semi-translucent backdrop that occludes the rest of the page
      shade: "modal-shade",

      // Wrapper div to help position the modal
      wrapper: "modal-wrapper",

      // The modal itself
      el: "modal",

      // The close button. Set to false if you don't have/want one.
      closeButton: "modal-cancel"
    };

    opts = $.extend(defaults, options || {});

    $el = $("#" + opts.el);
    if(!!$el.length){
      remove($el, create);
    } else {
      create();
    }
  }

  // Checks if an object is equivalent to a CSS pixel value
  // (accepts values of the form 5, '5', or '5px')
  function isNumber(obj) {
    var type = Object.prototype.toString.call(obj);
    if(type == '[object String]') {
        val = +(obj.replace(/px$/, ''));
        return(isNumber(val));
    } else if (type === '[object Number]') {
      return !(obj !== obj);
    }
    return false;
  }

  function createDivIfNotExists(id) {
    var $e = $("#" + id);
    if (!$e.length) {
      $e = $("<div id='" + id + "'></div>");
    }
    return $e;
  }

  function create() {
    $shade = createDivIfNotExists(opts.shade);
    $wrapper = createDivIfNotExists(opts.wrapper);
    $el = createDivIfNotExists(opts.el);

    if (opts.classString) {
      $el.addClass(opts.classString);
    }

    var content;
    if(typeof opts.html === 'function') {
      content = opts.html();
    } else {
      content = opts.html;
    }

    $el.html(content)
      .appendTo($wrapper);
    $wrapper.appendTo('body');
    $shade.appendTo('body');

    if(opts.closeButton) {
      var $cancel = createDivIfNotExists(opts.closeButton)
        .appendTo($el);
      $cancel.on('click', close);
    }

    if (isNumber(opts.width)) {
      $el.width(opts.width);
    }

    if (isNumber(opts.height)) {
      $el.height(opts.height);
    }

    if (opts.respectScroll) {
      $wrapper.css('margin-top', $(document).scrollTop());
    }

    if(opts.fade) {
      $shade.fadeIn('fast').show();
      $el.fadeIn('fast').show();
    }

    if (opts.clickToDismiss) {
      var clickEvent = 'click';
      if (opts.touch) { clickEvent = 'touchend'; }

      $(document).on(clickEvent, '#' + opts.shade + ', #' + opts.wrapper, function(e) {
        var $target = $(e.target);
        if ($target.is($shade) || $target.is($wrapper)) {
          close();
        }
      });
    }

    if (opts.keyboardDismiss) {
      $(document).on('keyup', handleKeys);
    }

    if (typeof opts.onCreate === 'function') {
      opts.onCreate();
    }
  }

  function handleKeys(e) {
    if (e.keyCode === 27) {  // escape key
      close();
    }
  }

  /** Closes the modal and the shade.
  * If an onDestroy callback was specified, this will call it with the
  * triggering event object as a parameter. */
  function close(e) {
    if (opts.keyboardDismiss) {
      $(document).off('keyup', handleKeys);
    }

    remove($el, opts.onDestroy, e);
    remove($shade);
  }

  /**
  * Destroys a DOM element, fading if appropriate
  * $obj: DOM elemenet to destroy
  * callbackFn: function to be called after completion
  * data: argument to pass to the callback
  */
  function remove($obj, callbackFn, data) {
    function doRemove() {
      $obj.remove();
      if (typeof callbackFn === 'function') {
        callbackFn(data);
      }
    }

    if (opts.fade) {
      $obj.fadeOut('fast', doRemove);
    } else {
      doRemove();
    }
  }

  $.modal.close = close;
})(jQuery, this);