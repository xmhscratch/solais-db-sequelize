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

    static get SingleTenancy() {
        return require('./single')
    }

    static get MultiTenancy() {
        return require('./multi')
    }

    initialize(done) {
        done()
        return this
    }
}

module.exports = Orm
