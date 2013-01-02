define(['sandbox', 'psgraph'], function(sandbox, psgraph) {

    var SliderView = sandbox.mvc.View({
        template: 'latex/templates/interactive/sliders',

        serialize: function() {
            var slider = this.options.slider;
            return {
                latex: slider.latex,
                scalar: slider.scalar,
                variable: slider.variable,
                min:  slider.min*slider.scalar,
                max:  slider.max*slider.scalar,
                value: slider.value
            };
        },
        afterRender: function() {
           
           var slid = this.$('input[type=range]');
           var p = this.$('h4+p');

           var svg = this.options.svg;
           var env = this.options.env;
           var plots = this.options.plot;


           // THIS SHOULD DELEGATE, NOT BE RESPONSIBLE FOR RENDERING! 
           slid.on('change', function(){
                var value = this.value/this.getAttribute('scalar');
                var variable = this.getAttribute('variable');
            
                p.html(value);

                env.variables[variable] = value;
                svg.selectAll('.psplot').remove();

                _.each(plots, function(plot, k) {

                    if (k.match(/psplot/)) {

                        _.each(plot, function(data) {

                            var d = data.fn.call(data.env, data.match);

                            // var d = _.extend({}, data, env);
                            psgraph[k].call(d, svg);
                        });
                    }

                });

            });

            var process = MathJax.Hub.Queue(["Typeset",MathJax.Hub,this.el]);
            if (typeof process === 'function') process();

        }


    });


    var SlidersView = sandbox.mvc.View({

        className: 'well interactive',
        beforeRender: function() {
               _.each(this.options.sliders, function(slider) {

                var view = new SliderView({
                    svg: this.options.svg,
                    env: this.options.env,
                    plot: this.options.plot,
                    slider: slider
                });
                this.insertView(view);

            }, this);
        }

    });

    return {
        SlidersView: SlidersView,
        SliderView: SliderView
    };


});
