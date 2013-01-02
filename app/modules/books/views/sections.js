define(['sandbox', 'codemirror'], function(sandbox, CodeMirror) {

    var Views = {};

    // table of contents
    Views.BookSections = sandbox.mvc.View({
        template: 'books/templates/sections/toc',
        tagName: 'article',
        serialize: function() {
            var o = { auth: this.options.auth};
            o.book = this.model.toJSON();
            o.toc = _.map(this.collection.models,function(model){return model.toJSON();});
            return o;
        },
        afterRender: function() {

            MathJax.Hub.Typeset();

            // if ($(this.el).find('.new-latex').length) {

            //     this.editor = CodeMirror.fromTextArea(document.querySelector(".latex-content"), {
            //         lineNumbers: true,
            //         matchBrackets: true,
            //         mode: "text/html",
            //         indentUnit: 4,
            //         indentWithTabs: false,
            //         enterMode: "keep",
            //         tabMode: "shift"
            //     });  
            // }
        },
        events: {
            'click .new-section': 'newSection',
            'click .change-name': 'changeName',
            'click .make-private': 'makePrivate',
            'click .make-public': 'makePublic',
            'click .add-bib': 'showBiB',
            'submit form.bib': 'addReference'

            // 'click .convert-latex': 'convertLaTeX'
        },

        showBiB: function (event) {
            $('.add-reference').removeClass('hidden');
        },
        addReference: function (event) {
            var text = $('.reference-text').val();
            var name = $('.reference-name').val();
            if (text && name && text.trim().length && name.trim().length) {
                $.post('/api/books/' + this.model.id + '/ref', {
                    name: name,
                    text: text
                }).done(function(data) {
                    if (data.message) {
                        alert(data.message);
                        $('.reference-name').val('');

                    } else {
                        alert('your reference was added!');
                        $('.reference-text').val('');
                        $('.reference-name').val('');

                    }


                });
            }
            event.preventDefault();

        },
        changeName: function (event) {

            var self = this;
            var title = prompt('choose a book title');
            if (title && title.trim().length && this.model.id) {

                $.post('/api/books/' + this.model.id + '/rename', {
                    title: title
                }, function(resp) {

                    if (resp.status === 200) {

                        self.model.set({name: title});
                        self.render();
                        // Backbone.history.navigate('books/' + resp.data.book_id, true);

                    } else {
                        alert('sorry but you have to be logged in');
                    }

                });

            }

        },
        makePublic: function (event) {
            this.togglePrivacy(true);
            $('.make-public').addClass('active');
            $('.make-private').removeClass('active');

        },
        makePrivate: function (event) {
            this.togglePrivacy(false);
            $('.make-private').addClass('active');
            $('.make-public').removeClass('active');

        },
        togglePrivacy: function (value) {


            var self = this;
            $.post('/api/books/' + this.model.id + '/public', {
                value: value
            }, function(resp) {

                if (resp.status === 200) {

                    // self.model.set({public: value});
                    // self.render();
                    // Backbone.history.navigate('books/' + resp.data.book_id, true);

                } else {
                    alert('sorry but you have to be logged in');
                }

            });


        },

        newSection: function (event) {

            var self = this;
            var title = prompt('choose a section title');
            if (title && title.trim().length && this.model.id) {

                $.post('/api/books/' + this.model.id, {
                    title: title
                }, function(resp) {

                    if (resp.status === 200) {

                        var section = new self.collection.model(resp.data);
                        self.collection.add(section);
                        self.render();
                        // Backbone.history.navigate('books/' + resp.data.book_id, true);

                    } else {
                        alert('sorry but you have to be logged in');
                    }

                });

            }

        },
        convertLaTeX: function (event) {

        }

    });


    return Views;

});
