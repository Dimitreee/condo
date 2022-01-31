/**
 * Generated by `createschema notification.Device 'deviceId:Text; pushToken?:Text; pushTransport?:Select:firebase,apple,huawei; owner?:Relationship:User:SET_NULL; meta?:Json'`
 */

const { Text, Relationship, Select } = require('@keystonejs/fields')

const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')

const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')

const access = require('@condo/domains/notification/access/Device')

const { PUSH_TRANSPORT_TYPES } = require('../constants/constants')

const Device = new GQLListSchema('Device', {
    schemaDoc:  'Used to describe device in order to be able to send push notifications via corresponding transport, depending on pushTransport value. ' +
                'Device could be mobile or web based. ' +
                'Device could be registered (created by user, admin or anonymous) with or without token, and updated later on by admin (or a user within SyncDeviceService) by ' +
                'adding/changing token value and connecting device to user (whose authorization was passed within request). ' +
                'All such interactions should be done via SyncDeviceService.',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        deviceId: {
            schemaDoc: 'Mobile/web device ID, which is used to identify device. One user can have many devices, and one device can be used by many users, one at a time.',
            type: Text,
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false },
        },

        pushToken: {
            schemaDoc: 'Used by transport services (FireBase, Apple, Huawei, etc.) to transfer push notifications to devices.',
            type: Text,
            required: false,
            kmigratorOptions: { unique: true, null: true },
        },

        pushTransport: {
            schemaDoc: 'Transport service, that delivers push notifications to client device. Type of device requires specific transport service, e.g. Huawei devices can not receive notifications through FireBase.',
            type: Select,
            options: PUSH_TRANSPORT_TYPES,
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false },
        },

        owner: {
            schemaDoc: 'Owner user of a device and a push token. User, which is logged in on the device. Push token can be created by anonymous user and connected to authorized user later on.',
            type: Relationship,
            ref: 'User',
            isRequired: false,
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
            knexOptions: { isNotNullable: false }, // token can be crated by anonymous and User could be connected later.
        },

        meta: {
            schemaDoc: 'Device metadata. OS type, OS version, etc.',
            type: Json,
            isRequired: false,
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadDevices,
        create: access.canManageDevices,
        update: access.canManageDevices,
        delete: false,
        auth: true,
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['deviceId', 'pushTransport'],
                name: 'deviceId_pushTransport_unique_context_globalId',
            },
        ],
    },

})

module.exports = {
    Device,
}
