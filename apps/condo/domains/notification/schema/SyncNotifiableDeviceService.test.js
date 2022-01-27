// noinspection DuplicatedCode
/**
 * Generated by `createservice notification.SyncNotifiableDeviceService --type mutations`
 */
const faker = require('faker')
const sample = require('lodash/sample')

const { makeLoggedInAdminClient, makeClient, makeLoggedInClient } = require('@core/keystone/test.utils')

const { syncNotifiableDeviceByTestClient } = require('@condo/domains/notification/utils/testSchema')
const { DEVICE_SERVICE_TYPE_KEYS } = require('@condo/domains/notification/constants/constants')

const getRandomTokenData = (extraAttrs = {}) => {
    const serviceType = sample(DEVICE_SERVICE_TYPE_KEYS)

    return {
        deviceId: faker.datatype.uuid(),
        token: faker.datatype.uuid(),
        serviceType,
        meta: { serviceType },
        ...extraAttrs,
    }
}

/**
 * Test cases for Service
 *
 * 1. anonymous/unauthorized (+)
 * 1.1. anonymous: deviceId + serviceType (+)
 *          - register device + serviceType  (+)
 *          - ignore update operation (nothing changed)
 * 1.2. anonymous: deviceId + serviceType + token (+)
 *          - register device & token (+)
 *          - update token of existing device (+)
 * 1.3. anonymous: deviceId + serviceType + token + meta (+)
 *          - register device with token & meta (+)
 *          - update token with meta of existing device (+)
 * 1.4. anonymous: deviceId + serviceType + meta (+)
 *          - register device with meta (+)
 *          - update meta of existing device (either no token or token not changed) (+)
 *
 * 2. user
 * 2.1. user: deviceId + serviceType (+)
 *          - register device & connect user (+)
 *          - connect user to existing device (+)
 *          - reconnect existing device to different user (+)
 * 2.2. user: deviceId + serviceType + token (+)
 *          - register device with token & connect to user (+)
 *          - update token of existing device & connect to user (+)
 *          - update token of existing device & reconnect to different user (+)
 * 2.3. user: deviceId + serviceType + token + meta (+)
 *          - register device with token & meta & connect to user (+)
 *          - update token/meta of existing device & connect to user (+)
 *          - update token/meta of existing device & reconnect to different user (+)
 * 2.4. user: deviceId + serviceType + meta (+)
 *          - register device with meta & connect to user (no token yet) (+)
 *          - update meta of existing device & connect to user (no token yet or not changed) (+)
 *          - update meta of existing device & reconnect to different user (no token yet or not changed) (+)
 *
 * 3. admin - the same with user
 */

