const path = require('path')
const conf = require('@core/config')
const { GraphQLApp } = require('@keystonejs/app-graphql')
const { getOrganizationAccessToken } = require('./accessToken')
const { SbbolRequestApi } = require('./SbbolRequestApi')
const { Organization, TokenSet } = require('@condo/domains/organization/utils/serverSchema')
const { SBBOL_IMPORT_NAME } = require('./common')

const SBBOL_FINTECH_CONFIG = conf.SBBOL_FINTECH_CONFIG ? JSON.parse(conf.SBBOL_FINTECH_CONFIG) : {}
const SBBOL_PFX = conf.SBBOL_PFX ? JSON.parse(conf.SBBOL_PFX) : {}

class SbbolCredentials {

    context = null

    async connect () {
        const resolved = path.resolve('./index.js')
        const { distDir, keystone, apps } = require(resolved)
        const graphqlIndex = apps.findIndex(app => app instanceof GraphQLApp)
        // we need only apollo
        await keystone.prepare({ apps: [apps[graphqlIndex]], distDir, dev: true })
        await keystone.connect()
        this.context = await keystone.createContext({ skipAccessControl: true })
    }

    async getAccessToken () {
        // `service_organization_hashOrgId` is a `userInfo.HashOrgId` from SBBOL, that used to obtain accessToken
        // for organization, that will be queried in SBBOL using `SbbolFintechApi`.
        const result = await getOrganizationAccessToken(SBBOL_FINTECH_CONFIG.service_organization_hashOrgId)
        return result
    }

    async refreshClientSecret ({ clientId, clientSecret }) {
        const { accessToken, tokenSet } = this.getAccessToken()
        const requestApi = new SbbolRequestApi({
            accessToken,
            host: SBBOL_FINTECH_CONFIG.host,
            port: SBBOL_FINTECH_CONFIG.port,
            certificate: SBBOL_PFX.certificate,
            passphrase: SBBOL_PFX.passphrase,
        })

        const { data, statusCode } = await requestApi.request({
            method: 'GET',
            path: 'ic/sso/api/v1/change-client-secret',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                client_id: clientId,
                client_secret: clientSecret,
            },
        })
        if (statusCode !== 200) {
            throw new Error('Something went wrong')
        } else {
            if (data) {
                let jsonData
                try {
                    jsonData = JSON.parse(data)
                    const { new_client_secret } = jsonData
                    if (!new_client_secret) {
                        throw new Error('New client secret is not obtained from SBBOL')
                    }
                    await TokenSet.update(this.context, tokenSet.id, {
                        clientSecret: new_client_secret,
                    })
                } catch (e) {
                    throw new Error('Unable to parse response as JSON')
                }
            }
        }
    }

    async refreshAllTokens () {
        // we need to refresh all tokens once per month
        const organizations = await Organization.getAll(this.context, { importRemoteSystem: SBBOL_IMPORT_NAME })
        await Promise.all(organizations.map(async organization => {
            console.log('Updating tokens for ', organization.name)
            try {
                await getOrganizationAccessToken(organization.importId)
            } catch (error) {
                console.log(error)
            }
        }))
    }
}

module.exports = {
    SbbolCredentials,
}