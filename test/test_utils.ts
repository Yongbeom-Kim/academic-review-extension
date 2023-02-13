// predicates
export const alwaysFalse = (x: string) => false;
export const alwaysTrue = (x: string) => true;
export const isZero = (x: number) => x === 0;
export const isOne = (x: number) => x === 1;
export const isTwo = (x: number) => x === 2;
export const isThree = (x: number) => x === 3;
export const isFour = (x: number) => x === 4;
export const isBetween0to10 = (x: number) => 0 <= x && x < 10;
export const isBetween10to20 = (x: number) => 10 <= x && x < 20;
export const isBetween20to30 = (x: number) => 20 <= x && x < 30;
export const isBetween30to40 = (x: number) => 30 <= x && x < 40;
export const isBetween40to50 = (x: number) => 40 <= x && x < 50;