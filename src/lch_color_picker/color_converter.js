"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var etc;
(function (etc) {
    /** 3次元ベクトルの線形変換 */
    function mul_m3_v3(m3, v3) {
        var SIZE = 3;
        var ret = new Array(SIZE);
        for (var i = 0; i < SIZE; i++) {
            var n = 0;
            for (var j = 0; j < SIZE; j++) {
                n += m3[i][j] * v3[j];
            }
            ret[i] = n;
        }
        return ret;
    }
    etc.mul_m3_v3 = mul_m3_v3;
    /** 2関数の合成 */
    etc.composite_2f = function (a, b) { return function (r) { return b(a(r)); }; };
    /** 3関数の合成 */
    etc.composite_3f = function (a, b, c) { return function (r) { return c(b(a(r))); }; };
    /** 0 -> '00', 255 -> 'ff' */
    etc.format_02f = function (n) { return ('00' + (n < 0 ? 0 : n > 255 ? 255 : Math.round(n)).toString(16)).slice(-2); };
    etc.d65lrgb_to_d50xyz_mx = [
        [0.436041, 0.385113, 0.143046],
        [0.222485, 0.716905, 0.060610],
        [0.013920, 0.097067, 0.713913]
    ];
    etc.d50xyz_to_d65lrgb_mx = [
        [3.134187, -1.617209, -0.490694],
        [-0.978749, 1.916130, 0.033433],
        [0.071964, -0.228994, 1.405754]
    ];
    /** 白色点X,Y,Z */
    etc.XYZn = [0.9642, 1.0000, 0.8249];
    etc.srgb_to_lrgb_f0 = function (n) { return Math.pow((n + 0.055) / 1.055, 2.4); };
    etc.srgb_to_lrgb_f1 = function (n) { return n / 12.92; };
    etc.srgb_to_lrgb_f = function (n) { return n > 0.040450 ? etc.srgb_to_lrgb_f0(n) : etc.srgb_to_lrgb_f1(n); };
    etc.lrgb_to_srgb_f0 = function (n) { return 1.055 * Math.pow(n, 1 / 2.4) - 0.055; };
    etc.lrgb_to_srgb_f1 = function (n) { return 12.92 * n; };
    etc.lrgb_to_srgb_f = function (n) { return n > 0.0031308 ? etc.lrgb_to_srgb_f0(n) : etc.lrgb_to_srgb_f1(n); };
    etc.xyz_to_lab_f0 = function (t) { return Math.pow(29 / 3, 3) * t; };
    etc.xyz_to_lab_f1 = function (t) { return 116 * Math.pow(t, 1 / 3) - 16; };
    etc.xyz_to_lab_f = function (t) { return t <= Math.pow(6 / 29, 3) ? etc.xyz_to_lab_f0(t) : etc.xyz_to_lab_f1(t); };
    etc.lab_to_xyz_f0 = function (t, n) { return Math.pow(t, 3) * n; };
    etc.lab_to_xyz_f1 = function (t, n) { return Math.pow(3 / 29, 3) * (116 * t - 16) * n; };
    etc.lab_to_xyz_f = function (t, n) { return t > 6 / 29 ? etc.lab_to_xyz_f0(t, n) : etc.lab_to_xyz_f1(t, n); };
    function hsl_to_rgb01_to_h6(h360) {
        var a = (h360 / 60) % 6; // -> -6.0 .. 6.0
        var b = a >= 0 ? a : a + 6; // -> 0.0 .. 6.0 
        return b;
    }
    etc.hsl_to_rgb01_to_h6 = hsl_to_rgb01_to_h6;
    function hsl_to_rgb01_to_lmdl(h6) {
        var d6 = Math.floor(h6);
        switch (d6) {
            case 0: return h6;
            case 1: return 2 - h6;
            case 2: return h6 - 2;
            case 3: return 4 - h6;
            case 4: return h6 - 4;
            case 5: return 6 - h6;
        }
        return 0;
    }
    etc.hsl_to_rgb01_to_lmdl = hsl_to_rgb01_to_lmdl;
    function hsl_to_rgb01_to_rgb(h6, min, mdl, max) {
        var d6 = Math.floor(h6);
        switch (d6) {
            case 0: return [max, mdl, min];
            case 1: return [mdl, max, min];
            case 2: return [min, max, mdl];
            case 3: return [min, mdl, max];
            case 4: return [mdl, min, max];
            case 5: return [max, min, mdl];
        }
        return [0, 0, 0];
    }
    etc.hsl_to_rgb01_to_rgb = hsl_to_rgb01_to_rgb;
    function rgb01_to_hsl_f1(min, max, sZero) {
        var sd = 1 - Math.abs(min + max - 1);
        return sd > sZero ? (max - min) / sd : 0;
    }
    etc.rgb01_to_hsl_f1 = rgb01_to_hsl_f1;
    function rgb01_to_hsl_f2(r, g, b, min, max, sZero) {
        var d = max - min;
        if (d < sZero) {
            return 0;
        }
        if (b == min) {
            return 1 + (g - r) / d;
        }
        if (r == min) {
            return 3 + (b - g) / d;
        }
        if (g == min) {
            return 5 + (r - b) / d;
        }
        return 0;
    }
    etc.rgb01_to_hsl_f2 = rgb01_to_hsl_f2;
})(etc = exports.etc || (exports.etc = {}));
/**
 * RGB array (0, 0, 0) .. (255, 255, 255)
 *   ->
 * RGB string '#000000' .. '#ffffff'
 */
