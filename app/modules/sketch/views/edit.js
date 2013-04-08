define(['sandbox', 'codemirror', 'renderer', 'parse', 'app-data'], function(sandbox, CodeMirror, Renderer, Parser, Data) {

    var View = {
        template: 'sketch/templates/editor',
        className: 'math-editor',
        initialize: function() {
            if (!this.model) {
                this.model = new Data.Sketch();
            }
        },
        serialize: function() {
            return this.model.toJSON();
        },
        events: {
            'click .latex-save': 'save',
            'click .latex-preview': 'preview',
            'click .latex-view': 'sketch',
            'click .random-sketch': 'random',
            'keyup .CodeMirror':'update',
            'keyup input[title]': 'update',
            'click input[type=checkbox]':'checkbox'
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
        save: function(event) {

            $('.progress > .bar').width('100%');
            $('.progress').addClass('active');

            var model = this.model;
            var oldId = this.model.id;
            var view = this;

            this.model.set({text: this.editor.getValue()});
            this.model.set({name: $('input[title="name"]').val()});
            this.model.save(this.model.attributes, {
                success: function() {
                    // $('.progress > .bar').width('90%');
                    setTimeout(function() {
                        $('.progress').removeClass('active');
                        $('.progress > .bar').width('0%');
                    }, 500);


                    if (oldId === model.id) {
                        console.log('same model');
                    } else {
                        console.log('different model');
                        Backbone.history.navigate('/sketch/' + model.id + '/edit', false);
                        // view.render();
                    }

                    // console.log('success');
                },
                error: function() {
                    // console.log('error');
                }
            });
            event.stopPropagation();
            event.preventDefault();
        },
        checkbox: function(event) {
            var checked = this.$('input[type=checkbox]').attr('checked');
            this.noPreview = !checked;
            if (this.noPreview) {
                $('.preview').html(' '); 
            } else {
                this.update();
            }
        },
        preview: function(event) {
            if (!this.noPreview) {
                this.update();
            }
            event.stopPropagation();
            event.preventDefault();
        },
        sketch: function(event) {

            if (this.model.id) {
                Backbone.history.navigate('/sketch/' + this.model.id, true);
            } else {
                alert('save your sketch first!');
            }

        },
        update: _.throttle(function() {
            if (this.noPreview) return;
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
          // this.setView('.preview', TEX);
          TEX.render();
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

            // window.scrollTo(0, window.lastScrollTo);
            MathJax.Hub.Typeset();

            this.update(); 
        }

    };

    return sandbox.mvc.View(View);

});
