
/*!
 * popbox - Tooltip/Popover Library
 * v0.10.1
 * https://github.com/firstandthird/popbox
 * copyright First + Third 2014
 * MIT License
*/
(function($) {
  $.declare('popbox', {
    defaults: {
      containerClass: 'popbox',
      direction: 'down',
      directionClasses: 'left left-edge up right right-edge down left-up right-up',
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

      clearTimeout(this.hideTimer);

      if(!this.open) {
        $('body').append(this.generateTemplate());

        this.template.bind('mouseenter.popbox', this.proxy(this.hoverTooltip));
        this.template.bind('mouseleave.popbox', this.proxy(this.hoverLeaveTooltip));
        this.template.bind('click.popbox', this.proxy(this.popboxClick));

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
        this.hoveringOverTooltip = false;
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

      this.template.removeClass(this.directionClasses);

      var elOffset = this.el.offset();
      var left, top;
      var right = 'auto';

      switch(this.direction) {
        case 'left':
          left = elOffset.left - this.template.outerWidth() - this.directionOffset;
          top = (elOffset.top + this.el.outerHeight() / 2) - (this.template.outerHeight() / 2);
          this.template.addClass('left');
          break;
        case 'up':
          left = (elOffset.left + this.el.outerWidth() / 2) - (this.template.outerWidth() / 2);
          top = elOffset.top  - this.template.outerHeight() - this.directionOffset;
          this.template.addClass('up');
          break;
        case 'right':
          left = elOffset.left + this.el.outerWidth() + this.directionOffset;
          top = (elOffset.top + this.el.outerHeight() / 2) - (this.template.outerHeight() / 2);
          this.template.addClass('right');
          break;
        case 'down':
          left = (elOffset.left + this.el.outerWidth() / 2) - (this.template.outerWidth() / 2);
          top = elOffset.top  + this.el.outerHeight() + this.directionOffset;
          this.template.addClass('down');
          break;
        case 'left-up':
          left = (elOffset.left) - (this.template.outerWidth() / 2);
          top = elOffset.top  - this.template.outerHeight() - this.directionOffset;
          this.template.addClass('left-up');
          break;
        case 'right-up':
          left = (elOffset.left + this.el.outerWidth()) - (this.template.outerWidth() / 2);
          top = elOffset.top  - this.template.outerHeight() - this.directionOffset;
          this.template.addClass('right-up');
          break;
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
    }
  });

  if(!$.popboxDisableAutoAPI) {
    $('[data-popbox]').popbox();
  }
})(jQuery);
