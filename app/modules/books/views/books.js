define(['sandbox'], function(sandbox) {

    var Views = {};

    Views.Book = sandbox.mvc.View({

        template: 'books/templates/books/item',
        serialize: function() {
            var book = this.model.toJSON();
            book.auth= this.options.auth;
            book.path = '/books/' + this.model.id;
            return book;
        }

    });

    Views.Books = sandbox.mvc.View({
        template: 'books/templates/books/list',
        className: 'books',
        serialize: function() {
            return {
                auth: this.options.auth
            };
        },
        beforeRender: function() {
            this.collection.each(function(book) {
                this.insertView('.book-list', new Views.Book({ model: book }));
            }, this);
        },
        events: {
            'click .new-book':'newBook'
        },
        newBook: function (event) {

            var self = this;
            var title = prompt('choose a title');
            if (title && title.trim().length) {

                $.post('/api/books', {
                    title: title
                }, function(resp) {

                    if (resp.status === 200) {

                        Backbone.history.navigate('books/' + resp.data.book_id, true);

                    } else {
                        alert('sorry but you have to be logged in');
                    }

                });

            }

        }
    });

    return Views;

});
