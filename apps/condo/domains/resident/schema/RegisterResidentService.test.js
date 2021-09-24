/**
 * Generated by `createservice property.RegisterResidentService --type mutations`
 */

const { buildingMapJson } = require('@condo/domains/property/constants/property')
const { registerNewOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { createTestProperty, makeClientWithResidentUserAndProperty } = require('@condo/domains/property/utils/testSchema')
const { makeClientWithResidentUser } = require('@condo/domains/user/utils/testSchema')
const { makeLoggedInAdminClient, makeClient, UUID_RE } = require('@core/keystone/test.utils')
const { expectToThrowAuthenticationError, expectToThrowAccessDeniedErrorToResult } = require('@condo/domains/common/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithStaffUser } = require('@condo/domains/user/utils/testSchema')
const { registerResidentByTestClient, Resident } = require('@condo/domains/resident/utils/testSchema')
const { Property } = require('@condo/domains/property/utils/testSchema')

describe('RegisterResidentService', () => {
    test('can be executed by user with "resident" type', async () => {
        const userClient = await makeClientWithResidentUser()
        const [obj, attrs] = await registerResidentByTestClient(userClient)
        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.address).toEqual(attrs.address)
        expect(obj.addressMeta).toStrictEqual(attrs.addressMeta)
        expect(obj.user.id).toEqual(userClient.user.id)
    })

    test('cannot be executed by user', async () => {
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await registerResidentByTestClient(userClient)
        }, 'result')
    })

    test('anonymous: execute', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationError(async () => {
            await registerResidentByTestClient(client)
        }, 'result')
    })

    test('admin: execute', async () => {
        const adminClient = await makeLoggedInAdminClient()
        const [obj, attrs] = await registerResidentByTestClient(adminClient)
        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.address).toEqual(attrs.address)
        expect(obj.addressMeta).toStrictEqual(attrs.addressMeta)
        expect(obj.user.id).toEqual(adminClient.user.id)
    })

    it('connects property with matched address to resident', async () => {
        const adminClient = await makeLoggedInAdminClient()

        const [organization] = await registerNewOrganization(adminClient)
        const [property] = await createTestProperty(adminClient, organization, { map: buildingMapJson })

        const payload = {
            address: property.address,
            addressMeta: property.addressMeta,
        }

        const [obj, attrs] = await registerResidentByTestClient(adminClient, payload)
        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.address).toEqual(attrs.address)
        expect(obj.addressMeta).toStrictEqual(attrs.addressMeta)
        expect(obj.user.id).toEqual(adminClient.user.id)
        expect(obj.property.id).toEqual(property.id)
        expect(obj.organization.id).toEqual(organization.id)
    })

    it('does not connects to deleted property with matched address to resident', async () => {
        const adminClient = await makeLoggedInAdminClient()

        const [organization] = await registerNewOrganization(adminClient)
        const [property] = await createTestProperty(adminClient, organization, { map: buildingMapJson })
        await Property.softDelete(adminClient, property.id)

        const payload = {
            address: property.address,
            addressMeta: property.addressMeta,
        }

        const [obj, attrs] = await registerResidentByTestClient(adminClient, payload)
        await Property.softDelete(adminClient, property.id, { deletedAt: null })

        expect(obj.address).toEqual(attrs.address)
        expect(obj.addressMeta).toStrictEqual(attrs.addressMeta)
        expect(obj.user.id).toEqual(adminClient.user.id)
        expect(obj.property).toEqual(null)
        expect(obj.organization).toEqual(null)
    })

    test('cannot be executed for staff', async () => {
        const staffClient = await makeClientWithStaffUser()
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await registerResidentByTestClient(staffClient)
        })
    })

    it('clears `deletedAt` when a Resident with same address and unitName already exists for this user', async () => {
        const userClient = await makeClientWithResidentUserAndProperty()
        const [resident, attrs] = await registerResidentByTestClient(userClient)
        const [softDeletedResident] = await Resident.softDelete(userClient, resident.id)

        const [restoredResident] = await registerResidentByTestClient(userClient, {
            address: attrs.address,
            unitName: attrs.unitName,
        })
        expect(restoredResident.id).toEqual(softDeletedResident.id)
        expect(restoredResident.deletedAt).toBeNull()
    })
})