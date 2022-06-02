const { getToken, releaseToken } = require("../iiko/token");
const { getBranches } = require("../iiko/getBranches");
const { getCategories } = require("../iiko/getCategories");
const { getRepo } = require("../iiko/getRepo");
const { iikoLogin, iikoPassword, iikoServer } = require("../consts/iiko");
const crypto = require('crypto');
const fs = require('fs');
const {getFilters} = require("../iiko/getFilters");

const getHashedPassword = (password) => {
    const sha1 = crypto.createHash('sha1');
    const hash = sha1.update(password).digest('hex');
    return hash;
}

class Iiko {
    constructor() {
        this.server = iikoServer;
        this.login = iikoLogin;
        this.password = iikoPassword;
    }

    async getToken() {
        this.token = await getToken(this.server, this.login, this.password);
        const date = new Date();
        let str = date.toString() + ' get token: ' + this.token + '\n';
        fs.appendFile('iiko.log', str, (err) => {
            if (err) throw err;
        })
    }

    async close() {
        await releaseToken(this.token, this.server);
        const date = new Date();
        let str = date.toString() + ' release token: ' + this.token + '\n';
        fs.appendFile('iiko.log', str, (err) => {
            if (err) throw err;
        })
        this.token = null;
    }

    async getBranches() {
        return await getBranches(this.token, this.server);
    }

    async getCategories() {
        return await getCategories(this.token, this.server);
    }

    async getRepo(startDate, endDate, filter, department) {
        return await getRepo(startDate, endDate, filter, department, this.token, this.server);
    }

    async getFilters() {
        return await getFilters(this.token, this.server);
    }

    update(server, login, password) {
        this.server = server;
        this.login = login;
        this.password = getHashedPassword(password);
    }

    getAuthData() {
        return {
            server: this.server,
            login: this.login,
            password: 'XXXXXXXXXXXXXX'
        }
    }

    async testConnect() {
        await this.getToken();
        if (this.token) {
            await this.close();
            return true;
        } else {
            return false;
        }
    }
}

module.exports = {
    Iiko
}