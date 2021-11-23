/**
 * Generated by `createservice resident.RegisterServiceConsumerService --type mutations`
 */

const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { makeClient } = require('@core/keystone/test.utils')
const { catchErrorFrom, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')
const { updateTestUser } = require('@condo/domains/user/utils/testSchema')
const { RESIDENT } = require('@condo/domains/user/constants/common')
const { createTestBillingProperty, createTestBillingAccount, createTestBillingIntegration, createTestBillingIntegrationOrganizationContext } = require('@condo/domains/billing/utils/testSchema')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { makeLoggedInAdminClient } = require('@core/keystone/test.utils')
const { registerServiceConsumerByTestClient, updateTestServiceConsumer, createTestResident } = require('@condo/domains/resident/utils/testSchema')
 
describe('RegisterServiceConsumerService', () => {

    it('does not create same service consumer twice', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })

        const payload = {
            residentId: resident.id,
            accountNumber: billingAccountAttrs.number,
            tin: userClient.organization.tin,
        }

        const out = await registerServiceConsumerByTestClient(userClient, payload)
        expect(out).not.toEqual(undefined)

        const out2 = await registerServiceConsumerByTestClient(userClient, payload)
        expect(out2.id).toEqual(out.id)
    })

    it('can create, delete and create service consumer', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })

        const payload = {
            residentId: resident.id,
            accountNumber: billingAccountAttrs.number,
            tin: userClient.organization.tin,
        }
        const [out] = await registerServiceConsumerByTestClient(userClient, payload)
        expect(out).not.toEqual(undefined)

        await updateTestServiceConsumer(userClient, out.id, { deletedAt: 'true' })

        const [out2] = await registerServiceConsumerByTestClient(userClient, payload)
        expect(out2.id).toEqual(out.id)
    })

    it('creates serviceConsumer with billingAccount for valid input as resident', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })

        const payload = {
            residentId: resident.id,
            accountNumber: billingAccountAttrs.number,
            tin: userClient.organization.tin,
        }
        const [ out ] = await registerServiceConsumerByTestClient(userClient, payload)

        expect(out).toBeDefined()
        expect(out.billingAccount.id).toEqual(billingAccountAttrs.id)
    })

    it('creates serviceConsumer for valid input as resident and not fail with explicit validations set', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })

        const payload = {
            residentId: resident.id,
            accountNumber: billingAccountAttrs.number,
            tin: userClient.organization.tin,
            validations: ['billingAccount'],
        }
        const [ out ] = await registerServiceConsumerByTestClient(userClient, payload)

        expect(out).toBeDefined()
        expect(out.billingAccount.id).toEqual(billingAccountAttrs.id)
    })

    it('creates serviceConsumer with billingAccount for separate organization', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [organization] = await createTestOrganization(adminClient)
        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, undefined, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })

        const payload = {
            residentId: resident.id,
            accountNumber: billingAccountAttrs.number,
            tin: organization.meta.inn,
        }

        const [ out ] = await registerServiceConsumerByTestClient(userClient, payload)
        expect(out).toBeDefined()
        expect(out.billingAccount).toBeDefined()
    })

    it('does not fail with error when billingAccount not found, and explicit validation is disabled', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, undefined, userClient.property, {
            unitName: '21',
        })

        const payload = {
            residentId: resident.id,
            accountNumber: '221231232',
            tin: userClient.organization.tin,
        }

        const [ out ] = await registerServiceConsumerByTestClient(userClient, payload)
        expect(out).toBeDefined()
        expect(out.billingAccount).toBeDefined()
    })

    it('fails with error when billingAccount not found, and explicit validation is enabled', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, undefined, userClient.property, {
            unitName: '21',
        })

        const payload = {
            residentId: resident.id,
            accountNumber: '221231232',
            tin: userClient.organization.tin,
            validations: ['billingAccount'],
        }

        await catchErrorFrom(async () => {
            await registerServiceConsumerByTestClient(userClient, payload)
        }, (e) => {
            expect(e.errors[0].message).toContain('billingAccount is not found')
        })
    })

    it('fails with error when creating serviceConsumer without billingAccount for resident with wrong unitName, and explicit validation is enabled', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName + 'not-valid-buddy',
        })

        const payload = {
            residentId: resident.id,
            accountNumber: billingAccountAttrs.number,
            tin: userClient.organization.tin,
        }

        const [ out ] = await registerServiceConsumerByTestClient(userClient, payload)
        expect(out).toBeDefined()
        expect(out.billingAccount).toBeNull()
    })

    it('fails with error when creating serviceConsumer without billingAccount for resident with wrong accountNumber, and explicit validation is enabled', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })

        const payload = {
            residentId: resident.id,
            accountNumber: billingAccountAttrs.number + 'not-valid-buddy',
            tin: userClient.organization.tin,
        }

        const [ out ] = await registerServiceConsumerByTestClient(userClient, payload)
        expect(out).toBeDefined()
        expect(out.billingAccount).toBeNull()
    })

    it('fails with error when creating serviceConsumer for nullish data', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })

        const payloadWithNullishAccountName = {
            residentId: resident.id,
            accountNumber: '',
            tin: userClient.organization.tin,
        }

        await catchErrorFrom(async () => {
            await registerServiceConsumerByTestClient(userClient, payloadWithNullishAccountName)
        }, (e) => {
            expect(e.errors[0].message).toContain('Account number null or empty')
        })
    })

    it('cannot be invoked by non-resident user', async () => {

        const userClient = await makeClientWithProperty()

        const payload = {
            residentId: 'test-id',
            accountNumber: 'test-number',
            tin: userClient.organization.tin,
        }

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await registerServiceConsumerByTestClient(userClient, payload)
        })
    })

    it('cannot be invoked by anonymous', async () => {

        const userClient = await makeClient()

        const payload = {
            residentId: 'test-id',
            accountNumber: 'test-number',
            tin: '1111111',
        }

        await expectToThrowAuthenticationErrorToObj(async () => {
            await registerServiceConsumerByTestClient(userClient, payload)
        })
    })
})