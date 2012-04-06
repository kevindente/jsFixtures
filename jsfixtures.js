
var readFixtures = function() {
  return jsFixtures.getFixtures().proxyCallTo_('read', arguments);
};

var preloadFixtures = function() {
  jsFixtures.getFixtures().proxyCallTo_('preload', arguments);
};

var loadFixtures = function() {
  jsFixtures.getFixtures().proxyCallTo_('load', arguments);
};

var setFixtures = function(html) {
  jsFixtures.getFixtures().set(html);
};

var sandbox = function(attributes) {
  return jsFixtures.getFixtures().sandbox(attributes);
};
jsFixtures = function() {
  this.containerId = 'js-fixtures';
  this.fixturesCache_ = {};
  this.fixturesPath = 'spec/javascripts/fixtures';
};

jsFixtures.getFixtures = function() {
  return jsFixtures.currentFixtures_ = jsFixtures.currentFixtures_ || new jsFixtures();
};

jsFixtures.prototype.set = function(html) {
  this.cleanUp();
  this.createContainer_(html);
};

jsFixtures.prototype.preload = function() {
  this.read.apply(this, arguments);
};

jsFixtures.prototype.load = function() {
  this.cleanUp();
  var args, cb;

  if (typeof(arguments[arguments.length - 1]) === 'function') {
    cb = arguments[arguments.length - 1];
    args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
  }
  else {
    args = Array.prototype.slice.call(arguments);
  }

  var This = this;
  args.push(function (data) {
    This.createContainer_(data);

    if (cb) cb(data);
  });

  this.read.apply(this, args);
};

jsFixtures.prototype.read = function() {
  var htmlChunks = [];
  var asyncRead = false;
  var fixtureUrls = arguments;
  var cb;
  var fetched = 0;
  var urlCount;
  var result;
  if (typeof(arguments[arguments.length - 1]) === 'function') {
    asyncRead = true;
    cb = arguments[arguments.length - 1];
    fixtureUrls = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
  }

  urlCount = fixtureUrls.length;
  var fetchDone = function(data) {
    htmlChunks.push(data);
    if (++fetched == urlCount) {
      result = htmlChunks.join('')
      if (cb) return cb(result);
    }
  }

  for(var urlIndex = 0; urlIndex < urlCount; urlIndex++) {
    this.getFixtureHtml_(fixtureUrls[urlIndex], fetchDone, asyncRead);
  }

  return result;
};

jsFixtures.prototype.clearCache = function() {
  this.fixturesCache_ = {};
};

jsFixtures.prototype.cleanUp = function() {
  $('#' + this.containerId).remove();
};

jsFixtures.prototype.sandbox = function(attributes) {
  var attributesToSet = attributes || {};
  return $('<div id="sandbox" />').attr(attributesToSet);
};

jsFixtures.prototype.createContainer_ = function(html) {
  var container;
  if(html instanceof $.fn.constructor) {
    container = $('<div id="' + this.containerId + '" />');
    container.html(html);
  } else {
    container = '<div id="' + this.containerId + '">' + html + '</div>';
  }
  $('body').append(container);
};

jsFixtures.prototype.getFixtureHtml_ = function(url, cb, asyncRead) {  
  if (typeof this.fixturesCache_[url] == 'undefined') {
    this.loadFixtureIntoCache_(url, cb, asyncRead);
  } else {
    cb(this.fixturesCache_[url]);
  }
};

jsFixtures.prototype.loadFixtureIntoCache_ = function(relativeUrl, cb, asyncRead) {
  var self = this;
  var url = this.fixturesPath.match('/$') ? this.fixturesPath + relativeUrl : this.fixturesPath + '/' + relativeUrl;

  $.ajax({
    async: asyncRead,
    cache: false,
    dataType: 'html',
    url: url,
    success: function(data) {
      self.fixturesCache_[relativeUrl] = data;
      cb(data);
    },
    error: function(jqXHR, status, errorThrown) {
        throw new Error('Fixture could not be loaded: ' + url + ' (status: ' + status + ', message: ' + (errorThrown ? errorThrown.message : "") + ')');
    }
  });
};

jsFixtures.prototype.proxyCallTo_ = function(methodName, passedArguments) {
  return this[methodName].apply(this, passedArguments);
};

if (typeof(afterEach) !== "undefined") {
  afterEach(function() {
    jsFixtures.getFixtures().cleanUp();
  });
}

if (typeof exports !== "undefined") {
  module.exports = jsFixtures;
}