function rgb255_to_rgbhex(rgb) {
    return "#" + etc.format_02f(rgb[0]) + etc.format_02f(rgb[1]) + etc.format_02f(rgb[2]);
}
exports.rgb255_to_rgbhex = rgb255_to_rgbhex;
/**
 * RGB string '#000000' .. '#ffffff'
 *   ->
 * RGB array (0, 0, 0) .. (255, 255, 255)
 */
function rgbhex_to_rgb255(rgbhex) {
    if (rgbhex[0] === '#') {
        rgbhex = rgbhex.slice(1);
    }
    if (rgbhex.length == 6) {
        var rh = rgbhex.slice(0, 2);
        var gh = rgbhex.slice(2, 4);
        var bh = rgbhex.slice(4, 6);
        var r = parseInt(rh, 16);
        var g = parseInt(gh, 16);
        var b = parseInt(bh, 16);
        var rgb = [r, g, b];
        return rgb;
    }
    else if (rgbhex.length == 3) {
        var rh = rgbhex.slice(0, 1);
        var gh = rgbhex.slice(1, 2);
        var bh = rgbhex.slice(2, 3);
        var r = parseInt(rh, 16) * 17;
        var g = parseInt(gh, 16) * 17;
        var b = parseInt(bh, 16) * 17;
        var rgb = [r, g, b];
        return rgb;
    }
    else {
        throw new TypeError("parameter 'rgbhex' length error. '#06c', '#0080ff', etc.");
    }
}
exports.rgbhex_to_rgb255 = rgbhex_to_rgb255;
/**
 * RGB array (0, 0, 0) .. (255, 255, 255)
 *   ->
 * RGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 */
function rgb255_to_rgb01(rgb) {
    return rgb.map(function (n) { return n / 255; });
}
exports.rgb255_to_rgb01 = rgb255_to_rgb01;
/**
 * RGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 *   ->
 * RGB array (0, 0, 0) .. (255, 255, 255)
 */
function rgb01_to_rgb255(rgb) {
    return rgb.map(function (n) { return n * 255; });
}
exports.rgb01_to_rgb255 = rgb01_to_rgb255;
/**
 * D65 non linear sRGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 *   ->
 * D65 linear sRGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 */
function srgb_to_lrgb(rgb) {
    return rgb.map(function (n) { return etc.srgb_to_lrgb_f(n); });
}
exports.srgb_to_lrgb = srgb_to_lrgb;
/**
 * D65 linear sRGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 *   ->
 * D65 non linear sRGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 */
function lrgb_to_srgb(rgb) {
    return rgb.map(function (n) { return etc.lrgb_to_srgb_f(n); });
}
exports.lrgb_to_srgb = lrgb_to_srgb;
/**
 * D65 linear sRGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 *   ->
 * D50 CIE XYZ array (*.*, *.*, *.*) .. (*.*, *.*, *.*)
 */
function lrgb_to_xyz(rgb) {
    return etc.mul_m3_v3(etc.d65lrgb_to_d50xyz_mx, rgb);
}
exports.lrgb_to_xyz = lrgb_to_xyz;
/**
 * D50 CIE XYZ array (*.*, *.*, *.*) .. (*.*, *.*, *.*)
 *   ->
 * D65 linear sRGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 */
function xyz_to_lrgb(xyz) {
    return etc.mul_m3_v3(etc.d50xyz_to_d65lrgb_mx, xyz);
}
exports.xyz_to_lrgb = xyz_to_lrgb;
/**
 * D50 CIE XYZ array (*.*, *.*, *.*) .. (*.*, *.*, *.*)
 *   ->
 * D50 CIE L*a*b* array (0.0, *.*, *.*) .. (100.0, *.*, *.*)
 */
function xyz_to_lab(xyz) {
    var fx = etc.xyz_to_lab_f(xyz[0] / etc.XYZn[0]);
    var fy = etc.xyz_to_lab_f(xyz[1] / etc.XYZn[1]);
    var fz = etc.xyz_to_lab_f(xyz[2] / etc.XYZn[2]);
    var l = fy;
    var a = (500 / 116) * (fx - fy);
    var b = (200 / 116) * (fy - fz);
    var lab = [l, a, b];
    return lab;
}
exports.xyz_to_lab = xyz_to_lab;
/**
 * D50 CIE L*a*b* array (0.0, *.*, *.*) .. (100.0, *.*, *.*)
 *   ->
 * D50 CIE XYZ array (*.*, *.*, *.*) .. (*.*, *.*, *.*)
 */
