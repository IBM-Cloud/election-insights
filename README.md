# Election Insights

Currently hosted [here](http://electioninsights.mybluemix.net/)

The Election Insights app uses Alchemy News API to display a bubble map of
what's being talked about in real time and how people feel about them. The app
uses Alchemy's taxonmy breakdown to focus specifically on the election, and uses
Alchemy's entity breakdown and sentiment analaysis to display the data visually.

The size of the bubbles are dictated by how much they're being discussed and the
color is dictated by the average sentiment around that entity.

![screenshot](http://i.imgur.com/SqKHnBC.png)

# Deploy to Bluemix

prerequisite: create a [Bluemix](https://bluemix.net/), and register for an
[Alchemy API Key](http://www.alchemyapi.com/api/register.html).

There are two ways to deploy this to Bluemix:

### Option 1: Click the button below:

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy)

This will set up a build pipeline - every time you push to the jazzhub repo this
will create, it will automatically trigger a build and deploy.

After the initial deploy is done, you'll need to go to your dashboard, go to the
space that you choose for this application, go to the application itself,

### Option 2: The manual route:

In Bluemix:

  1. Create a Node.js runtime
  1. Bind a Mongolabs service instance with the "sandbox" plan
  1. Bind Alchemy with your API key

Once this is set up add these to your manifest.yml:

```yml
host: newsinsights
name: newsinsights
```

Then:

```sh
npm install
npm run build
cf push "electioninsights"
```

(or whatever you named your app), and you'll be all set.

# Running the app locally

All you need to do is:

```sh
npm install
npm run build
npm start
```

There's also a helper `npm dev` that kicks off the server and runs `gulp dev`
which handles watchify and re-compiling less->css when files change.

Make `server/config.json` that is the same structure as `VCAP_SERVICES` is on
Bluemix. For example:

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

# Using IBM DevOps

*Note: if you used the "Deploy to Bluemix" button, this will all be set up for*
*you.*

I like to use IBM DevOps to automatically build and deploy my code whenever I
push to git. Your build stage should look like:

```sh
#!/bin/bash
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
# Contributing

Feel free to fork this repo and open a Pull Request or open an issue!

# License

This app is licensed under the Apache 2.0 License. Full license text is
available in [LICENSE](https://github.com/kauffecup/news-insights/blob/master/LICENSE).

# Contact Me

All of my contact information can be found [here](http://www.jkaufman.io/about/)