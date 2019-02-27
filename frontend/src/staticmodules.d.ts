// This way you can import non-JS/TS sources
declare module "*.png" {
    const value: any;
    export default value;
  }
