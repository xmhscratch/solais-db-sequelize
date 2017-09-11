const DbTable = require('./db-table')

class Member extends DbTable {

    static getTableName(tenantId, groupName) {
        return `${groupName}_${tenantId}`
    }

    get tables() {
        return this.getDb()
    }

    constructor(tenantId, groupName) {
        const tableName = Member.getTableName(tenantId, groupName)

        super(tableName)

        this.tableName = tableName
        this.tenantId = tenantId
        this.groupName = groupName

        return this
            .ensure()
            .thenReturn(this)
    }

    getId() {
        return this.tenantId
    }

    getDb() {
        const { tableName } = this

        return Db
            .connect(tableName)
            .load('./schema/member', true)
    }
}

module.exports = Member
