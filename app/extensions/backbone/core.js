// ## Core Extension
// @fileOverview Extend the aura-core (mediator pattern).
define(['aura_core', 'backbone',
  'handlebars',
  'toolbox',
  'plugins/backbone.localstorage',
  "plugins/backbone.layoutmanager"],

  function(core, Backbone, Handlebars, Toolbox, Store) {

  "use strict";

  var auraCore = Object.create(core);
  auraCore.data.Store = Store;
  auraCore.mvc = Backbone;
  auraCore.Toolbox = Toolbox;


  return auraCore;

});
