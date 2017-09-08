const DbTable = require('./db-table')

class Member extends DbTable {

    get tables() {
        return this.getDb()
    }

    constructor(tenantId, groupName) {
        const tableName = `${groupName}_${tenantId}`

        super(tableName)

        this.tableName = tableName
        this.tenantId = tenantId
        this.groupName = groupName

        return this
    }

    getDb() {
        const { tableName } = this
        const { tenantId, groupName } = this

        return Db
            .connect(tableName)
            .load('./schema/member', true)
    }
}

module.exports = Member
