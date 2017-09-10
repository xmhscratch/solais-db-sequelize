const Db = require('../../db')
const DbTable = require('./db-table')
const Member = require('./member')
const uuidv4 = require('uuid/v4')

class Group extends DbTable {

    constructor(groupName) {
        super(groupName)
        this.groupName = groupName

        return this
            .ensure()
            .thenReturn(this)
    }

    ensure() {
        const { tableName } = this

        return Promise.using(
            this.getDb(),
            super.ensure(),
            (db) => {
                const connection = db.getConnection()

                return db.addSchema('_members', () => {
                    const MemberSchema = this.getMemberSchema(connection)

                    MemberSchema.sync()
                    return MemberSchema
                })
            }
        )
    }

    getDb() {
        const { groupName } = this

        if (this._db) {
            return this._db
        }

        this._db = Db
            .connect(`${groupName}`)
            .load('./schema')

        return this._db
    }

    getMemberSchema(connection) {
        const SchemaModel = connection.define('_members', {
            id: {
                type: Db.Sequelize.UUID,
                defaultValue: Db.Sequelize.UUIDV4,
                primaryKey: true
            },
            // db_user: '',
            // db_pass: '',
            // db_hostname: '',
        }, {
            timestamps: true,
            paranoid: true,
            underscored: true,
            freezeTableName: true,
            tableName: '_members'
        })

        return SchemaModel
    }

    createMember() {
        const { groupName } = this

        return this.getDb()
            .then((db) => {
                const Members = db.tables._members
                return Members.create()
            }).then((memberModel) => {
                const tenantId = memberModel.get('id')
                return new Member(tenantId, groupName)
            })
    }

    removeMember(tenantId) {
        const { groupName } = this

        return this.getMember()
            .then((member) => {
                if (!member) return
                return member.drop()
            })
    }

    getMember(tenantId) {
        const { groupName } = this
        const tableName = Member.getTableName(tenantId, groupName)

        return this
            .getDb()
            .then((db) => {
                return db.hasTable(tableName)
            })
            .then((isExist) => {
                if (!isExist) {
                    return
                }
                return new Member(tenantId, groupName)
            })
    }
}

module.exports = Group
