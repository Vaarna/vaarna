import argparse
import sys
import typing as t

import uvicorn

from .app import app


def do_hello(args: argparse.Namespace) -> int:
    print("hello :)")
    return 0


def do_start(args: argparse.Namespace) -> int:
    application = "gm_screen:app" if args.dev else app
    kwargs = {"host": args.host, "port": args.port, "reload": args.dev}

    uvicorn.run(application, **kwargs)

    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.set_defaults(_do=None)

    subparser = parser.add_subparsers()

    hello = subparser.add_parser("hello")
    hello.set_defaults(_do=do_hello)

    start = subparser.add_parser("start")
    start.set_defaults(_do=do_start)
    start.add_argument("--host", "-b", default="0.0.0.0")
    start.add_argument("--port", "-p", default=8000, type=int)
    start.add_argument("--dev", "-d", action="store_true")

    args = parser.parse_args()

    if args._do is None:
        parser.print_help()
        return 2

    return args._do(args)


if __name__ == "__main__":
    sys.exit(main())
