# News Insights

Currently hosted [here](http://newsinsights.mybluemix.net/)

Uses Alchemy API.

Note: Loading `alchemyapi_node` as a git submodule from
https://github.com/kauffecup/alchemyapi_node. This means that once you clone
this repo down, you'll need to run:

    git submodule init
    git submodule update

# Configuration

If running on Bluemix, make sure you bind Alchemy with your API key. If running
locally, make `server/config.json` that is the same structure as `VCAP_SERVICES`
is on Bluemix. For example:

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
}
```

# License

This app is licensed under the Apache 2.0 License. Full license text is
available in [LICENSE](https://github.com/kauffecup/news-insights/blob/master/LICENSE).

# Contact Me

All of my contact information can be found [here](http://www.jkaufman.io/about/)