import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import app from "./index.js";

const MOCK_RSS_FEED = `
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Example feed</title>
    <link>https://www.example.com</link>
    <description>This is just an example of RSS feed</description>
    <item>
      <title>Item</title>
      <description>Description</description>
      <pubDate>Tue, 8 Jan 2019 01:15:00 GMT</pubDate>
    </item>
  </channel>
</rss>
`;

describe("YLE LaMetric server", () => {
  const server = setupServer(
    http.get(
      "https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss",
      () => HttpResponse.xml(MOCK_RSS_FEED),
    ),
    http.get("https://feeds.yle.fi/uutiset/v1/recent.rss", () =>
      HttpResponse.xml(MOCK_RSS_FEED),
    ),
    http.get("https://feeds.yle.fi/uutiset/v1/mostRead/YLE_UUTISET.rss", () =>
      HttpResponse.xml(MOCK_RSS_FEED),
    ),
  );

  beforeAll(() => {
    server.listen({ onUnhandledRequest: "bypass" });
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("should use default feed when feed request parameter is omitted", () =>
    request(app)
      .get("/")
      .then((response) => {
        expect(response.body).toEqual({
          frames: [{ icon: "yle", index: 0, text: "1. Item" }],
        });
      }));

  it.each([
    "Pääuutiset",
    "Tuoreimmat uutiset",
    "Luetuimmat uutiset",
    "In English",
  ])("should read name of the feed from request parameter", (feedName) =>
    request(app)
      .get(`/?feed=${encodeURI(feedName)}`)
      .then((response) => {
        expect(response.body).toEqual({
          frames: [{ icon: "yle", index: 0, text: "1. Item" }],
        });
      }),
  );

  it("should return erroneous response when feed name is not recognized", () =>
    request(app)
      .get("/?feed=unknown")
      .then((response) => {
        expect(response.body).toEqual({
          frames: [{ icon: "stop", text: "Invalid feed" }],
        });
      }));

  it('should allow numeric "max" request parameter', () =>
    request(app)
      .get("/?max=5")
      .then((response) => {
        expect(response.body).toEqual({
          frames: [{ icon: "yle", index: 0, text: "1. Item" }],
        });
      }));

  it('should return erroneous response if unable to parse "max" request parameter as integer', () =>
    request(app)
      .get("/?max=foo")
      .then((response) => {
        expect(response.body).toEqual({
          frames: [{ icon: "stop", text: "Invalid max parameter" }],
        });
      }));
});
