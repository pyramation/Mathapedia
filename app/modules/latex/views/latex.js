define(['sandbox', 'codemirror', 'renderer', 'parse'], function(sandbox, CodeMirror, Renderer, Parser) {

    var Views = {};
  
    Views.View = sandbox.mvc.View({

        template: 'latex/templates/math',
        className: 'math',
        events: {
            'keyup .CodeMirror':'update',
            'click .save-sketch': 'save',
            'click .random-sketch': 'random'
        },
        update: _.throttle(function() {
            var math = this.editor.getValue();
            var parser = new Parser();
            var objects = parser.parse(math);
            this.parsed(objects);
        }, 1000),
        parsed: function(objects, text) {
          var TEX = new Renderer.TEX({
            latex: objects
          });
          $('.preview').html(TEX.el);
          TEX.render();
        },
        save: function() {

            var text =  this.editor.getValue();
            text = text.trim();

            if (text.length) {
                $('.progress > .bar').width('100%');
                $('.progress').addClass('active');

                $.post('/sketch', {text: text}, function (data) {

                    setTimeout(function() {
                        $('.progress').removeClass('active');
                        $('.progress > .bar').width('0%');
                    }, 500);

                });

            }

        },

        random: function() {

            $('.progress > .bar').width('100%');
            $('.progress').addClass('active');
            var self = this;
            $.get('/sketch', function (data) {

                setTimeout(function() {
                    $('.progress').removeClass('active');
                    $('.progress > .bar').width('0%');
                }, 500);

                self.editor.setValue(data.data ? data.data.text || '' : '');
                self.update();
                
            });
        },
        afterRender: function() {

            this.editor = CodeMirror.fromTextArea(document.querySelector(".latex-content"), {
                lineNumbers: true,
                matchBrackets: true,
                mode: "text/html",
                indentUnit: 4,
                indentWithTabs: false,
                enterMode: "keep",
                tabMode: "shift"

            });

            MathJax.Hub.Typeset();

        }

    });

    return Views;

});
