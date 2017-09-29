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
            .then((dbTable) => dbTable.getDb())
            .then((db) => {
                this._tables = db.tables
                this._initialized = true

                return this
            })
    }
}

module.exports = SingleTenancy
