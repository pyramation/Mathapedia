define(['sandbox', 'app-data', 'renderer', 'parse'], function(sandbox, Data, Renderer, Parser) {

    var Views = {};

    Views.Content = sandbox.mvc.View({
        template: 'books/templates/content/content',
        tagName: 'section',

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


            if (this.collection.pluck('id').indexOf(this.section_id) > 0)
            this.prevSection = this.collection.at( this.collection.pluck('id').indexOf(this.section_id) - 1 );

            if (this.collection.pluck('id').indexOf(this.section_id) !== this.collection.length - 1)            
            this.nextSection = this.collection.at( this.collection.pluck('id').indexOf(this.section_id) + 1 );

            this.model = this.options.content;

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
                auth: this.options.auth,
                book: this.options.book.toJSON(),
                section: this.options.section.toJSON(),
                content: this.model.toJSON(),
                next: this.next ? this.next.toJSON() : null,
                prev: this.prev ? this.prev.toJSON() : null,
                nextSection: this.nextSection ? this.nextSection.toJSON() : null,
                prevSection: this.prevSection ? this.prevSection.toJSON() : null
            };
        }

    });

    Views.Section = sandbox.mvc.View({

        template: 'books/templates/sections/sections.toc',
        tagName: 'article',

        initialize: function() {
            this.section_id = this.options.section.id;
            this.model = this.collection.get(this.section_id);

        },

        serialize: function() {
            return {
                auth: this.options.auth,
                book: this.options.book.toJSON(),
                section: this.model.toJSON()
            };
        },
        
        afterRender: function() {
            MathJax.Hub.Typeset();
        },

        events: {
            'click .new-subsection': 'newSubsection',
            'click .new-content': 'newContent',
            'click .change-name': 'changeName'

        },

        changeName: function (event) {

            var self = this;
            var title = prompt('choose a new name');
            if (title && title.trim().length && this.model.id) {

                $.post('/api/books/' + this.options.book.id + '/' + this.options.section.id + '/rename', {
                    title: title
                }, function(resp) {

                    if (resp.status === 200) {

                        $('.change-name').html(title);
                        // self.model.set({name: title});
                        // self.render();
                        // Backbone.history.navigate('books/' + resp.data.book_id, true);

                    } else {
                        alert('sorry but you have to be logged in');
                    }

                });

            }

        },

        newSubsection: function (event) {

            var self = this;
            var title = prompt('choose a subsection title');
            if (title && title.trim().length) {

                $.post('/api/books/' + this.options.book.id + '/' + this.options.section.id, {
                    title: title
                }, function(resp) {

                    if (resp.status === 200) {

                         Backbone.history.navigate('/books/' + self.options.book.id + '/sections/' + self.options.section.id + '/subsections/' + resp.data.id, true);

                    } else {
                        alert('sorry but you have to be logged in');
                    }

                });

            }

        },
        newContent: function (event) {

            var self = this;
            var title = prompt('choose a content title');
            if (title && title.trim().length) {

                $.post('/api/books/' + this.options.book.id + '/' + this.options.section.id + '/content', {
                    title: title
                }, function(resp) {

                    if (resp.status === 200) {

                        Backbone.history.navigate('/books/' + self.options.book.id + '/sections/' + self.options.section.id + '/' + resp.data.id + '/edit', true);

                    } else {
                        alert('sorry but you have to be logged in');
                    }

                });

            }

        }

    });

    Views.Subcontent = sandbox.mvc.View({
        template: 'books/templates/content/subcontent',
        tagName: 'section',


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

            // console.log(this.options.content.attributes.text);

      
            if (this.collection.pluck('id').indexOf(this.section_id) > 0)
            this.prevSection = this.collection.at( this.collection.pluck('id').indexOf(this.section_id) - 1 );
            if (this.collection.pluck('id').indexOf(this.section_id) !== this.collection.length - 1)            
            this.nextSection = this.collection.at( this.collection.pluck('id').indexOf(this.section_id) + 1 );


            if (this.subsections.pluck('id').indexOf(this.subsection_id) > 0)
            this.prevSubsection = this.subsections.at( this.subsections.pluck('id').indexOf(this.subsection_id) - 1 );
            if (this.subsections.pluck('id').indexOf(this.subsection_id) !== this.subsections.length - 1)            
            this.nextSubsection = this.subsections.at( this.subsections.pluck('id').indexOf(this.subsection_id) + 1 );


            var parser = new Parser();
            var objects = parser.parse(this.options.content.attributes.text);

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
                auth: this.options.auth,
                book: this.options.book.toJSON(),
                section: this.options.section.toJSON(),
                subsection: this.options.subsection.toJSON(),
                content: this.model.toJSON(),
                next: this.next ? this.next.toJSON() : null,
                prev: this.prev ? this.prev.toJSON() : null,
                nextSection: this.nextSection ? this.nextSection.toJSON() : null,
                prevSection: this.prevSection ? this.prevSection.toJSON() : null,
                nextSubsection: this.nextSubsection ? this.nextSubsection.toJSON() : null,
                prevSubsection: this.prevSubsection ? this.prevSubsection.toJSON() : null
            };

        }


    });

    Views.Subsection = sandbox.mvc.View({

        template: 'books/templates/sections/subsections.toc',
        tagName: 'article',

        initialize: function() {

            this.section_id = this.options.section.id;
            this.section = this.collection.get(this.section_id);

            this.subsections = new Data.Sections(this.section.get('subsections'));
            this.subsection_id = this.options.subsection.id;    
            this.model = this.subsections.get(this.subsection_id);
     

        },

        serialize: function() {
            return {
                auth: this.options.auth,
                book: this.options.book.toJSON(),
                section: this.options.subsection.toJSON(),
                parentsection: this.options.section.toJSON()
            };
        },
        afterRender: function() {
            MathJax.Hub.Typeset();
        },

        events: {
            'click .new-content': 'newContent',
            'click .change-name': 'changeName'

        },

        changeName: function (event) {

            var self = this;
            var title = prompt('choose a new name');
            if (title && title.trim().length && this.model.id) {

                $.post('/api/books/' + this.options.book.id + '/' + this.options.section.id + '/' + this.options.subsection.id + '/rename', {
                    title: title
                }, function(resp) {

                    if (resp.status === 200) {

                        $('.change-name').html(title);
                        // self.model.set({name: title});
                        // self.render();
                        // Backbone.history.navigate('books/' + resp.data.book_id, true);

                    } else {
                        alert('sorry but you have to be logged in');
                    }

                });

            }

        },

        newContent: function (event) {

            var self = this;
            var title = prompt('choose a content title');
            if (title && title.trim().length) {

                $.post('/api/books/' + this.options.book.id + '/' + this.options.section.id + '/' + this.options.subsection.id +  '/content', {
                    title: title
                }, function(resp) {

                    if (resp.status === 200) {

                        Backbone.history.navigate('/books/' + self.options.book.id + '/sections/' + self.options.section.id + '/subsections/' + self.options.subsection.id + '/' + resp.data.id + '/edit', true);
                        // window.location.href = window.location.href;

                    } else {
                        alert('sorry but you have to be logged in');
                    }

                });

            }

        }

    });

    return Views;

});
