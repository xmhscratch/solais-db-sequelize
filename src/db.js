const LRU = require('lru-cache')

class Db extends LRU {

    static get Sequelize() {
        return require('sequelize')
    }

    constructor() {
        super()
    }

    connect(dbname = 'tests', username = 'root', password = '', options = {}) {
        const connection = new Db.Sequelize(
            dbname || config('database.name'),
            username || config('database.username', 'root'),
            password || config('database.password', ''),
            // sequelize options
            _.defaultsDeep(options, {
                dialect: config('database.dialect', 'mysql'),
                // dialectModulePath: 'mysql',
                host: config('database.host', '127.0.0.1'),
                port: config('database.port', 3306),
                pool: {
                    max: config('database.pool.max', 5),
                    min: config('database.pool.min', 0),
                    idle: config('database.pool.idle', 10000)
                },
                dialectOptions: {
                    charset: config('database.charset', 'utf8mb4')
                },
                define: {
                    charset: config('database.charset', 'utf8mb4'),
                    collate: config('database.collate', 'utf8mb4_unicode_ci')
                },
                logging: false
            })
        )

        return connection
            .authenticate()
            .then(() => {
                this.connection = connection
                config('dispatcher.onConnectionEstablish', _.noop)(connection)
            })
            .catch((error) => {
                config('dispatcher.onConnectionError', _.noop)(error, connection)
            })
    }

    disconnect() {
        if (this.isConnected()) {
            return this.connection.close()
        }
        return false
    }

    isConnected() {
        const { connection } = this
        return connection ? true : false
    }

    import(dirPath, isRecursion = false) {
        const { connection } = this

        return Promise.promisify((dirPath, done) => async.map(
            fs(dirPath).getItems(
                false, !isRecursion ? { deep: 1 } : null
            ),
            (filePaths, callback) => {
                _.castArray(filePaths)
                    .filter((filePath) => {
                        return filePath.indexOf('.') !== 0
                    })
                    .forEach((filePath) => {
                        const model = connection.import(filePath)

                        this.set(model.name, model)
                        this[model.name] = this.peek(model.name)
                        return callback(null, model)
                    })
            }, (error, results) => {
                _.forEach(results, (model) => {
                    if (this[model.name].options.hasOwnProperty('associate')) {
                        this[model.name].options.associate(results)
                    }
                }, this)

                return done()
            }
        ))(dirPath)
    }

    addSchema(name, defineFunc) {
        const { connection } = this

        const model = connection.import(
            name, defineFunc
        )
        this.set(model.name, model)
        this[model.name] = this.peek(model.name)

        return this
    }
}

module.exports = Db
