<template>
<div>
    <div class="vue-magnifier-container">
      <slot></slot>
      <span ref="magnificationElement" class="preview" v-bind:style="{backgroundImage:'url(' + src + ')'}">
          <span ref="glass" class="magnifying-glass" v-bind:style="{backgroundImage: 'url(' + srcLarge + ')', backgroundPosition: backgroundPos, left: cursorX + 'px', top: cursorY + 'px'}"></span>
      </span>
    </div>
</div>
</template>

<script>
export default {
  props: {
    src: String,
    srcLarge: String
  },
  methods: {
    getCursorPos: function(e) {
      var x = window.Event
        ? e.pageX
        : e.clientX +
          (document.documentElement.scrollLeft
            ? document.documentElement.scrollLeft
            : document.body.scrollLeft);
      var y = window.Event
        ? e.pageY
        : e.clientY +
          (document.documentElement.scrollTop
            ? document.documentElement.scrollTop
            : document.body.scrollTop);

      this.cursorX = x - this.thumbPos.x;
      this.cursorY = y - this.thumbPos.y;
    },
    getBounds: function() {
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

          xPos +=
            el.offsetLeft - xScroll + el.clientLeft + parseInt(transform[0]);
          yPos +=
            el.offsetTop - yScroll + el.clientTop + parseInt(transform[1]);
        } else {
          // for all other non-BODY elements
          xPos +=
            el.offsetLeft -
            el.scrollLeft +
            el.clientLeft +
            parseInt(transform[0]);
          yPos +=
            el.offsetTop - el.scrollTop + el.clientTop + parseInt(transform[1]);
        }

        el = el.offsetParent;
      }
      this.thumbPos = {
        x: xPos,
        y: yPos
      };
    },
    moveMagnifier: function(e) {
      e.preventDefault();

      this.getBounds();
      this.getCursorPos(e);

      this.backgroundPos =
        (this.cursorX * 100) / this.bounds.width +
        "% " +
        (this.cursorY * 100) / this.bounds.height +
        "%";
    },
    getTransform: function(el) {
      var transform = window
        .getComputedStyle(el, null)
        .getPropertyValue("-webkit-transform");

      function rotate_degree(matrix) {
        if (matrix !== "none") {
          var values = matrix
            .split("(")[1]
            .split(")")[0]
            .split(",");
          var a = values[0];
          var b = values[1];
          var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        } else {
          var angle = 0;
        }
        return angle < 0 ? (angle += 360) : angle;
      }

      var results = transform.match(
        /matrix(?:(3d)\(-{0,1}\d+\.?\d*(?:, -{0,1}\d+\.?\d*)*(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*)), -{0,1}\d+\.?\d*\)|\(-{0,1}\d+\.?\d*(?:, -{0,1}\d+\.?\d*)*(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*))\))/
      );

      var output = [0, 0, 0];
      if (results) {
        if (results[1] == "3d") {
          output = results.slice(2, 5);
        } else {
          results.push(0);
          output = results.slice(5, 9); // returns the [X,Y,Z,1] value;
        }

        output.push(rotate_degree(transform));
      }
      return output;
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      this.$refs.magnificationElement.addEventListener(
        "mousemove",
        this.moveMagnifier
      );
    });
  },
  data: function() {
    return {
      img: null,
      width: null,
      height: null,
      bounds: null,
      cursorX: 0,
      cursorY: 0,
      thumbPos: { x: 0, y: 0 },
      backgroundPos: "0 0"
    };
  }
};
</script>

<style lang="scss">
// Magnifying glass options
$border-size: 5px; // Modify the border width of the magnifying glass component
$border-color: #666666; // Modify the border color of the magnifying glass component
$magnifier-width: 150px; // Modify the width of the magnifying glass component
$magnifier-height: 150px; // Modify the height of the magnifying glass component

// Define your responsive sizes of
$sizes: (
  "(max-width: 320px)" 250px 250px,
  "(max-width: 480px)" 350px 350px,
  "(min-width: 481px)" 450px 450px,
  "(min-width: 1024px)" 550px 550px,
  "(min-width: 1280px)" 600px 600px
);

.vue-magnifier-container {
  position: relative;
  .preview {
    position: relative;
    background: {
      repeat: no-repeat;
      size: contain;
      position: 50% 50%;
    }
    display: block;
    clear: both;
    margin: 0 auto;
    cursor: none;

    .magnifying-glass {
      position: absolute;
      border: $border-size solid $border-color;
      border-radius: 50%;
      cursor: none;
      width: $magnifier-width;
      height: $magnifier-height;
      transform: translate(
        (-1 * $magnifier-width/2),
        (-1 * $magnifier-width/2)
      );
      background: #fff no-repeat;
      display: none;
      pointer-events: none;
    }

    &:hover {
      .magnifying-glass {
        display: block;
      }
    }

    @each $breakpoint in $sizes {
      $query: nth($breakpoint, 1);
      $bpWidth: nth($breakpoint, 2);
      $bpHeight: nth($breakpoint, 3);

      @media only screen and #{$query} {
        width: $bpWidth;
        height: $bpHeight;
      }
    }
  }
}
</style>
