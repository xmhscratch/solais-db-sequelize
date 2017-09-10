class Orm extends System.Module {

    static get $ID() {
        return 'orm'
    }

    static get Sequelize() {
        return require('sequelize')
    }

    static get Db() {
        return require('./db')
    }

    static get MultiTenancy() {
        return require('./tenancy/multi')
    }

    constructor() {
        super()
    }

    initialize(done) {
        return done()
    }
}

module.exports = Orm
