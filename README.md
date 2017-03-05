# remember
This is a web application for commemorating victims of genocide and mass atrocities.

## Overview
The application offers access to a database of people who have been killed in genocides or mass atrocities.  It will also have an application specifically for people to read names aloud, in person.

## Structure
At the top level are files for starting the application: build files, a script for seeding the database, the server, and the main `index.html` page.

In `conf/` are configuration files, including files for specifying compilation and testing options.

In `src/` are the source files for styles and functionality (in `css/` and `js/` respectively).

## Development
This application is written in Typescript, with stylesheets written in SASS.  It uses MongoDB for the database, Mocha for testing, and Gulp for building.

Upon cloning or forking this repo, run `npm install` to install all dependencies.  Run `npm run watch` to build the code, start a database seeded with test data, and start a server.  You can then view the front page at [http://localhost:5000/](http://localhost:5000/).  Code will be rebuilt automatically when any source file changes.

The other available tasks are:

|  Node task  |  Effect  |
|-------------|----------|
| `npm run build` | Compiles the server, javascript, and css files for a production environment. |
| `npm run build-dev` | Compiles development versions of all files, including metadata for easier debugging. |
| `npm start` | Starts the production environment server. Must have compiled code, and must have mongodb running with its URI in MONGODB_URI (or else running on the default port 27017). |
| `npm run start-dev` | Runs a local server, connected to a local database filled with test data. |
| `npm run watch` | Like above, but also re-compiles code when source files change, and restarts the server if its code changes. |
| `npm run docs` | Generates TypeDoc documentation, placed in a new `docs` folder, accessible by browser. |
| `npm test` | Runs unit tests specified in `.ts.spec` files. Must have compiled code. |
