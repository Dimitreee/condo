const express = require('express')
const gql = require('graphql-tag')
const { get, set } = require('lodash')

const HIDE_GRAPHQL_VARIABLES_KEYS = ['secret', 'password', 'data.password', 'data.secret']

function normalizeQuery (string) {
    if (!string) return ''
    // NOTE(pahaz): https://spec.graphql.org/June2018/#sec-Insignificant-Commas
    //   Similar to white space and line terminators, commas (,) are used to improve the legibility of source text
    return string.replace(/[\s,]+/g, ' ').trim()
}

function normalizeVariables (object) {
    if (!object) return undefined
    const data = JSON.parse(JSON.stringify(object))
    for (const key of HIDE_GRAPHQL_VARIABLES_KEYS) {
        if (get(data, key)) {
            set(data, key, '***')
        }
    }
    return data
}

class GraphQLLoggerApp {
    prepareMiddleware () {
        const app = express()
        app.use((req, res, next) => {
            const logger = req.log
            if (!logger || !req.url.startsWith('/admin/api')) return next()

            // NOTE(pahaz): taken from ApolloServer code
            const body = req.method === 'POST' ? req.body : req.query
            // NOTE: Skip multipart form requests (ie; when using the Upload type)
            if (!body || !body.query) {
                return next()
            }

            const { variables: rawVariables, query: rawQuery } = body
            const query = normalizeQuery(rawQuery)
            const variables = normalizeVariables(rawVariables)
            const ast = gql(query)

            const graphQLOperations = ast.definitions.map(
                def => `${def.operation} ${def.name ? `${def.name.value} ` : ''}{ .. }`,
            )

            logger.info({ graphQLOperations, graphql: { query, variables } })

            // finally pass requests to the actual graphql endpoint
            next()
        })

        return app
    }
}

module.exports = {
    normalizeQuery,
    GraphQLLoggerApp,
}