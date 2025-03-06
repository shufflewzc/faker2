'use strict';

const got = require('got');
require('dotenv').config();
const { readFile } = require('fs/promises');
const path = require('path');

const qlDir = '/ql';
const fs = require('fs');

const api = got.extend({
  prefixUrl: 'http://127.0.0.1:5600',
  retry: { limit: 0 },
  responseType: 'json'
});

global.versionPromise = null;
module.exports.getVersion = () => {
  return api({
    url: 'api/system',
    headers: {
      Accept: 'application/json',
    },
  }).then(response => {
    return response.body.data.version;
  }).catch(error => {
    console.error('Error fetching version:', error.response ? error.response.body : error.message);
    throw error;
  });
};

let authFile = "";

(function initialize() {
  global.versionPromise = module.exports.getVersion();
  global.versionPromise.then(version => {
    console.log('当前青龙版本：', version + "\n");
    if (version) {
      if (version >= '2.18.0') {
        authFile = "/ql/data/db/keyv.sqlite";
      } else if (version < '2.12.0') {
        authFile = "/ql/config/auth.json";
      } else {
        authFile = "/ql/data/config/auth.json";
      }
    } else {
      // 当检测不到版本号时，采用 version < '2.12.0' 的操作
      authFile = "/ql/config/auth.json";
    }
  }).catch(error => {
    console.error('Error after initialization:', error);
  });
})();

async function getAuthFile() {
  await global.versionPromise;
  return authFile;

}

async function getTokenFromSqlite(dbPath) {
  const sqlite3 = require('sqlite3').verbose();
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        return reject(err);
      }
      db.serialize(() => {
        db.get('SELECT value FROM keyv WHERE key = ?', ['keyv:authInfo'], (err, row) => {
          if (err) {
            db.close((closeErr) => {
              if (closeErr) {
                console.error('Error closing database:', closeErr);
              }
              reject(err);
            });
            return;
          }

          let token = null;
          if (row && row.value) {
            try {
              const parsedData = JSON.parse(row.value);
              token = parsedData.value.token;
            } catch (parseErr) {
              console.error('Error parsing JSON:', parseErr);
              reject(parseErr);
              return;
            }
          }

          resolve(token);

          db.close((closeErr) => {
            if (closeErr) {
              console.error('Error closing database:', closeErr);
            }
          });
        });
      });
    });
  });
}

async function getToken() {
  const authFilePath = await getAuthFile();
  if (authFilePath.endsWith('keyv.sqlite')) {
    return getTokenFromSqlite(authFilePath);
  } else {
    const authConfig = JSON.parse(await readFile(authFilePath));
    return authConfig.token;
  }
}

module.exports.getEnvs = async () => {
  const token = await getToken();
  const body = await api({
    url: 'api/envs',
    searchParams: {
      searchValue: 'JD_COOKIE',
      t: Date.now(),
    },
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
  }).json();
  return body.data;
};

module.exports.getEnvsCount = async () => {
  const data = await this.getEnvs();
  return data.length;
};

module.exports.addEnv = async (cookie, remarks) => {
  const token = await getToken();
  const body = await api({
    method: 'post',
    url: 'api/envs',
    params: { t: Date.now() },
    json: [{
      name: 'JD_COOKIE',
      value: cookie,
      remarks,
    }],
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  }).json();
  return body;
};

module.exports.updateEnv = async (cookie, eid, remarks) => {
  const token = await getToken();
  const body = await api({
    method: 'put',
    url: 'api/envs',
    params: { t: Date.now() },
    json: {
      name: 'JD_COOKIE',
      value: cookie,
      _id: eid,
      remarks,
    },
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  }).json();
  return body;
};

module.exports.updateEnv11 = async (cookie, eid, remarks) => {
  const token = await getToken();
  const body = await api({
    method: 'put',
    url: 'api/envs',
    params: { t: Date.now() },
    json: {
      name: 'JD_COOKIE',
      value: cookie,
      id: eid,
      remarks,
    },
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  }).json();
  return body;
};

module.exports.DisableCk = async (eid) => {
  const token = await getToken();
  const body = await api({
    method: 'put',
    url: 'api/envs/disable',
    params: { t: Date.now() },
    body: JSON.stringify([eid]),
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  }).json();
  return body;
};

module.exports.EnableCk = async (eid) => {
  const token = await getToken();
  const body = await api({
    method: 'put',
    url: 'api/envs/enable',
    params: { t: Date.now() },
    body: JSON.stringify([eid]),
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  }).json();
  return body;
};

module.exports.getstatus = async (eid) => {
  const envs = await this.getEnvs();
  var tempid = 0;
  for (let i = 0; i < envs.length; i++) {
    tempid = 0;
    if (envs[i]._id) {
      tempid = envs[i]._id;
    }
    if (envs[i].id) {
      tempid = envs[i].id;
    }
    if (tempid == eid) {
      return envs[i].status;
    }
  }
  return 99;
};

module.exports.getEnvById = async (eid) => {
  const envs = await this.getEnvs();
  var tempid = 0;
  for (let i = 0; i < envs.length; i++) {
    tempid = 0;
    if (envs[i]._id) {
      tempid = envs[i]._id;
    }
    if (envs[i].id) {
      tempid = envs[i].id;
    }
    if (tempid == eid) {
      return envs[i].value;
    }
  }
  return "";
};

module.exports.getEnvByPtPin = async (Ptpin) => {
  const envs = await this.getEnvs();
  for (let i = 0; i < envs.length; i++) {
    var tempptpin = decodeURIComponent(envs[i].value.match(/pt_pin=([^; ]+)(?=;?)/) && envs[i].value.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    if (tempptpin == Ptpin) {
      return envs[i];
    }
  }
  return "";
};

module.exports.delEnv = async (eid) => {
  const token = await getToken();
  const body = await api({
    method: 'delete',
    url: 'api/envs',
    params: { t: Date.now() },
    body: JSON.stringify([eid]),
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  }).json();
  return body;
};
