import argparse
import sys

import uvicorn


def do_start(args: argparse.Namespace) -> int:
    uvicorn.run("app:app", host=args.host, port=args.port, reload=args.dev)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.set_defaults(_do=None)

    subparser = parser.add_subparsers()

    start = subparser.add_parser("start")
    start.set_defaults(_do=do_start)
    start.add_argument("--host", "-b", default="0.0.0.0")
    start.add_argument("--port", "-p", default=9999, type=int)
    start.add_argument("--dev", "-d", action="store_true")

    args = parser.parse_args()

    if args._do is None:
        parser.print_help()
        return 2

    return args._do(args)


if __name__ == "__main__":
    sys.exit(main())
