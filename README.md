# Election Insights

Currently hosted [here](http://electioninsights.mybluemix.net/)

The Election Insights app uses Alchemy News API to display a bubble map of
what's being talked about in real time and how people feel about them. The app
uses Alchemy's taxonmy breakdown to focus specifically on the election, and uses
Alchemy's entity breakdown and sentiment analaysis to display the data visually.

The size of the bubbles are dictated by how much they're being discussed and the
color is dictated by the average sentiment around that entity.

![screenshot](http://i.imgur.com/SqKHnBC.png)

# Configuration

In Bluemix you will need to create a Node.js runtime, bind a Mongolabs
service instance and bind Alchemy with your API key. Once this is set up you'll
be able to

```sh
git submodule init
git submodule update
npm install
npm run build
cf push "electioninsights"
```

(or whatever you named your app), and you'll be all set.

If running locally, make `server/config.json` that is the same structure as
`VCAP_SERVICES` is on Bluemix. For example:

```json
{
  "user-provided": [{
    "name": "AlchemyAPI-2e",
    "label": "user-provided",
    "credentials": {
      "apikey": "your-key-goes-here"
    }
  }],
  "mongolab": [{
    "name": "MongoLab-bh",
    "label": "mongolab",
    "plan": "sandbox",
    "credentials": {
      "uri": "mongodb://yourmongouri"
    }
  }]
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

# Using IBM DevOps

I like to use IBM DevOps to automatically build and deploy my code whenever I
push to git. Your build stage should look like:

```sh
#!/bin/bash
git submodule init
git submodule update
npm install
npm run build
```

And your deploy should look like:

```sh
#!/bin/bash
cf push "${CF_APP}"

# view logs
#cf logs "${CF_APP}" --recent
```

# License

This app is licensed under the Apache 2.0 License. Full license text is
available in [LICENSE](https://github.com/kauffecup/news-insights/blob/master/LICENSE).

# Contact Me

All of my contact information can be found [here](http://www.jkaufman.io/about/)