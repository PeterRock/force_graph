Research for the performance between echarts and d3.js.

D3 use d3-force as simulator, echarts use option `type: 'graph', layout: 'force'`

### Description

|driver|render|
|:-|:-|
|echrts|canvas|
|d3-force|canvas|
|d3-force|dom|
|d3-force|svg|
|d3-force|webgl|

#### screenshot
![picture](./screenshot.png)

#### graph content
- event handler: drag-drop, drag-move
- force-simulator
- colorful points
- text of responsive size
- Large amounts of data (674 points + 1099 links)

drawing text cost lots of resource

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

