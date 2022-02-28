/**
 * Generated by `createservice ticket.ResidentTicketService --type mutations`
 */
const { Contact } = require('@condo/domains/contact/utils/testSchema')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { createResidentTicketByTestClient } = require('@condo/domains/ticket/utils/testSchema')
const { UUID_RE } = require('@core/keystone/test.utils')
const faker = require('faker')
const { catchErrorFrom } = require('@condo/domains/common/utils/testSchema')
const { makeClientWithResidentAccessAndProperty } = require('@condo/domains/property/utils/testSchema')
const { NOT_FOUND_ERROR } = require('@condo/domains/common/constants/errors')
const { expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')
const { generateGQLTestUtils } = require('@condo/domains/common/utils/codegeneration/generate.test.utils')
const { Ticket: TicketGQL } = require('@condo/domains/ticket/gql')
const Ticket = generateGQLTestUtils(TicketGQL)

describe('CreateResidentTicketService', () => {

    test('resident: can create resident ticket', async () => {
        const userClient = await makeClientWithResidentAccessAndProperty()

        const [ticket] = await createResidentTicketByTestClient(userClient, userClient.property)
        expect(ticket.id).toMatch(UUID_RE)
    })

    test('resident: can create resident ticket with unit name which does not exist at property map', async () => {
        const userClient = await makeClientWithResidentAccessAndProperty()
        const unitName = faker.random.alphaNumeric(10)

        const [ticket] = await createResidentTicketByTestClient(userClient, userClient.property, { unitName })
        expect(ticket.id).toMatch(UUID_RE)
        expect(ticket.unitName).toEqual(unitName)
    })

    test('resident: cannot create resident ticket without details', async () => {
        const userClient = await makeClientWithResidentAccessAndProperty()

        await catchErrorFrom(async () => {
            await createResidentTicketByTestClient(userClient, userClient.property, { details: null })
        }, ({ errors, data }) => {
            expect(errors).toHaveLength(1)
            expect(errors[0].message).toContain('Variable "$data" got invalid value null at "data.details"')
        })
    })

    test('resident: cannot create resident ticket with wrong property id', async () => {
        const userClient = await makeClientWithResidentAccessAndProperty()

        const wrongProperty = {
            id: faker.random.uuid(),
        }

        await catchErrorFrom(async () => {
            await createResidentTicketByTestClient(userClient, wrongProperty)
        }, ({ errors, data }) => {
            expect(errors).toHaveLength(1)
            expect(errors[0].message).toEqual(`${NOT_FOUND_ERROR}property] property not found`)
            expect(data).toEqual({ 'obj': null })
        })
    })

    test('resident: cannot create resident ticket with wrong source id', async () => {
        const userClient = await makeClientWithResidentAccessAndProperty()
        const wrongSource = {
            connect: {
                id: faker.random.uuid(),
            },
        }

        await catchErrorFrom(async () => {
            await createResidentTicketByTestClient(userClient, userClient.property, { source: wrongSource })
        }, ({ errors, data }) => {
            expect(errors).toHaveLength(1)
            expect(errors[0].message).toEqual(`${NOT_FOUND_ERROR}source] source not found`)
            expect(data).toEqual({ 'obj': null })
        })
    })

    test('resident: create contact when create resident ticket without contact', async () => {
        const admin = await makeLoggedInAdminClient()
        const userClient = await makeClientWithResidentAccessAndProperty()

        await createResidentTicketByTestClient(userClient, userClient.property)
        const [contact] = await Contact.getAll(admin, {
            property: { id: userClient.property.id },
            organization: { id: userClient.organization.id },
            name: userClient.name,
            email: userClient.email,
            phone: userClient.phone,
        })
        expect(contact.id).toMatch(UUID_RE)
    })
    test('resident: created ticket has contact', async () => {
        const admin = await makeLoggedInAdminClient()
        const userClient = await makeClientWithResidentAccessAndProperty()
        const [residentTicket] = await createResidentTicketByTestClient(userClient, userClient.property)
        const [ticket] = await Ticket.getAll(admin, {
            id: residentTicket.id,
        })
        const [contact] = await Contact.getAll(admin, {
            property: { id: userClient.property.id },
            organization: { id: userClient.organization.id },
            name: userClient.name,
            email: userClient.email,
            phone: userClient.phone,
        })

        expect(contact.id).toMatch(ticket.contact.id)
    })

    test('resident: do not create contact when create resident ticket with contact with same data', async () => {
        const admin = await makeLoggedInAdminClient()
        const userClient = await makeClientWithResidentAccessAndProperty()

        await createResidentTicketByTestClient(userClient, userClient.property)
        await createResidentTicketByTestClient(userClient, userClient.property)

        const contacts = await Contact.getAll(admin, {
            property: { id: userClient.property.id },
            organization: { id: userClient.organization.id },
            name: userClient.name,
            email: userClient.email,
            phone: userClient.phone,
        })

        expect(contacts).toHaveLength(1)
        expect(contacts[0].id).toMatch(UUID_RE)
    })

    test('anonymous: cannot create resident ticket', async () => {
        const anon = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [property] = await createTestProperty(admin, organization)

        await expectToThrowAuthenticationErrorToObj(async () => {
            await createResidentTicketByTestClient(anon, property)
        })
    })

    test('admin: can create resident ticket', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [property] = await createTestProperty(admin, organization)
        const [data] = await createResidentTicketByTestClient(admin, property)
        expect(data.id).toMatch(UUID_RE)
    })
})