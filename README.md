# API Tester

A tiny, dependency-free Postman-like tool built with plain HTML, CSS, and JavaScript. Made while learning fetch() and async/await.

This project exists so you can learn by breaking things: type a URL, hit Send, watch a real HTTP request/response cycle, and see what goes wrong when you forget an await.

## What it does

- Send requests to any endpoint using GET, POST, PUT, PATCH, or DELETE
- Add query parameters and headers through the UI. No code changes required
- Send a JSON body for POST/PUT/PATCH; the app validates your JSON before sending
- Shows HTTP status code, response time, headers, and the parsed JSON body
- Keeps a short history of recent requests so you don't retype the same URL repeatedly
- Copy the response with one click
- Clear, actionable error messages when something goes wrong

## Why I built it this way

Reading docs about fetch() is useful, but you truly learn it when a request fails in real time. This project is the request/response cycle made clickable. A small, focused playground to learn how fetch(), Promises, and async/await behave in real scenarios.

Everything in the code is commented to explain why a line exists (not just what it does). The goal was to learn, not to hide complexity behind a framework.

## How to run

1.try it live

-no cloning required, just click:

https://ainali-10.github.io/API-TESTER/

-running it locally


2.if you want to poke at the code instead:

-clone or download this repo

-open index.html in your browser

-that's it, you're done

That's it. You're ready to send requests.

## Project structure

index.html          → The page (root)

project/
├── css/
│   └── style.css    → Styling
└── js/
    └── script.js    → App logic and comments

## Built with

Plain HTML, CSS and JavaScript — no React, no Node, no npm. Zero dependencies.

## Try it out

The app comes pre-loaded with a request to jsonplaceholder (a free fake API for testing). Hit Send on the default GET request to see it in action before changing anything.

## Things I might add

- Saving auth tokens / API keys so you don't retype them
- Saved request collections (folders of requests)
- Environment switching (dev / staging / prod)
- Dark mode toggle

## License

Do whatever you want with it — this is a learning project, not a company.
