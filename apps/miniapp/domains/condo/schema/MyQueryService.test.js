/**
 * Generated by `createservice condo.MyQueryService --type queries`
 */

const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObjects } = require('@condo/domains/common/utils/testSchema')

const { myQueryByTestClient } = require('@condo/domains/condo/utils/testSchema')
 
describe('MyQueryService', () => {
    test('user: execute', async () => {
        const client = await makeClient()  // TODO(codegen): use truly useful client!
        const payload = {}  // TODO(codegen): change the 'user: update MyQueryService' payload
        const [data, attrs] = await myQueryByTestClient(client, payload)
        // TODO(codegen): write user expect logic
        throw new Error('Not implemented yet')
    })
 
    test('anonymous: execute', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationErrorToObjects(async () => {
            await myQueryByTestClient(client)
        })
    })
 
    test('admin: execute', async () => {
        const admin = await makeLoggedInAdminClient()
        const payload = {}  // TODO(codegen): change the 'user: update MyQueryService' payload
        const [data, attrs] = await myQueryByTestClient(admin, payload)
        // TODO(codegen): write admin expect logic
        throw new Error('Not implemented yet')
    })
})