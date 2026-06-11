// Type declaration so TypeScript understands CSS Module imports
// (e.g. `import styles from "./X.module.css"`).
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
