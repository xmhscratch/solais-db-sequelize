const LRU = require('lru-cache')

class Db extends LRU {

    static get Sequelize() {
        return require('sequelize')
    }

    static connect(dbname = 'tests', username = 'root', password = '', options = {}) {
        return {
            load: (dirPath, isRecursion) => {
                const db = new Db()
                    .createConnection(dbname, username, password, options)
                    .then(() => {
                        return db.import(dirPath, isRecursion)
                    })

                return db
            }
        }
    }

    createConnection(dbname = 'tests', username = 'root', password = '', options = {}) {
        if (this.isConnected()) {
            return this.getConnection().authenticate()
        }

        const connection = new Db.Sequelize(
            _.isUndefined(dbname) ? config('database.name') : dbname,
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
                this._connection = connection
                config('dispatcher.onConnectionEstablish', _.noop)(connection)
            })
            .catch((error) => {
                config('dispatcher.onConnectionError', _.noop)(error, connection)
            })
    }

    import(dirPath, isRecursion = false) {
        const connection = this.getConnection()

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
                    if (!model) return

                    if (this[model.name].options.hasOwnProperty('associate')) {
                        this[model.name].options.associate(results)
                    }
                }, this)

                return done()
            }
        ))(dirPath)
    }

    getConnection() {
        return this._connection
    }

    disconnect() {
        if (this.isConnected()) {
            return this.getConnection().close()
        }
        return false
    }

    isConnected() {
        return this.getConnection() ? true : false
    }

    addSchema(name, defineFunc) {
        const connection = this.getConnection()

        const model = connection.import(
            name, defineFunc
        )
        this.set(model.name, model)
        this[model.name] = this.peek(model.name)

        return this
    }
}

module.exports = Db