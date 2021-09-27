/**
 * Generated by `createschema meter.MeterReadingSource 'organization:Relationship:Organization:CASCADE; type:Select:call,mobile_app,billing; name:Text;'`
 */

const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { makeClient } = require('@core/keystone/test.utils')
const { createTestResident } = require('@condo/domains/resident/utils/testSchema')
const { makeLoggedInAdminClient } = require('@core/keystone/test.utils')
const { updateTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationEmployeeRole } = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationWithAccessToAnotherOrganization } = require('@condo/domains/organization/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObj } = require('@condo/domains/common/utils/testSchema')
const { expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')
const { makeEmployeeUserClientWithAbilities } = require('@condo/domains/organization/utils/testSchema')
const { MeterResource, Meter, createTestMeter, updateTestMeter } = require('../utils/testSchema')
const { expectToThrowAuthenticationErrorToObjects } = require('@condo/domains/common/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { UUID_RE } = require('@core/keystone/test.utils')
const faker = require('faker')
const { createTestServiceConsumer } = require('@condo/domains/resident/utils/testSchema')
const { createTestBillingAccount } = require('@condo/domains/billing/utils/testSchema')
const { createTestBillingProperty } = require('@condo/domains/billing/utils/testSchema')
const { makeContextWithOrganizationAndIntegrationAsAdmin } = require('@condo/domains/billing/utils/testSchema')
const { makeClientWithResidentUser } = require('@condo/domains/user/utils/testSchema')
const { catchErrorFrom } = require('@condo/domains/common/utils/testSchema')
const { COLD_WATER_METER_RESOURCE_ID } = require('../constants/constants')

describe('Meter', () => {
    describe('Create', () => {
        test('employee with "canManageMeters" role: can create Meter', async () => {
            const client = await makeEmployeeUserClientWithAbilities({
                canManageMeters: true,
            })
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })
            const [meter] = await createTestMeter(client, client.organization, client.property, resource, {})

            expect(meter.id).toMatch(UUID_RE)
        })

        test('employee with "canManageMeters" role: cannot create Meter with wrong "sender" field', async () => {
            const client = await makeEmployeeUserClientWithAbilities({
                canManageMeters: true,
            })
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })

            await catchErrorFrom(async () => {
                await createTestMeter(client, client.organization, client.property, resource, {
                    sender: null,
                })
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                expect(errors[0].data.messages[0]).toContain('Required field "sender" is null or undefined.')
                expect(data).toEqual({ 'obj': null })
            })
        })

        test('employee without "canManageMeters" role: cannot create Meter', async () => {
            const client = await makeEmployeeUserClientWithAbilities({
                canManageMeters: false,
            })
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeter(client, client.organization, client.property, resource, {})
            })
        })

        test('employee with "canManageMeters" role: cannot create Meter if Meter with same accountNumber exist in organization', async () => {
            const client = await makeEmployeeUserClientWithAbilities({
                canManageMeters: true,
            })
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })
            const accountNumber = faker.lorem.word()

            await createTestMeter(client, client.organization, client.property, resource, {
                accountNumber,
            })

            await catchErrorFrom(async () => {
                await createTestMeter(client, client.organization, client.property, resource, { accountNumber })
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                expect(errors[0].data.messages[0]).toContain('Meter with same account number exist in current organization')
                expect(data).toEqual({ 'obj': null })
            })
        })

        test('employee with "canManageMeters" role: can create Meter if Meter with same accountNumber exist in other organization', async () => {
            const client = await makeEmployeeUserClientWithAbilities({
                canManageMeters: true,
            })
            const client2 = await makeEmployeeUserClientWithAbilities({
                canManageMeters: true,
            })
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })
            const accountNumber = faker.lorem.word()

            await createTestMeter(client, client.organization, client.property, resource, {
                accountNumber,
            })

            const [meter] = await createTestMeter(client2, client2.organization, client2.property, resource, {
                accountNumber,
            })

            expect(meter.id).toMatch(UUID_RE)
        })

        test('employee from another organization with "canManageMeters" role: cannot create Meter', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const client = await makeEmployeeUserClientWithAbilities({
                canManageMeters: true,
            })
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeter(client, organization, property, resource, {})
            })
        })

        test('employee from "from" related organization with "canManageMeters" role: can create Meter', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientFrom, employeeFrom, organizationFrom, organizationTo, propertyTo } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                canManageMeters: true,
            })
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                role: { connect: { id: role.id } },
            })
            const [resource] = await MeterResource.getAll(clientFrom, { id: COLD_WATER_METER_RESOURCE_ID })
            const [meter] = await createTestMeter(clientFrom, organizationTo, propertyTo, resource, {})

            expect(meter.id).toMatch(UUID_RE)
        })

        test('employee from "from" related organization without "canManageMeters" role: cannot create Meter', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientFrom, organizationFrom, employeeFrom, organizationTo, propertyTo } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [resource] = await MeterResource.getAll(clientFrom, { id: COLD_WATER_METER_RESOURCE_ID })

            const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                canManageMeters: false,
            })
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                role: { connect: { id: role.id } },
            })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeter(clientFrom, organizationTo, propertyTo, resource, {})
            })
        })

        test('employee from "to" related organization with "canManageMeters" role: cannot create Meter in "from" organization', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientTo, clientFrom, employeeTo, organizationFrom, organizationTo, propertyFrom } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [role] = await createTestOrganizationEmployeeRole(admin, organizationTo, {
                canManageMeters: true,
            })
            await updateTestOrganizationEmployee(admin, employeeTo.id, {
                role: { connect: { id: role.id } },
            })
            const [resource] = await MeterResource.getAll(clientFrom, { id: COLD_WATER_METER_RESOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeter(clientTo, organizationFrom, propertyFrom, resource, {})
            })
        })

        test('employee with "canManageMeters" role: cannot create Meter if another Meter with same number exist in user organization', async () => {
            const client = await makeEmployeeUserClientWithAbilities({
                canManageMeters: true,
            })
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })

            const number = faker.random.alphaNumeric(5)
            await createTestMeter(client, client.organization, client.property, resource, { number })

            await catchErrorFrom(async () => {
                await createTestMeter(client, client.organization, client.property, resource, { number })
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                expect(errors[0].data.messages[0]).toContain('Meter with same number exist in current organization')
                expect(data).toEqual({ 'obj': null })
            })
        })

        test('resident: cannot create Meter', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const unitName = faker.random.alphaNumeric(8)

            const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestProperty(adminClient, organization)
            const [billingProperty] = await createTestBillingProperty(adminClient, context)
            const [billingAccount] = await createTestBillingAccount(adminClient, context, billingProperty)
            const [resident] = await createTestResident(adminClient, client.user, organization, property, {
                unitName,
            })

            await createTestServiceConsumer(adminClient, resident, billingAccount, {
                accountNumber: billingAccount.number,
            })

            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeter(client, organization, property, resource, {
                    accountNumber: billingAccount.number,
                    unitName,
                })
            })
        })

        test('user: cannot create Meter', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)

            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeter(client, organization, property, resource, {})
            })
        })

        test('anonymous: cannot create Meter', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const client = await makeClient()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)

            const [resource] = await MeterResource.getAll(adminClient, { id: COLD_WATER_METER_RESOURCE_ID })

            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestMeter(client, organization, property, resource, {})
            })
        })

        test('admin: can create Meter', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const [resource] = await MeterResource.getAll(adminClient, { id: COLD_WATER_METER_RESOURCE_ID })

            const [meter] = await createTestMeter(adminClient, organization, property, resource, {})

            expect(meter.id).toMatch(UUID_RE)
        })
    })
    describe('Update', () => {
        test('employee with "canManageMeters" role: can update Meter', async () => {
            const client = await makeEmployeeUserClientWithAbilities({
                canManageMeters: true,
            })
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })
            const [meter] = await createTestMeter(client, client.organization, client.property, resource, {})

            const newNumber = faker.random.alphaNumeric(8)
            const [updatedMeter] = await updateTestMeter(client, meter.id, {
                number: newNumber,
            })

            expect(updatedMeter.number).toEqual(newNumber)
        })

        test('employee without "canManageMeters" role: cannot update Meter', async () => {
            const admin = await makeLoggedInAdminClient()
            const client = await makeEmployeeUserClientWithAbilities({
                canManageMeters: false,
            })
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })

            const [meter] = await createTestMeter(admin, client.organization, client.property, resource, {})


            const newNumber = faker.random.alphaNumeric(8)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeter(client, meter.id, {
                    number: newNumber,
                })
            })
        })

        test('employee from "from" related organization with "canManageMeters" role: can update Meter', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientFrom, employeeFrom, organizationFrom, organizationTo, propertyTo } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                canManageMeters: true,
            })
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                role: { connect: { id: role.id } },
            })
            const [resource] = await MeterResource.getAll(clientFrom, { id: COLD_WATER_METER_RESOURCE_ID })
            const [meter] = await createTestMeter(clientFrom, organizationTo, propertyTo, resource, {})

            const newNumber = faker.random.alphaNumeric(8)
            const [updatedMeter] = await updateTestMeter(clientFrom, meter.id, {
                number: newNumber,
            })

            expect(updatedMeter.number).toEqual(newNumber)
        })

        test('employee from "from" related organization without "canManageMeters" role: cannot update Meter', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientFrom, organizationTo, propertyTo, organizationFrom, employeeFrom } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [resource] = await MeterResource.getAll(clientFrom, { id: COLD_WATER_METER_RESOURCE_ID })
            const [meter] = await createTestMeter(admin, organizationTo, propertyTo, resource, {})

            const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                canManageMeters: false,
            })
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                role: { connect: { id: role.id } },
            })

            const newNumber = faker.random.alphaNumeric(8)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeter(clientFrom, meter.id, {
                    number: newNumber,
                })
            })
        })

        test('employee from "to" related organization with "canManageMeters" role: cannot update Meter from "from" organization', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientFrom, clientTo, employeeTo, organizationFrom, propertyFrom } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                canManageMeters: true,
            })
            await updateTestOrganizationEmployee(admin, employeeTo.id, {
                role: { connect: { id: role.id } },
            })
            const [resource] = await MeterResource.getAll(clientFrom, { id: COLD_WATER_METER_RESOURCE_ID })
            const [meter] = await createTestMeter(admin, organizationFrom, propertyFrom, resource, {})

            const newNumber = faker.random.alphaNumeric(8)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeter(clientTo, meter.id, {
                    number: newNumber,
                })
            })
        })

        test('resident: cannot update Meter', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const client = await makeClientWithResidentUser()
            const unitName = faker.random.alphaNumeric(8)

            const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestProperty(adminClient, organization)
            const [billingProperty] = await createTestBillingProperty(adminClient, context)
            const [billingAccount] = await createTestBillingAccount(adminClient, context, billingProperty)
            const [resident] = await createTestResident(adminClient, client.user, organization, property, {
                unitName,
            })
            await createTestServiceConsumer(adminClient, resident, billingAccount, {
                accountNumber: billingAccount.number,
            })

            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })

            const [meter] = await createTestMeter(adminClient, organization, property, resource, {
                accountNumber: billingAccount.number,
                unitName,
            })

            const newNumber = faker.random.alphaNumeric(8)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeter(client, meter.id, {
                    number: newNumber,
                })
            })
        })

        test('user: cannot update Meter', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const [resource] = await MeterResource.getAll(adminClient, { id: COLD_WATER_METER_RESOURCE_ID })
            const [meter] = await createTestMeter(adminClient, organization, property, resource, {})

            const newNumber = faker.random.alphaNumeric(8)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeter(client, meter.id, {
                    number: newNumber,
                })
            })
        })

        test('anonymous: cannot update Meter', async () => {
            const client = await makeClient()
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const [resource] = await MeterResource.getAll(adminClient, { id: COLD_WATER_METER_RESOURCE_ID })
            const [meter] = await createTestMeter(adminClient, organization, property, resource, {})

            const newNumber = faker.random.alphaNumeric(8)
            await expectToThrowAuthenticationErrorToObj(async () => {
                await updateTestMeter(client, meter.id, {
                    number: newNumber,
                })
            })
        })

        test('admin: can update Meter', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const [resource] = await MeterResource.getAll(adminClient, { id: COLD_WATER_METER_RESOURCE_ID })
            const [meter] = await createTestMeter(adminClient, organization, property, resource, {})

            const newNumber = faker.random.alphaNumeric(8)
            const [updatedMeter] = await updateTestMeter(adminClient, meter.id, {
                number: newNumber,
            })

            expect(updatedMeter.number).toEqual(newNumber)
        })
    })
    describe('Read', () => {
        test('employee: can read Meters', async () => {
            const admin = await makeLoggedInAdminClient()
            const client = await makeEmployeeUserClientWithAbilities()
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })

            const [meter] = await createTestMeter(admin, client.organization, client.property, resource, {})

            const meters = await Meter.getAll(client, { id: meter.id })
            expect(meters).toHaveLength(1)
        })

        test('employee from "from" related organization: can read Meters', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientFrom, organizationTo, propertyTo } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [resource] = await MeterResource.getAll(clientFrom, { id: COLD_WATER_METER_RESOURCE_ID })

            const [meter] = await createTestMeter(admin, organizationTo, propertyTo, resource, {})

            const meters = await Meter.getAll(clientFrom, { id: meter.id })
            expect(meters).toHaveLength(1)
        })

        test('employee from "to" related organization: cannot read Meters from "from" organization', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientFrom, clientTo, organizationFrom, propertyFrom } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [resource] = await MeterResource.getAll(clientFrom, { id: COLD_WATER_METER_RESOURCE_ID })

            const [meter] = await createTestMeter(admin, organizationFrom, propertyFrom, resource, {})

            const meters = await Meter.getAll(clientTo, { id: meter.id })
            expect(meters).toHaveLength(0)
        })

        test('resident: can read his Meters', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const client = await makeClientWithResidentUser()
            const unitName = faker.random.alphaNumeric(8)

            const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestProperty(adminClient, organization)
            const [billingProperty] = await createTestBillingProperty(adminClient, context)
            const [billingAccount] = await createTestBillingAccount(adminClient, context, billingProperty)
            const [resident] = await createTestResident(adminClient, client.user, organization, property, {
                unitName,
            })
            await createTestServiceConsumer(adminClient, resident, billingAccount, {
                accountNumber: billingAccount.number,
            })

            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })

            const [meter] = await createTestMeter(adminClient, organization, property, resource, {
                accountNumber: billingAccount.number,
                unitName,
            })

            const meters = await Meter.getAll(client, { id: meter.id })
            expect(meters).toHaveLength(1)
        })

        test('resident: cannot read Meters from other organization', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const client1 = await makeClientWithResidentUser()
            const client2 = await makeClientWithResidentUser()
            const unitName = faker.random.alphaNumeric(8)

            const { context: context1, organization: organization1 } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property1] = await createTestProperty(adminClient, organization1)
            const [billingProperty1] = await createTestBillingProperty(adminClient, context1)
            const [billingAccount1] = await createTestBillingAccount(adminClient, context1, billingProperty1)
            const [resident1] = await createTestResident(adminClient, client1.user, organization1, property1, {
                unitName,
            })
            await createTestServiceConsumer(adminClient, resident1, billingAccount1, {
                accountNumber: billingAccount1.number,
            })

            const { context: context2, organization: organization2 } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property2] = await createTestProperty(adminClient, organization2)
            const [billingProperty2] = await createTestBillingProperty(adminClient, context2)
            const [billingAccount2] = await createTestBillingAccount(adminClient, context2, billingProperty2)
            const [resident2] = await createTestResident(adminClient, client2.user, organization2, property2, {
                unitName,
            })
            await createTestServiceConsumer(adminClient, resident2, billingAccount2, {
                accountNumber: billingAccount2.number,
            })

            const [resource] = await MeterResource.getAll(client1, { id: COLD_WATER_METER_RESOURCE_ID })

            const [meter] = await createTestMeter(adminClient, organization2, property2, resource, {
                accountNumber: billingAccount2.number,
                unitName,
            })

            const meters = await Meter.getAll(client1, { id: meter.id })

            expect(meters).toHaveLength(0)
        })

        test('resident: cannot read Meters in other property in same organization', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const client1 = await makeClientWithResidentUser()
            const client2 = await makeClientWithResidentUser()
            const unitName = faker.random.alphaNumeric(8)

            const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property1] = await createTestProperty(adminClient, organization)
            const [billingProperty1] = await createTestBillingProperty(adminClient, context)
            const [billingAccount1] = await createTestBillingAccount(adminClient, context, billingProperty1)
            const [resident1] = await createTestResident(adminClient, client1.user, organization, property1, {
                unitName,
            })
            await createTestServiceConsumer(adminClient, resident1, billingAccount1, {
                accountNumber: billingAccount1.number,
            })

            const [property2] = await createTestProperty(adminClient, organization)
            const [billingProperty2] = await createTestBillingProperty(adminClient, context)
            const [billingAccount2] = await createTestBillingAccount(adminClient, context, billingProperty2)
            const [resident2] = await createTestResident(adminClient, client2.user, organization, property2, {
                unitName,
            })
            await createTestServiceConsumer(adminClient, resident2, billingAccount2, {
                accountNumber: billingAccount2.number,
            })

            const [resource] = await MeterResource.getAll(client1, { id: COLD_WATER_METER_RESOURCE_ID })

            const [meter] = await createTestMeter(adminClient, organization, property2, resource, {
                accountNumber: billingAccount2.number,
                unitName,
            })

            const meters = await Meter.getAll(client1, { id: meter.id })

            expect(meters).toHaveLength(0)
        })

        test('resident: cannot read Meters in other unit in same property', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const client1 = await makeClientWithResidentUser()
            const client2 = await makeClientWithResidentUser()
            const unitName1 = faker.random.alphaNumeric(8)
            const unitName2 = faker.random.alphaNumeric(8)

            const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [property] = await createTestProperty(adminClient, organization)
            const [billingProperty] = await createTestBillingProperty(adminClient, context)
            const [billingAccount1] = await createTestBillingAccount(adminClient, context, billingProperty)
            const [resident1] = await createTestResident(adminClient, client1.user, organization, property, {
                unitName: unitName1,
            })
            await createTestServiceConsumer(adminClient, resident1, billingAccount1, {
                accountNumber: billingAccount1.number,
            })

            const [billingAccount2] = await createTestBillingAccount(adminClient, context, billingProperty)
            const [resident2] = await createTestResident(adminClient, client2.user, organization, property, {
                unitName: unitName2,
            })
            await createTestServiceConsumer(adminClient, resident2, billingAccount2, {
                accountNumber: billingAccount2.number,
            })

            const [resource] = await MeterResource.getAll(client1, { id: COLD_WATER_METER_RESOURCE_ID })

            const [meter] = await createTestMeter(adminClient, organization, property, resource, {
                accountNumber: billingAccount2.number,
                unitName: unitName2,
            })
            const meters = await Meter.getAll(client1, { id: meter.id })

            expect(meters).toHaveLength(0)
        })

        test('user: cannot read Meters', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const [resource] = await MeterResource.getAll(adminClient, { id: COLD_WATER_METER_RESOURCE_ID })

            const [meter] = await createTestMeter(adminClient, organization, property, resource, {})

            const meters = await Meter.getAll(client, { id: meter.id })
            expect(meters).toHaveLength(0)
        })

        test('anonymous: cannot read Meters', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const client = await makeClient()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const [resource] = await MeterResource.getAll(adminClient, { id: COLD_WATER_METER_RESOURCE_ID })

            const [meter] = await createTestMeter(adminClient, organization, property, resource, {})

            await expectToThrowAuthenticationErrorToObjects(async () => {
                await Meter.getAll(client, { id: meter.id })
            })
        })
    })
})
