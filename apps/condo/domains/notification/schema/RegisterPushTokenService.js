/**
 * Generated by `createservice notification.RegisterPushTokenService --type mutations`
 */

const get = require('lodash/get')

const { GQLCustomSchema } = require('@core/keystone/schema')

const { PushToken: PushTokenAPI } = require('@condo/domains/notification/utils/serverSchema')
const access = require('@condo/domains/notification/access/RegisterPushTokenService')

const RegisterPushTokenService = new GQLCustomSchema('RegisterPushTokenService', {
    types: [
        {
            access: true,
            type: 'input RegisterPushTokenInput { dv: Int!, sender: SenderFieldInput!, deviceId: String!, token: String!, serviceType: String! }',
        },
        {
            access: true,
            type: 'type RegisterPushTokenOutput { id: String!, deviceId: String!, token: String!, serviceType: String!, owner: User }',
        },
    ],

    mutations: [
        {
            access: access.canRegisterPushToken,
            schema: 'registerPushToken(data: RegisterPushTokenInput!): RegisterPushTokenOutput',
            resolver: async (parent, args, context) => {
                const { data: { dv, sender, deviceId, token, serviceType } } = args
                const userId = get(context, 'authedItem.id', null)
                const attrs = {
                    dv,
                    sender,
                    deviceId,
                    token,
                    serviceType,
                    owner: userId ? { disconnectAll: true, connect: { id: userId } } : null,
                }
                const [existingToken] = await PushTokenAPI.getFirst(context, { deviceId, serviceType })

                const tokenData = existingToken
                    ? await PushTokenAPI.update(context, existingToken.id, attrs)
                    : await PushTokenAPI.create(context, attrs)

                return tokenData
            },
        },
    ],

})

module.exports = {
    RegisterPushTokenService,
}
