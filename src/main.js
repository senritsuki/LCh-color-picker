import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'
import CC from './lch_color_picker/lch_color_picker.vue'

new Vue({
  el: '#lch_color_picker',
  render: h => h(CC)
});
