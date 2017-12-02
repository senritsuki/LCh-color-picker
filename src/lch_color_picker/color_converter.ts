
export namespace etc {
    /** 3次元ベクトルの線形変換 */
    export function mul_m3_v3(m3: number[][], v3: number[]): number[] {
        const SIZE = 3;
        const ret: number[] = new Array(SIZE);
        for (let i = 0; i < SIZE; i++) {
            let n = 0;
            for (let j = 0; j < SIZE; j++) {
                n += m3[i][j] * v3[j];
            }
            ret[i] = n;
        }
        return ret;
    }

    /** 2関数の合成 */
    export const composite_2f = <R, S, T>(a: (r: R) => S, b: (s: S) => T): (r: R) => T => (r: R) => b(a(r));
    /** 3関数の合成 */
    export const composite_3f = <R, S, T, U>(a: (r: R) => S, b: (s: S) => T, c: (t: T) => U): (r: R) => U => (r: R) => c(b(a(r)));

    /** 0 -> '00', 255 -> 'ff' */
    export const format_02f = (n: number): string => ('00' + (n < 0 ? 0 : n > 255 ? 255 : Math.round(n)).toString(16)).slice(-2);

    export const d65lrgb_to_d50xyz_mx = [
        [0.436041, 0.385113, 0.143046],
        [0.222485, 0.716905, 0.060610],
        [0.013920, 0.097067, 0.713913]];

    export const d50xyz_to_d65lrgb_mx = [
        [3.134187, -1.617209, -0.490694],
        [-0.978749, 1.916130, 0.033433],
        [0.071964, -0.228994, 1.405754]];

    /** 白色点X,Y,Z */
    export const XYZn = [0.9642, 1.0000, 0.8249];

    export const srgb_to_lrgb_f0 = (n: number): number => Math.pow((n + 0.055) / 1.055, 2.4);
    export const srgb_to_lrgb_f1 = (n: number): number => n / 12.92;
    export const srgb_to_lrgb_f = (n: number): number => n > 0.040450 ? srgb_to_lrgb_f0(n) : srgb_to_lrgb_f1(n);

    export const lrgb_to_srgb_f0 = (n: number): number => 1.055 * Math.pow(n, 1 / 2.4) - 0.055;
    export const lrgb_to_srgb_f1 = (n: number): number => 12.92 * n;
    export const lrgb_to_srgb_f = (n: number): number => n > 0.0031308 ? lrgb_to_srgb_f0(n) : lrgb_to_srgb_f1(n);

    export const xyz_to_lab_f0 = (t: number): number => Math.pow(29 / 3, 3) * t;
    export const xyz_to_lab_f1 = (t: number): number => 116 * Math.pow(t, 1 / 3) - 16;
    export const xyz_to_lab_f = (t: number): number => t <= Math.pow(6 / 29, 3) ? xyz_to_lab_f0(t) : xyz_to_lab_f1(t);

    export const lab_to_xyz_f0 = (t: number, n: number): number => Math.pow(t, 3) * n;
    export const lab_to_xyz_f1 = (t: number, n: number): number => Math.pow(3 / 29, 3) * (116 * t - 16) * n;
    export const lab_to_xyz_f = (t: number, n: number): number => t > 6 / 29 ? lab_to_xyz_f0(t, n) : lab_to_xyz_f1(t, n);

