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

    constructor() {
        super()
    }

    initialize(done) {
        return done()
    }
}

module.exports = Orm
