import { PaymentWhereInput } from '@app/condo/schema'
import { EXPORT_PAYMENTS_TO_EXCEL } from '@condo/domains/acquiring/gql'
import { Payment } from '@condo/domains/acquiring/utils/clientSchema'
import { usePaymentsTableColumns } from '@condo/domains/billing/hooks/usePaymentsTableColumns'
import { ExportToExcelActionBar } from '@condo/domains/common/components/ExportToExcelActionBar'
import { useLayoutContext } from '@condo/domains/common/components/LayoutContext'
import { Loader } from '@condo/domains/common/components/Loader'
import { DEFAULT_PAGE_SIZE, Table } from '@condo/domains/common/components/Table/Index'
import { useQueryMappers } from '@condo/domains/common/hooks/useQueryMappers'
import { useSearch } from '@condo/domains/common/hooks/useSearch'
import {
    getPageIndexFromOffset,
    getStringContainsFilter,
    parseQuery,
    QueryMeta,
} from '@condo/domains/common/utils/tables.utils'
import { useIntl } from '@core/next/intl'
import { useOrganization } from '@core/next/organization'
import { Col, Input, Row } from 'antd'
import { get } from 'lodash'
import { useRouter } from 'next/router'
import React from 'react'

const addressFilter = getStringContainsFilter(['frozenReceipt', 'data', 'property', 'address'])
// const periodFilter = (period: string) => ({ period })
const SORTABLE_PROPERTIES = ['amount', 'organization', 'updatedBy']

const PaymentsTable = ({ billingContext }): JSX.Element => {
    const intl = useIntl()
    const { isSmall } = useLayoutContext()
    const router = useRouter()
    const userOrganization = useOrganization()
    const organizationId = get(userOrganization, ['organization', 'id'], '')
    const { filters, sorters, offset } = parseQuery(router.query)
    const queryMetas: Array<QueryMeta<PaymentWhereInput>> = [
        // { keyword: 'period', filters: [periodFilter] },
        { keyword: 'search', filters: [addressFilter], combineType: 'OR' },
    ]
    const currentPageIndex = getPageIndexFromOffset(offset, DEFAULT_PAGE_SIZE)
    const { filtersToWhere, sortersToSortBy } = useQueryMappers(queryMetas, SORTABLE_PROPERTIES)

    // const searchPaymentsQuery = { ...filtersToWhere(filters), organization: { id: organizationId } }

    const {
        loading,
        count,
        objs,
        error,
    } = Payment.useObjects({
        where: { ...filtersToWhere(filters), organization: { id: organizationId } },
        // sortBy: sortersToSortBy(sorters) as SortPaymentsBy[],
        first: DEFAULT_PAGE_SIZE,
        skip: (currentPageIndex - 1) * DEFAULT_PAGE_SIZE,
    })

    const [search, handleSearchChange] = useSearch(loading)
    const currencyCode = get(billingContext, ['integration', 'currencyCode'], 'RUB')
    const tableColumns = usePaymentsTableColumns(currencyCode)

    if (loading) {
        return <Loader fill/>
    }

    const SearchPlaceholder = intl.formatMessage({ id: 'filters.FullSearch' })

    return (
        <>
            <Row gutter={[0, 40]}>
                <Col span={6}>
                    <Input
                        placeholder={SearchPlaceholder}
                        onChange={(e) => {
                            handleSearchChange(e.target.value)
                        }}
                        value={search}
                    />
                </Col>
                <Col span={6}>
                    date filter here
                </Col>
                <Col span={24}>
                    <Table
                        loading={loading}
                        dataSource={objs}
                        totalRows={count}
                        columns={tableColumns}
                    />
                </Col>
            </Row>
            <ExportToExcelActionBar
                hidden={isSmall}
                searchObjectsQuery={search}
                sortBy={'amount'}
                exportToExcelQuery={EXPORT_PAYMENTS_TO_EXCEL}
            />
        </>
    )
}

export default PaymentsTable