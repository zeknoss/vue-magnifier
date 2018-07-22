Vue.component('vue-magnifier', {
    template:
    '<div class="vue-magnifier-container">' +
        '<slot></slot>' +
        '<span ref="magnificationElement" class="preview" v-bind:style="{backgroundImage:\'url(\' + src + \')\'}">' +
            '<span ref="glass" class="magnifying-glass" v-bind:style="{backgroundImage: \'url(\' + srclarge + \')\', backgroundPosition: backgroundPos, left: cursorX + \'px\', top: cursorY + \'px\'}"></span>' +
        '</span>' +
    '</div>',
    props: {
        src: String,
        srcLarge: String
    },
    methods: {
        getCursorPos: function(e){
            var x = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
            var y = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

            this.cursorX = x-this.thumbPos.x;
            this.cursorY = y-this.thumbPos.y;
        },
        getBounds: function(){
            var el = this.$refs.magnificationElement;

            this.bounds = el.getBoundingClientRect();

            var xPos = 0;
            var yPos = 0;
            while (el) {
                var transform = this.getTransform(el);
                if (el.tagName == "BODY") {
                    // deal with browser quirks with body/window/document and page scroll
                    var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                    var yScroll = el.scrollTop || document.documentElement.scrollTop;


                    xPos += (el.offsetLeft - xScroll + el.clientLeft + parseInt(transform[0]));
                    yPos += (el.offsetTop - yScroll + el.clientTop + parseInt(transform[1]));
                } else {
                    // for all other non-BODY elements
                    xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft + parseInt(transform[0]));
                    yPos += (el.offsetTop - el.scrollTop + el.clientTop + parseInt(transform[1]));
                }

                el = el.offsetParent;
            }
            this.thumbPos = {
                x: xPos,
                y: yPos
            }
        },
        moveMagnifier: function (e) {
            e.preventDefault();

            this.getBounds();
            this.getCursorPos(e);

            this.backgroundPos = this.cursorX * 100 / this.bounds.width + "% " + this.cursorY * 100 / this.bounds.height + "%";
        },
        getTransform: function (el) {
            var transform = window.getComputedStyle(el, null).getPropertyValue('-webkit-transform');

            function rotate_degree(matrix) {
                if(matrix !== 'none') {
                    var values = matrix.split('(')[1].split(')')[0].split(',');
                    var a = values[0];
                    var b = values[1];
                    var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
                } else {
                    var angle = 0;
                }
                return (angle < 0) ? angle +=360 : angle;
            }

            var results = transform.match(/matrix(?:(3d)\(-{0,1}\d+\.?\d*(?:, -{0,1}\d+\.?\d*)*(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*)), -{0,1}\d+\.?\d*\)|\(-{0,1}\d+\.?\d*(?:, -{0,1}\d+\.?\d*)*(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*))\))/);

            var output = [0,0,0];
            if(results){
                if(results[1] == '3d'){
                    output = results.slice(2,5);
                } else {
                    results.push(0);
                    output = results.slice(5, 9); // returns the [X,Y,Z,1] value;
                }

                output.push(rotate_degree(transform));
            }
            return output;
        }
    },
    mounted: function(){
        this.$nextTick(function () {
            this.$refs.magnificationElement.addEventListener("mousemove", this.moveMagnifier);
        })
    },
    data: function(){
        return {
            img: null,
            width: null,
            height: null,
            bounds: null,
            cursorX:0,
            cursorY:0,
            thumbPos:{x:0,y:0},
            backgroundPos: '0 0'
        }
    }
});