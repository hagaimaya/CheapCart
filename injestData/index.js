const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

let driver = new webdriver.Builder()
    .forBrowser('firefox')
    .setChromeOptions(/* ... */)
    .setFirefoxOptions(/* ... */)
    .build();