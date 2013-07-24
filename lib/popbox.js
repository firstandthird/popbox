(function($) {
  $.declare('popbox', {
    defaults: {
      containerClass: 'popbox',
      direction: 'down',
      directionOffset: 10,
      hideFadeDuration: 100,
      showFadeDuration: 50,
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

      this.attachEvents();
    },

    isOpen: function () {
      return this.open;
    },

    attachEvents: function () {
      if(this.enableHover) {
        this.el.bind('mouseenter', this.proxy(this.show));
        this.el.bind('mouseleave', this.proxy(this.hide));
      }
    },

    reset: function () {
      this.template.unbind('mouseenter');
      this.template.unbind('mouseleave');
      this.template.remove();
    },

    show: function (e) {
      if(this.hoveringOverTooltip) return;

      if(typeof e !== 'undefined' && this.forcedOpen) return;

      if(typeof e === 'undefined') {
        this.forcedOpen = true;
      }

      clearTimeout(this.hideTimer);

      if(!this.open) {
        $('body').append(this.generateTemplate());

        this.template.bind('mouseenter', this.proxy(this.hoverTooltip));
        this.template.bind('mouseleave', this.proxy(this.hoverLeaveTooltip));

        this.template.hide().fadeIn(this.showFadeDuration);
        this.position();
      }

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
        this.template.fadeOut(this.hideFadeDuration, this.proxy(this.reset));

        this.open = false;
        this.el.trigger('hide');
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

      var elOffset = this.el.offset();

      switch(this.direction) {
        case 'left':
          this.template.css({
            left: elOffset.left - this.template.outerWidth() - this.directionOffset,
            top: (elOffset.top + this.el.outerHeight() / 2) - (this.template.outerHeight() / 2)
          });
          this.template.addClass('left');
          break;
        case 'up':
          this.template.css({
            left: (elOffset.left + this.el.outerWidth() / 2) - (this.template.outerWidth() / 2),
            top: elOffset.top  - this.template.outerHeight() - this.directionOffset
          });
          this.template.addClass('up');
          break;
        case 'right':
          this.template.css({
            left: elOffset.left + this.el.outerWidth() + this.directionOffset,
            top: (elOffset.top + this.el.outerHeight() / 2) - (this.template.outerHeight() / 2)
          });
          this.template.addClass('right');
          break;
        case 'down':
          this.template.css({
            left: (elOffset.left + this.el.outerWidth() / 2) - (this.template.outerWidth() / 2),
            top: elOffset.top  + this.el.outerHeight() + this.directionOffset
          });
          this.template.addClass('down');
          break;
        case 'left-up':
          this.template.css({
            left: (elOffset.left) - (this.template.outerWidth() / 2),
            top: elOffset.top  - this.template.outerHeight() - this.directionOffset
          });
          this.template.addClass('up');
          break;
        case 'right-up':
          this.template.css({
            left: (elOffset.left + this.el.outerWidth()) - (this.template.outerWidth() / 2),
            top: elOffset.top  - this.template.outerHeight() - this.directionOffset
          });
          this.template.addClass('up');
          break;
      }
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
      this.el.trigger('mouseleave');
    }
  });

  if(!$.popboxDisableAutoAPI) {
    $('[data-popbox]').popbox();
  }
})(jQuery);
