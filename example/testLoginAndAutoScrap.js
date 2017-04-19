//=========================
// This example will log into steam and then use the steam session
// to log into scrap.tf. Finally it will run the AutoScrap function
//=========================
let ScrapTF = require('../index.js');
let SteamUser = require('steam-user');
let SteamTotp = require('steam-totp');

let steamUser = new SteamUser();
let scrapTF = new ScrapTF();

//If no Cookies are Saved, fill out below credentials and set to true
let doSteamLogin = false;

if(doSteamLogin == true) {
    let config = {};
    config.account = {};
    config.account.username = "";
    config.account.password = "";
    config.escrow = {};
    config.escrow.shared_secret = "";

    SteamTotp.generateAuthCode(config.escrow.shared_secret, function (err, code) {
        if (err) {
            console.error("[totp] " + err.stack);
        } else {
            console.log("SteamGuard Code: " + code);
            doSetup(code);
        }
    });
    function doSetup(code) {
        let loginObject = {
            accountName: config.account.username,
            password: config.account.password,
            twoFactorCode: code
        };
        steamUser.logOn(loginObject);
        steamUser.on('webSession', function (sessionID, cookies) {
            console.log("Got webSession: Starting ScrapTF Login");
            scrapTF.setSteamCookies(cookies);
            main()
        });
    };
} else {
    main()
}
function main(){
    scrapTF.logOn().then(() => {
        console.log("Scrap.tf logon complete!")
    }).catch((error) => { console.error(error); });
    scrapTF.weapon_autoScrap().then().catch((error) => { console.error(error); });

}