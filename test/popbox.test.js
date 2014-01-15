$.fn.popbox.defaults.hideTimeout = 10;
$.fn.popbox.defaults.hideFadeDuration = 10;

suite('popbox', function() {
  var tooltip,
      tooltipTitle,
      tooltipCustom,
      tooltipBlank;

  setup(function() {
    tooltip = $('.hover-popbox').clone();
    tooltipTitle = $('.hover-popbox-title').clone();
    tooltipCustom = $('.custom-popbox').clone();
    tooltipBlank = $('.blank-popbox').clone();

    tooltip.removeData();
    tooltipTitle.removeData();
    tooltipCustom.removeData();
    tooltipBlank.removeData();

    $('.popbox').remove();
  });

  suite('init', function() {

    test('$().popbox exists', function() {
      assert.equal(typeof tooltip.popbox, 'function');
    });
  });

  suite('generateTemplate', function() {
    test('template without title', function() {
      tooltip.popbox();

      assert.equal(tooltip.popbox('generateTemplate')[0].outerHTML, '<div class="popbox"><div class="text">This is a tooltip</div></div>');
    });

    test('template with title', function() {
      tooltipTitle.popbox();

      assert.equal(tooltipTitle.popbox('generateTemplate')[0].outerHTML, '<div class="popbox"><div class="title">Awesome title</div><div class="text">This is a tooltip</div></div>');
    });

    test('custom template', function() {
      tooltipCustom.popbox();

      assert.equal(tooltipCustom.popbox('generateTemplate')[0].innerHTML, $('.custom-popbox-content')[0].innerHTML);
    });
  });

  suite('show', function() {
    test('show on mouseenter', function() {
      tooltip.popbox();

      tooltip.mouseenter();

      assert.equal(tooltip.popbox('isOpen'), true);
    });

    test('show on click', function() {
      tooltip.popbox();

      tooltip.popbox('toggle');

      assert.equal($('.popbox').length, 1);
    });

    test('show manually', function() {
      tooltip.popbox();

      tooltip.popbox('show');

      assert.equal($('.popbox').length, 1);
    });

    test('show event triggered', function(done) {
      tooltip.popbox();

      tooltip.one('show', function() {
        assert.ok(true);
        done();
      });

      tooltip.popbox('show');
    });

    test('don\'t show if blank', function() {
      tooltipBlank.popbox();

      tooltipBlank.mouseenter();

      assert.equal(tooltipBlank.popbox('isOpen'), false);
    });

  });

  suite('hide', function() {
    test('hide on mouseleave', function(done) {
      tooltip.popbox();

      tooltip.mouseenter();
      tooltip.mouseleave();

      setTimeout(function() {
        assert.equal($('.popbox').length, 0);
        done();
      }, 100);
    });

    test('hide on click', function(done) {
      tooltip.popbox();

      tooltip.popbox('toggle');
      tooltip.popbox('toggle');

      setTimeout(function() {
        assert.equal($('.popbox').length, 0);
        done();
      }, 100);
    });

    test('hide manually', function(done) {
      tooltip.popbox();

      tooltip.popbox('show');
      tooltip.popbox('hide');

      setTimeout(function() {
        assert.equal($('.popbox').length, 0);
        done();
      }, 100);

    });

    test('hide event triggered', function(done) {
      tooltip.popbox();

      tooltip.one('hide', function() {
        assert.ok(true);
        done();
      });

      tooltip.popbox('show');
      tooltip.popbox('hide');
    });
  });

  suite('setText', function(){
    test('normal update', function(){
      tooltip.popbox();

      tooltip.data('popbox').setText('New text');
      assert.equal(tooltip.popbox('generateTemplate')[0].outerHTML, '<div class="popbox"><div class="text">New text</div></div>');
    });
    test('while opened update', function(){
      tooltip.popbox();
      tooltip.popbox('show');
      tooltip.data('popbox').setText('New text');
      assert.equal($('.text').text(),'New text');
    });
  });

  suite('popboxClick', function() {
    test('trigger event when popbox clicked', function(done) {
      tooltip.popbox();
      tooltip.on('popboxClick', function() {
        done();
      });
      tooltip.popbox('show');
      $('.popbox').click();
    });
  });
});
