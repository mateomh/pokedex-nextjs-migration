export {}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: () => any;
  }
}
