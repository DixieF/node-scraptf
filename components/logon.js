let ScrapTF = require('../index.js');
let Request = require('request');
let cheerio = require('cheerio');
const scrapTFLoginUrl = "https://scrap.tf/login";

//Add events

ScrapTF.prototype.logOn = function(callback) {
    let self = this;
    return new Promise((resolve, reject) => {
       if(self._loggedIn){
           return reject(['E_ALREADYLOGGEDIN']);
       }
       if(self._jar.getCookies('https://scrap.tf').length < 3){
           if(hasSteamCookies()){
                self._doScrapTFOathMultiPart().then(function(cookies){
                    try {
                        let scr_session = cookies[0].match(/scr_session=([^;]+)/)[1];
                        let decodedSCR = (Buffer.from(decodeURI(scr_session), 'base64')).toString('ascii');
                        self._csrf_hash = decodedSCR.match(/token\|s:64:"([^"]+)/)[1];
                        self._loggedIn = true;
                        self.emit('loggedOn');
                        if (callback) {
                            return callback(null)
                        }
                        return resolve()
                    } catch(err){
                        if (callback) { return callback(['E_CSRFPASSERROR',err]) }
                        return reject(['E_CSRFPASSERROR',e])
                    }
                }).catch(function(err){
                    if (callback) { return callback(['E_OATHMULTIPART',err])}
                    return reject(['E_OATHMULTIPART',err])
                })
            } else {
                if (callback) { return callback(['E_NOSTEAMCOOKIES']) }
                return reject(['E_NOSTEAMCOOKIES'])
            }
       } else {
           let cookies = (self._jar.getCookieString('https://scrap.tf'));
           try {
               let scr_session = cookies.match(/scr_session=([^;]+)/)[1];
               let decodedSCR = (Buffer.from(decodeURI(scr_session), 'base64')).toString('ascii');
               self._csrf_hash = decodedSCR.match(/token\|s:64:"([^"]+)/)[1];
               self._loggedIn = true;
               if (callback) { return callback() }
               return resolve();
           } catch(err){
               if (callback) { return callback(['E_CSRFPASSERROR',err]) }
               return reject(['E_CSRFPASSERROR',err])
           }
       }
       //TODO: Add check for steam session cookies
       function hasSteamCookies(){
           return true
       }
    });
};
ScrapTF.prototype.setSteamCookies = function(cookies){
    let self = this;
    cookies.forEach(function(cookie){
        let cookieName = cookie.match(/(.+)=/)[1];
        self._setSteamCookie(Request.cookie(cookie), !!(cookieName.match(/^steamMachineAuth/) || cookieName.match(/Secure$/)));
    });
};
// This function was taken from: [doctormckay/node-steamcommunity]
ScrapTF.prototype._setSteamCookie = function(cookie, secure) {
    let protocol = secure ? "https" : "http";
    cookie.secure = !!secure;

    this._steamjar.setCookie(cookie.clone(), protocol + "://steamcommunity.com");
    this._steamjar.setCookie(cookie.clone(), protocol + "://store.steampowered.com");
    this._steamjar.setCookie(cookie.clone(), protocol + "://help.steampowered.com");
};
ScrapTF.prototype._setScrapTFCookie = function(cookies) {
    let self = this;
    cookies.forEach(function(cookie){
        self._jar.setCookie(cookie,"https://scrap.tf");
    });
};
ScrapTF.prototype._doScrapTFOathMultiPart = function() {
    let self = this;
    return new Promise((resolve, reject) => {
        Request({
            method: 'GET',
            uri: scrapTFLoginUrl,
            headers: {
                'User-Agent': self._userAgent
            },
            jar: self._steamjar
        }, function (error, response, body) {
            if (error) {
                return reject(error);
            }
            let $ = cheerio.load(body);

            $('#openidForm').filter(function(){
               let postData = {};
               let data = $(this);

               formParts = data.children();
               postData[formParts[0].attribs.name] = formParts[0].attribs.value;
               postData[formParts[1].attribs.name] = formParts[1].attribs.value;
               postData[formParts[2].attribs.name] = formParts[2].attribs.value;
               postData[formParts[3].attribs.name] = formParts[3].attribs.value;
               if(postData['action'] && postData['openid.mode'] && postData['openidparams'] && postData['nonce']){
                   return submitInitialRequest(postData);
               } else {
                   return reject('Missing Key Elements');
               }
            });
        });
        function submitInitialRequest(postData){
            Request({
                method: 'POST',
                uri: 'https://steamcommunity.com/openid/login',
                headers: {
                    'User-Agent': self._userAgent,
                },
                formData: postData,
                jar: self._steamjar,
                followRedirect: false
            }, function(err, response, body){
                if (err){
                    return reject(err)
                }
                return doScrapTFOathLogin(response.headers.location);
            });
        }
        function doScrapTFOathLogin(url){
            Request({
                method: 'GET',
                uri: url,
                headers: {
                    'User-Agent': self._userAgent,
                },
                followRedirect: false
            }, function(err, response, body){
                if(err){
                    reject(err);
                }
                self._setScrapTFCookie(response.headers['set-cookie']);
                return retrieveUpdatedCookie(response.headers.location);

            });
        }
        function retrieveUpdatedCookie(url){
            Request({
                method: 'GET',
                uri: "https://scrap.tf"+url,
                headers: {
                    'User-Agent': self._userAgent,
                },
                followRedirect: false,
                jar: self._jar
            }, function(err, response, body) {
                if(err){
                    return reject(err)
                }
                self._setScrapTFCookie(response.headers['set-cookie']);
                return resolve(response.headers['set-cookie']);
            });
        }
    });
};


