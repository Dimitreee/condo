const { generators } = require('openid-client') // certified openid client will all checks
const { Issuer } = require('openid-client') // certified openid client will all checks
const express = require('express')
const { isObject } = require('lodash')

const { Keystone } = require('@keystonejs/keystone')
const { GraphQLApp } = require('@keystonejs/app-graphql')
const { AdminUIApp } = require('@keystonejs/app-admin-ui')
const { StaticApp } = require('@keystonejs/app-static')
const { NextApp } = require('@keystonejs/app-next')
const { PasswordAuthStrategy } = require('@keystonejs/auth-password')

const {
    introspectSchema,
    RenameTypes,
    RenameRootFields,
} = require('@graphql-tools/wrap')
const { loadSchema } = require('@graphql-tools/load')
const { graphqlHTTP } = require('express-graphql')
const { stitchSchemas } = require('@graphql-tools/stitch')
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader')
const makeRemoteExecutor = require('./introspection')
const CONDO_URL = 'https://2aed-46-48-110-105.eu.ngrok.io/admin/api'
const APP_URL = 'https://952e-46-48-110-105.eu.ngrok.io/admin/api'
const fs = require('fs')


const conf = require('@core/config')
const { EmptyApp } = require('@core/keystone/test.utils')
const { prepareDefaultKeystoneConfig } = require('@core/keystone/setup.utils')
const { registerSchemas } = require('@core/keystone/KSv5v6/v5/registerSchema')

const { createOrUpdateUser } = require('@miniapp/domains/condo/utils/serverSchema/createOrUpdateUser')
const { createItems } = require('@keystonejs/server-side-graphql-client')
const { formatError } = require('@miniapp/domains/common/utils/apolloErrorFormatter')

const IS_ENABLE_DD_TRACE = conf.NODE_ENV === 'production'
const IS_ENABLE_APOLLO_DEBUG = conf.NODE_ENV === 'development' || conf.NODE_ENV === 'test'

// NOTE: should be disabled in production: https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/
// WARN: https://github.com/graphql/graphql-playground/tree/main/packages/graphql-playground-html/examples/xss-attack
const IS_ENABLE_DANGEROUS_GRAPHQL_PLAYGROUND = conf.ENABLE_DANGEROUS_GRAPHQL_PLAYGROUND === 'true'

const defaultKeystoneConf = prepareDefaultKeystoneConfig(conf)
const { introspectionFromSchema, buildClientSchema } = require('graphql')
const { isEqual } = require('lodash')

const keystone = new Keystone({
    ...defaultKeystoneConf,
    cookie: {
        ...defaultKeystoneConf.cookie,

        // Enable cross-site usage
        sameSite: 'none',
        secure: true,
    },
    onConnect: async () => {
        // Initialise some data
        if (conf.NODE_ENV !== 'development' && conf.NODE_ENV !== 'test') return // Just for dev env purposes!
        // This function can be called before tables are created! (we just ignore this)
        const users = await keystone.lists.User.adapter.findAll()
        if (!users.length) {
            const initialData = require('./initialData')
            for (let { listKey, items } of initialData) {
                console.log(`🗿 createItems(${listKey}) -> ${items.length}`)
                await createItems({
                    keystone,
                    listKey,
                    items,
                })
            }
        }
    },
})

registerSchemas(keystone, [
    require('@miniapp/domains/condo/schema/User'),
])

let authStrategy = keystone.createAuthStrategy({
    type: PasswordAuthStrategy,
    list: 'User',
    config: {
        protectIdentities: true,
    },
})

class OIDCHelper {
    constructor () {
        const oidcClientConfig = conf.OIDC_CONDO_CLIENT_CONFIG
        if (!oidcClientConfig) throw new Error('no OIDC_CONDO_CLIENT_CONFIG env')
        const { serverUrl, clientId, clientSecret, clientOptions, issuerOptions } = JSON.parse(oidcClientConfig)
        if (!serverUrl || !clientId || !clientSecret) throw new Error('no serverUrl or clientId or clientSecret inside OIDC_CONDO_CLIENT_CONFIG env')

        this.redirectUrl = `${conf.SERVER_URL}/oidc/callback`
        this.issuer = new Issuer({
            authorization_endpoint: `${serverUrl}/oidc/auth`,
            token_endpoint: `${serverUrl}/oidc/token`,
            end_session_endpoint: `${serverUrl}/oidc/session/end`,
            jwks_uri: `${serverUrl}/oidc/jwks`,
            revocation_endpoint: `${serverUrl}/oidc/token/revocation`,
            userinfo_endpoint: `${serverUrl}/oidc/me`,
            issuer: serverUrl,
            ...(issuerOptions || {}),
        })
        this.client = new this.issuer.Client({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uris: [this.redirectUrl], // using uri as redirect_uri to show the ID Token contents
            response_types: ['code id_token'],
            token_endpoint_auth_method: 'client_secret_basic',
            ...(clientOptions || {}),
        })
    }