describe('SyncNotifiableDeviceService', () => {
    test('anonymous: register deviceId + serviceType + (no token/meta | token | meta | token + meta)', async () => {
        const client = await makeClient()
        const payload = getRandomTokenData({ token: null, meta: null }) // no meta or token
        const payload1 = getRandomTokenData({ meta: null }) // no meta, with token
        const payload2 = getRandomTokenData({ token: null }) // no token, with meta
        const payload3 = getRandomTokenData() // with meta & token

        const [data] = await syncNotifiableDeviceByTestClient(client, payload)

        expect(data.id).not.toBeFalsy()
        expect(data.deviceId).toEqual(payload.deviceId)
        expect(data.serviceType).toEqual(payload.serviceType)
        expect(data.token).toBeNull()
        expect(data.meta).toBeNull()
        expect(data.owner).toBeNull()

        const [data1] = await syncNotifiableDeviceByTestClient(client, payload1)

        expect(data1.id).not.toBeFalsy()
        expect(data1.deviceId).toEqual(payload1.deviceId)
        expect(data1.serviceType).toEqual(payload1.serviceType)
        expect(data1.token).toEqual(payload1.token)
        expect(data1.meta).toBeNull()
        expect(data1.owner).toBeNull()

        const [data2] = await syncNotifiableDeviceByTestClient(client, payload2)

        expect(data2.id).not.toBeFalsy()
        expect(data2.deviceId).toEqual(payload2.deviceId)
        expect(data2.serviceType).toEqual(payload2.serviceType)
        expect(data2.token).toBeNull()
        expect(data2.meta).toEqual(payload2.meta)
        expect(data2.owner).toBeNull()

        const [data3] = await syncNotifiableDeviceByTestClient(client, payload3)

        expect(data3.id).not.toBeFalsy()
        expect(data3.deviceId).toEqual(payload3.deviceId)
        expect(data3.serviceType).toEqual(payload3.serviceType)
        expect(data3.token).toEqual(payload3.token)
        expect(data3.meta).toEqual(payload3.meta)
        expect(data3.owner).toBeNull()

    })

    test('anonymous: register deviceId + serviceType & update token | meta | token + meta', async () => {
        const client = await makeClient()
        const payload = getRandomTokenData({ token: null, meta: null })

        const [data] = await syncNotifiableDeviceByTestClient(client, payload)

        expect(data.id).not.toBeFalsy()
        expect(data.deviceId).toEqual(payload.deviceId)
        expect(data.serviceType).toEqual(payload.serviceType)
        expect(data.token).toBeNull()
        expect(data.meta).toBeNull()
        expect(data.owner).toBeNull()

        const payload1 = {
            deviceId: payload.deviceId,
            serviceType: payload.serviceType,
            token: faker.datatype.uuid(),
        }
        const [data1] = await syncNotifiableDeviceByTestClient(client, payload1)

        expect(data1.id).toEqual(data.id)
        expect(data1.deviceId).toEqual(data.deviceId)
        expect(data1.serviceType).toEqual(payload1.serviceType)
        expect(data1.token).toEqual(payload1.token)
        expect(data1.meta).toBeNull()
        expect(data1.owner).toBeNull()

        const payload2 = {
            deviceId: payload.deviceId,
            serviceType: payload.serviceType,
            meta: { serviceType: payload.serviceType },
        }
        const [data2] = await syncNotifiableDeviceByTestClient(client, payload2)

        expect(data2.id).toEqual(data.id)
        expect(data2.deviceId).toEqual(data.deviceId)
        expect(data2.serviceType).toEqual(payload2.serviceType)
        expect(data2.token).toEqual(payload1.token)
        expect(data2.meta).toEqual(payload2.meta)
        expect(data2.owner).toBeNull()

        const token = faker.datatype.uuid()
        const payload3 = {
            deviceId: payload.deviceId,
            serviceType: payload.serviceType,
            token,
            meta: { serviceType: payload.serviceType, token },
        }
        const [data3] = await syncNotifiableDeviceByTestClient(client, payload3)

        expect(data3.id).toEqual(data.id)
        expect(data3.deviceId).toEqual(data.deviceId)
        expect(data3.serviceType).toEqual(payload3.serviceType)
        expect(data3.token).toEqual(payload3.token)
        expect(data3.meta).toEqual(payload3.meta)
        expect(data3.owner).toBeNull()
    })

    test('anonymous: register deviceId + serviceType & connect to user', async () => {
        const client = await makeClient()
        const user = await makeLoggedInClient()
        const payload = getRandomTokenData({ token: null, meta: null })

        const [data] = await syncNotifiableDeviceByTestClient(client, payload)

        expect(data.id).not.toBeFalsy()
        expect(data.deviceId).toEqual(payload.deviceId)
        expect(data.serviceType).toEqual(payload.serviceType)
        expect(data.token).toBeNull()
        expect(data.meta).toBeNull()
        expect(data.owner).toBeNull()

        const payload1 = {
            deviceId: payload.deviceId,
            serviceType: payload.serviceType,
        }
        const [data1] = await syncNotifiableDeviceByTestClient(user, payload1)

        expect(data1.id).toEqual(data.id)
        expect(data1.deviceId).toEqual(data.deviceId)
        expect(data1.serviceType).toEqual(payload1.serviceType)
        expect(data1.token).toBeNull()
        expect(data1.meta).toBeNull()
        expect(data1.owner).not.toBeNull()
        expect(data1.owner.id).toEqual(user.user.id)
    })

    test('authorized: register deviceId + serviceType & connect to user', async () => {
        const user = await makeLoggedInClient()
        const payload = getRandomTokenData({ token: null, meta: null })

        const [data] = await syncNotifiableDeviceByTestClient(user, payload)

        expect(data.id).not.toBeFalsy()
        expect(data.deviceId).toEqual(payload.deviceId)
        expect(data.serviceType).toEqual(payload.serviceType)
        expect(data.token).toBeNull()
        expect(data.meta).toBeNull()
        expect(data.owner).not.toBeNull()
        expect(data.owner.id).toEqual(user.user.id)
    })

    test('authorized: register deviceId + serviceType & reconnect to different user', async () => {
        const user = await makeLoggedInClient()
        const user1 = await makeLoggedInClient()
        const payload = getRandomTokenData({ token: null, meta: null })

        const [data] = await syncNotifiableDeviceByTestClient(user, payload)

        expect(data.id).not.toBeFalsy()
        expect(data.deviceId).toEqual(payload.deviceId)
        expect(data.serviceType).toEqual(payload.serviceType)
        expect(data.token).toBeNull()
        expect(data.meta).toBeNull()
        expect(data.owner).not.toBeNull()
        expect(data.owner.id).toEqual(user.user.id)

        const payload1 = {
            deviceId: payload.deviceId,
            serviceType: payload.serviceType,
        }
        const [data1] = await syncNotifiableDeviceByTestClient(user1, payload1)

        expect(data1.id).toEqual(data.id)
        expect(data1.deviceId).toEqual(data.deviceId)
        expect(data1.serviceType).toEqual(payload1.serviceType)
        expect(data1.token).toBeNull()
        expect(data1.meta).toBeNull()
        expect(data1.owner).not.toBeNull()
        expect(data1.owner.id).toEqual(user1.user.id)
    })

    test('authorized: register deviceId + serviceType + (token | meta | token + meta) & connect to user', async () => {
        const user = await makeLoggedInClient()
        const payload = getRandomTokenData({ meta: null })
        const payload1 = getRandomTokenData( { token: null })
        const payload2 = getRandomTokenData()

        const [data] = await syncNotifiableDeviceByTestClient(user, payload)

        expect(data.id).not.toBeFalsy()
        expect(data.deviceId).toEqual(payload.deviceId)
        expect(data.serviceType).toEqual(payload.serviceType)
        expect(data.token).toEqual(payload.token)
        expect(data.meta).toBeNull()
        expect(data.owner).not.toBeNull()
        expect(data.owner.id).toEqual(user.user.id)

        const [data1] = await syncNotifiableDeviceByTestClient(user, payload1)

        expect(data1.id).not.toBeFalsy()
        expect(data1.deviceId).toEqual(payload1.deviceId)
        expect(data1.serviceType).toEqual(payload1.serviceType)
        expect(data1.token).toBeNull()
        expect(data1.meta).toEqual(payload1.meta)
        expect(data1.owner).not.toBeNull()
        expect(data1.owner.id).toEqual(user.user.id)

        const [data2] = await syncNotifiableDeviceByTestClient(user, payload2)

        expect(data2.id).not.toBeFalsy()
        expect(data2.deviceId).toEqual(payload2.deviceId)
        expect(data2.serviceType).toEqual(payload2.serviceType)
        expect(data2.token).toEqual(payload2.token)
        expect(data2.meta).toEqual(payload2.meta)
        expect(data2.owner).not.toBeNull()
        expect(data2.owner.id).toEqual(user.user.id)
    })

    test('anonymous: register deviceId + serviceType & update (token | meta | token + meta) + connect to user', async () => {
        const client = await makeClient()
        const user = await makeLoggedInClient()
        const payload = getRandomTokenData({ meta: null, token: null })
        const payload1 = getRandomTokenData({ meta: null, token: null })
        const payload2 = getRandomTokenData({ meta: null, token: null })

        const payload3 = getRandomTokenData( { deviceId: payload.deviceId, serviceType: payload.serviceType, meta: null })
        const payload4 = getRandomTokenData( { deviceId: payload1.deviceId, serviceType: payload1.serviceType, token: null })
        const payload5 = getRandomTokenData( { deviceId: payload2.deviceId, serviceType: payload2.serviceType })

        const [data] = await syncNotifiableDeviceByTestClient(client, payload)

        expect(data.id).not.toBeFalsy()
        expect(data.deviceId).toEqual(payload.deviceId)
        expect(data.serviceType).toEqual(payload.serviceType)
        expect(data.token).toBeNull()
        expect(data.meta).toBeNull()
        expect(data.owner).toBeNull()

        const [data1] = await syncNotifiableDeviceByTestClient(client, payload1)

        expect(data1.id).not.toBeFalsy()
        expect(data1.deviceId).toEqual(payload1.deviceId)
        expect(data1.serviceType).toEqual(payload1.serviceType)
        expect(data1.token).toBeNull()
        expect(data1.meta).toBeNull()
        expect(data1.owner).toBeNull()

        const [data2] = await syncNotifiableDeviceByTestClient(client, payload2)

        expect(data2.id).not.toBeFalsy()
        expect(data2.deviceId).toEqual(payload2.deviceId)
        expect(data2.serviceType).toEqual(payload2.serviceType)
        expect(data2.token).toBeNull()
        expect(data2.meta).toBeNull()
        expect(data2.owner).toBeNull()

        const [data3] = await syncNotifiableDeviceByTestClient(user, payload3)

        expect(data3.id).toEqual(data.id)
        expect(data3.deviceId).toEqual(payload3.deviceId)
        expect(data3.serviceType).toEqual(payload3.serviceType)
        expect(data3.token).toEqual(payload3.token)
        expect(data3.meta).toBeNull()
        expect(data3.owner).not.toBeNull()
        expect(data3.owner.id).toEqual(user.user.id)

        const [data4] = await syncNotifiableDeviceByTestClient(user, payload4)

        expect(data4.id).toEqual(data1.id)
        expect(data4.deviceId).toEqual(payload4.deviceId)
        expect(data4.serviceType).toEqual(payload4.serviceType)
        expect(data4.token).toBeNull()
        expect(data4.meta).toEqual(payload4.meta)
        expect(data4.owner).not.toBeNull()
        expect(data4.owner.id).toEqual(user.user.id)

        const [data5] = await syncNotifiableDeviceByTestClient(user, payload5)

        expect(data5.id).toEqual(data2.id)
        expect(data5.deviceId).toEqual(payload5.deviceId)
        expect(data5.serviceType).toEqual(payload5.serviceType)
        expect(data5.token).toEqual(payload5.token)
        expect(data5.meta).toEqual(payload5.meta)
        expect(data5.owner).not.toBeNull()
        expect(data5.owner.id).toEqual(user.user.id)
    })

    test('authorized: register deviceId + serviceType & update (token | meta | token + meta) + reconnect to different user', async () => {
        const client = await makeLoggedInClient()
        const user = await makeLoggedInClient()
        const payload = getRandomTokenData({ meta: null, token: null })
        const payload1 = getRandomTokenData({ meta: null, token: null })
        const payload2 = getRandomTokenData({ meta: null, token: null })

        const payload3 = getRandomTokenData( { deviceId: payload.deviceId, serviceType: payload.serviceType, meta: null })
        const payload4 = getRandomTokenData( { deviceId: payload1.deviceId, serviceType: payload1.serviceType, token: null })
        const payload5 = getRandomTokenData( { deviceId: payload2.deviceId, serviceType: payload2.serviceType })

        const [data] = await syncNotifiableDeviceByTestClient(client, payload)

        expect(data.id).not.toBeFalsy()
        expect(data.deviceId).toEqual(payload.deviceId)
        expect(data.serviceType).toEqual(payload.serviceType)
        expect(data.token).toBeNull()
        expect(data.meta).toBeNull()
        expect(data.owner).not.toBeNull()
        expect(data.owner.id).toEqual(client.user.id)

        const [data1] = await syncNotifiableDeviceByTestClient(client, payload1)

        expect(data1.id).not.toBeFalsy()
        expect(data1.deviceId).toEqual(payload1.deviceId)
        expect(data1.serviceType).toEqual(payload1.serviceType)
        expect(data1.token).toBeNull()
        expect(data1.meta).toBeNull()
        expect(data1.owner).not.toBeNull()
        expect(data1.owner.id).toEqual(client.user.id)

        const [data2] = await syncNotifiableDeviceByTestClient(client, payload2)

        expect(data2.id).not.toBeFalsy()
        expect(data2.deviceId).toEqual(payload2.deviceId)
        expect(data2.serviceType).toEqual(payload2.serviceType)
        expect(data2.token).toBeNull()
        expect(data2.meta).toBeNull()
        expect(data2.owner).not.toBeNull()
        expect(data2.owner.id).toEqual(client.user.id)

        const [data3] = await syncNotifiableDeviceByTestClient(user, payload3)

        expect(data3.id).toEqual(data.id)
        expect(data3.deviceId).toEqual(payload3.deviceId)
        expect(data3.serviceType).toEqual(payload3.serviceType)
        expect(data3.token).toEqual(payload3.token)
        expect(data3.meta).toBeNull()
        expect(data3.owner).not.toBeNull()
        expect(data3.owner.id).toEqual(user.user.id)

        const [data4] = await syncNotifiableDeviceByTestClient(user, payload4)

        expect(data4.id).toEqual(data1.id)
        expect(data4.deviceId).toEqual(payload4.deviceId)
        expect(data4.serviceType).toEqual(payload4.serviceType)
        expect(data4.token).toBeNull()
        expect(data4.meta).toEqual(payload4.meta)
        expect(data4.owner).not.toBeNull()
        expect(data4.owner.id).toEqual(user.user.id)

        const [data5] = await syncNotifiableDeviceByTestClient(user, payload5)

        expect(data5.id).toEqual(data2.id)
        expect(data5.deviceId).toEqual(payload5.deviceId)
        expect(data5.serviceType).toEqual(payload5.serviceType)
        expect(data5.token).toEqual(payload5.token)
        expect(data5.meta).toEqual(payload5.meta)
        expect(data5.owner).not.toBeNull()
        expect(data5.owner.id).toEqual(user.user.id)
    })
})