    export function hsl_to_rgb01_to_h6(h360: number): number {
        const a = (h360 / 60) % 6;      // -> -6.0 .. 6.0
        const b = a >= 0 ? a : a + 6;   // -> 0.0 .. 6.0 
        return b;
    }
    export function hsl_to_rgb01_to_lmdl(h6: number): number {
        const d6 = Math.floor(h6);
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
    export function hsl_to_rgb01_to_rgb(h6: number, min: number, mdl: number, max: number): number[] {
        const d6 = Math.floor(h6);
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

    export function rgb01_to_hsl_f1(min: number, max: number, sZero: number): number {
        const sd = 1 - Math.abs(min + max - 1);
        return sd > sZero ? (max - min) / sd : 0;
    }
    export function rgb01_to_hsl_f2(r: number, g: number, b: number, min: number, max: number, sZero: number): number {
        const d = max - min;
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
}


/**
 * RGB array (0, 0, 0) .. (255, 255, 255)
 *   ->
 * RGB string '#000000' .. '#ffffff'
 */
export function rgb255_to_rgbhex(rgb: number[]): string {
    return `#${etc.format_02f(rgb[0])}${etc.format_02f(rgb[1])}${etc.format_02f(rgb[2])}`;
}

/**
 * RGB string '#000000' .. '#ffffff'
 *   ->
 * RGB array (0, 0, 0) .. (255, 255, 255)
 */
export function rgbhex_to_rgb255(rgbhex: string): number[] {
    if (rgbhex[0] === '#') {
        rgbhex = rgbhex.slice(1);
    }
    if (rgbhex.length == 6) {
        const rh = rgbhex.slice(0, 2);
        const gh = rgbhex.slice(2, 4);
        const bh = rgbhex.slice(4, 6);
        const r = parseInt(rh, 16);
        const g = parseInt(gh, 16);
        const b = parseInt(bh, 16);
        const rgb = [r, g, b];
        return rgb;
    } else if (rgbhex.length == 3) {
        const rh = rgbhex.slice(0, 1);
        const gh = rgbhex.slice(1, 2);
        const bh = rgbhex.slice(2, 3);
        const r = parseInt(rh, 16) * 17;
        const g = parseInt(gh, 16) * 17;
        const b = parseInt(bh, 16) * 17;
        const rgb = [r, g, b];
        return rgb;
    } else {
        throw new TypeError("parameter 'rgbhex' length error. '#06c', '#0080ff', etc.");
    }
}


/**
 * RGB array (0, 0, 0) .. (255, 255, 255)
 *   ->
 * RGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 */
export function rgb255_to_rgb01(rgb: number[]): number[] {
    return rgb.map(n => n / 255);
}

/**
 * RGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 *   ->
 * RGB array (0, 0, 0) .. (255, 255, 255)
 */
export function rgb01_to_rgb255(rgb: number[]): number[] {
    return rgb.map(n => n * 255);
}


/**
 * D65 non linear sRGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 *   ->
 * D65 linear sRGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 */
export function srgb_to_lrgb(rgb: number[]): number[] {
    return rgb.map(n => etc.srgb_to_lrgb_f(n));
}

/**
 * D65 linear sRGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 *   ->
 * D65 non linear sRGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 */
export function lrgb_to_srgb(rgb: number[]): number[] {
    return rgb.map(n => etc.lrgb_to_srgb_f(n));
}


/**
 * D65 linear sRGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 *   ->
 * D50 CIE XYZ array (*.*, *.*, *.*) .. (*.*, *.*, *.*)
 */
export function lrgb_to_xyz(rgb: number[]): number[] {
    return etc.mul_m3_v3(etc.d65lrgb_to_d50xyz_mx, rgb);
}

/**
 * D50 CIE XYZ array (*.*, *.*, *.*) .. (*.*, *.*, *.*)
 *   ->
 * D65 linear sRGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 */
export function xyz_to_lrgb(xyz: number[]): number[] {
    return etc.mul_m3_v3(etc.d50xyz_to_d65lrgb_mx, xyz);
}


/**
 * D50 CIE XYZ array (*.*, *.*, *.*) .. (*.*, *.*, *.*)
 *   ->
 * D50 CIE L*a*b* array (0.0, *.*, *.*) .. (100.0, *.*, *.*)
 */
export function xyz_to_lab(xyz: number[]): number[] {
    const fx = etc.xyz_to_lab_f(xyz[0] / etc.XYZn[0]);
    const fy = etc.xyz_to_lab_f(xyz[1] / etc.XYZn[1]);
    const fz = etc.xyz_to_lab_f(xyz[2] / etc.XYZn[2]);
    const l = fy;
    const a = (500 / 116) * (fx - fy);
    const b = (200 / 116) * (fy - fz);
    const lab = [l, a, b];
    return lab;
}

/**
 * D50 CIE L*a*b* array (0.0, *.*, *.*) .. (100.0, *.*, *.*)
 *   ->
 * D50 CIE XYZ array (*.*, *.*, *.*) .. (*.*, *.*, *.*)
 */
export function lab_to_xyz(lab: number[]): number[] {
    const fy = (lab[0] + 16) / 116;
    const fx = fy + (lab[1] / 500);
    const fz = fy - (lab[2] / 200);
    const fxyz = [fx, fy, fz];
    const xyz = [0, 1, 2].map(i => etc.lab_to_xyz_f(fxyz[i], etc.XYZn[i]));
    return xyz;
}


/**
 * D50 CIE L*a*b* array (0.0, *.*, *.*) .. (100.0, *.*, *.*)
 *   ->
 * D50 CIE L*C*h array (0.0, 0.0, 0.0) .. (100.0, *.*, 360.0)
 */
export function lab_to_lch(lab: number[]): number[] {
    const l = lab[0], a = lab[1], b = lab[2];
    const c = Math.sqrt(a * a + b * b);
    const h = Math.atan2(b, a) * 180 / Math.PI;
    const lch = [l, c, h];
    return lch;
}

/**
 * D50 CIE L*C*h array (0.0, 0.0, 0.0) .. (100.0, *.*, 360.0)
 *   ->
 * D50 CIE L*a*b* array (0.0, *.*, *.*) .. (100.0, *.*, *.*)
 */
export function lch_to_lab(lch: number[]): number[] {
    const l = lch[0], c = lch[1], h = lch[2];
    const rad = h / 180 * Math.PI;
    const a = c * Math.cos(rad);
    const b = c * Math.sin(rad);
    const lab = [l, a, b];
    return lab;
}


/**
 * RGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 *   ->
 * HSL array (0.0, 0.0, 0.0) .. (360.0, 1.0, 1.0)
 */
export function rgb01_to_hsl(rgb: number[]): number[] {
    const r = rgb[0], g = rgb[1], b = rgb[2];
    const min = rgb.reduce((a, b) => a <= b ? a : b);
    const max = rgb.reduce((a, b) => a >= b ? a : b);
    const sZero = 0.005
    const l = (min + max) / 2;
    const s = etc.rgb01_to_hsl_f1(min, max, sZero);
    const h = etc.rgb01_to_hsl_f2(r, g, b, min, max, sZero) / 6;
    return [h, s, l];
}

/**
 * HSL array (0.0, 0.0, 0.0) .. (360.0, 1.0, 1.0)
 *   ->
 * RGB array (0.0, 0.0, 0.0) .. (1.0, 1.0, 1.0)
 */
export function hsl_to_rgb01(hsl: number[]): number[] {
    const h6 = etc.hsl_to_rgb01_to_h6(hsl[0]), s = hsl[1], l = hsl[2];
    const lmax = l + s / 2;
    const lmin = l - s / 2;
    const lmdl = lmin == lmax ? lmin : (lmax - lmin) * etc.hsl_to_rgb01_to_lmdl(h6);
    const rgb = etc.hsl_to_rgb01_to_rgb(h6, lmin, lmdl, lmax);
    return rgb;
}


export const rgb255_to_hsl = etc.composite_2f(rgb255_to_rgb01, rgb01_to_hsl)
export const hsl_to_rgb255 = etc.composite_2f(hsl_to_rgb01, rgb01_to_rgb255)

export const rgbhex_to_hsl = etc.composite_2f(rgbhex_to_rgb255, rgb255_to_hsl)
export const hsl_to_rgbhex = etc.composite_2f(hsl_to_rgb255, rgb255_to_rgbhex)

export const rgb01_to_lab = etc.composite_3f(srgb_to_lrgb, lrgb_to_xyz, xyz_to_lab)
export const lab_to_rgb01 = etc.composite_3f(lab_to_xyz, xyz_to_lrgb, lrgb_to_srgb)

export const rgbhex_to_rgb01 = etc.composite_2f(rgbhex_to_rgb255, rgb255_to_rgb01)
export const rgb01_to_rgbhex = etc.composite_2f(rgb01_to_rgb255, rgb255_to_rgbhex)

export const rgbhex_to_lab = etc.composite_2f(rgbhex_to_rgb01, rgb01_to_lab)
export const lab_to_rgbhex = etc.composite_2f(lab_to_rgb01, rgb01_to_rgbhex)

export const rgbhex_to_lch = etc.composite_2f(rgbhex_to_lab, lab_to_lch)
export const lch_to_rgbhex = etc.composite_2f(lch_to_lab, lab_to_rgbhex)

export const rgb255_to_lab = etc.composite_2f(rgb255_to_rgb01, rgb01_to_lab)
export const lab_to_rgb255 = etc.composite_2f(lab_to_rgb01, rgb01_to_rgb255)

export const rgb255_to_lch = etc.composite_2f(rgb255_to_lab, lab_to_lch)
export const lch_to_rgb255 = etc.composite_2f(lch_to_lab, lab_to_rgb255)

