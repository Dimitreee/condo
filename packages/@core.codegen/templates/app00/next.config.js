const conf = require('@core/config')
const withLess = require('@zeit/next-less')
const withCSS = require('@zeit/next-css')
// Tell webpack to compile the "@core/next" package, necessary
// https://www.npmjs.com/package/next-transpile-modules
// NOTE: FormTable require rc-table module
const withTM = require('next-transpile-modules')(['@core/next', '@app/condo', '@{{name}}/domains', 'rc-table'])

const serverUrl = conf['SERVER_URL']
const apolloGraphQLUrl = `${serverUrl}/admin/api`

module.exports = withTM(withLess(withCSS({
    publicRuntimeConfig: {
        // Will be available on both server and client
        serverUrl,
        apolloGraphQLUrl,
    },
    lessLoaderOptions: {
        javascriptEnabled: true,
    },
})))
