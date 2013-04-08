// Set the require.js configuration for your application.
require.config({

  // Initialize the application with the main application file.
  deps: ["./app"],

  paths: {

    // JavaScript folders.
    libs: "./assets/js/libs",
    plugins: "./assets/js/plugins",

    // jQuery
    jquery: './assets/js/libs/jquery-bootstrap',

    // Zepto
    zepto: './assets/js/libs/zepto/zepto',
    deferred: './assets/js/libs/zepto/deferred',

    // Underscore
    underscore: './assets/js/libs/underscore',

    // Set the base library
    dom: './assets/js/libs/dom',
    base: './assets/js/libs/base/jquery',

    handlebars: './assets/js/libs/handlebars-1.0.0.beta.6',

    toolbox: './assets/js/libs/toolbox',

    codemirror: './assets/js/libs/codemirror/codemirror',

    // Aura
    aura_core: './aura/core',
    aura_perms: './aura/permissions',
    aura_sandbox: './aura/sandbox',

    // Backbone Extension
    core: './extensions/backbone/core',
    sandbox: './extensions/backbone/sandbox',
    backbone: './assets/js/libs/backbone',

    async: './assets/js/libs/async',

    d3: './assets/js/libs/d3',
    dsp: './assets/js/libs/dsp',

    texdrop: './modules/latex/lib/dragndrop',
    expressions: './modules/latex/lib/expressions',
    renderer: './modules/latex/views/renderer',
    psgraph: './modules/latex/lib/psgraph',
    parse: './modules/latex/lib/parse',
    interact: './modules/latex/lib/interact',


    'app-data':'./extensions/data/main',

    // modules

    'home':'./modules/home/main',
    'home-views':'./modules/home/views/home',

    'auth':'./modules/auth/main',
    'auth-views':'./modules/auth/views/auth',
    
    'editor':'./modules/editor/main',
    'editor-views':'./modules/editor/views',

    'about':'./modules/about/main',
    'about-views':'./modules/about/views/about',

    'books':'./modules/books/main',
    'books-views':'./modules/books/views',

    'sketch': './modules/sketch/main',
    'sketch-views':'./modules/sketch/views',


    'layout': './modules/layout/main',

    'latex': './modules/latex/main',
    'latex-views': './modules/latex/views/latex',

    'router':'./modules/router/router'

  },

  shim: {
    'dom': {
      exports: '$',
      deps: ['jquery'] // switch to the DOM-lib of your choice
    },
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['underscore', 'dom'],
      exports: 'Backbone'
    },
    'deferred': {
      exports: 'Deferred',
      deps: ['dom']
    },
    "plugins/backbone.localstorage": {
      deps: ["backbone"]
    },
    "plugins/backbone.layoutmanager": {
      deps: ["backbone"]
    }
  }

});