function lab_to_xyz(lab) {
    var fy = (lab[0] + 16) / 116;
    var fx = fy + (lab[1] / 500);
    var fz = fy - (lab[2] / 200);
    var fxyz = [fx, fy, fz];
    var xyz = [0, 1, 2].map(function (i) { return etc.lab_to_xyz_f(fxyz[i], etc.XYZn[i]); });
    return xyz;
}
exports.lab_to_xyz = lab_to_xyz;
/**
 * D50 CIE L*a*b* array (0.0, *.*, *.*) .. (100.0, *.*, *.*)
 *   ->
 * D50 CIE L*C*h array (0.0, 0.0, 0.0) .. (100.0, *.*, 360.0)
 */
function lab_to_lch(lab) {
    var l = lab[0], a = lab[1], b = lab[2];
    var c = Math.sqrt(a * a + b * b);
    var h = Math.atan2(b, a) * 180 / Math.PI;
    var lch = [l, c, h];
    return lch;
}
exports.lab_to_lch = lab_to_lch;
/**
 * D50 CIE L*C*h array (0.0, 0.0, 0.0) .. (100.0, *.*, 360.0)
 *   ->
 * D50 CIE L*a*b* array (0.0, *.*, *.*) .. (100.0, *.*, *.*)
 */
function lch_to_lab(lch) {
    var l = lch[0], c = lch[1], h = lch[2];
    var rad = h / 180 * Math.PI;
    var a = c * Math.cos(rad);
    var b = c * Math.sin(rad);
    var lab = [l, a, b];
    return lab;
}
exports.lch_to_lab = lch_to_lab;
/**
 * RGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 *   ->
 * HSL array (0.0, 0.0, 0.0) .. (360.0, 1.0, 1.0)
 */
function rgb01_to_hsl(rgb) {
    var r = rgb[0], g = rgb[1], b = rgb[2];
    var min = rgb.reduce(function (a, b) { return a <= b ? a : b; });
    var max = rgb.reduce(function (a, b) { return a >= b ? a : b; });
    var sZero = 0.005;
    var l = (min + max) / 2;
    var s = etc.rgb01_to_hsl_f1(min, max, sZero);
    var h = etc.rgb01_to_hsl_f2(r, g, b, min, max, sZero) / 6;
    return [h, s, l];
}
exports.rgb01_to_hsl = rgb01_to_hsl;
/**
 * HSL array (0.0, 0.0, 0.0) .. (360.0, 1.0, 1.0)
 *   ->
 * RGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 */
function hsl_to_rgb01(hsl) {
    var h6 = etc.hsl_to_rgb01_to_h6(hsl[0]), s = hsl[1], l = hsl[2];
    var lmax = l + s / 2;
    var lmin = l - s / 2;
    var lmdl = lmin == lmax ? lmin : (lmax - lmin) * etc.hsl_to_rgb01_to_lmdl(h6);
    var rgb = etc.hsl_to_rgb01_to_rgb(h6, lmin, lmdl, lmax);
    return rgb;
}
exports.hsl_to_rgb01 = hsl_to_rgb01;
exports.rgb255_to_hsl = etc.composite_2f(rgb255_to_rgb01, rgb01_to_hsl);
exports.hsl_to_rgb255 = etc.composite_2f(hsl_to_rgb01, rgb01_to_rgb255);
exports.rgbhex_to_hsl = etc.composite_2f(rgbhex_to_rgb255, exports.rgb255_to_hsl);
exports.hsl_to_rgbhex = etc.composite_2f(exports.hsl_to_rgb255, rgb255_to_rgbhex);
exports.rgb01_to_lab = etc.composite_3f(srgb_to_lrgb, lrgb_to_xyz, xyz_to_lab);
exports.lab_to_rgb01 = etc.composite_3f(lab_to_xyz, xyz_to_lrgb, lrgb_to_srgb);
exports.rgbhex_to_rgb01 = etc.composite_2f(rgbhex_to_rgb255, rgb255_to_rgb01);
exports.rgb01_to_rgbhex = etc.composite_2f(rgb01_to_rgb255, rgb255_to_rgbhex);
exports.rgbhex_to_lab = etc.composite_2f(exports.rgbhex_to_rgb01, exports.rgb01_to_lab);
exports.lab_to_rgbhex = etc.composite_2f(exports.lab_to_rgb01, exports.rgb01_to_rgbhex);
exports.rgbhex_to_lch = etc.composite_2f(exports.rgbhex_to_lab, lab_to_lch);
exports.lch_to_rgbhex = etc.composite_2f(lch_to_lab, exports.lab_to_rgbhex);
exports.rgb255_to_lab = etc.composite_2f(rgb255_to_rgb01, exports.rgb01_to_lab);
exports.lab_to_rgb255 = etc.composite_2f(exports.lab_to_rgb01, rgb01_to_rgb255);
exports.rgb255_to_lch = etc.composite_2f(exports.rgb255_to_lab, lab_to_lch);
exports.lch_to_rgb255 = etc.composite_2f(lch_to_lab, exports.lab_to_rgb255);
