define(function(){

/**
* el is drag/drop area, file is backup if drag and drop not supported
*/


var DragNDropReader = function( el, file, callback){
    this.el = el;

    var self = this;
    ['drop', 'dragenter', 'dragover', 'dragleave'].forEach(function(event) {
        el.addEventListener(event, self, false);
    });

    if (file) {
        file.addEventListener('change', function(event) {
            self.handleFiles(this.files) ;
        }, false);
    }

    this.callback = callback;
};

// https://developer.mozilla.org/en/DOM/FileReader
var imageRegEx = /^(image\/bmp|image\/cis-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x-cmu-raster|image\/x-cmx|image\/x-icon|image\/x-portable-anymap|image\/x-portable-bitmap|image\/x-portable-graymap|image\/x-portable-pixmap|image\/x-rgb|image\/x-xbitmap|image\/x-xpixmap|image\/x-xwindowdump)$/i; 

var audioRegEx = /^audio\/mp3$/i;

DragNDropReader.imageRegEx = imageRegEx;
DragNDropReader.audioRegEx = audioRegEx;

DragNDropReader.prototype = {

    handleEvent: function(event) {
        switch (event.type) {
            case 'drop': 
                this.onDrop(event);
                break;

            case 'dragenter': 
                this.cancel(event);
                break;
            case 'dragover': 
                this.onDragOver(event);
                break;

                break;
            case 'dragleave':
                this.onDragLeave(event);
                break;
        }
    },

    onDragEnter: function(event) { },
    onDragLeave: function(event) { },

    onDragOver: function(event) {
        return this.cancel( event );
    },

    onDrop: function(event) {
        event.preventDefault();
        event.stopPropagation();
        this.handleFiles( event.dataTransfer.files );
    },

    cancel: function(event) {
        event.preventDefault();
        event.stopPropagation();
    },

    handleFiles: function(files) {

        var self = this;
        [].forEach.call(files, function(file) {
            self.handleFile( file );
        });

    },

    handleFile: function(file) {

        this.callback(file);

        // var reader = new FileReader();
        // reader.onerror = this.readerError;
        // if (imageRegEx.test( file.type )) {
        //     reader.onload = this.readerLoaded(file);
        //     //reader.onload = this.readerLoadedImage(file);
        //     //reader.readAsDataURL( file );
        //     reader.readAsBinaryString( file );
        //     //reader.readAsText( file );
        // } else {
        //     reader.onload = this.readerLoaded(file);
        //     reader.readAsBinaryString( file );
        //     //reader.readAsText( file );
        // }

    },

    readerLoaded: function(file) {
        return function(event) {
           console.log( event.target.result );
        };

    },

    readerLoadedImage: function(file) {

        return function(event) {
            var img = document.createElement('img');
            img.src = event.target.result;
            img.height = '100';
            img.width = '100';
        };
    },

    readerError: function(event) {
        console.log( event );
    }

};

// document.addEventListener('DOMContentLoaded', function(event) {
//     new DragNDropReader( document.getElementById('content'), document.getElementById('file') );
//     window.socket = io.connect('192.168.1.107:7777');
// }, false);


return DragNDropReader;

});