# Election Insights

Currently hosted [here](http://newsinsights.mybluemix.net/)

The Election Insights app uses Alchemy News API to display a bubble map of
what's being talked about in real time and how people feel about them. The app
uses Alchemy's taxonmy breakdown to focus specifically on the election, and uses
Alchemy's entity breakdown and sentiment analaysis to display the data visually.

The size of the bubbles are dictated by how much they're being discussed and the
color is dictated by the average sentiment around that entity.

![screenshot](http://i.imgur.com/D1uinel.png)

# Configuration

In Bluemix you will need to bind mongolabs and bind Alchemy with your API key.
If running locally, make `server/config.json` that is the same structure as
`VCAP_SERVICES` is on Bluemix. For example:

```json
{
   "user-provided": [
      {
         "name": "AlchemyAPI-2e",
         "label": "user-provided",
         "credentials": {
            "apikey": "your-key-goes-here"
         }
      }
   ]
   ...
}
```

# Running the app locally

Note: Loading `alchemyapi_node` as a git submodule from
https://github.com/kauffecup/alchemyapi_node. This means that once you clone
this repo down, you'll need to run:

    git submodule init
    git submodule update

Then all you need to do is

    npm install
    npm start

There's also a helper `npm dev` that kicks off the server and runs `gulp dev`
which handles watchify and re-compiling less->css when files change.


# License

This app is licensed under the Apache 2.0 License. Full license text is
available in [LICENSE](https://github.com/kauffecup/news-insights/blob/master/LICENSE).

# Contact Me

All of my contact information can be found [here](http://www.jkaufman.io/about/)