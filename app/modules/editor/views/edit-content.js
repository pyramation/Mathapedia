define(['sandbox', 'codemirror', 'renderer', 'parse'], function(sandbox, CodeMirror, Renderer, Parser) {

    var Views = {};

   

    Views.Editor = {
        template: 'editor/templates/editor',
        className: 'math-editor',
        serialize: function() {
            return this.model.toJSON();
        },
        events: {
            'click .latex-save': 'save',
            'click .latex-preview': 'preview',
            'click .latex-cancel': 'cancel',
            'keyup .CodeMirror':'update',
            'keyup input[title]': 'update',
            'click input[type=checkbox]':'checkbox'
        },

        save: function(event) {

            $('.progress > .bar').width('100%');
            $('.progress').addClass('active');

            this.model.set({text: this.editor.getValue()});
            this.model.set({name: $('input[title="name"]').val()});
            this.model.save(this.model.attributes, {
                success: function() {
                    // $('.progress > .bar').width('90%');
                    setTimeout(function() {
                        $('.progress').removeClass('active');
                        $('.progress > .bar').width('0%');
                    }, 500);
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
        cancel: function(event) {

            var go = confirm("are you sure?");
            if (!go) {
                event.stopPropagation();
                event.preventDefault();
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

            this.update(); 
        }

    };


    Views.Content = _.clone(Views.Editor);
    _.extend(Views.Content, {

        template: 'editor/templates/content.editor',

        initialize: function() {

            this.section_id = this.options.section.id;
            this.section = this.collection.get(this.section_id);
            this.contents = new Data.Contents(this.section.get('contents'));
            this.content_id = this.options.content.id;
            this.content = this.contents.get(this.content_id);
         
            this.prevIndex = this.contents.indexOf(this.content) - 1;
            this.prev = this.contents.at( this.prevIndex );
            this.nextIndex = this.contents.indexOf(this.content) + 1;
            this.next = this.contents.at( this.nextIndex );

            this.model = this.options.content;




        },

        serialize: function() {
            return {
                book: this.options.book.toJSON(),
                section: this.options.section.toJSON(),
                content: this.model.toJSON(),
                next: this.next ? this.next.toJSON() : null,
                prev: this.prev ? this.prev.toJSON() : null
            };
        }
    });
    Views.Content = sandbox.mvc.View(Views.Content);


    Views.Subcontent = _.clone(Views.Editor);
    _.extend(Views.Subcontent, {
        template: 'editor/templates/subcontent.editor',

        initialize: function() {

            this.section_id = this.options.section.id;
            this.section = this.collection.get(this.section_id);

            this.subsections = new Data.Sections(this.section.get('subsections'));
            this.subsection_id = this.options.subsection.id;    
            this.subsection = this.subsections.get(this.subsection_id);
            
            this.contents = new Data.Contents(this.subsection.get('contents'));
            this.content_id = this.options.content.id;
            this.content = this.contents.get(this.content_id);

            this.prevIndex = this.contents.indexOf(this.content) - 1;
            this.prev = this.contents.at( this.prevIndex );
            this.nextIndex = this.contents.indexOf(this.content) + 1;
            this.next = this.contents.at( this.nextIndex );

            this.model = this.options.content;


        },

        serialize: function() {
            return {
                book: this.options.book.toJSON(),
                section: this.options.section.toJSON(),
                subsection: this.options.subsection.toJSON(),
                content: this.model.toJSON(),
                next: this.next ? this.next.toJSON() : null,
                prev: this.prev ? this.prev.toJSON() : null
            };
        }
    });
    Views.Subcontent = sandbox.mvc.View(Views.Subcontent);

    return Views;

});
