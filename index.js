const express = require('express');
const { format } = require('lametric-rss-formatter');

const feeds = {
  'Pääuutiset': 'https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss',
  'Tuoreimmat uutiset': 'https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_UUTISET',
  'Luetuimmat uutiset': 'https://feeds.yle.fi/uutiset/v1/mostRead/YLE_UUTISET.rss',
  'In English': 'https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_NEWS'
};
const defaultFeed = 'Tuoreimmat uutiset';

const app = express();

module.exports = app;

app.get('/', (req, res) => {
  const { feed, max } = req.query;
  const url = feeds[feed || defaultFeed];

  if (!url) {
    res.send({
      frames: [{
        text: 'Invalid feed',
        icon: 'stop'
      }]
    });
    return;
  }

  format({ url, max, icon: 'yle' })
    .then((result) => res.send(result))
    .catch(() => res.sendStatus(500));
});
