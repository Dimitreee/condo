import React from 'react'
import Head from 'next/head'
import { TitleHeaderAction } from '@condo/domains/common/components/HeaderActions'
import { useIntl } from '@core/next/intl'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { PageContent, PageHeader, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { Typography } from 'antd'
import { BillingPageContent } from '@condo/domains/billing/components/BillingPageContent'
import { useOrganization } from '@core/next/organization'
import get from 'lodash/get'
import { BillingIntegrationOrganizationContext } from '@condo/domains/billing/utils/clientSchema'


const BillingPage = () => {
    const intl = useIntl()
    const BillingTitle = intl.formatMessage({ id:'menu.Billing' })

    const userOrganization = useOrganization()
    const organizationId = get(userOrganization, ['organization', 'id'], '')
    const canReadBillingReceipts = get(userOrganization, ['link', 'role', 'canReadBillingReceipts'], false)
    const {
        obj: currentContext,
        error: contextError,
        loading: contextLoading,
    } = BillingIntegrationOrganizationContext.useObject({
        where: {
            organization: {
                id: organizationId,
            },
        },
    }, {
        fetchPolicy: 'network-only',
    })

    const PageTitle = get(currentContext, ['integration', 'billingPageTitle'], BillingTitle)
    console.log(currentContext)
    return (
        <>
            <Head>
                <title>
                    {BillingTitle}
                </title>
            </Head>
            <PageWrapper>
                <PageHeader title={<Typography.Title style={{ margin: 0 }}>{PageTitle}</Typography.Title>}/>
                <PageContent>
                    <BillingPageContent
                        access={canReadBillingReceipts}
                        contextLoading={contextLoading}
                        contextError={contextError}
                        context={currentContext}
                    />
                </PageContent>
            </PageWrapper>
        </>
    )
}

BillingPage.headerAction = <TitleHeaderAction descriptor={{ id:'menu.Billing' }}/>
BillingPage.requiredAccess = OrganizationRequired

export default BillingPage