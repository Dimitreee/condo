/**
 * Generated by `createschema ticket.TicketCommentFile 'organization:Relationship:Organization:CASCADE;file?:File;ticketComment?:Relationship:TicketComment:SET_NULL'`
 */

const { Text, Relationship, Integer, Select, Checkbox, DateTimeUtc, CalendarDay, Decimal, Password, File } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/ticket/access/TicketCommentFile')
const FileAdapter = require('@condo/domains/common/utils/fileAdapter')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')

const TICKET_FILE_FOLDER_NAME = 'ticketComment'
const Adapter = new FileAdapter(TICKET_FILE_FOLDER_NAME)

const TicketCommentFile = new GQLListSchema('TicketCommentFile', {
    schemaDoc: 'File attached to the ticket comment',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,
        organization: ORGANIZATION_OWNED_FIELD,

        file: {
            schemaDoc: 'File object with meta information and publicUrl',
            type: File,
            adapter: Adapter,
        },

        ticketComment: {
            schemaDoc: 'Link to ticket comment',
            type: Relationship,
            ref: 'TicketComment',
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadTicketCommentFiles,
        create: access.canManageTicketCommentFiles,
        update: access.canManageTicketCommentFiles,
        delete: false,
        auth: true,
    },
})

module.exports = {
    TicketCommentFile,
}