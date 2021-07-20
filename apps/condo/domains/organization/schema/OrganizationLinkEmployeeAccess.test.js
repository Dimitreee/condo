/**
 * Generated by `createschema organization.OrganizationLinkEmployeeAccess 'link:Relationship:OrganizationLink:CASCADE; employee:Relationship:OrganizationEmployee:CASCADE; canManageOrganization:Checkbox; canManageEmployees:Checkbox; canManageRoles:Checkbox; canManageIntegrations:Checkbox; canManageProperties:Checkbox; canManageTickets:Checkbox;'`
 */

const { createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationEmployeeRole } = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationLink, createTestOrganization } = require('../utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestOrganizationLinkEmployeeAccess } = require('@condo/domains/organization/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObj } = require('../../common/utils/testSchema')

describe('OrganizationLinkEmployeeAccess', () => {

    test('admin: create OrganizationLinkEmployeeAccess', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom)
        const clientFrom = await makeClientWithNewRegisteredAndLoggedInUser()
        const [employeeFrom] = await createTestOrganizationEmployee(admin, organizationFrom, clientFrom.user, role)

        const [organizationTo] = await createTestOrganization(admin)
        const clientTo = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestOrganizationEmployee(admin, organizationTo, clientTo.user, role)

        const [link] = await createTestOrganizationLink(admin, organizationFrom, organizationTo)

        const [access] = await createTestOrganizationLinkEmployeeAccess(admin, link, employeeFrom, {
            canManageTickets: true,
        })

        expect(access.canManageTickets).toEqual(true)
    })

    test('admin: cannot create OrganizationLinkEmployeeAccess for employee from "to" organization', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom)

        const [organizationTo] = await createTestOrganization(admin)
        const clientTo = await makeClientWithNewRegisteredAndLoggedInUser()
        const [employeeTo] = await createTestOrganizationEmployee(admin, organizationTo, clientTo.user, role)

        const [link] = await createTestOrganizationLink(admin, organizationFrom, organizationTo)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestOrganizationLinkEmployeeAccess(admin, link, employeeTo, {
                canManageTickets: true,
            })
        })
    })

    test('anonymous: create OrganizationLinkEmployeeAccess', async () => {
        const client = await makeClient()

        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom)
        const clientFrom = await makeClientWithNewRegisteredAndLoggedInUser()
        const [employeeFrom] = await createTestOrganizationEmployee(admin, organizationFrom, clientFrom.user, role)

        const [organizationTo] = await createTestOrganization(admin)
        const clientTo = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestOrganizationEmployee(admin, organizationTo, clientTo.user, role)

        const [link] = await createTestOrganizationLink(admin, organizationFrom, organizationTo)
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestOrganizationLinkEmployeeAccess(client, link, employeeFrom)
        })
    })

    test('user: create OrganizationLinkEmployeeAccess', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom)
        const clientFrom = await makeClientWithNewRegisteredAndLoggedInUser()
        const [employeeFrom] = await createTestOrganizationEmployee(admin, organizationFrom, clientFrom.user, role)

        const [organizationTo] = await createTestOrganization(admin)
        const clientTo = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestOrganizationEmployee(admin, organizationTo, clientTo.user, role)

        const [link] = await createTestOrganizationLink(admin, organizationFrom, organizationTo)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestOrganizationLinkEmployeeAccess(clientFrom, link, employeeFrom)
        })
    })
})
