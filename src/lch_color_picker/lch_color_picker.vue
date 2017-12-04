<template lang="pug">
#lch_color_picker
  el-row
    el-col(:xs="24", :sm="12", :md="12")
      .box
        svg(width="450", height="450", viewBox="-112.5 -112.5 225 225", :class="{black: bg_black}")
          g
            circle.clickable(v-for="c in colors_h", :cx="c.x", :cy="c.y", :r="c.r", :fill="c.c.rgbhex", stroke="none", @click="select_color(c.c.lch)", @mouseover="hover_color(c.c.lch)", @mouseout="hover_color(null)")
            circle(v-for="c in colors_h_mark", :cx="c.x", :cy="c.y", :r="c.r", :fill="c.c.rgbhex", stroke="none")
          g(transform="translate(-55, 55), scale(1.10, -0.55)")
            circle.clickable(v-for="c in colors_lc", :cx="c.x", :cy="c.y", :r="c.r", :fill="c.c.rgbhex", stroke="none", @click="select_color(c.c.lch)", @mouseover="hover_color(c.c.lch)", @mouseout="hover_color(null)")
            circle(v-for="c in colors_lc_mark", :cx="c.x", :cy="c.y", :r="c.r", :fill="c.c.rgbhex", stroke="none")
    el-col(:xs="24", :sm="12", :md="12")
      .box
        div(:style="{backgroundColor: rgbhex, height: '12px'}")
    el-col(:xs="24", :sm="12", :md="12")
      .box
        el-row
          el-col.slider-label(:span="6") Lightness
          el-col(:span="18"): el-slider(v-model="lch_l", :max="100", :step="5", show-input)
        el-row
          el-col.slider-label(:span="6") Chroma
          el-col(:span="18"): el-slider(v-model="lch_c", :max="100", :step="10", show-input)
        el-row
          el-col.slider-label(:span="6") Hue
          el-col(:span="18"): el-slider(v-model="lch_h", :max="360", :step="5", show-input)
    el-col(:xs="24", :sm="12", :md="12")
      .box
        el-row
          el-col.label(:span="14") L*C*h
          el-col.value(:span="3") {{lch_active[0]}},
          el-col.value(:span="3") {{lch_active[1]}},
          el-col.value(:span="4") {{lch_active[2]}}
        el-row
          el-col.label(:span="14") L*a*b*
          el-col.value(:span="3") {{lab_f[0]}},
          el-col.value(:span="3") {{lab_f[1]}},
          el-col.value(:span="4") {{lab_f[2]}}
        el-row
          el-col.label(:span="14") HSL (CSS3 style)
          el-col.value(:span="3") {{hsl_f[0]}},
          el-col.value(:span="3") {{hsl_f[1]}}%,
          el-col.value(:span="4") {{hsl_f[2]}}%
        el-row
          el-col.label(:span="14") RGB (hex)
          el-col.value(:span="10") {{rgbhex}}
        el-row
          el-col.label(:span="14") RGB (0.00 ... 1.00)
          el-col.value(:span="3") {{rgb01_fc[0]}},
          el-col.value(:span="3") {{rgb01_fc[1]}},
          el-col.value(:span="4") {{rgb01_fc[2]}}
        el-row
          el-col.label(:span="14") RGB (0 ... 255)
          el-col.value(:span="3") {{rgb255_fc[0]}},
          el-col.value(:span="3") {{rgb255_fc[1]}},
          el-col.value(:span="4") {{rgb255_fc[2]}}
        el-row
          el-col.label(:span="14") RGB (0 ... 255) non-clamp
          el-col.value(:span="3") {{rgb255_f[0]}},
          el-col.value(:span="3") {{rgb255_f[1]}},
          el-col.value(:span="4") {{rgb255_f[2]}}
    el-col(:xs="24", :sm="12", :md="12")
      .box
        el-switch(v-model="bg_black", inactive-text="Background White", active-text="Background Black")
</template>

<script src="./lch_color_picker.js">
</script>

<style>
#lch_color_picker {
  color: #333;
  font-size: 90%;
  font-family: 'Verdana', sans-serif;
  box-sizing: border-box;
}
#lch_color_picker .box {
  /*width: 480px;*/
  padding: 15px;
}
#lch_color_picker svg {
  background-color: #fff;
}
#lch_color_picker svg.black {
  background-color: #000;
}
#lch_color_picker .clickable {
  cursor: pointer;
}
#lch_color_picker .slider-label {
  font-weight: normal;
  line-height: 32px;
}
#lch_color_picker .label {
  font-size: 90%;
  font-weight: normal;
  line-height: 30px;
  border-bottom: 1px solid #e6ebf5;
}
#lch_color_picker .value {
  text-align: left;
  color: #409eff;
  font-size: 90%;
  font-weight: normal;
  line-height: 30px;
  border-bottom: 1px solid #e6ebf5;
}
</style>
