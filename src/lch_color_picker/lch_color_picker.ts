import * as cc from "./color_converter";

function seq(count: number, start: number=0, step: number=1): number[] {
    const s: number[] = new Array(count);
    for (let i = 0, d = start; i < count; i++, d += step) {
        s[i] = d;
    }
    return s;
}
function isOverflow(rgb255: number[]): boolean {
    for (let i = 0; i < 3; i++) {
        if (rgb255[i] <= -0.5 || 255.5 <= rgb255[i]) {
            return true;
        }
    }
    return false;
}
function clamp(n: number, min: number, max: number): number {
    return n < min ? min : n > max ? max : n;
}
function format_n(n: number, f: (n: number) => string): string {
    let b = '';
    if (n < 0) {
        b = '-';
        n = -n;
    }
    return b + f(n);
}
function format_02d(n: number): string {
    return format_n(n, n => ('00' + n).slice(-2));
}
function format_01f(n: number): string {
    return format_n(n, n => `${Math.floor(n)}.${Math.floor(n*10)%10}`);
}
function format_02f(n: number): string {
    return format_n(n, n => `${Math.floor(n)}.${format_02d(Math.floor(n*100)%100)}`);
}

class Color {
    rgbhex: string;
    isOverflow: boolean;
    constructor(
        public lch: number[],
    ) {
        const rgb = cc.lch_to_rgb255(lch);
        this.rgbhex = cc.rgb255_to_rgbhex(rgb);
        this.isOverflow = isOverflow(rgb);
    }
}

class LChTable {
    static LMax = 100;
    static CMax = 100;
    static HMax = 360;

    mx: Color[][][];

    l_size: number;
    c_size: number;
    h_size: number;

    constructor(
        public l_step: number,
        public c_step: number,
        public h_step: number,
    ){
        const l_size = Math.floor(LChTable.LMax / l_step) + 1;
        const c_size = Math.floor(LChTable.CMax / c_step) + 1;
        const h_size = Math.floor(LChTable.HMax / h_step);
        const d: Color[][][] = new Array(l_size);
        seq(l_size, 0, l_step).forEach((l, i) => {
            d[i] = new Array(c_size);
            seq(c_size, 0, c_step).forEach((c, j) => {
                d[i][j] = new Array(h_size);
                seq(h_size, 0, h_step).forEach((h, k) => {
                    d[i][j][k] = new Color([l, c, h]);
                });
            });
        });
        this.mx = d;
        this.l_size = l_size;
        this.c_size = c_size;
        this.h_size = h_size;
    }

    get(l: number, c: number, h: number): Color {
        let i = Math.floor(l / this.l_step) % this.l_size;
        let j = Math.floor(c / this.c_step) % this.c_size;
        let k = Math.floor(h / this.h_step) % this.h_size;
        return this.mx[i][j][k];
    }
    get2(lch: number[]): Color {
        return this.get(lch[0], lch[1], lch[2]);
    }
}


const gLchTable = new LChTable(5, 10, 5);

class ColorPiece {
    constructor(
        public x: number,
        public y: number,
        public r: number,
        public c: Color,
    ){}
}

function build_colorPiece_h(c: Color, h: number, h_radian: number, r: number): ColorPiece {
    const rad = Math.PI * h / 180;
    const x = h_radian * Math.sin(rad);
    const y = -h_radian * Math.cos(rad);
    return new ColorPiece(x, y, r, c);
}

function build_colorPiece_lc(c: Color, l_i: number, c_i: number, lc_distance: number, r: number): ColorPiece {
    const x = c_i * lc_distance;
    const y = l_i * lc_distance;
    return new ColorPiece(x, y, r, c);
}

function build_colorPieces_h(l: number, c: number, h_radian: number, r: (isOverflow: boolean) => number): ColorPiece[] {
    const hues = seq(gLchTable.h_size, 0, gLchTable.h_step);
    return hues.map(h => {
        const color = gLchTable.get(l, c, h);
        return build_colorPiece_h(color, h, h_radian, r(color.isOverflow));
    });
}

function build_colorPieces_lc(h: number, lc_distance: number, r: (isOverflow: boolean) => number): ColorPiece[] {
    const lights = seq(gLchTable.l_size, 0, gLchTable.l_step);
    const chromas = seq(gLchTable.c_size, 0, gLchTable.c_step);
    const colors: ColorPiece[] = [];
    lights.forEach((l, l_i) => {
        chromas.forEach((c, c_i) => {
            const color = gLchTable.get(l, c, h);
            colors.push(build_colorPiece_lc(color, l_i, c_i, lc_distance, r(color.isOverflow)));
        });
    });
    return colors;
}

let gHoverCount = 0;

