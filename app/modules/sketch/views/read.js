define(['sandbox', 'app-data', 'renderer', 'parse'], function(sandbox, Data, Renderer, Parser) {

    var Views = {};

    Views.Content = sandbox.mvc.View({
        template: 'sketch/templates/content',
        tagName: 'section',

        initialize: function() {

            var parser = new Parser();
            var objects = parser.parse(this.model.attributes.text);

            this.parsed(objects);
        },

        

        parsed: function(objects) {
          
          var TEX = new Renderer.TEX({
            latex: objects
          });

          this.setView('.mathapedia-ctx', TEX);

          TEX.render();


        },
        serialize: function() {
            return {
                content: this.model.toJSON()
            };
        }

    });


    Views.Embed = sandbox.mvc.View({
        initialize: function() {

            var parser = new Parser();
            var objects = parser.parse(this.model.attributes.text);

            this.parsed(objects);
        },

        parsed: function(objects) {
          
          var TEX = new Renderer.TEX({
            latex: objects
          });

          TEX.render();

          $('body').html(TEX.el);


        },
        serialize: function() {
            return {
                content: this.model.toJSON()
            };
        }

    });

    return Views;

});
