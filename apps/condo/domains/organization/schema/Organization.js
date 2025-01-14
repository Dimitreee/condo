/**
 * Generated by `createschema organization.Organization 'country:Select:ru,en; name:Text; description?:Text; avatar?:File; meta:Json; employees:Relationship:OrganizationEmployee:CASCADE; statusTransitions:Json; defaultEmployeeRoleStatusTransitions:Json' --force`
 */

const get = require('lodash/get')
const { File, Text, Relationship, Select, Virtual } = require('@keystonejs/fields')
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce')

const { GQLListSchema } = require('@core/keystone/schema')
const { Json } = require('@core/keystone/fields')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')

const FileAdapter = require('@condo/domains/common/utils/fileAdapter')
const { isValidTin } = require('@condo/domains/organization/utils/tin.utils')
const { COUNTRIES } = require('@condo/domains/common/constants/countries')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')

const access = require('@condo/domains/organization/access/Organization')
const userAccess = require('@condo/domains/user/access/User')
const { COUNTRY_RELATED_STATUS_TRANSITIONS } = require('@condo/domains/ticket/constants/statusTransitions')

const AVATAR_FILE_ADAPTER = new FileAdapter('orgavatars')

const Organization = new GQLListSchema('Organization', {
    schemaDoc: 'B2B customer of the service, a legal entity or an association of legal entities (holding/group)',
    fields: {
        // TODO(pahaz): DOMA-2308 migrate to `const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')`
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        country: {
            schemaDoc: 'Country level specific',
            isRequired: true,
            type: Select,
            options: Object.keys(COUNTRIES).join(','),
        },
        name: {
            schemaDoc: 'Customer-friendly name',
            type: Text,
            isRequired: true,
            kmigratorOptions: { null: false },
        },
        // The reason for this field is to avoid adding check for resident user into global Organization read access.
        // This field have specific use case for mobile client.
        tin: {
            schemaDoc: 'Taxpayer identification number. Every country has its own identification. Examples: INN for Russia, IIN for Kazakhstan and so on',
            type: Virtual,
            resolver: async (item) => {
                if (!item) return null

                const country = get(item, 'country')
                const meta = get(item, 'meta')

                if (!country || !meta) return null

                // TODO(DOMA-663): rename Organization.meta.inn to Organization.meta.tin and fix corresponding code
                const innValue = get(meta, 'inn', '').toString().trim()
                const isValid = isValidTin(innValue, item.country)

                return isValid ? innValue : null
            },
            graphQLReturnType: 'String',
            access: true,
        },
        description: {
            schemaDoc: 'Customer-friendly description. Friendly text for employee and resident users',
            type: Wysiwyg,
            isRequired: false,
        },
        avatar: {
            schemaDoc: 'Customer-friendly avatar',
            type: File,
            isRequired: false,
            adapter: AVATAR_FILE_ADAPTER,
        },
        meta: {
            schemaDoc: 'Organization metadata. Depends on country level specific' +
                'Examples of data keys: `inn`, `kpp`',
            type: Json,
            isRequired: true,
            access: userAccess.canAccessToStaffUserField,
        },
        employees: {
            type: Relationship,
            ref: 'OrganizationEmployee.organization',
            many: true,
            access: userAccess.canAccessToStaffUserField,
        },
        relatedOrganizations: {
            type: Relationship,
            ref: 'OrganizationLink.to',
            many: true,
            access: userAccess.canAccessToStaffUserField,
        },
        statusTransitions: {
            schemaDoc: 'Graph of possible transitions for statuses. If there is no transition in this graph, ' +
                'it is impossible to change status if the user in the role has the right to do so.',
            type: Virtual,
            graphQLReturnType: 'JSON',
            resolver: (organization) => {
                const organizationCountry = get(organization, 'country', 'en')

                return COUNTRY_RELATED_STATUS_TRANSITIONS[organizationCountry]
            },
        },
        defaultEmployeeRoleStatusTransitions: {
            schemaDoc: 'Default employee role status transitions map which will be used as fallback for status transition validation' +
                'if user dont have OrganizationEmployeeRole',
            type: Virtual,
            graphQLReturnType: 'JSON',
            resolver: (organization) => {
                const organizationCountry = get(organization, 'country', 'en')

                return COUNTRY_RELATED_STATUS_TRANSITIONS[organizationCountry]
            },
        },
        importRemoteSystem: {
            schemaDoc: 'External provider for organization',
            type: Text,
            access: access.canAccessToImportField,
            kmigratorOptions: { null: true, unique: false },
        },
        importId: {
            schemaDoc: 'External system organization id. Used for integrations',
            type: Text,
            access: access.canAccessToImportField,
            kmigratorOptions: { null: true, unique: false },
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['importId', 'importRemoteSystem'],
                name: 'unique_organization_importid_and_importremotesystem',
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadOrganizations,
        create: access.canManageOrganizations,
        update: access.canManageOrganizations,
        delete: false,
        auth: true,
    },
})

module.exports = {
    Organization,
}
