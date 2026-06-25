// Ambient declaration for CSS Module imports (compile-time type only).
declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

