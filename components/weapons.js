let ScrapTF = require('../index.js');
let Request = require('request');

ScrapTF.prototype.weapon_autoScrap = function(){
    let self = this;
    return new Promise((resolve, reject) => {
        this._scraptfGenericAPIRequest({
            uri: 'https://scrap.tf/ajax/weapons/AutoScrap'
        }).then(function (response, body) {
            console.log(response)
            return resolve()

        }).catch(function (error) {
            return reject(['E_APICONERROR',error])
        });
    });
};