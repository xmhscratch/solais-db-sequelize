const Db = require('../db')

class DbTable {

    constructor(tableName) {
        this.db = new Db()
        this.tableName = tableName

        return this
    }

    ensure() {
        const { tableName } = this

        return Promise.using(
            this.db.createConnection(null),
            (connection) => {
                return connection.query(`CREATE DATABASE IF NOT EXISTS \`${tableName}\` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;`)
            }
        )
    }

    drop() {
        const { tableName } = this

        return Promise.using(
            this.db.createConnection(null),
            (connection) => {
                return connection.query(`DROP DATABASE IF EXISTS \`${tableName}\`;`)
            }
        )
    }
}

module.exports = DbTable
