let Request = require('request');
let FileCookieStore = require('tough-cookie-filestore');

module.exports = ScrapTF;

function ScrapTF(options){
    options = options || {};

    this._userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36";
    this._steamjar = Request.jar();
    this._jar = Request.jar(new FileCookieStore('scraptf-cookies.json'));
    this._csrf_hash = {};

    this._loggedIn = false;
}

ScrapTF.prototype._scraptfGenericAPIRequest = function(options){
    let self = this;
    return new Promise((resolve, reject) => {
        if(self._loggedIn === false){
            return reject('Not Logged Into Scrap.TF')
        }
        let baseRequest = Request.defaults({
            method: 'POST',
            headers: {
                'User-Agent': self._userAgent
            },
            form: {
                csrf: self._csrf_hash
            },
            jar: self._jar
        });
        baseRequest(options, function (error, body, response) {
            if(error){
                return reject(error)
            }
            return resolve(body, response)
        });
    });
};
require('./components/logon.js');
require('./components/weapons.js');