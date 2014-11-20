/*!
 * popbox - Tooltip/Popover Library
 * v0.11.4
 * https://github.com/firstandthird/popbox
 * copyright First + Third 2014
 * MIT License
*/
/*!
 * fidel - a ui view controller
 * v2.2.5
 * https://github.com/jgallen23/fidel
 * copyright Greg Allen 2014
 * MIT License
*/
(function(w, $) {
  var _id = 0;
  var Fidel = function(obj) {
    this.obj = obj;
  };

  Fidel.prototype.__init = function(options) {
    $.extend(this, this.obj);
    this.id = _id++;
    this.namespace = '.fidel' + this.id;
    this.obj.defaults = this.obj.defaults || {};
    $.extend(this, this.obj.defaults, options);
    $('body').trigger('FidelPreInit', this);
    this.setElement(this.el || $('<div/>'));
    if (this.init) {
      this.init();
    }
    $('body').trigger('FidelPostInit', this);
  };
  Fidel.prototype.eventSplitter = /^(\w+)\s*(.*)$/;

  Fidel.prototype.setElement = function(el) {
    this.el = el;
    this.getElements();
    this.dataElements();
    this.delegateEvents();
    this.delegateActions();
  };

  Fidel.prototype.find = function(selector) {
    return this.el.find(selector);
  };

  Fidel.prototype.proxy = function(func) {
    return $.proxy(func, this);
  };

  Fidel.prototype.getElements = function() {
    if (!this.elements)
      return;

    for (var selector in this.elements) {
      var elemName = this.elements[selector];
      this[elemName] = this.find(selector);
    }
  };

  Fidel.prototype.dataElements = function() {
    var self = this;
    this.find('[data-element]').each(function(index, item) {
      var el = $(item);
      var name = el.data('element');
      self[name] = el;
    });
  };

  Fidel.prototype.delegateEvents = function() {
    if (!this.events)
      return;
    for (var key in this.events) {
      var methodName = this.events[key];
      var match = key.match(this.eventSplitter);
      var eventName = match[1], selector = match[2];

      var method = this.proxy(this[methodName]);

      if (selector === '') {
        this.el.on(eventName + this.namespace, method);
      } else {
        if (this[selector] && typeof this[selector] != 'function') {
          this[selector].on(eventName + this.namespace, method);
        } else {
          this.el.on(eventName + this.namespace, selector, method);
        }
      }
    }
  };

  Fidel.prototype.delegateActions = function() {
    var self = this;
    self.el.on('click'+this.namespace, '[data-action]', function(e) {
      var el = $(this);
      var action = el.attr('data-action');
      if (self[action]) {
        self[action](e, el);
      }
    });
  };

  Fidel.prototype.on = function(eventName, cb) {
    this.el.on(eventName+this.namespace, cb);
  };

  Fidel.prototype.one = function(eventName, cb) {
    this.el.one(eventName+this.namespace, cb);
  };

  Fidel.prototype.emit = function(eventName, data, namespaced) {
    var ns = (namespaced) ? this.namespace : '';
    this.el.trigger(eventName+ns, data);
  };

  Fidel.prototype.hide = function() {
    if (this.views) {
      for (var key in this.views) {
        this.views[key].hide();
      }
    }
    this.el.hide();
  };
  Fidel.prototype.show = function() {
    if (this.views) {
      for (var key in this.views) {
        this.views[key].show();
      }
    }
    this.el.show();
  };

  Fidel.prototype.destroy = function() {
    this.el.empty();
    this.emit('destroy');
    this.el.unbind(this.namespace);
  };

  Fidel.declare = function(obj) {
    var FidelModule = function(el, options) {
      this.__init(el, options);
    };
    FidelModule.prototype = new Fidel(obj);
    return FidelModule;
  };

  //for plugins
  Fidel.onPreInit = function(fn) {
    $('body').on('FidelPreInit', function(e, obj) {
      fn.call(obj);
    });
  };
  Fidel.onPostInit = function(fn) {
    $('body').on('FidelPostInit', function(e, obj) {
      fn.call(obj);
    });
  };
  w.Fidel = Fidel;
})(window, window.jQuery || window.Zepto);

