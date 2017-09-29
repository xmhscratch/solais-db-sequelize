const Db = require('../db')
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
            paranoid: false,
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
                const { _members } = db.tables
                return _members.create()
            })
            .then((memberModel) => {
                const tenantId = memberModel.get('id')
                return new Member(tenantId, groupName)
            })
    }

    removeMember(tenantId) {
        const { groupName } = this

        return Promise.using(
            this.getDb(),
            this.getMember(tenantId),
            (db, member) => {
                const { _members } = db.tables
                return _members.destroy({
                    where: { id: tenantId }
                }).then(() => {
                    if (!member) return
                    return member.drop()
                })
            }
        )
    }

    getMember(tenantId) {
        const { groupName } = this
        const tableName = Member.getTableName(tenantId, groupName)

        return this
            .getDb()
            .then((db) => db.hasTable(tableName))
            .then((isExist) => {
                if (!isExist) {
                    return
                }
                return new Member(tenantId, groupName)
            })
    }
}

module.exports = Group
