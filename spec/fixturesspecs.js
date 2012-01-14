
describe("jQueryFixtures.Fixtures", function() {
  var ajaxData = 'some ajax data';
  var fixtureUrl = 'some_url';
  var anotherFixtureUrl = 'another_url';
  var ajaxStub;
  var fixturesContainer = function() {
    return $('#' + jQueryFixtures.getFixtures().containerId);
  };
  var appendFixturesContainerToDom = function() {
    $('body').append('<div id="' + jQueryFixtures.getFixtures().containerId + '">old content</div>');
  };

  var removeFixturesContainer = function() {
    $("#" + jQueryFixtures.getFixtures().containerId).remove();
  }

  beforeEach(function() {
    jQueryFixtures.getFixtures().clearCache();

    sinon.stub(jQuery, 'ajax').yieldsTo("success", ajaxData);
  });

  afterEach(function() {
    jQuery.ajax.restore();
  });
  
  
  describe("default initial config values", function() {
    it("should set 'jQueryFixtures-fixtures' as the default container id", function() {
      expect(jQueryFixtures.getFixtures().containerId).to.equal('jquery-fixtures');
    });
    
    it("should set 'spec/javascripts/fixtures' as the default fixtures path", function() {
      expect(jQueryFixtures.getFixtures().fixturesPath).to.equal('spec/javascripts/fixtures');
    });
  });

  describe("cache", function() {
    describe("clearCache", function() {
      it("should clear cache and in effect force subsequent AJAX call", function() {
        jQueryFixtures.getFixtures().read(fixtureUrl);
        jQueryFixtures.getFixtures().clearCache();
        jQueryFixtures.getFixtures().read(fixtureUrl);
        expect($.ajax.callCount).to.equal(2);
      });
    });

    it("first-time read should go through AJAX", function() {
      jQueryFixtures.getFixtures().read(fixtureUrl);
      expect(jQuery.ajax.callCount).to.equal(1);
    });

    it("subsequent read from the same URL should go from cache", function() {
      jQueryFixtures.getFixtures().read(fixtureUrl, fixtureUrl);
      expect($.ajax.callCount).to.equal(1);
    });    
  });

  describe("read", function() {
    it("should return fixture HTML", function() {
      var html = jQueryFixtures.getFixtures().read(fixtureUrl);
      expect(html).to.equal(ajaxData);
    });

    it("should return duplicated HTML of a fixture when its url is provided twice in a single call", function() {
      var html = jQueryFixtures.getFixtures().read(fixtureUrl, fixtureUrl);
      expect(html).to.equal(ajaxData + ajaxData);
    });

    it("should return merged HTML of two fixtures when two different urls are provided in a single call", function() {
      var html = jQueryFixtures.getFixtures().read(fixtureUrl, anotherFixtureUrl);
      expect(html).to.equal(ajaxData + ajaxData);
    });

    it("should have shortcut global method readFixtures", function() {
      var html = readFixtures(fixtureUrl, anotherFixtureUrl);
      expect(html).to.equal(ajaxData + ajaxData);
    });
    
    it("should use the configured fixtures path concatenating it to the requested url (without concatenating a slash if it already has an ending one)", function() {
      jQueryFixtures.getFixtures().fixturesPath = 'a path ending with slash/';
      readFixtures(fixtureUrl);
      expect($.ajax.lastCall.args[0].url).to.equal('a path ending with slash/'+fixtureUrl);
    });
    
    it("should use the configured fixtures path concatenating it to the requested url (concatenating a slash if it doesn't have an ending one)", function() {
      jQueryFixtures.getFixtures().fixturesPath = 'a path without an ending slash';
      readFixtures(fixtureUrl);
      expect($.ajax.lastCall.args[0].url).to.equal('a path without an ending slash/'+fixtureUrl);
    });
  });

  describe("load", function() {
    it("should insert fixture HTML into container", function() {
      jQueryFixtures.getFixtures().load(fixtureUrl);
      expect(fixturesContainer().html()).to.equal(ajaxData);
    });

    it("should insert duplicated fixture HTML into container when the same url is provided twice in a single call", function() {
      jQueryFixtures.getFixtures().load(fixtureUrl, fixtureUrl);
      expect(fixturesContainer().html()).to.equal(ajaxData + ajaxData);
    });

    it("should insert merged HTML of two fixtures into container when two different urls are provided in a single call", function() {
      jQueryFixtures.getFixtures().load(fixtureUrl, anotherFixtureUrl);
      expect(fixturesContainer().html()).to.equal(ajaxData + ajaxData);
    });

    it("should have shortcut global method loadFixtures", function() {
      loadFixtures(fixtureUrl, anotherFixtureUrl);
      expect(fixturesContainer().html()).to.equal(ajaxData + ajaxData);
    });

    describe("when fixture container does not exist", function() {
      it("should automatically create fixtures container and append it to DOM", function() {
        removeFixturesContainer();
        jQueryFixtures.getFixtures().load(fixtureUrl);
        expect(fixturesContainer().size()).to.equal(1);
      });      
    });

    describe("when fixture container exists", function() {
      beforeEach(function() {
        removeFixturesContainer();
        appendFixturesContainerToDom();
      });

      it("should replace it with new content", function() {
        jQueryFixtures.getFixtures().load(fixtureUrl);
        expect(fixturesContainer().html()).to.equal(ajaxData);
      });
    });

    describe("when fixture contains an inline <script> tag", function(){
      beforeEach(function(){
        ajaxData = "<div><a id=\"anchor_01\"></a><script>$(function(){ $('#anchor_01').addClass('foo')});</script></div>";
      });

      it("should execute the inline javascript after the fixture has been inserted into the body", function(){
        jQueryFixtures.getFixtures().load(fixtureUrl);
        expect($("#anchor_01")).toHaveClass('foo');
      });
    });
  });

  describe("preload", function() {
    describe("read after preload", function() {
      it("should go from cache", function() {
        jQueryFixtures.getFixtures().preload(fixtureUrl, anotherFixtureUrl);
        jQueryFixtures.getFixtures().read(fixtureUrl, anotherFixtureUrl);
        expect($.ajax.callCount).to.equal(2);
      });

      it("should return correct HTMLs", function() {
        jQueryFixtures.getFixtures().preload(fixtureUrl, anotherFixtureUrl);
        var html = jQueryFixtures.getFixtures().read(fixtureUrl, anotherFixtureUrl);
        expect(html).to.equal(ajaxData + ajaxData);
      });
    });

    it("should not preload the same fixture twice", function() {
      jQueryFixtures.getFixtures().preload(fixtureUrl, fixtureUrl);
      expect($.ajax.callCount).to.equal(1);
    });

    it("should have shortcut global method preloadFixtures", function() {
      preloadFixtures(fixtureUrl, anotherFixtureUrl);
      jQueryFixtures.getFixtures().read(fixtureUrl, anotherFixtureUrl);
      expect($.ajax.callCount).to.equal(2);
    });
  });

  describe("set", function() {
    var html = '<div>some HTML</div>';
    
    it("should insert HTML into container", function() {
      jQueryFixtures.getFixtures().set(html);
      expect(fixturesContainer().html()).to.equal(jQueryFixtures.JQuery.browserTagCaseIndependentHtml(html));
    });

    it("should insert jQuery element into container", function() {
      jQueryFixtures.getFixtures().set($(html));
      expect(fixturesContainer().html()).to.equal(jQueryFixtures.JQuery.browserTagCaseIndependentHtml(html));
    });

    it("should have shortcut global method setFixtures", function() {
      setFixtures(html);
      expect(fixturesContainer().html()).to.equal(jQueryFixtures.JQuery.browserTagCaseIndependentHtml(html));
    });

    describe("when fixture container does not exist", function() {
      it("should automatically create fixtures container and append it to DOM", function() {
        jQueryFixtures.getFixtures().set(html);
        expect(fixturesContainer().size()).to.equal(1);
      });
    });

    describe("when fixture container exists", function() {
      beforeEach(function() {
        appendFixturesContainerToDom();
      });

      it("should replace it with new content", function() {
        jQueryFixtures.getFixtures().set(html);
        expect(fixturesContainer().html()).to.equal(jQueryFixtures.JQuery.browserTagCaseIndependentHtml(html));
      });
    });
  });

  describe("sandbox", function() {
    describe("with no attributes parameter specified", function() {
      it("should create DIV with id #sandbox", function() {
        expect(jQueryFixtures.getFixtures().sandbox().html()).to.equal($('<div id="sandbox" />').html());
      });
    });

    describe("with attributes parameter specified", function() {
      it("should create DIV with attributes", function() {
        var attributes = {
          attr1: 'attr1 value',
          attr2: 'attr2 value'
        };
        var element = $(jQueryFixtures.getFixtures().sandbox(attributes));

        expect(element.attr('attr1')).to.equal(attributes.attr1);
        expect(element.attr('attr2')).to.equal(attributes.attr2);
      });

      it("should be able to override id by setting it as attribute", function() {
        var idOverride = 'overridden';
        var element = $(jQueryFixtures.getFixtures().sandbox({id: idOverride}));
        expect(element.attr('id')).to.equal(idOverride);
      });
    });

    it("should have shortcut global method sandbox", function() {
      var attributes = {
        id: 'overridden'
      };
      var element = $(sandbox(attributes));
      expect(element.attr('id')).to.equal(attributes.id);
    });
  });

  describe("cleanUp", function() {
    it("should remove fixtures container from DOM", function() {
      appendFixturesContainerToDom();
      jQueryFixtures.getFixtures().cleanUp();
      expect(fixturesContainer().size()).to.equal(0);
    });
  });

  // WARNING: this block requires its two tests to be invoked in order!
  // (Really ugly solution, but unavoidable in this specific case)
  describe("automatic DOM clean-up between tests", function() {
    // WARNING: this test must be invoked first (before 'SECOND TEST')!
    it("FIRST TEST: should pollute the DOM", function() {
      appendFixturesContainerToDom();
    });

    // WARNING: this test must be invoked second (after 'FIRST TEST')!
    it("SECOND TEST: should see the DOM in a blank state", function() {
      expect(fixturesContainer().size()).to.equal(0);
    });
  });
});

describe("jQueryFixtures.Fixtures using real AJAX call", function() {
  var defaultFixturesPath;

  beforeEach(function() {
    defaultFixturesPath = jQueryFixtures.getFixtures().fixturesPath;
    jQueryFixtures.getFixtures().fixturesPath = 'spec/fixtures';
  });

  afterEach(function() {
    jQueryFixtures.getFixtures().fixturesPath = defaultFixturesPath;
  });

  describe("when fixture file exists", function() {
    var fixtureUrl = "real_non_mocked_fixture.html";

    it("should load content of fixture file", function() {
      var fixtureContent = jQueryFixtures.getFixtures().read(fixtureUrl);
      expect(fixtureContent).to.equal('<div id="real_non_mocked_fixture"></div>');
    });
  });

  describe("when fixture file does not exist", function() {
    var fixtureUrl = "not_existing_fixture";

    it("should throw an exception", function() {
      expect(function() {
        jQueryFixtures.getFixtures().read(fixtureUrl);
      }).toThrow();
    });
  });
});

