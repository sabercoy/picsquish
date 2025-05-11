export namespace filter {
    namespace box {
        let win: number;
        function fn(x: any): 1 | 0;
    }
    namespace hamming {
        let win_1: number;
        export { win_1 as win };
        export function fn_1(x: any): number;
        export { fn_1 as fn };
    }
    namespace lanczos2 {
        let win_2: number;
        export { win_2 as win };
        export function fn_2(x: any): number;
        export { fn_2 as fn };
    }
    namespace lanczos3 {
        let win_3: number;
        export { win_3 as win };
        export function fn_3(x: any): number;
        export { fn_3 as fn };
    }
    namespace mks2013 {
        let win_4: number;
        export { win_4 as win };
        export function fn_4(x: any): number;
        export { fn_4 as fn };
    }
}