(function($) {
  $.declare = function(name, obj) {

    $.fn[name] = function() {
      var args = Array.prototype.slice.call(arguments);
      var options = args.shift();
      var methodValue;
      var els;

      els = this.each(function() {
        var $this = $(this);

        var data = $this.data(name);

        if (!data) {
          var View = Fidel.declare(obj);
          var opts = $.extend({}, options, { el: $this });
          data = new View(opts);
          $this.data(name, data); 
        }
        if (typeof options === 'string') {
          methodValue = data[options].apply(data, args);
        }
      });

      return (typeof methodValue !== 'undefined') ? methodValue : els;
    };

    $.fn[name].defaults = obj.defaults || {};

  };

  $.Fidel = window.Fidel;

})(jQuery);

(function($) {
  $.declare('popbox', {
    defaults: {
      containerClass: 'popbox',
      direction: 'smart',
      directionClasses: 'left left-edge up right right-edge down left-up right-up',
      directionOffset: 10,
      animOffset: 5,
      hideTimeout: 100,
      enableHover: true,
      clickToShow: true
    },

    init: function () {
      this.open = false;
      this.hoveringOverTooltip = false;
      this.hideTimer = null;

      this.text = this.el.data('popbox-text') || '';
      this.title = this.el.data('popbox-title') || '';
      this.templateEl = this.el.data('popbox-el') || '';
      this.direction = this.el.data('popbox-direction') || this.direction;
      this.template = '';

      this.transitionEvents = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';

      this.attachEvents();
    },

    isOpen: function () {
      return this.open;
    },

    attachEvents: function () {
      if(this.enableHover) {
        this.el.bind('mouseenter.popbox', this.proxy(this.show));
        this.el.bind('mouseleave.popbox', this.proxy(this.hide));
      }
    },

    reset: function () {
      if (this.template){
        this.template.unbind('.popbox');
        this.template.remove();
      }
    },

    show: function (e) {
      if(this.hoveringOverTooltip) return;
      
      if (!this.text) {
        return;
      }

      if(typeof e !== 'undefined' && this.forcedOpen) return;

      if(typeof e === 'undefined') {
        this.forcedOpen = true;
      }

      if(!this.open) {
        $('body').append(this.generateTemplate());

        this.template.bind('mouseenter.popbox', this.proxy(this.hoverTooltip));
        this.template.bind('mouseleave.popbox', this.proxy(this.hoverLeaveTooltip));
        this.template.bind('click.popbox', this.proxy(this.popboxClick));

        this.position();
        this.template.addClass('open');
      }

      clearTimeout(this.hideTimer);
      this.template.unbind(this.transitionEvents);

      this.open = true;
      this.el.trigger('show');
    },

    hide: function (e) {
      if(this.hoveringOverTooltip) return;

      if(!this.open) return;

      if(typeof e !== 'undefined' && this.forcedOpen) return;

      if(typeof e === 'undefined') {
        this.forcedOpen = false;
      }

      this.hideTimer = setTimeout(this.proxy(function() {
        this.template.removeClass('open');

        // $().one() can be a bit spotty with transition events. Better to manually unbind.
        this.template.bind(this.transitionEvents, this.proxy(function() {
          this.template.unbind(this.transitionEvents);
          this.reset();
          this.el.trigger('hide');
          this.hoveringOverTooltip = false;
        }));

        this.open = false;
        
      }), this.hideTimeout);
    },

    toggle: function (e) {
      if(!this.clickToShow) return;

      if(this.open) {
        this.hide(e);
      } else {
        this.show(e);
      }

      return false;
    },

    position: function () {
      this.template.css({
        position: 'absolute'
      });

      this.template.removeClass(this.directionClasses);

      var elOffset = this.el.offset();
      var left, top;
      var right = 'auto';
      var direction = this.direction;
      var good = false;
      var index = 0;

      // The order of these can be changed based ideal position
      var positions = ['down', 'up', 'left', 'right', 'left-up', 'right-up', 'down']; //down is default if nothing fits

      if(this.direction === 'smart') {
        direction = positions[0];
      }

      while(!good) {
        index++;

        switch(direction) {
          case 'left':
            left = elOffset.left - this.template.outerWidth() - this.directionOffset - this.animOffset;
            top = (elOffset.top + this.el.outerHeight() / 2) - (this.template.outerHeight() / 2);
            this.template.addClass('left');
            break;
          case 'up':
            left = (elOffset.left + this.el.outerWidth() / 2) - (this.template.outerWidth() / 2);
            top = elOffset.top  - this.template.outerHeight() - this.directionOffset - this.animOffset;
            this.template.addClass('up');
            break;
          case 'right':
            left = elOffset.left + this.el.outerWidth() + this.directionOffset + this.animOffset;
            top = (elOffset.top + this.el.outerHeight() / 2) - (this.template.outerHeight() / 2);
            this.template.addClass('right');
            break;
          case 'down':
            left = (elOffset.left + this.el.outerWidth() / 2) - (this.template.outerWidth() / 2);
            top = elOffset.top  + this.el.outerHeight() + this.directionOffset + this.animOffset;
            this.template.addClass('down');
            break;
          case 'left-up':
            left = (elOffset.left) - (this.template.outerWidth() / 2);
            top = elOffset.top  - this.template.outerHeight() - this.directionOffset - this.animOffset;
            this.template.addClass('left-up');
            break;
          case 'right-up':
            left = (elOffset.left + this.el.outerWidth()) - (this.template.outerWidth() / 2);
            top = elOffset.top  - this.template.outerHeight() - this.directionOffset - this.animOffset;
            this.template.addClass('right-up');
            break;
        }

        if(this.direction === 'smart') {
          this.template.css({
            left: left,
            right: right,
            top: top
          });

          if(this.isInViewport(this.template) || index === positions.length) {
            good = true;
          } else {
            direction = positions[index];
            this.template.removeClass(this.directionClasses);
          }
        } else {
          good = true;
        }
      }

      if(($(window).width() - (left + this.template.outerWidth())) < 0) {
        this.template.addClass('right-edge');
        left = 'auto';
        right = 0;
      } else if(left < 0) {
        this.template.addClass('left-edge');
        left = 0;
      }

      this.template.css({
        left: left,
        right: right,
        top: top
      });
    },

    generateTemplate: function () {
      if(this.template) return this.template;

      var container = $(document.createElement('div'));
      var title = $(document.createElement('div'));
      var text = $(document.createElement('div'));

      container.addClass(this.containerClass);

      if(this.templateEl) {
        container.append($(this.templateEl).html());
      } else {
        if(this.title) {
          title.addClass('title');
          title.html(this.title);
          container.append(title);
        }

        if(this.text) {
          text.addClass('text');
          text.html(this.text);
          container.append(text);
        }
      }

      this.template = container;
      return this.template;
    },

    hoverTooltip: function () {
      clearTimeout(this.hideTimer);
      this.hoveringOverTooltip = true;
    },

    hoverLeaveTooltip: function () {
      this.hoveringOverTooltip = false;
      this.el.trigger('mouseleave.popbox');
    },

    setText: function(text){
      this.text = text;

      if (this.open){
        this.template.find('.text').text(text);
      }
    },

    popboxClick: function(e) {
      this.emit('popboxClick');
    },

    destroy: function(){
      this.reset();
      this.el.unbind('.popbox');

      Fidel.prototype.destroy.call(this);
    },

    isInViewport: function(el) {
      var rect = el[0].getBoundingClientRect();

      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= $(window).height() &&
        rect.right <= $(window).width()
      );
    }
  });

  if(!$.popboxDisableAutoAPI) {
    $('[data-popbox]').popbox();
  }
})(jQuery);
