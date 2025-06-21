import { Filter } from '../../common';
type FilterValue = {
    win: number;
    fn: (x: number) => number;
};
type FilterMap = {
    [K in Filter]: FilterValue;
};
export declare const FILTER_MAP: FilterMap;
export {};
