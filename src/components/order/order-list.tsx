import Pagination from '@components/ui/pagination';
import dayjs from 'dayjs';
import { Table } from '@components/ui/table';
import ActionButtons from '@components/common/action-buttons';
import UsePrice from '@utils/use-price';
import { formatAddress } from '@utils/format-address';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  Order,
  OrderPaginator,
  OrderStatus,
  UserAddress,
} from '@ts-types/generated';
import InvoicePdf from './invoice-pdf';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@utils/locals';

type IProps = {
  orders: OrderPaginator | null | undefined;
  onPagination: (current: number) => void;
};

const OrderList = ({ orders, onPagination }: IProps) => {
  const { data, paginatorInfo } = orders! ?? {};
  const { t } = useTranslation();
  const rowExpandable = (record: any) => record.children?.length;
  const router = useRouter();
  const { alignLeft } = useIsRTL();

  const columns = [
    {
      title: t('table:table-item-tracking-number'),
      dataIndex: 'tracking_number',
      key: 'tracking_number',
      align: 'center',
      width: 150,
    },
    {
      title: t('table:table-item-delivery-fee'),
      dataIndex: 'delivery_fee',
      key: 'delivery_fee',
      align: 'center',
      render: (value: any) => {
        const delivery_fee = value ? value : 0;
        const { price } = UsePrice({
          amount: delivery_fee,
        });
        return <span>{price}</span>;
      },
    },
    {
      title: t('table:table-item-total'),
      dataIndex: 'total',
      key: 'total',
      align: 'center',
      width: 120,
      render: (value: any) => {
        const { price } = UsePrice({
          amount: value,
        });
        return <span className="whitespace-nowrap">{price}</span>;
      },
    },
    {
      title: t('table:table-item-order-date'),
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (date: string) => {
        dayjs.extend(relativeTime);
        dayjs.extend(utc);
        dayjs.extend(timezone);
        return (
          <span className="whitespace-nowrap">
            {dayjs.utc(date).tz(dayjs.tz.guess()).fromNow()}
          </span>
        );
      },
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'status',
      key: 'status',
      align: alignLeft,
      render: (status: OrderStatus) => (
        <span
          className="whitespace-nowrap font-semibold"
          style={{ color: status?.color! }}
        >
          {status?.name}
        </span>
      ),
    },
    {
      title: t('table:table-item-shipping-address'),
      dataIndex: 'shipping_address',
      key: 'shipping_address',
      align: alignLeft,
      render: (shipping_address: UserAddress) => (
        <div>{formatAddress(shipping_address)}</div>
      ),
    },
    {
      // title: "Download",
      title: t('common:text-download'),
      dataIndex: 'id',
      key: 'download',
      align: 'center',
      render: (_id: string, order: Order) => (
        <div>
          <PDFDownloadLink
            document={<InvoicePdf order={order} />}
            fileName="invoice.pdf"
          >
            {({ loading }: any) =>
              loading ? t('common:text-loading') : t('common:text-download')
            }
          </PDFDownloadLink>
        </div>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'center',
      width: 100,
      render: (id: string) => (
        <ActionButtons id={id} detailsUrl={`${router.asPath}/${id}`} />
      ),
    },
  ];

  return (
    <>
      <div className="rounded overflow-hidden shadow mb-6">
        <Table
          //@ts-ignore
          columns={columns}
          emptyText={t('table:empty-table-data')}
          data={data}
          rowKey="id"
          scroll={{ x: 1000 }}
          expandable={{
            expandedRowRender: () => '',
            rowExpandable: rowExpandable,
          }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex justify-end items-center">
          <Pagination
            total={paginatorInfo?.total}
            current={paginatorInfo?.currentPage}
            pageSize={paginatorInfo?.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default OrderList;
