# Description
This application is a Nodejs-based page with a basic form containing 3 fields for: email, Amazon product URL to track, and the asking price for the product to go below. Upon a successful submission, the website checks the actual price of the product on Amazon every 24 hours. Once the price of the product goes below the asking price it will notify the client via email. As of the current version - 1.0, it only works for one product at a time - each subsequent submission cancelling out tracking for the previously submitted product. The app has to be constantly running so it is best suited for a server.

# Getting Started
1. Clone the repository (https://www.github.com/pjedra/amazon-price-tracking) to a directory of your choice.
2. Ensure that you have NodeJS installed (v6+) on your system. 
3. Install all dependencies on your machine at the root of the repository clone, using `npm install`.
4. Execute `npm start` from the NodeJS Command Prompt at the root of the clone.
5. `localhost:3000` in the browser.

# Notice
The e-mail address provided in the code is only used for testing, and therefore it does not send actual an actual email to the user, should they enter their address. In order for the email functionality to actually send emails, nodemailer has to be configured using an actual gmail or hotmail account details.