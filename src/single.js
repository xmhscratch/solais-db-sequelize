const Db = require('./db')
const DbTable = require('./tenancy/db-table')

class SingleTenancy {

    get tables() {
        return this._tables || {}
    }

    constructor() {
        this._initialized = false
        return this
    }

    initialize(tableName) {
        this.tableName = tableName

        return new DbTable(tableName)
            .ensure()
            .then((dbTable) => {
                return dbTable.getDb()
            })
            .then((db) => {
                this._tables = db.Tables
                this._initialized = true
                return this
            })
            .thenReturn(this)
    }
}

module.exports = SingleTenancy
