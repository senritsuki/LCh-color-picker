"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cc = require("./color_converter");
function seq(count, start, step) {
    if (start === void 0) { start = 0; }
    if (step === void 0) { step = 1; }
    var s = new Array(count);
    for (var i = 0, d = start; i < count; i++, d += step) {
        s[i] = d;
    }
    return s;
}
function isOverflow(rgb255) {
    for (var i = 0; i < 3; i++) {
        if (rgb255[i] <= -0.5 || 255.5 <= rgb255[i]) {
            return true;
        }
    }
    return false;
}
function clamp(n, min, max) {
    return n < min ? min : n > max ? max : n;
}
function format_n(n, f) {
    var b = '';
    if (n < 0) {
        b = '-';
        n = -n;
    }
    return b + f(n);
}
function format_02d(n) {
    return format_n(n, function (n) { return ('00' + n).slice(-2); });
}
function format_01f(n) {
    return format_n(n, function (n) { return Math.floor(n) + "." + Math.floor(n * 10) % 10; });
}
function format_02f(n) {
    return format_n(n, function (n) { return Math.floor(n) + "." + format_02d(Math.floor(n * 100) % 100); });
}
var Color = (function () {
    function Color(lch) {
        this.lch = lch;
        var rgb = cc.lch_to_rgb255(lch);
        this.rgbhex = cc.rgb255_to_rgbhex(rgb);
        this.isOverflow = isOverflow(rgb);
    }
    return Color;
}());
var LChTable = (function () {
    function LChTable(l_step, c_step, h_step) {
        this.l_step = l_step;
        this.c_step = c_step;
        this.h_step = h_step;
        var l_size = Math.floor(LChTable.LMax / l_step) + 1;
        var c_size = Math.floor(LChTable.CMax / c_step) + 1;
        var h_size = Math.floor(LChTable.HMax / h_step);
        var d = new Array(l_size);
        seq(l_size, 0, l_step).forEach(function (l, i) {
            d[i] = new Array(c_size);
            seq(c_size, 0, c_step).forEach(function (c, j) {
                d[i][j] = new Array(h_size);
                seq(h_size, 0, h_step).forEach(function (h, k) {
                    d[i][j][k] = new Color([l, c, h]);
                });
            });
        });
        this.mx = d;
        this.l_size = l_size;
        this.c_size = c_size;
        this.h_size = h_size;
    }
    LChTable.prototype.get = function (l, c, h) {
        var i = Math.floor(l / this.l_step) % this.l_size;
        var j = Math.floor(c / this.c_step) % this.c_size;
        var k = Math.floor(h / this.h_step) % this.h_size;
        return this.mx[i][j][k];
    };
    LChTable.prototype.get2 = function (lch) {
        return this.get(lch[0], lch[1], lch[2]);
    };
    LChTable.LMax = 100;
    LChTable.CMax = 100;
    LChTable.HMax = 360;
    return LChTable;
}());
var gLchTable = new LChTable(5, 10, 5);
var ColorPiece = (function () {
    function ColorPiece(x, y, r, c) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c;
    }
    return ColorPiece;
}());
function build_colorPiece_h(c, h, h_radian, r) {
    var rad = Math.PI * h / 180;
    var x = h_radian * Math.sin(rad);
    var y = -h_radian * Math.cos(rad);
    return new ColorPiece(x, y, r, c);
}
function build_colorPiece_lc(c, l_i, c_i, lc_distance, r) {
    var x = c_i * lc_distance;
    var y = l_i * lc_distance;
    return new ColorPiece(x, y, r, c);
}
function build_colorPieces_h(l, c, h_radian, r) {
    var hues = seq(gLchTable.h_size, 0, gLchTable.h_step);
    return hues.map(function (h) {
        var color = gLchTable.get(l, c, h);
        return build_colorPiece_h(color, h, h_radian, r(color.isOverflow));
    });
}
function build_colorPieces_lc(h, lc_distance, r) {
    var lights = seq(gLchTable.l_size, 0, gLchTable.l_step);
    var chromas = seq(gLchTable.c_size, 0, gLchTable.c_step);
    var colors = [];
    lights.forEach(function (l, l_i) {
        chromas.forEach(function (c, c_i) {
            var color = gLchTable.get(l, c, h);
            colors.push(build_colorPiece_lc(color, l_i, c_i, lc_distance, r(color.isOverflow)));
        });
    });
    return colors;
}
var gHoverCount = 0;
var VueData = (function () {
    function VueData() {
        this.lch_l = 75;
        this.lch_c = 50;
        this.lch_h = 0;
        this.lch_hover = null;
        this.hover_interval = 500;
        this.bg_black = false;
    }
    return VueData;
}());
var VueMethods = (function () {
    function VueMethods() {
        this.select_color = function (lch) {
            this.lch_l = lch[0];
            this.lch_c = lch[1];
            this.lch_h = lch[2];
            gHoverCount++;
        };
        this.hover_color = function (lch) {
            var _this = this;
            if (lch != null) {
                this.lch_hover = lch;
                gHoverCount++;
            }
            else {
                // hover_intervalミリ秒後、他の色がhoverされてなければnullに戻す
                var nowHoverCount_1 = gHoverCount;
                setTimeout(function () {
                    if (nowHoverCount_1 == gHoverCount) {
                        _this.lch_hover = null;
                    }
                }, this.hover_interval);
            }
        };
    }
    return VueMethods;
}());
var VueComputed = (function () {
    function VueComputed() {
        this.lch_active = function () {
            return this.lch_hover != null ? this.lch_hover : [this.lch_l, this.lch_c, this.lch_h];
        };
        this.colors_h = function () {
            return build_colorPieces_h(this.lch_active[0], this.lch_active[1], 100, function (b) { return b ? 3.0 : 4.5; });
        };
        this.colors_lc = function () {
            return build_colorPieces_lc(this.lch_active[2], 10.0, function (b) { return b ? 2.5 : 5.0; });
        };
        this.colors_h_mark = function () {
            var selected_color = gLchTable.get(this.lch_l, this.lch_c, this.lch_h);
            var h_rad_1 = 91;
            var h_rad_2 = 109;
            var r_1 = 3.0;
            var r_2 = 1.5;
            var pieces = [
                build_colorPiece_h(selected_color, this.lch_h, h_rad_1, r_1),
                build_colorPiece_h(selected_color, this.lch_h, h_rad_2, r_1),
            ];
            if (this.lch_hover != null) {
                var hover_color = gLchTable.get2(this.lch_hover);
                pieces = pieces.concat([
                    build_colorPiece_h(hover_color, this.lch_hover[2], h_rad_1, r_2),
                    build_colorPiece_h(hover_color, this.lch_hover[2], h_rad_2, r_2),
                ]);
            }
            return pieces;
        };
        this.colors_lc_mark = function () {
            var l_min = -1;
            var l_max = gLchTable.l_size;
            var c_min = -1;
            var c_max = gLchTable.c_size;
            var distance = 10.0;
            var r_1 = 2.5;
            var r_2 = 1.5;
            var selected_color = gLchTable.get(this.lch_l, this.lch_c, this.lch_h);
            var l_i = this.lch_l / gLchTable.l_step;
            var c_i = this.lch_c / gLchTable.c_step;
            var pieces = [
                build_colorPiece_lc(selected_color, l_i, c_min, distance, r_1),
                build_colorPiece_lc(selected_color, l_i, c_max, distance, r_1),
                build_colorPiece_lc(selected_color, l_min, c_i, distance, r_1),
                build_colorPiece_lc(selected_color, l_max, c_i, distance, r_1),
            ];
            if (this.lch_hover != null) {
                var hover_color = gLchTable.get2(this.lch_hover);
                var l_i_1 = this.lch_hover[0] / gLchTable.l_step;
                var c_i_1 = this.lch_hover[1] / gLchTable.c_step;
                pieces = pieces.concat([
                    build_colorPiece_lc(hover_color, l_i_1, c_min, distance, r_2),
                    build_colorPiece_lc(hover_color, l_i_1, c_max, distance, r_2),
                    build_colorPiece_lc(hover_color, l_min, c_i_1, distance, r_2),
                    build_colorPiece_lc(hover_color, l_max, c_i_1, distance, r_2),
                ]);
            }
            return pieces;
        };
        this.lab = function () {
            //return cc.lch_to_lab([this.lch_l, this.lch_c, this.lch_h]);
            return cc.lch_to_lab(this.lch_active);
        };
        this.lab_f = function () {
            return ['' + this.lab[0]].concat(this.lab.slice(1).map(function (n) { return format_01f(n); }));
        };
        this.rgb01 = function () {
            return cc.lab_to_rgb01(this.lab);
        };
        this.rgb01_fc = function () {
            return this.rgb01.map(function (n) { return clamp(n, 0, 1); }).map(function (n) { return format_02f(n); });
        };
        this.rgb255 = function () {
            return cc.rgb01_to_rgb255(this.rgb01);
        };
        this.rgb255_f = function () {
            return this.rgb255.map(function (n) { return Math.round(n); });
        };
        this.rgb255_fc = function () {
            return this.rgb255.map(function (n) { return clamp(n, 0, 255); }).map(function (n) { return Math.round(n); });
        };
        this.rgbhex = function () {
            return cc.rgb255_to_rgbhex(this.rgb255);
        };
        this.hsl_f = function () {
            var hsl = cc.rgb01_to_hsl(this.rgb01.map(function (n) { return clamp(n, 0, 1); }));
            return [Math.round(hsl[0] * 360)].concat(hsl.slice(1).map(function (n) { return Math.round(n * 100); }));
        };
        this.overflow = function () {
            return isOverflow(this.rgb255) ? 'NG' : 'OK';
        };
    }
    return VueComputed;
}());
exports.default = {
    data: function () {
        return new VueData();
    },
    methods: new VueMethods(),
    computed: new VueComputed(),
};
var vue_1 = require("vue");
var element_ui_1 = require("element-ui");
vue_1.default.use(element_ui_1.Slider);
vue_1.default.use(element_ui_1.Switch);
vue_1.default.use(element_ui_1.Row);
vue_1.default.use(element_ui_1.Col);
