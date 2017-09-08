const Db = require('../db')

class SingleTenancy {
    constructor(tenantName) {
        return new Db().connect(tenantName)
    }
}

module.exports = SingleTenancy
