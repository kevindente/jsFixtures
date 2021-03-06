jsFixtures allows you to load HTML content to be used by your tests. It's a straight port of the fixtures portion of
the jasmine-jquery project (even the bulk of this readme comes directly from that project). All the credit belongs
to the creators of jasmine-jquery, I've just repackaged it into a more convenient form.

I created jsFixtures because I needed fixture functionality but I'm not using the Jasmine test framework (I use Mocha). 
Since the fixture functionality didn't seem particularly tied to Jasmine, I extracted it out into this library.

The overall workflow is like follows:

In _myfixture.html_ file:

    <div id="my-fixture">some complex content here</div>
    
Inside your test:

    loadFixtures('myfixture.html');
    $('#my-fixture').myTestedPlugin();
    expect($('#my-fixture')).to...;
    
By default, fixtures are loaded from `spec/javascripts/fixtures`. You can configure this path: `jsFixtures.getFixtures().fixturesPath = 'my/new/path';`.

Your fixture is being loaded into `<div id="js-fixtures"></div>` container that is automatically added to the DOM by the Fixture module (If you _REALLY_ must change id of this container, try: `jsFixtures.getFixtures().containerId = 'my-new-id';` in your test runner). To make tests fully independent, fixtures container is automatically cleaned-up between tests, so you don't have to worry about left-overs from fixtures loaded in preceeding test. Also, fixtures are internally cached by the Fixture module, so you can load the same fixture file in several tests without penalty to your test suite's speed.

To invoke fixture related methods, obtain Fixtures singleton through a factory and invoke a method on it:

    jsfixtures.getFixtures().load(...);
    
There are also global short cut functions available for the most used methods, so the above example can be rewritten to just:

    loadFixtures(...);
    
Several methods for loading fixtures are provided:

- `load(fixtureUrl[, fixtureUrl, ..., cb])`
  - Loads fixture(s) from one or more files and automatically appends them to the DOM (to the fixtures container). 
    If the last parameter is a callback function, then the load happens asynchronously, and the callback is invoked when the fixture data is available. If no callback
    is provided, then the fixture data is loaded synchronously
- `read(fixtureUrl[, fixtureUrl, ..., cb])`
  - Loads fixture(s) from one or more files but instead of appending them to the DOM returns them as a string (useful if you want to process fixture's content directly in your test).
    If the last parameter is a callback function, then the read happens asynchronously, and the callback is invoked when the fixture data is available. If no callback
    is provided, then the fixture data is read synchronously
- `set(html)`
  - Doesn't load fixture from file, but instead gets it directly as a parameter (html parameter may be a string or a jQuery element, so both `set('<div></div>')` and `set($('<div/>'))` will work). Automatically appends fixture to the DOM (to the fixtures container). It is useful if your fixture is too simple to keep it in an external file or is constructed procedurally, but you still want Fixture module to automatically handle DOM insertion and clean-up between tests for you.
- `preload(fixtureUrl[, fixtureUrl, ...])`
  - Pre-loads fixture(s) from one or more files and stores them into cache, without returning them or appending them to the DOM. All subsequent calls to `load` or `read` methods will then get fixtures content from cache, without making any AJAX calls (unless cache is manually purged by using `clearCache` method). Pre-loading all fixtures before a test suite is run may be useful when working with libraries that block or otherwise modify the inner workings of JS or jQuery AJAX calls.
  
All of above methods have matching global short cuts:

- `loadFixtures(fixtureUrl[, fixtureUrl, ...])`
- `readFixtures(fixtureUrl[, fixtureUrl, ...])`
- `setFixtures(html)`

Also, a helper method for creating HTML elements for your tests is provided:

- `sandbox([{attributeName: value[, attributeName: value, ...]}])`

It creates an empty DIV element with a default id="sandbox". If a hash of attributes is provided, they will be set for this DIV tag. If a hash of attributes contains id attribute it will override the default value. Custom attributes can also be set. So e.g.:

    sandbox();
    
Will return:

    <div id="sandbox"></div>    
    
And:

    sandbox({
      id: 'my-id',
      class: 'my-class',
      myattr: 'my-attr'
    });
    
Will return:

    <div id="my-id" class="my-class" myattr="my-attr"></div>

Sandbox method is useful if you want to quickly create simple fixtures in your tests without polluting them with HTML strings:

    setFixtures(sandbox({class: 'my-class'}));
    $('#sandbox').myTestedClassRemoverPlugin();
    expect($('#sandbox')).not.toHaveClass('my-class');

This method also has a global short cut available:

- `sandbox([{attributeName: value[, attributeName: value, ...]}])`

Additionally, two clean up methods are provided:

- `clearCache()`
  - purges Fixture module internal cache (you should need it only in very special cases; typically, if you need to use it, it may indicate a smell in your test code)
- `cleanUp()`
  - cleans-up fixtures container (this is done automatically between tests by Fixtures module, so there is no need to ever invoke this manually, unless you're testing a really fancy special case and need to clean-up fixtures in the middle of your test)
  
These two methods do not have global short cut functions.

## Dependencies

jsFixtures was tested with jQuery 1.7 on Chrome 17 and Safari 5.1 (so far - more to come). I've also attempted maintain compatibility with Zepto.js 0.8. However, 
there are a couple of known issues with Zepto. Namely:
1) Fixture load errors aren't propogated out to the caller
2) At least one test fails, but only the test is problematic - the actual jsFixtures code works properly

jsFixtures also uses Sinon for test stubs.

## Cross domain policy problems under Chrome

Newer versions of Chrome don't allow file:// URIs read other file:// URIs. In effect, jsFixtures cannot properly load fixtures under some versions of Chrome. An override for this is to run Chrome with a switch `--allow-file-access-from-files` (I have not verified if this works for all Chrome versions though). The full discussion on this topic can be found in [this GitHub ticket](https://github.com/velesin/jasmine-jquery/issues/4).