class VueData {
    lch_l = 75;
    lch_c = 50;
    lch_h = 0;
    lch_hover: number[]|null = null;
    hover_interval = 500;
    bg_black = false;
}
class VueMethods {
    select_color = function(this: VueThis, lch: number[]) {
        this.lch_l = lch[0];
        this.lch_c = lch[1];
        this.lch_h = lch[2];
        gHoverCount++;
    }
    hover_color = function(this: VueThis, lch: number[]|null) {
        if (lch != null) {
            this.lch_hover = lch;
            gHoverCount++;
        } else {
            // hover_intervalミリ秒後、他の色がhoverされてなければnullに戻す
            const nowHoverCount = gHoverCount;
            setTimeout(() => {
                if (nowHoverCount == gHoverCount) {
                    this.lch_hover = null;
                }
            }, this.hover_interval);
        }
    }
}
class VueComputed {
    lch_active = function(this: VueThis): number[] {
        return this.lch_hover != null ? this.lch_hover : [this.lch_l, this.lch_c, this.lch_h];
    }
    colors_h = function(this: VueThis): ColorPiece[] {
        return build_colorPieces_h(this.lch_active[0], this.lch_active[1], 100, b => b ? 3.0 : 4.5);
    }
    colors_lc = function(this: VueThis): ColorPiece[] {
        return build_colorPieces_lc(this.lch_active[2], 10.0, b => b ? 2.5 : 5.0);
    }
    colors_h_mark = function(this: VueThis): ColorPiece[] {
        const selected_color = gLchTable.get(this.lch_l, this.lch_c, this.lch_h);
        const h_rad_1 = 91;
        const h_rad_2 = 109;
        const r_1 = 3.0;
        const r_2 = 1.5;
        let pieces = [
            build_colorPiece_h(selected_color, this.lch_h, h_rad_1, r_1),
            build_colorPiece_h(selected_color, this.lch_h, h_rad_2, r_1),
        ];
        if (this.lch_hover != null) {
            const hover_color = gLchTable.get2(this.lch_hover);
            pieces = pieces.concat([
                build_colorPiece_h(hover_color, this.lch_hover[2], h_rad_1, r_2),
                build_colorPiece_h(hover_color, this.lch_hover[2], h_rad_2, r_2),
            ]);
        }
        return pieces;
    }
    colors_lc_mark = function(this: VueThis): ColorPiece[] {
        const l_min = -1;
        const l_max = gLchTable.l_size;
        const c_min = -1;
        const c_max = gLchTable.c_size;
        const distance = 10.0;
        const r_1 = 2.5;
        const r_2 = 1.5;
        const selected_color = gLchTable.get(this.lch_l, this.lch_c, this.lch_h);
        const l_i = this.lch_l / gLchTable.l_step;
        const c_i = this.lch_c / gLchTable.c_step;
        let pieces = [
            build_colorPiece_lc(selected_color, l_i, c_min, distance, r_1),
            build_colorPiece_lc(selected_color, l_i, c_max, distance, r_1),
            build_colorPiece_lc(selected_color, l_min, c_i, distance, r_1),
            build_colorPiece_lc(selected_color, l_max, c_i, distance, r_1),
        ];
        if (this.lch_hover != null) {
            const hover_color = gLchTable.get2(this.lch_hover);
            const l_i = this.lch_hover[0] / gLchTable.l_step;
            const c_i = this.lch_hover[1] / gLchTable.c_step;
            pieces = pieces.concat([
                build_colorPiece_lc(hover_color, l_i, c_min, distance, r_2),
                build_colorPiece_lc(hover_color, l_i, c_max, distance, r_2),
                build_colorPiece_lc(hover_color, l_min, c_i, distance, r_2),
                build_colorPiece_lc(hover_color, l_max, c_i, distance, r_2),
            ]);
        }
        return pieces;
    }
    lab = function(this: VueThis): number[] {
        //return cc.lch_to_lab([this.lch_l, this.lch_c, this.lch_h]);
        return cc.lch_to_lab(this.lch_active);
    }
    lab_f = function(this: VueThis) {
        return [''+this.lab[0]].concat(this.lab.slice(1).map(n => format_01f(n)));
    }
    rgb01 = function(this: VueThis): number[] {
        return cc.lab_to_rgb01(this.lab);
    }
    rgb01_fc = function(this: VueThis) {
        return this.rgb01.map(n => clamp(n, 0, 1)).map(n => format_02f(n));
    }
    rgb255 = function(this: VueThis): number[] {
        return cc.rgb01_to_rgb255(this.rgb01);
    }
    rgb255_f = function(this: VueThis) {
        return this.rgb255.map(n => Math.round(n));
    }
    rgb255_fc = function(this: VueThis) {
        return this.rgb255.map(n => clamp(n, 0, 255)).map(n => Math.round(n));
    }
    rgbhex = function(this: VueThis) {
        return cc.rgb255_to_rgbhex(this.rgb255);
    }
    hsl_f = function(this: VueThis) {
        const hsl = cc.rgb01_to_hsl(this.rgb01.map(n => clamp(n, 0, 1)));
        return [Math.round(hsl[0] * 360)].concat(hsl.slice(1).map(n => Math.round(n * 100)));
    }
    overflow = function(this: VueThis) {
        return isOverflow(this.rgb255) ? 'NG' : 'OK';
    }
}
interface VueThis extends VueData {
    lch_active: number[];
    colors_h: ColorPiece[];
    colors_lc: ColorPiece[];
    lab: number[];
    rgb01: number[];
    rgb255: number[];
}

export default {
    data() {
        return new VueData()
    },
    methods: new VueMethods(),
    computed: new VueComputed(),
}

import Vue from 'vue'
import { Slider, Switch, Row, Col } from 'element-ui'
Vue.use(Slider)
Vue.use(Switch)
Vue.use(Row)
Vue.use(Col)
