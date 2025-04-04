## Install the NextJS dependency

Install Next.js in your existing project:

```
  npm install next@latest
```
### Problems
- Update old packages to newer packages to be able to install nextjs
- Updated react to 18.3.1 because latests was causing issues with dependencies with deprecated packages.
- Updated react-dom and react-test-renderer to match the version of React.
- Updated react-redux redux and testing libraries to latest.



## Create the Next.js Configuration File

Create a next.config.ts at the root of your project (same level as your package.json). This file holds your Next.js configuration options.

```Typescript
import type { NextConfig } from 'next'
 
const nextConfig: NextConfig = {
  output: 'export', // Outputs a Single-Page Application (SPA)
  distDir: 'build', // Changes the build output directory to `build`
}
 
export default nextConfig
```

Note: Using output: 'export' means you’re doing a static export. You will not have access to server-side features like SSR or APIs. You can remove this line to leverage Next.js server features.

## Create the Root Layout

A Next.js App Router application must include a root layout file, which is a React Server Component that will wrap all your pages.

The closest equivalent of the root layout file in a CRA application is public/index.html, which includes your <html>, <head>, and <body> tags.

Create a new app directory inside your src directory (or at your project root if you prefer app at the root).
Inside the app directory, create a layout.tsx (or layout.js) file:

```TypeScript

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return '...'
}
```

Now copy the content of your old index.html into this <RootLayout> component. Replace body div#root (and body noscript) with <div id="root">{children}</div>.

```TypeScript

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>React App</title>
        <meta name="description" content="Web site created..." />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
```

Good to know: Next.js ignores CRA’s public/manifest.json, additional iconography, and testing configuration by default. If you need these, Next.js has support with its Metadata API and Testing setup.

### Problems
- Not recognizing ReactNode from React
  - Had to install the typescript types for the react version i'm using
- Not rendering the raw html in the layout.ts file
  - Had to rename the layout.ts to layout.tsx because it is using jsx code
  - Not sure if it helped but also created a tsconfig.json file
  ```json
    {
    "compilerOptions": {
      "types": ["node","webpack-env"],
      "target": "es5",
      "lib": [
        "dom",
        "dom.iterable",
        "esnext"
      ],
      "allowJs": true,
      "skipLibCheck": true,
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "strict": true,
      "forceConsistentCasingInFileNames": true,
      "module": "esnext",
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx"
    },
    "include": [
      "src",
      "typings.d.ts"
    ]
  }
  ```

## Styles

Like CRA, Next.js supports CSS Modules out of the box. It also supports global CSS imports.

If you have a global CSS file, import it into your app/layout.tsx

## Create the Entrypoint Page

Create React App uses src/index.tsx (or index.js) as the entry point. In Next.js (App Router), each folder inside the app directory corresponds to a route, and each folder should have a page.tsx.

Since we want to keep the app as an SPA for now and intercept all routes, we’ll use an optional catch-all route.

Create a [[...slug]] directory inside app. Create an page.tsx file and add the following:

```typescript
export function generateStaticParams() {
  return [{ slug: [''] }]
}
 
export default function Page() {
  return <ClientOnly />
}
```
This tells Next.js to generate a single route for the empty slug (/), effectively mapping all routes to the same page. This page is a Server Component, prerendered into static HTML.

## Add a Client-Only Entrypoint

Create a client.tsx (or client.js) in app/[[...slug]]/:
```typescript
'use client'
 
import dynamic from 'next/dynamic'
 
const App = dynamic(() => import('../../App'), { ssr: false })
 
export function ClientOnly() {
  return <App />
}
```
The 'use client' directive makes this file a Client Component.

The dynamic import with ssr: false disables server-side rendering for the <App /> component, making it truly client-only (SPA)

### Problems
- I didn't have an App component to wrap the whole application so i copied all the contents of the index.ts file, but i had issues wwith the reduc properties for the window object and also had problems trying to import the css modules created for the app.
  - Had to create a `global.d.ts` file inside the `src/types` folder that has the configuration for the window object and for the css modules.
  - Had to add the `src/types` folder and the `.module.css` extension to the tsconfig so it recognizes it.

 
 ## Update Static Image Imports

 With Next.js, static image imports return an object. The object can then be used directly with the Next.js <Image> component, or you can use the object's src property with your existing <img> tag.

The <Image> component has the added benefits of automatic image optimization. The <Image> component automatically sets the width and height attributes of the resulting <img> based on the image's dimensions. This prevents layout shifts when the image loads. However, this can cause issues if your app contains images with only one of their dimensions being styled without the other styled to auto. When not styled to auto, the dimension will default to the <img> dimension attribute's value, which can cause the image to appear distorted.

Keeping the <img> tag will reduce the amount of changes in your application and prevent the above issues. You can then optionally later migrate to the <Image> component to take advantage of optimizing images by configuring a loader, or moving to the default Next.js server which has automatic image optimization.

```typescript
// Before
<img src={logo} />
 
// After
<img src={logo.src} />
```

## Migrate Environment Variables

Next.js supports environment variables similarly to CRA but requires a NEXT_PUBLIC_ prefix for any variable you want to expose in the browser.

The main difference is the prefix used to expose environment variables on the client-side. Change all environment variables with the REACT_APP_ prefix to NEXT_PUBLIC_.

## Update Scripts in package.json

Update your package.json scripts to use Next.js commands. Also, add .next and next-env.d.ts to your .gitignore:

```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "npx serve@latest ./build"
  }
}
```

```
// .gitignore
# ...
.next
next-env.d.ts
```

### Problems

- When i ran `npm run dev` i had a hydration error, this was caused by the `window` object configuration for redux, i had to add this code to the ClientOnly component to fix it

```typescript
const [store, setStore] = useState<any>(null);

  useEffect(() => {
    const devtools =
      typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : undefined;

    const createdStore = createStore(rootReducer, devtools);
    setStore(createdStore);
  }, []);

  if (!store) return null; // Or a loading spinner
```

This will wait until the window is rendered in the client, because the window object doesn't exists in the server