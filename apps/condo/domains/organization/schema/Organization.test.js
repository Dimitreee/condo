/**
 * Generated by `createschema organization.Organization 'country:Select:ru,en; name:Text; description?:Text; avatar?:File; meta:Json; employees:Relationship:OrganizationEmployee:CASCADE; statusTransitions:Json; defaultEmployeeRoleStatusTransitions:Json'`
 */
const { DEFAULT_STATUS_TRANSITIONS, STATUS_IDS } = require('@condo/domains/ticket/constants/statusTransitions')
const { createTestOrganizationEmployeeRole } = require('../utils/testSchema')
const { createTestOrganizationEmployee } = require('../utils/testSchema')
const { makeClientWithRegisteredOrganization } = require('../../../utils/testSchema/Organization')

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')

const { Organization, createTestOrganization, updateTestOrganization } = require('@condo/domains/organization/utils/testSchema')

describe('Organization', () => {
    // Despite just registered user can create Organization from UI, calling `Organization.create`
    // should be forbidden for it. User can create organization using UI, because it executes
    // `registerNewOrganization` GraphQL mutation, that creates all the stuff without
    // access check, using `execGqlWithoutAccess` under the hood.
    test('user: create Organization', async () => {
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        try {
            await createTestOrganization(userClient)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(e.data).toEqual({ 'obj': null })
        }
    })

    test('anonymous: create Organization', async () => {
        const client = await makeClient()
        try {
            await createTestOrganization(client)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(e.data).toEqual({ 'obj': null })
        }
    })

    test('user: read Organization — only those, it employed in', async () => {
        const admin = await makeLoggedInAdminClient()
        await createTestOrganization(admin)
        const client = await makeClientWithRegisteredOrganization()

        const objs = await Organization.getAll(client, {})
        expect(objs.length).toBe(1)
        expect(objs[0].id).toEqual(client.organization.id)
    })

    test('anonymous: read Organization', async () => {
        const client = await makeClient()

        try {
            await Organization.getAll(client)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['objs'],
            })
            expect(e.data).toEqual({ 'objs': null })
        }
    })

    describe('user: update Organization',  () => {

        describe('not employed into organization', () => {

            it('cannot regardless of granted "canManageOrganization"', async () => {
                [true, false].map(async (canManageOrganization) => {
                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                        canManageOrganization,
                    })
                    const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

                    const [anotherOrganization] = await createTestOrganization(admin)

                    let thrownError
                    try {
                        await updateTestOrganization(managerUserClient, anotherOrganization.id)
                    } catch (e) {
                        thrownError = e
                    }
                    expect(thrownError).toBeDefined()
                    expect(thrownError.errors[0]).toMatchObject({
                        'message': 'You do not have access to this resource',
                        'name': 'AccessDeniedError',
                        'path': ['obj'],
                    })
                    expect(thrownError.data).toEqual({ 'obj': null })
                })
            })

        })

        describe('employed into organization', () => {

            it('cannot without granted "canManageOrganization"', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageOrganization: false,
                })
                const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

                let thrownError
                try {
                    await updateTestOrganization(managerUserClient, organization.id)
                } catch (e) {
                    thrownError = e
                }
                expect(thrownError).toBeDefined()
                expect(thrownError.errors[0]).toMatchObject({
                    'message': 'You do not have access to this resource',
                    'name': 'AccessDeniedError',
                    'path': ['obj'],
                })
                expect(thrownError.data).toEqual({ 'obj': null })
            })

            it('can with granted "canManageOrganization"', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageOrganization: true,
                })
                const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

                const [objUpdated, attrs] = await updateTestOrganization(managerUserClient, organization.id)
                expect(objUpdated.id).toEqual(organization.id)
                expect(objUpdated.dv).toEqual(1)
                expect(objUpdated.sender).toEqual(attrs.sender)
                expect(objUpdated.v).toEqual(2)
                expect(objUpdated.newId).toEqual(null)
                expect(objUpdated.name).toEqual(attrs.name)
                expect(objUpdated.description).toEqual(attrs.description)
                expect(objUpdated.county).toEqual(attrs.county)
                expect(objUpdated.meta).toEqual(attrs.meta)
                expect(objUpdated.deletedAt).toEqual(null)
                expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: managerUserClient.user.id }))
                expect(objUpdated.createdAt).toMatch(DATETIME_RE)
                expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
                expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
            })

            it('cannot update "statusTransitions"', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageOrganization: true,
                })
                const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

                let thrownError
                try {
                    await updateTestOrganization(managerUserClient, organization.id, {
                        statusTransitions: {
                            ...DEFAULT_STATUS_TRANSITIONS,
                            [STATUS_IDS.DECLINED]: [STATUS_IDS.OPEN],
                        },
                    })
                } catch (e) {
                    thrownError = e
                }
                expect(thrownError).toBeDefined()
                expect(thrownError.errors[0]).toMatchObject({
                    'message': 'You do not have access to this resource',
                    'name': 'AccessDeniedError',
                    'path': ['obj'],
                    'data': {
                        'type': 'mutation',
                        'target': 'updateOrganization',
                        'restrictedFields': [ 'statusTransitions' ],
                    },
                })
                expect(thrownError.data).toEqual({ 'obj': null })
            })

            // TODO(antonal): Why this test passes
            test.skip('cannot update "defaultEmployeeRoleStatusTransitions"', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageOrganization: true,
                })
                const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

                let thrownError
                try {
                    await updateTestOrganization(managerUserClient, organization.id, {
                        defaultEmployeeRoleStatusTransitions: {
                            ...DEFAULT_STATUS_TRANSITIONS,
                            [STATUS_IDS.DECLINED]: [STATUS_IDS.OPEN],
                        },
                    })
                } catch (e) {
                    thrownError = e
                }
                expect(thrownError).toBeDefined()
                expect(thrownError.errors[0]).toMatchObject({
                    'message': 'You do not have access to this resource',
                    'name': 'AccessDeniedError',
                    'path': ['obj'],
                    'data': {
                        'type': 'mutation',
                        'target': 'updateOrganization',
                        'restrictedFields': [ 'defaultEmployeeRoleStatusTransitions' ],
                    },
                })
                expect(thrownError.data).toEqual({ 'obj': null })
            })
        })
    })

    test('anonymous: update Organization', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestOrganization(admin)

        const client = await makeClient()
        try {
            await updateTestOrganization(client, objCreated.id)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(e.data).toEqual({ 'obj': null })
        }
    })

    test('user: delete Organization', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestOrganization(admin)

        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        try {
            await Organization.delete(userClient, objCreated.id)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(e.data).toEqual({ 'obj': null })
        }
    })

    test('anonymous: delete Organization', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestOrganization(admin)

        const client = await makeClient()
        try {
            await Organization.delete(client, objCreated.id)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(e.data).toEqual({ 'obj': null })
        }
    })

    test('default status transitions is defined', async () => {
        const { organization } = await makeClientWithRegisteredOrganization()

        expect(organization.statusTransitions).toBeDefined()
        expect(organization.defaultEmployeeRoleStatusTransitions).toMatchObject(DEFAULT_STATUS_TRANSITIONS)
    })

    test('admin: can create Organization', async () => {
        const admin = await makeLoggedInAdminClient()
        const [obj, attrs] = await createTestOrganization(admin)
        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.newId).toEqual(null)
        expect(obj.deletedAt).toEqual(null)
        expect(obj.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
        expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
        expect(obj.createdAt).toMatch(DATETIME_RE)
        expect(obj.updatedAt).toMatch(DATETIME_RE)
    })
})
