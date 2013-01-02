define(['sandbox'], function(sandbox) {

  var AppLayout = sandbox.Module({

      render: function(from, view) {

        if (from.match('editor')) {

          $('body').addClass('editor');
          $('body').removeClass('latex');

          this.layout.setView('.ltx-ctx', view);
          view.render();

          $('.main-content').html('<section class="preview"></section>');
 
        } else if (from.match('latex')) {

          $('body').addClass('latex');
          $('body').removeClass('editor');

          this.layout.setView('.ltx-ctx', view);
          view.render();

          $('.main-content').html('<section class="preview"></section>');
        } else {

          $('body').removeClass('latex');
          $('body').removeClass('editor');


          this.layout.setView('.main-content', view);
          view.render();

          $('.ltx-ctx').html('');


        }

      },

    // Helper for using layouts.
      start: function() {

        // Localize or create a new JavaScript Template object.
        var JST = window.JST = window.JST || {};

        // Configure LayoutManager with Backbone Boilerplate defaults.
        Backbone.LayoutManager.configure({

          paths: {
            layout: "app/modules/",
            template: "app/modules/"
          },

          fetch: function(path) {
          
            path = path + ".html";

            if (!JST[path]) {
              $.ajax({ url: '/' + path, async: false }).then(function(template) {
                JST[path] = Handlebars.compile(template);
              });
            } 
            
            return JST[path];
          }
        });

        // Create a new Layout.
        this.layout = new sandbox.mvc.Layout({
          template: 'layout/templates/main',
          className: "layout-main",

          events: {

          },
          toggle: function(event) {

          }
        
        });

        // Insert into the DOM.
        $("#main").empty().append(this.layout.el);

        // Render the layout.
        this.layout.render();

        sandbox.subscribe('render', 'layout', this.render, this);

      }

  });

  return new AppLayout();

});