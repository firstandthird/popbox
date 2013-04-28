$.fn.popbox.defaults.hideTimeout = 10;

suite('popbox', function() {
  var tooltip,
      tooltipTitle,
      tooltipCustom;

  setup(function() {
    tooltip = $('.hover-popbox');
    tooltipTitle = $('.hover-popbox-title');
    tooltipCustom = $('.custom-popbox');
  });

  suite('init', function() {

    test('$().popbox exists', function() {
      assert.equal(typeof tooltip.popbox, 'function');
    });
  });

  suite('generateTemplate', function() {
    test('template without title', function() {
      tooltip.popbox();

      assert.equal(tooltip.popbox('generateTemplate')[0].outerHTML, '<div class="Popbox"><div class="text">This is a tooltip</div></div>');
    });

    test('template with title', function() {
      tooltipTitle.popbox();

      assert.equal(tooltipTitle.popbox('generateTemplate')[0].outerHTML, '<div class="Popbox"><div class="title">Awesome title</div><div class="text">This is a tooltip</div></div>');
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

      tooltip.click();

      assert.equal(tooltip.popbox('isOpen'), true);
    });

    test('show manually', function() {
      tooltip.popbox();

      tooltip.popbox('show');

      assert.equal(tooltip.popbox('isOpen'), true);
    });

    test('show event triggered', function(done) {
      tooltip.popbox();

      tooltip.one('show', function() {
        assert.ok(true);
        done();
      });

      tooltip.popbox('show');
    });
  });

  suite('hide', function() {
    test('hide on mouseleave', function(done) {
      tooltip.popbox();

      tooltip.mouseenter();
      tooltip.mouseleave();

      setTimeout(function() {
        assert.notEqual(tooltip.popbox('isOpen'), true);
        done();
      }, 20);
    });

    test('hide on click', function(done) {
      tooltip.popbox();

      tooltip.click();
      tooltip.click();

      setTimeout(function() {
        assert.notEqual(tooltip.popbox('isOpen'), true);
        done();
      }, 20);
    });

    test('hide manually', function(done) {
      tooltip.popbox();

      tooltip.popbox('show');
      tooltip.popbox('hide');

      setTimeout(function() {
        assert.notEqual(tooltip.popbox('isOpen'), true);
        done();
      }, 20);

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

});
