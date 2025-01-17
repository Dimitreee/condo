/**
 * @jest-environment node
 */

const mockPushSubscriptionActivationToSalesCRM = jest.fn()
const mockPushOrganizationToSalesCRM = jest.fn()

const dayjs = require('dayjs')
const { prepareKeystoneExpressApp, setFakeClientMode, makeLoggedInAdminClient } = require('@core/keystone/test.utils')
const { MockSbbolResponses } = require('./sbbol/sync/MockSbbolResponses')
const { createTestOrganization } = require('../utils/testSchema')
const { createTestServiceSubscription } = require('@condo/domains/subscription/utils/testSchema')
const { rightSbbolOfferAccept } = require('@condo/domains/subscription/utils/testSchema/constants')
const { syncOrganization } = require('./sbbol/sync/syncOrganization')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { SBBOL_FINGERPRINT_NAME } = require('./sbbol/common')
const { makeClientWithRegisteredOrganization } = require('../utils/testSchema/Organization')


jest.mock('../utils/serverSchema/Organization')
jest.mock('../utils/serverSchema/Organization', () => {
    const originalOrg = jest.requireActual('../utils/serverSchema/Organization')
    return {
        ...originalOrg,
        pushSubscriptionActivationToSalesCRM: mockPushSubscriptionActivationToSalesCRM,
        pushOrganizationToSalesCRM: mockPushOrganizationToSalesCRM,
    }
})

let keystone

describe('Ineraction with sales CRM', () => {
    setFakeClientMode(require.resolve('../../../index'))
    beforeAll(async () => {
        const result = await prepareKeystoneExpressApp(require.resolve('../../../index'))
        keystone = result.keystone
    })
    it('should send to sales crm new organization', async () => {
        const client = await makeClientWithRegisteredOrganization()
        expect(mockPushOrganizationToSalesCRM).toBeCalled()
        expect(mockPushOrganizationToSalesCRM).lastCalledWith(
            expect.objectContaining({ 
                id: client.organization.id, 
                sender: expect.not.objectContaining({
                    fingerprint: SBBOL_FINGERPRINT_NAME,
                }),
            }))
    })
    it('should send to sales crm imported from sbbol organization', async () => {
        const { userData, organizationData, dvSenderFields } = MockSbbolResponses.getUserAndOrganizationInfo()
        const adminContext = await keystone.createContext({ skipAccessControl: true })
        const context = {
            keystone,
            context: adminContext,
        }
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const user = client.user
        userData.phone = user.phone
        const org = await syncOrganization({
            context,
            user: user,
            userInfo: userData,
            dvSenderFields,
            organizationInfo: organizationData,
        })
        expect(mockPushOrganizationToSalesCRM).toBeCalled()
        expect(mockPushOrganizationToSalesCRM).lastCalledWith(
            expect.objectContaining({ 
                id: org.id, 
                sender: expect.objectContaining({
                    fingerprint: SBBOL_FINGERPRINT_NAME,
                }),
            }))
    })
    it('Sync subscription pushes data to sales crm', async () => {
        const adminClient = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(adminClient)
        const [objCreated] = await createTestServiceSubscription(adminClient, organization, {
            sbbolOfferAccept: rightSbbolOfferAccept,
        })
        expect(mockPushSubscriptionActivationToSalesCRM).toBeCalled()
        expect(mockPushSubscriptionActivationToSalesCRM).lastCalledWith(rightSbbolOfferAccept.payerInn, dayjs(objCreated.startAt).toDate(), dayjs(objCreated.finishAt).toDate())
    })
}) 