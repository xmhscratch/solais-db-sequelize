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

    static get Tenancy() {
        return require('./tenancy')
    }

    constructor() {
        super()
    }

    initialize(done) {
        return done()
    }
}

module.exports = Orm
