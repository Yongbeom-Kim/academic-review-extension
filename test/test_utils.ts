// predicates
export const alwaysFalse = (x: string) => false;
export const alwaysTrue = (x: string) => true;
export const isZero = (x: string) => x === '0';
export const isOne = (x: string) => x === '1';
export const isTwo = (x: string) => x === '2';
export const isThree = (x: string) => x === '3';
export const isFour = (x: string) => x === '4';
export const isBetween0to10 = (x: string) => 0 <= Number.parseInt(x) && Number.parseInt(x) < 10;
export const isBetween10to20 = (x: string) => 10 <= Number.parseInt(x) && Number.parseInt(x) < 20;
export const isBetween20to30 = (x: string) => 20 <= Number.parseInt(x) && Number.parseInt(x) < 30;
export const isBetween30to40 = (x: string) => 30 <= Number.parseInt(x) && Number.parseInt(x) < 40;
export const isBetween40to50 = (x: string) => 40 <= Number.parseInt(x) && Number.parseInt(x) < 50;