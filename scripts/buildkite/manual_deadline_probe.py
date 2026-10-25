"""Temporary six-hour Janus deadline probe; this branch must never be merged."""

import datetime
import json
import signal
import sys
import time


def main():
    if sys.argv[1:] != ["build-and-test"]:
        return 2
    started = time.monotonic()

    def record(event, **fields):
        print(json.dumps({
            "probe": "cal-manual-deadline-20261025",
            "event": event,
            "utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "elapsedSeconds": round(time.monotonic() - started, 3),
            **fields,
        }, sort_keys=True), flush=True)

    def stop(signum, _frame):
        record("signal", signal=signum)
        raise SystemExit(128 + signum)

    for signum in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP):
        signal.signal(signum, stop)

    record("started", expectedCommandSeconds=21600, expectedProviderMinutes=372)
    # The controller must stop this process at 360 minutes. The extra two
    # minutes make an unexpectedly unenforced deadline a bounded failure.
    end = started + 21720
    while time.monotonic() < end:
        time.sleep(min(60, max(0, end - time.monotonic())))
        record("heartbeat")
    record("deadline-not-enforced")
    return 97


if __name__ == "__main__":
    raise SystemExit(main())
