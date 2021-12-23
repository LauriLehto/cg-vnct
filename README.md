
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

This app uses the netlify cli tool which can be installed with 

```
npm install -g netlify-cli
```

Because this app uses the Coin Gecko API the usual CORS issues are handled with Netlify functions and specifically 'node-fetch' function. This is the main reason for using Netlify CLI. In local development functions can be used by running them with
```
netlify dev
```
which runs the development server on localhost:8888 .

Builds are best run with
```
CI= npm run build
```
and published directly to Netlify by running
```
netlify deploy (--prod)
```
Running the deploy without --prod tag publishes the deployment on a preview url.