    authorizationUrlWithParams (checks) {
        return this.client.authorizationUrl({
            response_type: 'code',
            ...checks,
        })
    }

    async completeAuth (inputOrReq, checks) {
        const params = this.client.callbackParams(inputOrReq)
        const { access_token } = await this.client.callback(this.redirectUrl, params, checks)
        const userInfo =  await this.client.userinfo(access_token)
        return { access_token, userInfo }
    }
}

class CondoOIDCMiddleware {
    prepareMiddleware () {
        const app = express()
        const oidcSessionKey = 'oidc'
        const helper = new OIDCHelper()
        app.get('/oidc/auth', async (req, res, next) => {
            // nonce: to prevent several callbacks from same request
            // state: to validate user browser on callback
            const checks = { nonce: generators.nonce(), state: generators.state() }
            req.session[oidcSessionKey] = checks
            await req.session.save()
            try {
                const redirectUrl = helper.authorizationUrlWithParams(checks)
                return res.redirect(redirectUrl)
            } catch (error) {
                return next(error)
            }
        })
        app.get('/oidc/callback', async (req, res, next) => {
            try {
                const checks = req.session[oidcSessionKey]
                if (!isObject(checks) || !checks) {
                    return res.status(400).send('ERROR: Invalid nonce and state')
                }

                const { userInfo, access_token } = await helper.completeAuth(req, checks)
                const user = await createOrUpdateUser(keystone, userInfo)
                await keystone._sessionManager.startAuthedSession(req, {
                    item: { id: user.id },
                    list: keystone.lists['User'],
                })


                req.session['condoSID'] = access_token
                delete req.session[oidcSessionKey]
                await req.session.save()

                return res.redirect('/')
            } catch (error) {
                return next(error)
            }
        })
        return app
    }
}

async function makeGatewaySchema () {
    const condoExecutor = makeRemoteExecutor(CONDO_URL)
    const appExecutor = makeRemoteExecutor(APP_URL)
    const bla = await loadSchema('./schema.graphql', {
        loaders: [new GraphQLFileLoader()],
    })
    const intr = introspectionFromSchema(bla)
    const data = JSON.stringify(intr)

    fs.writeFileSync('./schema.json', data)
    const schema = buildClientSchema(intr)
    console.log(bla)
    console.log(schema)
    console.log(isEqual(bla, schema))

    return stitchSchemas({
        subschemas: [
            {
                schema: bla,
                executor: appExecutor,
                transforms: [
                    new RenameTypes((name) => `App${name}`),
                    new RenameRootFields((op, name) => `app${name.charAt(0).toUpperCase()}${name.slice(1)}`),
                ],
            },
            {
                schema: await introspectSchema(condoExecutor),
                executor: condoExecutor,
            },
        ],
    })
}

class MergeSchemasMiddleware {
    async prepareMiddleware () {
        const schema = await makeGatewaySchema()
        const app = express()
        app.use('/graphql', graphqlHTTP((req) => {
            return {
                schema,
                // NOTE: Extract 2 tokens here and pass something like condoAuthToken and appAuthToken
                context: { authHeader: req.headers.authorization, condoAuth: req.session.condoSID },
                graphiql: true,
            }
        }))
        return app
    }
}

module.exports = {
    keystone,
    apps: [
        new CondoOIDCMiddleware(),
        new GraphQLApp({
            apollo: {
                formatError,
                debug: IS_ENABLE_APOLLO_DEBUG,
                introspection: true,
                playground: IS_ENABLE_DANGEROUS_GRAPHQL_PLAYGROUND,
            },
        }),
        new StaticApp({ path: conf.MEDIA_URL, src: conf.MEDIA_ROOT }),
        new AdminUIApp({
            adminPath: '/admin',
            isAccessAllowed: ({ authentication: { item: user } }) => Boolean(user && (user.isAdmin || user.isSupport)),
            authStrategy,
        }),
        new MergeSchemasMiddleware(),
        conf.NODE_ENV === 'test' ? new EmptyApp() : new NextApp({ dir: '.' }),
    ],
    configureExpress: (app) => {
        app.set('trust proxy', 1) // trust first proxy
    },
}
