/**
 * Generated by `createschema billing.BillingProperty 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; bindingId:Text; address:Text; raw:Json; meta:Json'`
 */
const faker = require('faker')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { catchErrorFrom } = require('@condo/domains/common/utils/testSchema')
const { makeContextWithOrganizationAndIntegrationAsAdmin } = require('@condo/domains/billing/utils/testSchema')
const { makeOrganizationIntegrationManager } = require('@condo/domains/billing/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestBillingIntegrationOrganizationContext, createReceiptsReader } = require('@condo/domains/billing/utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { BillingProperty, createTestBillingProperty, updateTestBillingProperty } = require('@condo/domains/billing/utils/testSchema')
const { expectToThrowAuthenticationErrorToObjects, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')

describe('BillingProperty', () => {
    describe('Constraints', () => {
        test('can create two BillingProperties with same globalId in different contexts', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            await createTestBillingProperty(admin, context)
            const [billingAccount] = await createTestBillingProperty(admin, context, {
                globalId: 'cat',
            })

            const { context: context2 } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            await createTestBillingProperty(admin, context2)
            const [billingAccount2] = await createTestBillingProperty(admin, context2, {
                globalId: 'cat',
            })

            expect(billingAccount.id).not.toEqual(billingAccount2.id)
            expect(billingAccount.globalId).toEqual(billingAccount2.globalId)
        })

        test('cannot create two BillingProperties with same globalId in one context', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            await createTestBillingProperty(admin, context)

            await createTestBillingProperty(admin, context, {
                globalId: 'cat',
            })

            await createTestBillingProperty(admin, context)

            await catchErrorFrom(
                async () =>
                    await createTestBillingProperty(admin, context, {
                        globalId: 'cat',
                    }),
                (e) => {
                    expect(e.errors).toBeDefined()
                }
            )
        })
    })

    describe('Create', () => {
        test('can be created by Admin', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property, attrs] = await createTestBillingProperty(admin, context)
            expect(property.context.id).toEqual(attrs.context.connect.id)
        })

        test('user: create BillingProperty', async () => {
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const client = await makeClientWithNewRegisteredAndLoggedInUser()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestBillingProperty(client, context)
            })
        })

        test('cannot be created by anonymous', async () => {
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const client = await makeClient()

            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestBillingProperty(client, context)
            })
        })

        test('can be created by organization integration manager', async () => {
            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property, attrs] = await createTestBillingProperty(managerUserClient, context)
            expect(property.context.id).toEqual(attrs.context.connect.id)
        })
    })

    describe('Read', () => {
        test('can be read by admin', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const properties = await BillingProperty.getAll(admin, { id: property.id })

            expect(properties).toHaveLength(1)
        })

        test('cannot be read by user', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            await createTestBillingProperty(admin, context)
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const properties = await BillingProperty.getAll(client)

            expect(properties).toHaveLength(0)
        })

        test('cannot be read by anonymous', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            await createTestBillingProperty(admin, context)
            const client = await makeClient()

            await expectToThrowAuthenticationErrorToObjects(async () => {
                await BillingProperty.getAll(client)
            })
        })

        test('can be read by organization integration manager', async () => {
            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property] = await createTestBillingProperty(managerUserClient, context)

            const props = await BillingProperty.getAll(managerUserClient, { id: property.id })
            expect(props).toHaveLength(1)
        })

        test('can be read by employee with `canReadBillingReceipts`', async () => {
            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            await createTestBillingProperty(managerUserClient, context)
            const client = await createReceiptsReader(organization)

            const properties = await BillingProperty.getAll(client)
            expect(properties).toHaveLength(1)
        })
    })

    describe('Update', () => {
        test('can be updated by admin', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const raw = faker.lorem.words()
            const address = faker.lorem.words()
            const payload = {
                raw,
                address,
            }
            const [updated] = await updateTestBillingProperty(admin, property.id, payload)

            expect(updated.raw).toEqual(raw)
            expect(updated.address).toEqual(address)
        })

        test('cannot be updated by user', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const payload = {
                raw: faker.lorem.words(),
                address: faker.lorem.words(),
            }

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestBillingProperty(client, property.id, payload)
            })
        })

        test('can be updated by organization integration manager', async () => {
            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property] = await createTestBillingProperty(managerUserClient, context)
            const raw = faker.lorem.words()
            const address = faker.lorem.words()
            const payload = {
                raw,
                address,
            }
            const [updated] = await updateTestBillingProperty(managerUserClient, property.id, payload)

            expect(updated.raw).toEqual(raw)
            expect(updated.address).toEqual(address)
        })

        test('cannot be updated by anonymous', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const client = await makeClient()
            const payload = {
                raw: faker.lorem.words(),
                globalId: faker.lorem.words(),
                address: faker.lorem.words(),
            }

            await expectToThrowAuthenticationErrorToObj(async () => {
                await updateTestBillingProperty(client, property.id, payload)
            })
        })
    })

    describe('Delete', () => {
        test('cannot be deleted by admin', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await BillingProperty.delete(admin, property.id)
            })
        })

        test('user: delete BillingProperty', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const client = await makeClientWithNewRegisteredAndLoggedInUser()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await BillingProperty.delete(client, property.id)
            })
        })

        test('cannot be deleted by anonymous', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestBillingProperty(admin, context)
            const client = await makeClient()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await BillingProperty.delete(client, property.id)
            })
        })

        test('cannot be deleted by organization integration manager', async () => {
            const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [property] = await createTestBillingProperty(managerUserClient, context)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await BillingProperty.delete(managerUserClient, property.id)
            })
        })
    })

    describe('Virtual Fields', () => {
        test('property with same address and organization is assigned to BillingProperty', async () => {
            const admin = await makeLoggedInAdminClient()

            const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            const [property] = await createTestProperty(admin, organization)

            const [billingProperty] = await createTestBillingProperty(admin, context, {
                address: property.address,
            })

            expect(billingProperty.property).not.toBeNull()
            expect(billingProperty.property.id).toEqual(property.id)
        })

        test('property with different address and same organization is not assigned to BillingProperty', async () => {
            const admin = await makeLoggedInAdminClient()

            const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            const [property] = await createTestProperty(admin, organization)

            const [billingProperty] = await createTestBillingProperty(admin, context, {
                address: property.address + 'whoa! I make address sooo wrong!',
            })

            expect(billingProperty.property).toBeNull()
        })

        test('property with different organization and same address is not assigned to BillingProperty', async () => {
            const admin = await makeLoggedInAdminClient()

            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            const [ wrongOrganization ] = await createTestOrganization(admin)

            const [property] = await createTestProperty(admin, wrongOrganization)

            const [billingProperty] = await createTestBillingProperty(admin, context, {
                address: property.address,
            })

            expect(billingProperty.property).toBeNull()
        })
    })
})