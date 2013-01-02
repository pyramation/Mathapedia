// ## Sandbox Extension
// @fileOverview Extend the aura-sandbox (facade pattern)

define(['aura_sandbox', 'core'], function(sandbox, core) {
  "use strict";

  var auraSandbox = Object.create(sandbox);
  auraSandbox.data.Store = core.data.Store;
  auraSandbox.mvc = {};
  auraSandbox.widgets = {};

  auraSandbox.mvc.View = function(view) {
    return core.mvc.LayoutView.extend(view);
  };

  auraSandbox.mvc.Layout = core.mvc.Layout;

  auraSandbox.mvc.Model = function(model) {
    return core.mvc.Model.extend(model);
  };

  auraSandbox.mvc.Events = core.mvc.Events;

  auraSandbox.mvc.Collection = function(collection) {
    return core.mvc.Collection.extend(collection);
  };

  auraSandbox.mvc.Router = function(router) {
    return core.mvc.Router.extend(router);
  };

  auraSandbox.Module = function(opts) {
    return core.Toolbox.Base.extend(opts);
  };

  auraSandbox.widgets.stop = function(channel, el) {
    return sandbox.stop.apply(this, arguments);
  };

  auraSandbox.widgets.start = function(channel, el) {
    return sandbox.start.apply(this, arguments);
  };

  return auraSandbox;

});
