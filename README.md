# Olympiads Scraper

A tool to automatically download Olympiads homework using your email and password

## Running the program

### Requirements

- Latest Node.js LTS, Yarn

### Instructions

1. Clone the repo
1. `cd` into the repo's directory
1. Copy `.env.example` to `.env`
   1. Change `EMAIL` to your Olympiads login email
   1. Change `PASS` to your Olympiads login password
   1. Change `PREFIX` to your desired download location, with a trailing slash. (This must be an absolute path, using shell extensions like `~/homework/` will not work!)
1. Run `yarn`
1. Run `yarn start`

## Built With

- Node.js
- Puppeteer

## Contributors

Jason Huang
