# GM Screen

GM Screen is meant as a simple-ish tool for the most common use-cases needed to succesfully play remotely. There is a long list of features in the backlog, but at its very simplest it is meant to be an easy way to share and show media with players (be that images, videos, music, or even PDFs).

## Project Structure and Naming

Always prefer singular when naming things (`test` over `tests`, `type` over `types`, ...) unless a tool or prior convention really prefers plural (e.g. NextJS really wants pages in the `pages` directory).

Project related configuration files should primarily live at the root of the project.

- `app/`, all (NextJS) applications.
- `package/`, all packages used by the applications.
- `script/`, scripts for one-off jobs (these should be refactored to an CLI app that is written with TS so we can use the common things from in the future).

Unit tests live next to the file which they test, e.g. `round.test.ts` tests exports of the file `round.ts`.

## Getting Started

For running the application locally you will need `node`, `npm`, and `docker-compose` (and `docker` of course).

After running `npm i` to install all packages, use `npm run dev-services` to start the Docker containers. Then you may start the development environment with `npm run dev`. The application will be available on `http://localhost:3000`.

If you wish to stop the started Docker containers you can use `npm run dev-services-down`.

There is also a GUI for the local S3 on `http://localhost:9000`, use the access key `local` and secret key `verysecret` to login. For the local DynamoDB a GUI runs on `http://localhost:8001`.

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
