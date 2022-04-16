/**
 * Generated by `createservice resident.RegisterMultipleServiceConsumersService --type mutations`
 */

const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObjects } = require('@condo/domains/common/utils/testSchema')

const { registerMultipleConsumersServiceByTestClient } = require('@condo/domains/resident/utils/testSchema')
 
describe('RegisterMultipleServiceConsumersService', () => {
    test('user: execute', async () => {
        const client = await makeClient()  // TODO(codegen): use truly useful client!
        const payload = {}  // TODO(codegen): change the 'user: update RegisterMultipleServiceConsumersService' payload
        const [data, attrs] = await registerMultipleConsumersServiceByTestClient(client, payload)
        // TODO(codegen): write user expect logic
        throw new Error('Not implemented yet')
    })
 
    test('anonymous: execute', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationErrorToObjects(async () => {
            await registerMultipleConsumersServiceByTestClient(client)
        })
    })
 
    test('admin: execute', async () => {
        const admin = await makeLoggedInAdminClient()
        const payload = {}  // TODO(codegen): change the 'user: update RegisterMultipleServiceConsumersService' payload
        const [data, attrs] = await registerMultipleConsumersServiceByTestClient(admin, payload)
        // TODO(codegen): write admin expect logic
        throw new Error('Not implemented yet')
    })
})