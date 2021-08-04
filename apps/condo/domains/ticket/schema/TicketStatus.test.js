/**
 * Generated by `createschema ticket.TicketStatus 'organization?:Relationship:Organization:CASCADE; type:Select:neworreopened,processing,canceled,completed,deferred,closed; name:Text;' --force`
 */
const faker = require('faker')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const {
    PROCESSING_STATUS_TYPE,
    NEW_OR_REOPENED_STATUS_TYPE,
    CANCELED_STATUS_TYPE,
    COMPLETED_STATUS_TYPE,
    DEFERRED_STATUS_TYPE,
    CLOSED_STATUS_TYPE,
} = require('@condo/domains/ticket/constants')

const { STATUS_SELECT_COLORS } = require('@condo/domains/ticket/constants/style')
const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { TicketStatus, createTestTicketStatus, updateTestTicketStatus } = require('@condo/domains/ticket/utils/testSchema')
const { expectToThrowAuthenticationErrorToObjects, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')
const { getTranslations, getAvailableLocales } = require('@condo/domains/common/utils/localesLoader')
const { STATUS_IDS } = require('../constants/statusTransitions')
const { find } = require('@core/keystone/schema')

describe('TicketStatus', () => {
    test('admin: create TicketStatus', async () => {
        const client = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(client)
        const [obj, attrs] = await createTestTicketStatus(client, { organization: { connect: { id: organization.id } } })

        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.newId).toEqual(null)
        expect(obj.deletedAt).toEqual(null)
        expect(obj.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(obj.createdAt).toMatch(DATETIME_RE)
        expect(obj.updatedAt).toMatch(DATETIME_RE)
    })

    test('admin: create TicketStatus with valid PROCESSING_STATUS_TYPE color', async () => {
        const client = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(client)
        const [obj] = await createTestTicketStatus(client, { type: PROCESSING_STATUS_TYPE, organization: { connect: { id: organization.id } } })
        expect(obj.colors).toStrictEqual(STATUS_SELECT_COLORS[obj.type])

    })

    test('admin: create TicketStatus with valid NEW_OR_REOPENED_STATUS_TYPE color', async () => {
        const client = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(client)
        const [obj] = await createTestTicketStatus(client, { type: NEW_OR_REOPENED_STATUS_TYPE, organization: { connect: { id: organization.id } } })
        expect(obj.colors).toStrictEqual(STATUS_SELECT_COLORS[obj.type])
    })

    test('admin: create TicketStatus with valid CANCELED_STATUS_TYPE color', async () => {
        const client = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(client)

        const [obj] = await createTestTicketStatus(client, { type: CANCELED_STATUS_TYPE, organization: { connect: { id: organization.id } } })
        expect(obj.colors).toStrictEqual(STATUS_SELECT_COLORS[obj.type])
    })

    test('admin: create TicketStatus with valid COMPLETED_STATUS_TYPE color', async () => {
        const client = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(client)

        const [obj] = await createTestTicketStatus(client, { type: COMPLETED_STATUS_TYPE, organization: { connect: { id: organization.id } } })
        expect(obj.colors).toStrictEqual(STATUS_SELECT_COLORS[obj.type])
    })

    test('admin: create TicketStatus with valid DEFERRED_STATUS_TYPE color', async () => {
        const client = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(client)

        const [obj] = await createTestTicketStatus(client, { type: DEFERRED_STATUS_TYPE, organization: { connect: { id: organization.id } } })
        expect(obj.colors).toStrictEqual(STATUS_SELECT_COLORS[obj.type])
    })

    test('admin: create TicketStatus with valid CLOSED_STATUS_TYPE color', async () => {
        const client = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(client)

        const [obj] = await createTestTicketStatus(client, { type: CLOSED_STATUS_TYPE, organization: { connect: { id: organization.id } } })
        expect(obj.colors).toStrictEqual(STATUS_SELECT_COLORS[obj.type])
    })

    test('user: create TicketStatus', async () => {
        const client = await makeClientWithProperty()

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestTicketStatus(client)
        })
    })

    test('anonymous: create TicketStatus', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestTicketStatus(client)
        })
    })

    test('user: read TicketStatus', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)

        const [obj, attrs] = await createTestTicketStatus(admin, {
            organization: { connect: { id: organization.id } },
        })

        const client = await makeClientWithProperty()
        const objs = await TicketStatus.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })

        expect(objs.length >= 1).toBeTruthy()
        expect(objs[0].id).toMatch(obj.id)
        expect(objs[0].dv).toEqual(1)
        expect(objs[0].sender).toEqual(attrs.sender)
        expect(objs[0].v).toEqual(1)
        expect(objs[0].newId).toEqual(null)
        expect(objs[0].deletedAt).toEqual(null)
        expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
        expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
        expect(objs[0].createdAt).toMatch(obj.createdAt)
        expect(objs[0].updatedAt).toMatch(obj.updatedAt)
        expect(objs[0].name).toMatch(attrs.name)
        expect(objs[0].type).toMatch(attrs.type)
        expect(objs[0].organization).toEqual(null)
    })

    test('anonymous: read TicketStatus', async () => {
        const client = await makeClient()

        await expectToThrowAuthenticationErrorToObjects(async () => {
            await TicketStatus.getAll(client)
        })
    })

    test('user: update TicketStatus', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)

        const [objCreated] = await createTestTicketStatus(admin, {
            organization: { connect: { id: organization.id } },
        })

        const client = await makeClientWithProperty()
        const name = faker.random.alphaNumeric(8)
        const payload = { name }
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestTicketStatus(client, objCreated.id, payload)
        })
    })

    test('anonymous: update TicketStatus', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)

        const [objCreated] = await createTestTicketStatus(admin, {
            organization: { connect: { id: organization.id } },
        })

        const client = await makeClient()
        const name = faker.random.alphaNumeric(8)
        const payload = { name }
        await expectToThrowAuthenticationErrorToObj(async () => {
            await updateTestTicketStatus(client, objCreated.id, payload)
        })
    })

    test('user: delete TicketStatus', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)

        const [objCreated] = await createTestTicketStatus(admin, {
            organization: { connect: { id: organization.id } },
        })

        const client = await makeClientWithProperty()
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await TicketStatus.delete(client, objCreated.id)
        })
    })

    test('anonymous: delete TicketStatus', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)

        const [objCreated] = await createTestTicketStatus(admin, {
            organization: { connect: { id: organization.id } },
        })

        const client = await makeClient()
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await TicketStatus.delete(client, objCreated.id)
        })
    })
    
    test.each(getAvailableLocales())('localization [%s]: static statuses correctly localized', async (locale) => {
        const translations = getTranslations(locale)

        const admin = await makeLoggedInAdminClient({
            headers: {
                'Accept-Language': locale,
            },
        })

        const statutsesLength = await TicketStatus.count(admin)
        expect(statutsesLength).toBeGreaterThanOrEqual(6)

        const rawStatuses = await find('TicketStatus', {})
        
        const tests = Object.values(STATUS_IDS).map(() => async (id) => {
            const rawStatus = rawStatuses.find(x => x.id === id)
            const status = await TicketStatus.getAll(admin, { id })
            expect(rawStatus).toBeDefined()
            expect(translations[rawStatus.name]).toBeDefined()
            expect(translations[rawStatus.name]).toStrictEqual(status.name)
        })
        await Promise.all(tests)
    })
})
