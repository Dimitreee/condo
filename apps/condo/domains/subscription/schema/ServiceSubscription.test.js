/**
 * Generated by `createschema subscription.ServiceSubscription 'type:Select:default,sbbol; isTrial:Checkbox; organization:Relationship:Organization:CASCADE; startAt:DateTimeUtc; finishAt:DateTimeUtc;'`
 */

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')

const { ServiceSubscription, createTestServiceSubscription, updateTestServiceSubscription, expectOverlappingFor } = require('@condo/domains/subscription/utils/testSchema')
const {
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAuthenticationErrorToObj, catchErrorFrom,
} = require('@condo/domains/common/utils/testSchema')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const dayjs = require('dayjs')
const faker = require('faker')

describe('ServiceSubscription', () => {
    describe('Validations', () => {
        it('should have null prices if is trial', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)

            const unitsCount = faker.datatype.number()
            const unitPrice = faker.datatype.float({ precision: 0.01 }).toString()
            const totalPrice = (unitPrice * unitsCount).toString()
            const wrongValues = {
                isTrial: true,
                unitsCount,
                unitPrice,
                totalPrice,
                currency: 'RUB',
            }

            await catchErrorFrom(async () => {
                await createTestServiceSubscription(adminClient, organization, wrongValues)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('violates check constraint "prices_check"')
                expect(data).toEqual({ 'obj': null })
            })

            const correctValues = {
                isTrial: true,
                unitsCount: null,
                unitPrice: null,
                totalPrice: null,
                currency: null,
            }

            const [obj, attrs] = await createTestServiceSubscription(adminClient, organization, correctValues)
            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
            expect(obj.organization.id).toEqual(organization.id)
            expect(obj.unitsCount).toBeNull()
            expect(obj.unitPrice).toBeNull()
            expect(obj.totalPrice).toBeNull()
            expect(obj.currency).toBeNull()
        })

        it('should have positive prices if is not trial', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)

            const wrongValues = {
                isTrial: false,
                unitsCount: null,
                unitPrice: null,
                totalPrice: null,
                currency: null,
            }

            await catchErrorFrom(async () => {
                await createTestServiceSubscription(adminClient, organization, wrongValues)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('violates check constraint "prices_check"')
                expect(data).toEqual({ 'obj': null })
            })

            const wrongValuesWithZeroPrices = {
                isTrial: false,
                unitsCount: 0,
                unitPrice: '0',
                totalPrice: '0',
                currency: 'RUB',
            }

            await catchErrorFrom(async () => {
                await createTestServiceSubscription(adminClient, organization, wrongValuesWithZeroPrices)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('violates check constraint "prices_check"')
                expect(data).toEqual({ 'obj': null })
            })

            const unitsCount = faker.datatype.number()
            const unitPrice = faker.datatype.float({ precision: 0.01 })
            const totalPrice = unitPrice * unitsCount
            const correctValues = {
                isTrial: false,
                unitsCount,
                unitPrice: String(unitPrice),
                totalPrice: String(totalPrice),
                currency: 'RUB',
            }

            const [obj, attrs] = await createTestServiceSubscription(adminClient, organization, correctValues)
            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
            expect(obj.organization.id).toEqual(organization.id)
            expect(obj.unitsCount).toEqual(unitsCount)
            expect(obj.unitPrice).toEqual(String(unitPrice))
            expect(obj.totalPrice).toEqual(String(totalPrice))
            expect(obj.currency).toEqual('RUB')
        })

        it('cannot have `startAt` after `finishAt`', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const attrs = {
                startAt: dayjs(),
                finishAt: dayjs().subtract(1, 'day'),
            }

            await catchErrorFrom(async () => {
                await createTestServiceSubscription(adminClient, organization, attrs)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('violates check constraint "startAt_is_before_finishAt"')
                expect(data).toEqual({ 'obj': null })
            })
        })

        it('does not allows strings to be saved to unitPrice', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)

            const attrs = {
                unitsCount: 9,
                unitPrice: 'asdf',
            }

            await catchErrorFrom(async () => {
                await createTestServiceSubscription(adminClient, organization, attrs)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('invalid input syntax for type numeric')
                expect(data).toEqual({ 'obj': null })
            })
        })

        describe('overlapping', () => {
            describe('for create', () => {
                it('cannot match same interval as in existing record for given organization', async () => {
                    const period = 15
                    const adminClient = await makeLoggedInAdminClient()
                    const [organization] = await createTestOrganization(adminClient)

                    const [existingSubscription] = await createTestServiceSubscription(adminClient, organization, {
                        startAt: dayjs(),
                        finishAt: dayjs().add(period, 'days'),
                    })

                    const sameInterval = {
                        startAt: dayjs(existingSubscription.startAt),
                        finishAt: dayjs(existingSubscription.finishAt),
                    }
                    await expectOverlappingFor(createTestServiceSubscription, adminClient, organization, sameInterval)
                })

                it('cannot overlap existing records for given organization', async () => {
                    const period = 15
                    const adminClient = await makeLoggedInAdminClient()
                    const [organization] = await createTestOrganization(adminClient)

                    const [existingSubscription] = await createTestServiceSubscription(adminClient, organization, {
                        startAt: dayjs(),
                        finishAt: dayjs().add(period, 'days'),
                    })

                    const overlappingIntervalNearStartAt = {
                        startAt: dayjs(existingSubscription.startAt).subtract(period + 1, 'days'),
                        finishAt: dayjs(existingSubscription.startAt).add(1, 'second'),
                    }
                    await expectOverlappingFor(createTestServiceSubscription, adminClient, organization, overlappingIntervalNearStartAt)

                    const overlappingIntervalNearFinishAt = {
                        startAt: dayjs(existingSubscription.finishAt).subtract(1, 'second'),
                        finishAt: dayjs(existingSubscription.finishAt).add(period, 'days'),
                    }
                    await expectOverlappingFor(createTestServiceSubscription, adminClient, organization, overlappingIntervalNearFinishAt)

                    const overlappingIntervalAround = {
                        startAt: dayjs(existingSubscription.startAt).subtract(1, 'second'),
                        finishAt: dayjs(existingSubscription.finishAt).add(1, 'second'),
                    }
                    await expectOverlappingFor(createTestServiceSubscription, adminClient, organization, overlappingIntervalAround)

                    const overlappingIntervalInside = {
                        startAt: dayjs(existingSubscription.startAt).add(1, 'second'),
                        finishAt: dayjs(existingSubscription.finishAt).subtract(1, 'second'),
                    }
                    await expectOverlappingFor(createTestServiceSubscription, adminClient, organization, overlappingIntervalInside)
                })

                it('can overlap existing records for another organization', async () => {
                    const adminClient = await makeLoggedInAdminClient()
                    const [organization1] = await createTestOrganization(adminClient)
                    const [organization2] = await createTestOrganization(adminClient)

                    const [firstSubscription] = await createTestServiceSubscription(adminClient, organization1, {
                        startAt: dayjs(),
                        finishAt: dayjs().add(15, 'days'),
                    })

                    const [secondSubscription] = await createTestServiceSubscription(adminClient, organization2, {
                        startAt: dayjs(firstSubscription.startAt).subtract(3, 'days'),
                        finishAt: dayjs(firstSubscription.finishAt).subtract(3, 'days'),
                    })

                    expect(secondSubscription).toBeDefined()
                })
            })

            describe('for update', () => {
                it('cannot match same interval as in existing record for given organization', async () => {
                    const period = 15
                    const adminClient = await makeLoggedInAdminClient()
                    const [organization] = await createTestOrganization(adminClient)

                    const [existingSubscription] = await createTestServiceSubscription(adminClient, organization, {
                        startAt: dayjs(),
                        finishAt: dayjs().add(period, 'days'),
                    })

                    const [subjectSubscription] = await createTestServiceSubscription(adminClient, organization, {
                        startAt: dayjs(existingSubscription.finishAt).add(1, 'day'),
                        finishAt: dayjs(existingSubscription.finishAt).add(period + 1, 'days'),
                    })

                    const sameInterval = {
                        startAt: dayjs(existingSubscription.startAt),
                        finishAt: dayjs(existingSubscription.finishAt),
                    }
                    await expectOverlappingFor(updateTestServiceSubscription, adminClient, subjectSubscription.id, sameInterval)
                })

                it('cannot overlap existing records for given organization', async () => {
                    const period = 15
                    const adminClient = await makeLoggedInAdminClient()
                    const [organization] = await createTestOrganization(adminClient)

                    const [existingSubscription] = await createTestServiceSubscription(adminClient, organization, {
                        startAt: dayjs(),
                        finishAt: dayjs().add(period, 'days'),
                    })

                    const [subjectSubscription] = await createTestServiceSubscription(adminClient, organization, {
                        startAt: dayjs(existingSubscription.finishAt).add(1, 'day'),
                        finishAt: dayjs(existingSubscription.finishAt).add(period + 1, 'days'),
                    })

                    const overlappingIntervalNearStartAt = {
                        startAt: dayjs(existingSubscription.startAt).subtract(period + 1, 'days'),
                        finishAt: dayjs(existingSubscription.startAt).add(1, 'second'),
                    }
                    await expectOverlappingFor(updateTestServiceSubscription, adminClient, subjectSubscription.id, overlappingIntervalNearStartAt)

                    const overlappingIntervalNearFinishAt = {
                        startAt: dayjs(existingSubscription.finishAt).subtract(1, 'second'),
                        finishAt: dayjs(existingSubscription.finishAt).add(period, 'days'),
                    }
                    await expectOverlappingFor(updateTestServiceSubscription, adminClient, subjectSubscription.id, overlappingIntervalNearFinishAt)

                    const overlappingIntervalAround = {
                        startAt: dayjs(existingSubscription.startAt).subtract(1, 'second'),
                        finishAt: dayjs(existingSubscription.finishAt).add(1, 'second'),
                    }
                    await expectOverlappingFor(updateTestServiceSubscription, adminClient, subjectSubscription.id, overlappingIntervalAround)

                    const overlappingIntervalInside = {
                        startAt: dayjs(existingSubscription.startAt).add(1, 'second'),
                        finishAt: dayjs(existingSubscription.finishAt).subtract(1, 'second'),
                    }
                    await expectOverlappingFor(updateTestServiceSubscription, adminClient, subjectSubscription.id, overlappingIntervalInside)
                })

                it('can overlap existing records for another organization', async () => {
                    const period = 15
                    const adminClient = await makeLoggedInAdminClient()
                    const [organization1] = await createTestOrganization(adminClient)
                    const [organization2] = await createTestOrganization(adminClient)

                    const [existingSubscription] = await createTestServiceSubscription(adminClient, organization1, {
                        startAt: dayjs(),
                        finishAt: dayjs().add(15, 'days'),
                    })

                    const [subjectSubscription] = await createTestServiceSubscription(adminClient, organization2, {
                        startAt: dayjs(existingSubscription.finishAt).add(1, 'day'),
                        finishAt: dayjs(existingSubscription.finishAt).add(period + 1, 'days'),
                    })

                    const overlappingInterval = {
                        startAt: dayjs(existingSubscription.startAt).subtract(3, 'days'),
                        finishAt: dayjs(existingSubscription.finishAt).subtract(3, 'days'),
                    }

                    const [objUpdated] = await updateTestServiceSubscription(adminClient, subjectSubscription.id, overlappingInterval)

                    expect(objUpdated.startAt).toEqual(overlappingInterval.startAt.toISOString())
                    expect(objUpdated.finishAt).toEqual(overlappingInterval.finishAt.toISOString())
                })
            })
        })
    })

    describe('Price calculation', () => {
        it('calculates totalPrice', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)

            const attrs = {
                unitsCount: 9,
                // Keystone's GraphQL accepts and returns decimal numbers as strings,
                // but they are casted to numbers for calculations in DB and JavaScript
                unitPrice: '1.11',
            }

            const [obj] = await createTestServiceSubscription(adminClient, organization, attrs)
            expect(obj.totalPrice).toEqual('9.99')
        })
    })

    describe('Create', () => {
        it('can be created by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)

            const [obj, attrs] = await createTestServiceSubscription(adminClient, organization)
            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
            expect(obj.organization.id).toEqual(organization.id)
            expect(obj.unitsCount).toEqual(attrs.unitsCount)
            expect(obj.unitPrice).toEqual(attrs.unitPrice.toString())
            expect(obj.currency).toEqual('RUB')
        })

        it('cannot be created by user', async () => {
            const userClient = await makeClientWithRegisteredOrganization()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestServiceSubscription(userClient, userClient.organization)
            })
        })

        it('cannot be created by anonymous', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const anonymousClient = await makeClient()
            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestServiceSubscription(anonymousClient, organization)
            })
        })
    })

    describe('Read', () => {
        it('can be read by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)

            const [obj, attrs] = await createTestServiceSubscription(adminClient, organization)

            const objs = await ServiceSubscription.getAll(adminClient, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs.length >= 1).toBeTruthy()
            expect(objs[0].id).toMatch(obj.id)
            expect(objs[0].dv).toEqual(1)
            expect(objs[0].sender).toEqual(attrs.sender)
            expect(objs[0].v).toEqual(1)
            expect(objs[0].newId).toEqual(null)
            expect(objs[0].deletedAt).toEqual(null)
            expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(objs[0].createdAt).toMatch(obj.createdAt)
            expect(objs[0].updatedAt).toMatch(obj.updatedAt)
        })

        it('can be read by user from the same organization', async () => {
            const userClient = await makeClientWithRegisteredOrganization()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestServiceSubscription(adminClient, userClient.organization)

            const userClientFromAnotherOrganization = await makeClientWithRegisteredOrganization()

            let objs
            objs = await ServiceSubscription.getAll(userClient, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs).toHaveLength(1)
            expect(objs[0].id).toMatch(obj.id)

            objs = await ServiceSubscription.getAll(userClientFromAnotherOrganization, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs).toHaveLength(0)
        })

        it('cannot be read by anonymous', async () => {
            const anonymousClient = await makeClient()
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            await createTestServiceSubscription(adminClient, organization)
            await expectToThrowAuthenticationErrorToObjects(async () => {
                await ServiceSubscription.getAll(anonymousClient, {}, { sortBy: ['updatedAt_DESC'] })
            })
        })
    })

    describe('Update', () => {
        it('can be updated by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)

            const [objCreated] = await createTestServiceSubscription(adminClient, organization)

            const payload = {
                type: 'sbbol',
                startAt: dayjs().add(1, 'day'),
                finishAt: dayjs().add(16, 'days'),
            }
            const [objUpdated, attrs] = await updateTestServiceSubscription(adminClient, objCreated.id, payload)

            expect(objUpdated.id).toEqual(objCreated.id)
            expect(objUpdated.dv).toEqual(1)
            expect(objUpdated.sender).toEqual(attrs.sender)
            expect(objUpdated.v).toEqual(2)
            expect(objUpdated.newId).toEqual(null)
            expect(objUpdated.deletedAt).toEqual(null)
            expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(objUpdated.createdAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
            expect(objUpdated.type).toEqual(payload.type)
            expect(objUpdated.startAt).toEqual(payload.startAt.toISOString())
            expect(objUpdated.finishAt).toEqual(payload.finishAt.toISOString())
        })

        it('cannot be updated by user', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const userClient = await makeClientWithRegisteredOrganization()

            const [objCreated] = await createTestServiceSubscription(adminClient, organization)

            const payload = {
                isTrial: !objCreated.isTrial,
                type: 'sbbol',
                startAt: dayjs().add(1, 'day'),
                finishAt: dayjs().add(16, 'days'),
            }
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestServiceSubscription(userClient, objCreated.id, payload)
            })
        })

        it('cannot be updated by anonymous', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            await createTestServiceSubscription(adminClient, organization)
            const anonymousClient = await makeClient()
            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestServiceSubscription(anonymousClient, organization)
            })
        })
    })

    describe('Delete', () => {
        it('cannot be deleted by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)

            const [obj] = await createTestServiceSubscription(adminClient, organization)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await ServiceSubscription.delete(adminClient, obj.id)
            })
        })

        it('cannot be deleted by user', async () => {
            const userClient = await makeClientWithRegisteredOrganization()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestServiceSubscription(adminClient, userClient.organization)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await ServiceSubscription.delete(userClient, obj.id)
            })
        })

        it('cannot be deleted by anonymous', async () => {
            const anonymousClient = await makeClient()
            const userClient = await makeClientWithRegisteredOrganization()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestServiceSubscription(adminClient, userClient.organization)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await ServiceSubscription.delete(anonymousClient, obj.id)
            })
        })
    })
})
