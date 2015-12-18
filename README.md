# TheNewBuro_Kroot
Kroot's project by [TheNewBuro](http://www.thenewburo.com/thecms/)

## Prerequisites

- NodeJS
- Cordova
- Ionic
- Gulp

## Installation

1) Install [NodeJS](https://nodejs.org/en/) (with the Node Package Manager)

2) Install [Cordova](https://nodejs.org/en/)
```bash
npm install -g cordova
```
3) Install [Ionic](http://ionicframework.com/)
```bash
npm install -g ionic
```
4) Install [Gulp](http://gulpjs.com/)
```bash
npm install -g gulp
```

## Run in your computer browser

In the project root folder, just execute
```bash
ionic serve
```

## Run in another platform

In the project root folder, check the available platforms
```bash
ionic platform list
```
Install the desired platform if needed
```bash
ionic platform add <platform>
```
Build the project
```bash
ionic build <platform>
```
Run the project (it will automatically find a device like an emulator or a connected phone)
```bash
ionic run <platform>
```