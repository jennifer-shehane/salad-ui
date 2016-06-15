'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fetchMethods = require('./fetch-methods');

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SSO = function () {
  function SSO() {
    _classCallCheck(this, SSO);
  }

  _createClass(SSO, null, [{
    key: 'init',
    value: function init(sdx) {
      var apiEndpoint = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      if (!apiEndpoint) SSO.apiEndpoint = 'https://sso.dailymotion.com';else SSO.apiEndpoint = apiEndpoint;

      SSO.sdx = sdx;
    }
  }, {
    key: 'setApiEndpoint',
    value: function setApiEndpoint(apiEndpoint) {
      SSO.apiEndpoint = apiEndpoint;
    }
  }, {
    key: 'setSDX',
    value: function setSDX(sdx) {
      SSO.sdx = sdx;
    }
  }, {
    key: 'setUserId',
    value: function setUserId(userId) {
      SSO.userId = userId;
    }
  }, {
    key: 'getJWTKey',
    value: function getJWTKey(service, accountId) {
      return 'JWT__' + service + '_' + (accountId || SSO.userId);
    }
  }, {
    key: 'getJWT',
    value: function getJWT(service, accountId) {
      var ignoreCache = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
      var d = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

      if (!SSO.sdx) console.warn('SSO initialized without sdx');

      var JWTKey = SSO.getJWTKey(service, accountId),
          localJWT = localStorage.getItem(JWTKey),
          nextTry = 0;

      SSO.debug && console.log('SSO GET', service, accountId);

      d = d || _q2.default.defer();

      SSO.jwtfailures[JWTKey] = SSO.jwtfailures[JWTKey] || 0;

      if (!ignoreCache && localJWT && SSO.isJWTValid(localJWT)) d.resolve(localJWT);

      SSO.getSSOAccount(service, accountId).then(function (account) {
        if (!account || !account.access_token) return d.reject('NO_ACCOUNT');
        localStorage.setItem(JWTKey, account.access_token);
        return d.resolve(account.access_token);
      }).catch(function (err) {
        if (err === 'NO_ACCOUNT') return d.reject(err);
        SSO.jwtfailures[JWTKey]++;
        if (SSO.jwtfailures[JWTKey] >= SSO.JWTRetries) return d.reject(err);

        nextTry = Math.round(4000 + SSO.jwtfailures[JWTKey] * (SSO.jwtfailures[JWTKey] / 4 + 1) * 1000);

        console.error('Failed to get SSO account for ' + service + '... launching retry in ' + nextTry / 1000 + 'sec');

        setTimeout(function () {
          SSO.getJWT(service, accountId, ignoreCache).then(function (token) {
            return d.resolve(token);
          }).catch(function (err) {
            return d.reject(err);
          });
        }, nextTry);
      });
      return d.promise;
    }
  }, {
    key: 'readJWT',
    value: function readJWT(token, part) {
      if (!token || typeof token !== 'string' || token.split('.').length < 2) return null;
      return JSON.parse(atob(token.split('.')[1]));
    }
  }, {
    key: 'isJWTValid',
    value: function isJWTValid(token) {
      var tokenData = SSO.readJWT(token);
      if (!tokenData) return false;
      return tokenData.exp + 60 > new Date().getTime() / 1000;
    }
  }, {
    key: 'getJWTAccountId',
    value: function getJWTAccountId(token) {
      return SSO.readJWT(token).sub;
    }
  }, {
    key: 'getSSOAccount',
    value: function getSSOAccount(service, accountId) {
      return SSO.getSSOAccounts(service).then(function (accounts) {
        return SSO.matchSSOAccount(accounts, accountId);
      });
    }
  }, {
    key: 'getSSOAccounts',
    value: function getSSOAccounts(service) {
      return (0, _fetchMethods.fetchJSON)(SSO.apiEndpoint + '/services/' + service + '/auth?sdx=' + SSO.sdx).then(function (data) {
        if (!data.accounts || data.accounts.length === 0) throw new Error('NO_ACCOUNT');else return data.accounts;
      }).catch(function (err) {
        throw new Error('Failed to retrieve SSO account', err);
      });
    }
  }, {
    key: 'deleteSSOAccount',
    value: function deleteSSOAccount(service, accountId) {
      return (0, _fetchMethods.fetchJSON)(SSO.apiEndpoint + '/services/' + service + '/accounts/' + accountId + '?sdx=' + SSO.sdx, 'DELETE').catch(function (err) {
        throw new Error('Failed to delete SSO account', res);
      });
    }
  }, {
    key: 'matchSSOAccount',
    value: function matchSSOAccount(accounts, accountId) {
      var account = void 0;
      if (accountId) account = accounts.find(function (acc) {
        return acc.id === accountId;
      });
      if (!account && accounts.length > 0) {
        account = accounts.pop();
        console.warn('Could not find an exact SSO account match for that accountId - ', accountId);
      }
      return account;
    }
  }, {
    key: 'createSSOAccount',
    value: function createSSOAccount(service, accountName) {
      return (0, _fetchMethods.fetchJSON)(SSO.apiEndpoint + '/services/' + service + '/accounts?sdx=' + SSO.sdx, 'POST', { name: accountName }).then(function (SSOAccount) {
        // @TODO: if SSO API implements this and returns token, uncomment the following and save 1 GET request.
        // SSO.SSOAccounts[service] = SSOAccount;
        // d.resolve(SSOAccount);
        return SSO.getSSOAccount(service, SSOAccount.item.id);
      });
    }
  }]);

  return SSO;
}();

SSO.apiEndpoint = 'https://sso.dailymotion.com';
SSO.sdx = null;
SSO.debug = true;
SSO.userId = null;
SSO.jwtfailures = {};
SSO.JWTRetries = 1;
exports.default = SSO;