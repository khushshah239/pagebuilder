// Ambient declaration for CSS Module imports (compile-time type only).
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

