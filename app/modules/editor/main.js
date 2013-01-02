define(['sandbox', 'editor-views/edit-content'], function(sandbox, Content) {

    var Editor = sandbox.Module({

        start: function() {

            sandbox.subscribe('edit:book', 'editor', this.editBook, this);
            sandbox.subscribe('edit:section', 'editor', this.editSection, this);
            sandbox.subscribe('edit:content', 'editor', this.editContent, this);
            sandbox.subscribe('edit:subsection', 'editor', this.editSubsection, this);
            sandbox.subscribe('edit:subcontent', 'editor', this.editSubcontent, this);
        },

        editBook: function(who, auth, sections, book) {

        },


        editSection: function(who, auth, book, sections, section) {

        },
        editContent: function(who, auth, book, sections, section, content) {

            if (auth.author) {


                if ( _.indexOf(auth.write, book.id) !== -1 ) {

                auth.can = (_.indexOf(auth.write, book.id) !== -1);



                    $('body').addClass('editor');

                    var v = new Content.Content({
                        auth: auth,
                        book: book,
                        collection: sections,
                        section: section,
                        content: content
                    });
                    sandbox.publish('render', 'editor', v);

                }

            } else {
                Backbone.history.navigate('/auth', true);
            }


        },
        editSubsection: function(who, auth, book, sections, section, subsection) {

        },
        editSubcontent: function(who, auth, book, sections, section, subsection, content) {

            if (auth.author) {

                if ( _.indexOf(auth.write, book.id) !== -1 ) {

                auth.can = (_.indexOf(auth.write, book.id) !== -1);


                    $('body').addClass('editor');

                    var v = new Content.Subcontent({
                        auth: auth,
                        book: book,
                        collection: sections,
                        section: section,
                        subsection: subsection,
                        content: content
                    });
                    sandbox.publish('render', 'editor', v);

                }

            } else {
                Backbone.history.navigate('/auth', true);
            }
        }


    });

    return {
        start: function() {
            var editor = new Editor();
            editor.start();
        }
    };

});
