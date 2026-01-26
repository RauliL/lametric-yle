import express from "express";
import { formatURL } from "lametric-rss-formatter";

type Feed =
  | "Pääuutiset"
  | "Tuoreimmat uutiset"
  | "Luetuimmat uutiset"
  | "In English";

const feeds: Map<Feed, string> = new Map([
  [
    "Pääuutiset",
    "https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss",
  ],
  [
    "Tuoreimmat uutiset",
    "https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_UUTISET",
  ],
  [
    "Luetuimmat uutiset",
    "https://feeds.yle.fi/uutiset/v1/mostRead/YLE_UUTISET.rss",
  ],
  [
    "In English",
    "https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_NEWS",
  ],
]);
const defaultFeed: Feed = "Tuoreimmat uutiset";

const app = express();

export default app;

app.get("/", (req, res) => {
  const { feed } = req.query;
  let max: number | undefined;
  const url = feeds.get((feed || defaultFeed) as Feed);

  if (!url) {
    res.send({
      frames: [
        {
          text: "Invalid feed",
          icon: "stop",
        },
      ],
    });
    return;
  }

  if (req.query.max) {
    max = Number.parseInt(`${req.query.max}`, 10);
    if (Number.isNaN(max)) {
      res.send({
        frames: [
          {
            text: "Invalid max parameter",
            icon: "stop",
          },
        ],
      });
      return;
    }
  }

  formatURL(url, { max, icon: "yle" })
    .then((result) => res.send(result))
    .catch(() => res.sendStatus(500));
});
