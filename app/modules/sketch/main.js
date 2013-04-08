define(['sandbox', 'sketch-views/edit', 'sketch-views/read'], function(sandbox, Editor, Content) {

    var E = sandbox.Module({

        start: function() {
            sandbox.subscribe('edit:sketch', 'sketch', this.editSketch, this);
            sandbox.subscribe('edit:newsketch', 'sketch', this.newSketch, this);
            sandbox.subscribe('render:sketch', 'sketch', this.viewSketch, this);
        },

        editSketch: function(who, auth, sketch) {

            $('body').addClass('editor');

            var v = new Editor({
                auth: auth,
                model: sketch
            });

            // using editor as the channel ... so it gets proper css applied
            sandbox.publish('render', 'editor', v);

        },

        newSketch: function(who, auth, sketch) {

            $('body').addClass('editor');

            var v = new Editor({
                auth: auth
            });

            // using editor as the channel ... so it gets proper css applied
            sandbox.publish('render', 'editor', v);

        },
        
        viewSketch: function(who, auth, sketch) {

            var v = new Content.Content({
                auth: auth,
                model: sketch
            });
            sandbox.publish('render', 'sketch', v);

        }       

    });

    return {
        start: function() {
            var editor = new E();
            editor.start();
        }
    };

});
