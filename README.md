# GM Screen

GM Screen is meant as a simple-ish tool for the most common use-cases needed to succesfully play remotely. There is a long list of features in the backlog, but at its very simplest it is meant to be an easy way to share and show media with players (be that images, videos, music, or even PDFs).

## Project Structure and Naming

Always prefer singular when naming things (`test` over `tests`, `type` over `types`, ...) unless a tool or prior convention really prefers plural (e.g. NextJS really wants pages in the `pages` directory).

Project related configuration files should primarily live at the root of the project.

- `cdk/`, AWS CDK stacks and app.
- `pages/`, pages for the NextJS app.
- `server/`, custom server for NextJS and the WebSocket stuff needed on the backend.
- `src/`, everything that is somewhat general and could be shared between other modules.
  - `component/`, all React components and their CSS.
  - `component/atom/`, "very small" components. Components that do just a single small thing, e.g. buttons and inputs.
  - `type/`, general types that are being used in many places. More specific types live closer to where they are being used. Most of the types in this directory relate to errors and the APIs/database.
- `test/`, end-to-end tests written with TestCafe.
- `script/`, scripts for one-off jobs (these should be refactored to an CLI app that is written with TS so we can use the common things from in the future).

Unit tests live next to the file which they test, e.g. `round.test.ts` tests exports of the file `round.ts`.

## Getting Started

For running the application locally you will need `node`, `yarn`, and `docker-compose` (and `docker` of course). You should also have `make` installed, but that usually comes as part of a sane development environment.

The development environment will start as easily as running `make dev`. This will start the required containers on the background and the NextJS application in dev mode. The application will be available on `http://localhost:3000`.

If you wish to stop the started Docker containers you can use `make dev-services-down`.

There is also a GUI for the local S3 on `http://localhost:9000`, use the access key `local` and secret key `verysecret` to login. For the local DynamoDB a GUI runs on `http://localhost:8001`.

See the [Makefile](./Makefile) for more commands, a better help that documents all of the commands is yet to be written. Do note that the scripts in `package.json` are only meant to be used by Heroku.

## License

```
gm-screen - tool to help GM's to run their games
Copyright (C) 2020  Maximilian Remming

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```
