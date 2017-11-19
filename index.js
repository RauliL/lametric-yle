const parser = require('parse-rss');

const feeds = {
  'Pääuutiset': 'https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss',
  'Tuoreimmat uutiset': 'https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_UUTISET',
  'Luetuimmat uutiset': 'https://feeds.yle.fi/uutiset/v1/mostRead/YLE_UUTISET.rss',
  'In English': 'https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_NEWS'
};
const defaultFeed = 'Tuoreimmat uutiset';

module.exports = hook => {
  const url = feeds[hook.params.feed || defaultFeed];

  // Specify response content type and character set.
  hook.res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (!url) {
    hook.res.json({
      frames: [{
        text: 'Invalid feed',
        icon: 'stop'
      }]
    });
    return;
  }

  // Attempt to retrieve and parse the RSS feed.
  parser(url, (err, rss) => {
    // Was it unsuccessful?
    if (err) {
      hook.res.json({
        frames: [
          {
            text: 'Unable to retrieve RSS feed',
            icon: 'stop'
          }
        ]
      });
      return;
    }

    // Success! Let's process the feed now.
    hook.res.json({
      frames: rss
        // Sort entries based on "pubDate" field.
        .sort((entry1, entry2) => {
          const time1 = (new Date(entry1.pubDate)).getTime();
          const time2 = (new Date(entry2.pubDate)).getTime();

          return time1 > time2 ? -1 : time1 < time2 ? 1 : 0;
        })
        // Display only 5 or user defined amount of latest entries.
        .splice(0, hook.params.max ? parseInt(hook.params.max) : 5)
        // And convert them into LaMetric format.
        .map((entry, index) => ({
          index,
          text: `${index + 1}. ${entry.title}`,
          icon: 'yle'
        }))
    });
  });
};
