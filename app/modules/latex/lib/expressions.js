define(['sandbox'], function(sandbox) {

    var Delimiters = {
        pspicture: {
            begin: /\\begin\{pspicture\}/,
            end: /\\end\{pspicture\}/
        },
        verbatim: {
            begin: /^\\begin\{verbatim\}/,
            end: /^\\end\{verbatim\}/
        },
        enumerate: {
            begin: /\\begin\{enumerate\}/,
            end: /\\end\{enumerate\}/
        },
        print: {
            begin: /\\begin\{print\}/,
            end: /\\end\{print\}/
        },
        nicebox: {
            begin: /\\begin\{nicebox\}/,
            end: /\\end\{nicebox\}/
        }

    };

    var Ignore = [
        /^\%/,
        /\\begin\{document\}/,
        /\\end\{document\}/,
        /\\begin\{interactive\}/,
        /\\end\{interactive\}/,
        /\\usepackage/,
        /\\documentclass/,
        /\\tableofcontents/,
        /\\author/,
        /\\date/,
        /\\maketitle/,
        /\\title/,
        /\\pagestyle/,

        /\\smallskip/,
        /\\medskip/,
        /\\bigskip/,
        /\\nobreak/,


        // this is because we auto center (sorry?)
        /\\begin\{center\}/,
        /\\end\{center\}/


    ];

    var Headers = {

        Expressions: {
            // bc: /\\begin\{center\}/,
            // ec: /\\end\{center\}/,


            bq: /\\begin\{quotation\}/,
            eq: /\\end\{quotation\}/,


            proof: /\\begin\{proof\}/,
            qed: /\\end\{proof\}/,
            example: /\\begin\{example\}/,
            definition: /\\begin\{definition\}/,
            theorem: /\\begin\{theorem\}/,
            claim: /\\begin\{claim\}/,
            corollary: /\\begin\{corollary\}/,
            problem: /\\begin\{problem\}/,
            solution: /\\begin\{solution\}/,


            endexample: /\\end\{example\}/,
            enddefinition: /\\end\{definition\}/,
            endproblem: /\\end\{problem\}/,
            endsolution: /\\end\{solution\}/,
            endtheorem: /\\end\{theorem\}/,
            endclaim: /\\end\{claim\}/,
            endcorallary: /\\end\{corallary\}/

        },
        Functions: {
            // bc: function() {
            //     return '<span class="center">';
            // },
            // ec: function() {
            //     return '</span>';
            // },

            endexample: function() {return '';},
            enddefinition: function() {return '';},
            endproblem: function() {return '';},
            endsolution: function() {return '';},
            endtheorem: function() {return '';},
            endclaim: function() {return '';},
            endcorollary: function() {return '';},

            bq: function() {
                return '<p class="quotation">';
            },
            eq: function() {
                return '</p>';
            },

            proof: function() {
                return '<h4>Proof</h4>';
            },
            qed: function() {
                return '$\\qed$';
            },
            example: function() {
                return '<h4>Example</h4>';
            },
            definition: function() {
                return '<h4>Definition</h4>';
            },
            problem: function() {
                return '<h4>Problem</h4>';
            },
            solution: function() {
                return '<h4>Solution</h4>';
            },
            theorem: function() {
                return '<h4>Theorem</h4>';
            },
            corollary: function() {
                return '<h4>Corollary</h4>';
            },
            claim: function() {
                return '<h4>Claim</h4>';
            }
        }

    };

    /**
    * TEXT
    */

    var simplerepl = function (regex,replace) {
        return function (m, contents) {
            return contents.replace(regex, replace);
        };
    };

    var matchrepl = function (regex, callback) {

        return function (m, contents) {
            _.each(m, function(match) {
                var m2 = match.match(regex);
                contents = contents.replace(m2.input, callback(m2));
            });
            return contents;
        };


    };

    var Text = {

        Expressions: {
            emph: /\\emph\{[^}]*\}/g,
            bf: /\{*\\bf [^}]*\}/g,
            rm: /\{*\\rm [^}]*\}/g,
            sl: /\{*\\sl [^}]*\}/g,
            it: /\{*\\it [^}]*\}/g,
            tt: /\{*\\tt [^}]*\}/g,
            mdash: /---/g,
            ndash: /--/g,
            openq: /``/g,
            closeq: /''/g,
            // dont catch ones that are already used for MathJAX (wrapped in $)

            TeX: /\\TeX\\|\\TeX/g,
            LaTeX: /\\LaTeX\\|\\LaTeX/g,
            vspace: /\\vspace/g,
            cite: /\\cite\[\d+\]\{[^}]*\}/g,

            href: /\\href\{[^}]*\}\{[^}]*\}/g,
            img: /\\img\{[^}]*\}/g,
            set: /\\set\{[^}]*\}/g,
            // iframe: /\\iframe\{[^}]*\}/g,
            youtube: /\\youtube\{[^}]*\}/g,

            // for parsing equations inside psgraph, maybe shouldn't be in Text
            euler: /Euler\^/g
        },

        Functions: {
            cite: function(m, contents) {
                _.each(m, function(match) {
                    var m2 = match.match(/\\cite\[(\d+)\]\{([^}]*)\}/);

                    var m = location.pathname.match(/\/books\/(\d+)\//);
                    var book_id = 0;
                    if (m) {
                        book_id = m[1];
                    }
                    contents = contents.replace(m2.input, '<a data-bypass="true" href="/references/' + book_id + '/' + m2[2] + '">[p' + m2[1] + ']</a>');
                });
                return contents;
            },

            img: matchrepl(/\\img\{([^}]*)\}/, function(m) {
                return '<div style="width: 100%;text-align: center;"><img src="'+m[1]+'"></div>';
            }),
            // iframe: matchrepl(/\\iframe\{([^}]*)\}/, function(m) {
            //     return '<iframe src="'+m[1]+'">';
            // }),
            youtube: matchrepl(/\\youtube\{([^}]*)\}/, function(m) {
                return '<div style="width: 100%;text-align: center;"><iframe width="560" height="315" src="https://www.youtube.com/embed/' + m[1] + '" frameborder="0" allowfullscreen></iframe></div>';
            }),


            href: matchrepl(/\\href\{([^}]*)\}\{([^}]*)\}/, function(m) {
                return '<a href="'+m[1]+'">'+ m[2] +'</a>';
            }),

            set: matchrepl(/\\set\{([^}]*)\}/, function(m) {
                return '<i>'+m[1]+'</i>';
            }),

            euler: simplerepl(/Euler\^/, 'exp'),
            emph: matchrepl(/\{([^}]*)\}/, function(m) { return  '<i>' + m[1] + '</i>'; }),
            bf: matchrepl(/\{*\\bf ([^}]*)\}/, function(m){return '<b>' + m[1] + '</b>';}),
            rm: matchrepl(/\{*\\rm ([^}]*)\}/,  function(m){return'<span class="rm">' + m[1] + '</span>';}),
            sl: matchrepl(/\{*\\sl ([^}]*)\}/,function(m){return '<i>' + m[1] + '</i>';}),
            it: matchrepl(/\{*\\it ([^}]*)\}/, function(m){return'<i>' + m[1] + '</i>';}),
            tt: matchrepl(/\{*\\tt ([^}]*)\}/, function(m){return'<span class="tt">' + m[1] + '</span>';}),
            ndash: simplerepl(/--/g, '&ndash;'),
            mdash: simplerepl(/---/g, '&mdash;'),
            openq: simplerepl(/``/g, '&ldquo;'),
            closeq: simplerepl(/''/g,'&rdquo;'),
            vspace: simplerepl(/\\vspace/g,'<br>'),
            TeX: simplerepl(/\\TeX\\|\\TeX/g,'$\\TeX$'),
            LaTeX: simplerepl(/\\LaTeX\\|\\LaTeX/g,'$\\LaTeX$')
        }
    };


    // OPTIONS 

    // converts [showorigin=false,labels=none, Dx=3.14] to {showorigin: 'false', labels: 'none', Dx: '3.14'}

    var parseOptions = function(opts) {

        var options = opts.replace(/[\]\[]/g, '');
        var all = options.split(',');
        var obj = {};
        _.each(all, function(option) {
            var kv = option.split('=');
            if (kv.length == 2) {
                obj[kv[0].trim()] = kv[1].trim();
            }
        });
        return obj;

    };

    /**
    * SETTINGS
    */

    var convertUnits = function(value) {

        var m = null;
        if ((m=value.match(/([^c]+)\s*cm/))) {
            var num1 = Number(m[1]);
            return num1 * 50; //118;
        } else if ((m=value.match(/([^i]+)\s*in/))) {
            var num2 = Number(m[1]);
            return num2 * 20; //46;
        } else if ((m=value.match(/(.*)/))) {
            var num3 = Number(m[1]);
            return num3 * 50;
        } else {
            var num4 = Number(value);
            return num4;
        }

    };

    var Settings = {

        Expressions: {
            fillcolor: /^fillcolor$/,
            fillstyle: /^fillstyle$/,
            linecolor: /^linecolor$/,
            linestyle: /^linestyle$/,

            // UNITS
            // default to 1cm (page 12/338 in pdf)
            unit: /^unit/,
            runit: /^runit/,
            xunit: /^xunit/,
            yunit: /^yunit/
        },

        Functions: {
            fillcolor: function(o,v) {
                o.fillcolor = v;
            },
            fillstyle: function(o,v) {
                o.fillstyle = v;
            },
            linecolor: function(o,v) {
                o.linecolor = v;
            },
            linestyle: function(o,v) {
                o.linestyle = v;
            },

            // UNITS
            // default to 1cm (page 12/338 in pdf)
            // this should set runit, xunit, yunit by default

            /*
            cm, in, pt
            */

            unit: function(o,v) {
                v = convertUnits(v);
                o.unit = v;
                o.runit = v;
                o.xunit = v;
                o.yunit = v;
            },
            runit: function(o,v) {
                v = convertUnits(v);
                o.runit = v;
            },
            xunit: function(o,v) {
                v = convertUnits(v);
                o.xunit = v;
            },
            yunit: function(o,v) {
                v = convertUnits(v);
                o.yunit = v;
            }
        }
    };

    /**
    * PSTRICKS
    */

    var parseArrows = function(m) {
        var lineType = m;

        var arrows = [0,0];
        var dots = [0,0];

        if (lineType) {

            var type = lineType.match(/\{([^\-]*)?\-([^\-]*)?\}/);

            if (type) {

                if (type[1]) {
                    // check starting point
                    if (type[1].match(/\*/)) {
                        dots[0] = 1;
                    } else if (type[1].match(/</)) {
                        arrows[0] = 1;
                    }
                }

                if (type[2]) {

                    // check ending point
                    if (type[2].match(/\*/)) {
                        dots[1] = 1;
                    } else if (type[2].match(/>/)) {
                        arrows[1] = 1;
                    }

                }
            }

        }

        return {
            arrows: arrows,
            dots: dots
        };

    };

    var evaluate = function (exp) {

        var num = Number(exp);
        if (_.isNaN(num)) {

            var expression = '';
            _.each(this.variables, function(val, name) {
                expression += 'var ' + name + ' = ' + val + ';';
            });
            expression+= 'with (Math){' + exp + '}';
            return eval(expression);

        } else {
            return num;
        }


    };

    var X = function (v) {
        return (this.w - (this.x1 - Number(v))) * this.xunit;
    };
    var Xinv = function(v) {
        return Number(v)/this.xunit - this.w + this.x1;
    };
    var Y = function (v) {
        return (this.y1 - Number(v)) * this.yunit;
    };
    var Yinv = function (v) {
        return this.y1 - Number(v)/this.yunit;
    };

    var RE = {

        // NOTE: ESCAPES MUST BE ESCAPED!

        options: '(\\[[^\\]]*\\])?',
        type: '(\\{[^\\}]*\\})?',
        squiggle: '\\{([^\\}]*)\\}',

        squiggleOpt: '(\\{[^\\}]*\\})?',


        //double match
        // returns [(0,0), 0, 0] or [undefined, undefined, undefined]

        coordsOpt: '(\\(\\s*([^\\)]*),([^\\)]*)\\s*\\))?',

        // not optional
        coords: '\\(\\s*([^\\)]*),([^\\)]*)\\s*\\)'

    };


    var PSTricks = {

        Expressions: {
            pspicture: /\\begin\{pspicture\}\(\s*(.*),(.*)\s*\)\(\s*(.*),(.*)\s*\)/,
            psframe: /\\psframe\(\s*(.*),(.*)\s*\)\(\s*(.*),(.*)\s*\)/,

            // \psplot[linewidth=1.5pt]{-3.14}{3.14}{cos(x/2)}
            psplot: /\\psplot(\[[^\]]*\])?\{([^\}]*)\}\{([^\}]*)\}\{([^\}]*)\}/,


            // \psarc*[par]{arrows}(x,y){radius}{angleA}{angleB}

            psarc: new RegExp( '\\\\psarc' + RE.options + RE.type + RE.coords + RE.squiggle + RE.squiggle + RE.squiggle ),

            pscircle: /\\pscircle.*\(\s*(.*),(.*)\s*\)\{(.*)\}/,

            pspolygon: new RegExp('\\\\pspolygon' + RE.options + '(.*)' ),

            // (\[[^\]]*\])?
            // matches [options]

            // \(\s*([^\)]*),([^\)]*)\s*\)\(\s*([^\)]*),([^\)]*)\s*\)
            // matches (0,0)(0,0)

            // psaxes: /\\psaxes(\[[^\]]*\])?\(\s*([^\)]*),([^\)]*)\s*\)\(\s*([^\)]*),([^\)]*)\s*\)/,

            // \psaxes*[par]{arrows}(x0,y0)(x1,y1)(x2,y2)
            psaxes: new RegExp( '\\\\psaxes' + RE.options + RE.type + RE.coords + RE.coordsOpt + RE.coordsOpt ),

            slider: new RegExp( '\\\\slider' + RE.options + RE.squiggle + RE.squiggle + RE.squiggle + RE.squiggle + RE.squiggle),


            // (\[[^\]]*\])?
            // matches [options]

            // (\{[^\}]*\})?
            // matches {type}

            // \(\s*([^\)]*),([^\)]*)\s*\)\(\s*([^\)]*),([^\)]*)\s*\)
            // matches (0,0)(0,0)
            // psline: /\\psline(\[[^\]]*\])?(\{[^\}]*\})?\(\s*([^\)]*),([^\)]*)\s*\)\(\s*([^\)]*),([^\)]*)\s*\)/,
            psline: new RegExp( '\\\\psline' + RE.options + RE.type + RE.coords + RE.coordsOpt ),
            userline: new RegExp( '\\\\userline' + RE.options + RE.type + RE.coords + RE.coords + RE.squiggleOpt + RE.squiggleOpt + RE.squiggleOpt + RE.squiggleOpt),

            // options / variable name / default (x,y) values / f(x,y)
            uservariable: new RegExp( '\\\\uservariable' + RE.options + RE.squiggle + RE.coords + RE.squiggle),

            rput: /\\rput\((.*),(.*)\)\{(.*)\}/,

            psset: /\\psset\{(.*)\}/
        },

        Functions: {

            slider: function (m) {

                // console.log(m);

                var obj = {
                    scalar: 1,

                    min: Number(m[2]),
                    max: Number(m[3]),
                    variable: m[4],
                    latex: m[5],
                    value: Number(m[6])
                };



                this.variables = this.variables || {};

                this.variables[obj.variable] = obj.value;

                this.sliders = this.sliders || [];

                this.sliders.push( obj );

                if (m[1]) {
                    _.extend(obj, parseOptions(m[1]));

                }

                return obj;

            },

            pspicture: function(m) {

                var p = {
                    x0: Number(m[1]),
                    y0: Number(m[2]),
                    x1: Number(m[3]),
                    y1: Number(m[4])
                };

                var s = {
                    w: p.x1 - p.x0,
                    h: p.y1 - p.y0
                };

                _.extend(this, p, s);

                return _.extend(p, s);

            },


            psframe: function(m) {

                var obj = {
                    x1: X.call(this, m[1]),
                    y1: Y.call(this, m[2]),
                    x2: X.call(this, m[3]),
                    y2: Y.call(this, m[4])
                };

                return obj;

            },

            pscircle: function(m) {
                var obj = {
                    cx: X.call(this, m[1]),
                    cy: Y.call(this, m[2]),
                    r: this.xunit * m[3]
                };

                return obj;
            },

            psaxes: function (m) {

                var obj = {
                    dx: 1*this.xunit,
                    dy: 1*this.yunit,
                    arrows:[0,0],
                    dots: [0,0],
                    ticks: 'all'
                };

                if (m[1]) {
                    var options = parseOptions(m[1]);

                    if (options.Dx) {
                        obj.dx = Number(options.Dx) * this.xunit;
                    }
                    if (options.Dy) {
                        obj.dy = Number(options.Dy) * this.yunit;
                    }

                }

                // arrows?
                var l = parseArrows(m[2]);
                obj.arrows = l.arrows;
                obj.dots = l.dots;


                // \psaxes*[par]{arrows}(x0,y0)(x1,y1)(x2,y2)

                // m[1] [options]
                // m[2] {<->}

                // origin
                // m[3] x0
                // m[4] y0

                // bottom left corner
                // m[6] x1 
                // m[7] y1

                // top right corner
                // m[9] x2
                // m[10] y2


                if (m[5] && !m[8]) {
                    // If (x0,y0) is omitted, then the origin is (x1,y1).

                    obj.origin = [X.call(this, m[3]), Y.call(this, m[4])];
                    obj.bottomLeft = [X.call(this, m[3]), Y.call(this, m[4])];
                    obj.topRight = [X.call(this, m[6]), Y.call(this, m[7])];


                } else if (!m[5] && !m[8]) {
                    // If both (x0,y0) and (x1,y1) are omitted, (0,0) is used as the default.

                    obj.origin = [X.call(this, 0), Y.call(this, 0)];
                    obj.bottomLeft = [X.call(this, 0), Y.call(this, 0)];
                    obj.topRight = [X.call(this, m[3]), Y.call(this, m[6])];


                } else {

                    // all three are specified
                    obj.origin = [X.call(this, m[3]), Y.call(this, m[4])];
                    obj.bottomLeft = [X.call(this, m[6]), Y.call(this, m[7])];
                    obj.topRight = [X.call(this, m[9]), Y.call(this, m[10])];

                }

                return obj;

            },

            psplot: function (m) {

                var startX = evaluate.call(this, m[2]);
                var endX = evaluate.call(this, m[3]);

                var data = [];

                var x;

                // get env
                var expression = '';
                _.each(this.variables, function(val, name) {
                    expression += 'var ' + name + ' = ' + val + ';';
                });
 
                expression+= 'with (Math){' + m[4] + '}';

                // console.log(expression);

                for(x=startX; x<=endX; x+=0.005) {

                    data.push(X.call(this, x));
                    // data.push(Y.call(this, Math.cos(x/2)));

                    data.push(Y.call(this, eval(expression)));

                }


                var obj = {

                    linecolor: 'black',
                    linestyle: 'solid', // solid, dotted, dashed
                    fillstyle: 'none', // none, solid
                    fillcolor: 'none',
                    linewidth: 2

                };
                if (m[1]) _.extend(obj, parseOptions(m[1]));

                obj.data = data;

                return obj;

            },

            pspolygon: function (m) {


                var coords = m[2];

                if (!coords) return;

                var manyCoords = new RegExp(RE.coords, 'g');
                var matches = coords.match(manyCoords);
                var singleCoord = new RegExp(RE.coords);
                var data = [];
                _.each(matches, function(coord) {

                    var d = singleCoord.exec(coord);

                    data.push(X.call(this, d[1]));
                    data.push(Y.call(this, d[2]));

                }, this);

                var obj = {
                    linecolor: 'black',
                    linestyle: 'solid', // solid, dotted, dashed
                    fillstyle: 'none', // none, solid
                    fillcolor: 'black',
                    linewidth: 2,
                    data: data
                };

                if (m[1]) _.extend(obj, parseOptions(m[1]));

                return obj;


            },

            psarc: function(m) {

                // console.log(m);

                var l = parseArrows(m[2]);
                var arrows = l.arrows;
                var dots = l.dots;

                var obj = {

                    linecolor: 'black',
                    linestyle: 'solid', // solid, dotted, dashed
                    fillstyle: 'solid', // none, solid
                    fillcolor: 'black',
                    linewidth: 2,
                    arrows: arrows,
                    dots: dots,

                    cx: X.call(this, 0),
                    cy: Y.call(this, 0)

                };

                if (m[1]) {
                    _.extend(obj, parseOptions(m[1]));
                }


                // m[1] options
                // m[2] arrows
                // m[3] x1
                // m[4] y1
                // m[5] radius
                // m[6] angleA
                // m[7] angleB

                if (m[3]) {
                    obj.cx = X.call(this, m[3]);
                }

                if (m[4]) {
                    obj.cy = Y.call(this, m[4]);
                }

                // choose x units over y, no reason...
                obj.r = Number(m[5]) * this.xunit;
                obj.angleA = Number(m[6]) * Math.PI / 180;
                obj.angleB = Number(m[7]) * Math.PI / 180;
                obj.A = {
                    x: X.call(this, Number(m[5]) * Math.cos(obj.angleA)),
                    y: Y.call(this, Number(m[5]) * Math.sin(obj.angleA))
                };
                obj.B = {
                    x: X.call(this, Number(m[5]) * Math.cos(obj.angleB)),
                    y: Y.call(this, Number(m[5]) * Math.sin(obj.angleB))
                };


                return obj;
            },
            psline: function(m) {

                var options = m[1],
                lineType = m[2];

                var l = parseArrows(lineType);

                var arrows = l.arrows;
                var dots = l.dots;

                var obj = {
                    linecolor: 'black',
                    linestyle: 'solid', // solid, dotted, dashed
                    fillstyle: 'solid', // none, solid
                    fillcolor: 'black',
                    linewidth: 2,

                    arrows: arrows,
                    dots: dots
                };

                if (m[5]) {
                    obj.x1 = X.call(this, m[3]);
                    obj.y1 = Y.call(this, m[4]);
                    obj.x2 = X.call(this, m[6]);
                    obj.y2 = Y.call(this, m[7]);
                } else {
                    obj.x1 = X.call(this, 0);
                    obj.y1 = Y.call(this, 0);
                    obj.x2 = X.call(this, m[3]);
                    obj.y2 = Y.call(this, m[4]);
                }


                if (options) {
                    _.extend(obj, parseOptions(options));
                }

                // TODO: add regex
                if (typeof obj.linewidth === 'string') {
                    obj.linewidth = 2;
                }

                return obj;
            },

            uservariable: function (m) {

                var options = m[1];

                var coords = [];
                if (this.userx && this.usery) {
                    // coords.push( Xinv.call(this, this.userx) );
                    // coords.push( Yinv.call(this, this.usery) );
                    coords.push( Number( this.userx ) );
                    coords.push( Number( this.usery ) );
                } else {
                    coords.push( X.call(this, m[3]) );
                    coords.push( Y.call(this, m[4]) );
                }

                var nx1 = Xinv.call(this, coords[0]);
                var ny1 = Yinv.call(this, coords[1]);
                var expx1 = 'var x = ' + nx1 + ';';
                var expy1 = 'var y = ' + ny1 + ';';
                // return X.call(this, eval(expy1 + expx1 + xExp));


                var obj = {
                    name: m[2], // variable name
                    x: X.call(this, m[3]),
                    y: Y.call(this, m[4]),
                    func: m[5],
                    value: eval(expx1 + expy1 + m[5])
                };

                return obj;

            },

            userline: function (m) {

                var options = m[1], // WE ARENT USING THIS YET!!!! e.g., [linecolor=green]
                lineType = m[2];

                var l = parseArrows(lineType);

                var arrows = l.arrows;
                var dots = l.dots;

    
                var xExp = m[7];
                var yExp = m[8];

                if (xExp) 
                xExp = 'with (Math){' +xExp.replace(/^\{/, '').replace(/\}$/, '') + '}';

                if (yExp)
                yExp = 'with (Math){' + yExp.replace(/^\{/, '').replace(/\}$/, '') + '}';

                var xExp2 = m[9];
                var yExp2 = m[10];

                if (xExp2) 
                xExp2 = 'with (Math){' +xExp2.replace(/^\{/, '').replace(/\}$/, '') + '}';

                if (yExp2)
                yExp2 = 'with (Math){' + yExp2.replace(/^\{/, '').replace(/\}$/, '') + '}';


                var expression = '';
                 _.each(this.variables, function(val, name) {
                    expression += 'var ' + name + ' = ' + val + ';';
                });
 


                var obj = {
                    x1: X.call(this, m[3]),
                    y1: Y.call(this, m[4]),
                    x2: X.call(this, m[5]),
                    y2: Y.call(this, m[6]),

                    xExp: xExp,
                    yExp: yExp,
                    xExp2: xExp2,
                    yExp2: yExp2,

                    userx: _.bind(function(coords) {

                        var nx1 = Xinv.call(this, coords[0]);
                        var ny1 = Yinv.call(this, coords[1]);
                        var expx1 = 'var x = ' + nx1 + ';';
                        var expy1 = 'var y = ' + ny1 + ';';
                        return X.call(this, eval(expression + expy1 + expx1 + xExp));
 
                    }, this),

                    usery: _.bind(function(coords) {

                        var nx2 = Xinv.call(this, coords[0]);
                        var ny2 = Yinv.call(this, coords[1]);
                        var expx2 = 'var x = ' + nx2 + ';';
                        var expy2 = 'var y = ' + ny2 + ';';
                        return Y.call(this, eval(expression + expy2 + expx2 + yExp));
 
                    }, this),

                    userx2: _.bind(function(coords) {


                        var nx3 = Xinv.call(this, coords[0]);
                        var ny3 = Yinv.call(this, coords[1]);
                        var expx3 = 'var x = ' + nx3 + ';';
                        var expy3 = 'var y = ' + ny3 + ';';
                        return X.call(this, eval(expression + expy3 + expx3 + xExp2));
 
                    }, this),

                    usery2: _.bind(function(coords) {

                        var nx4 = Xinv.call(this, coords[0]);
                        var ny4 = Yinv.call(this, coords[1]);
                        var expx4 = 'var x = ' + nx4 + ';';
                        var expy4 = 'var y = ' + ny4 + ';';
                        return Y.call(this, eval(expression + expy4 + expx4 + yExp2));
 
                    }, this),


                    linecolor: 'black',
                    linestyle: 'solid', // solid, dotted, dashed
                    fillstyle: 'solid', // none, solid
                    fillcolor: 'black',
                    linewidth: 2,

                    arrows: arrows,
                    dots: dots
                };


                if (options) {                    
                    _.extend(obj, parseOptions(options));
                }

                // TODO: add regex
                if (typeof obj.linewidth === 'string') {
                    obj.linewidth = 2;
                }

                // console.log('check options!!!!');
                // console.log(obj);

                return obj;

            },






            rput: function(m) {
                return {
                    x: X.call(this, m[1]),
                    y: Y.call(this, m[2]),
                    text: m[3]
                };
            },
            psset: function(m) {

                var pairs = _.map(m[1].split(','), function(pair) {
                    return pair.split('=');
                });

                var obj = {};

                _.each(pairs, function(pair) {

                    var key = pair[0];
                    var value = pair[1];

                    _.each(Settings.Expressions, function(exp, setting) {

                        if (key.match(exp)) {
                            Settings.Functions[setting](obj, value);
                        }

                    });

                });

                return obj;

            }
        }
    };

    return {

        X: X,
        Y: Y,
        Xinv: Xinv,
        Yinv: Yinv,

        PSTricks: PSTricks,
        Delimiters: Delimiters,
        Ignore: Ignore,
        Text: Text,
        Headers: Headers

    };


});
