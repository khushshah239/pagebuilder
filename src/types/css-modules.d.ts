/**
 * Ambient declaration so TypeScript understands CSS Module imports
 * (`import styles from "....module.scss"`). Next.js handles the runtime; this
 * only provides the compile-time type (a class-name → string map).
 */
declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

