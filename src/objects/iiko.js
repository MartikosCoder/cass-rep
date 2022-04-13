const { getToken, releaseToken } = require("../iiko/token");
const { getBranches } = require("../iiko/getBranches");
const { getCategories } = require("../iiko/getCategories");
const { getRepo } = require("../iiko/getRepo");
const { iikoLogin, iikoPassword, iikoServer } = require("../consts/iiko");

class Iiko {

    async getToken() {
        this.token = await getToken(iikoServer, iikoLogin, iikoPassword);
    }

    async close() {
        await releaseToken(this.token, iikoServer);
    }

    async getBranches() {
        return await getBranches(this.token, iikoServer);
    }

    async getCategories() {
        return await getCategories(this.token, iikoServer);
    }

    async getRepo(lastCheck) {
        return await getRepo(lastCheck, this.token, iikoServer);
    }

    // async getCashiers() {
    //     return await getCashiers(this.token, iikoServer);
    // }
}

module.exports = {
    Iiko
}