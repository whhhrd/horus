// This way you can import non-JS/TS sources
declare module "*.png" {
    const value: any;
    export default value;
}
declare module "*.jpg" {
    const value: any;
    export default value;
}

declare module "react-sortablejs";
declare module "react-string-replace";
