# 3D Raycasting Demo

This is a demo to explore old 3D rendering technics, specifically raycasting. In order to render in a HTML canvas, we are using the WebAssembly build of the 2D engine [Skia](https://skia.org/).

## Requirements:

* NPM for package management
* NodeJS to run the build system (Webpack, Typescript, Babel, etc)

## How to build:

1. Install the NPM packages, `npm install` should be enough
2. To build the demo: `npm run build` will compile and bundle the files in the `dist/` folder. You can start a local server in that folder, or
3. You can run `npm run start` to start the local server and reload files when changes are made to the files.

The project will build map files so that it can be debug. For example, I use VS code to run the npm task and launch the explorer. My `.vscode/launch.json` file looks like this:

```
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "pwa-chrome",
            "request": "launch",
            "name": "Launch Chrome against localhost",
            "url": "http://localhost:8080",
            "webRoot": "${workspaceFolder}"
        }
    ]
}
```
