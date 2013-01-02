if (typeof Object.create !== 'function') {
  Object.create = function(o) {
    function F() {}
    F.prototype = o;

    return new F();
  };
}

// Starts main modules
// Publishing from core because that's the way that Nicholas did it...
define([
  'core',
  'layout',
  'home',
  'books',
  'latex',
  'editor',
  'about',
  'auth',
  'router'
  ], function(core) {
  
  core.start([
    'layout',
    'auth',
    'home',
    'editor',
    'latex',
    'books',
    'about',
    'router'
    ]);

});
