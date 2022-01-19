/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')

const { getRandomString, getRandomItem } = require('@core/keystone/test.utils')

const { generateGQLTestUtils, throwIfError } = require('@condo/domains/common/utils/codegeneration/generate.test.utils')

const {
    Message: MessageGQL,
    SEND_MESSAGE, RESEND_MESSAGE,
    PushToken: PushTokenGQL,
} = require('@condo/domains/notification/gql')
const { REGISTER_PUSH_TOKEN_MUTATION } = require('@condo/domains/notification/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const { INVITE_NEW_EMPLOYEE_MESSAGE_TYPE, DEVICE_SERVICE_TYPES_KEYS } = require('@condo/domains/notification/constants')

const Message = generateGQLTestUtils(MessageGQL)
const PushToken = generateGQLTestUtils(PushTokenGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestMessage (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const email = ('test1.' + getRandomString() + '@example.com').toLowerCase()
    const type = INVITE_NEW_EMPLOYEE_MESSAGE_TYPE
    const meta = { dv: 1, name: faker.random.alphaNumeric(8) }
    const lang = 'en'

    const attrs = {
        dv: 1,
        sender,
        email, type, meta, lang,
        ...extraAttrs,
    }
    const obj = await Message.create(client, attrs)
    return [obj, attrs]
}

async function updateTestMessage (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await Message.update(client, id, attrs)
    return [obj, attrs]
}

async function sendMessageByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const type = INVITE_NEW_EMPLOYEE_MESSAGE_TYPE
    const meta = { dv: 1, inviteCode: faker.random.alphaNumeric(8) }
    const to = { 'email': ('test.' + getRandomString() + '@example.com').toLowerCase() }
    if (client.user && client.user.id) {
        to.user = { id: client.user.id }
    }

    const attrs = {
        dv: 1,
        sender,
        to, type, meta,
        lang: 'en',
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(SEND_MESSAGE, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function resendMessageByTestClient (client, message, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!message) throw new Error('no message')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        message: { id: message.id },
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(RESEND_MESSAGE, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function createTestPushToken (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const deviceId = faker.random.uuid()
    const token = faker.random.uuid()
    const serviceType = getRandomItem(DEVICE_SERVICE_TYPES_KEYS)

    const attrs = {
        dv: 1,
        sender,
        deviceId, token, serviceType,
        ...extraAttrs,
    }
    const obj = await PushToken.create(client, attrs)

    return [obj, attrs]
}

async function updateTestPushToken (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestPushToken logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await PushToken.update(client, id, attrs)
    return [obj, attrs]
}

async function registerPushTokenByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(REGISTER_PUSH_TOKEN_MUTATION, { data: attrs })

    console.log('registerPushTokenByTestClient:', { attrs, data, errors })

    throwIfError(data, errors)

    return [data.result, attrs]
}
/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    Message,
    createTestMessage, updateTestMessage, sendMessageByTestClient, resendMessageByTestClient,
    PushToken,
    createTestPushToken, updateTestPushToken,
    registerPushTokenByTestClient,
/* AUTOGENERATE MARKER <EXPORTS> */
}
