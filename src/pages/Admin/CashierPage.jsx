/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable react/display-name */
/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import { Icon } from '@iconify/react';
import { Modal, Table, Tabs, Switch, ConfigProvider, message } from 'antd';
import { tableOrder } from '../../constants';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	addOrderProduct,
	decreaseAmount,
	increaseAmount,
	removeProduct,
	resetOrder
} from '../../redux/Slice/orderSlice';
import { useReactToPrint } from 'react-to-print';
import * as ProductService from '../../services/product';
import * as OrderService from '../../services/order';
import { convertPrice } from '../../utils';
import { useNavigate } from 'react-router-dom';
import config from '../../config';

const CashierPage = () => {
	const [selectedTable, setSelectedTable] = useState(null);
	const [selectedTabKey, setSelectedTabKey] = useState('1');
	const [allProduct, setAllProduct] = useState([]);
	const [checked, setChecked] = useState(false);
	const [discount, setDiscount] = useState('');
	const [dataCreateOrder, setDataCreateOrder] = useState({ data: null });
	const navigate = useNavigate();
	const user = useSelector(state => state?.user);
	const printref = useRef();
	const dispatch = useDispatch();
	const order = useSelector(state => state?.order);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const showModal = () => {
		setIsModalOpen(true);
	};
	const handleCancelModal = () => {
		setIsModalOpen(false);
	};

	const handleTableClick = idx => {
		setSelectedTable(idx);
		setSelectedTabKey('2');
	};

	const handleOnChangeCount = (type, idProduct, limited) => {
		if (type === 'increase') {
			dispatch(increaseAmount({ idProduct }));
		} else if (type === 'decrease') {
			if (!limited) {
				dispatch(decreaseAmount({ idProduct }));
			}
		}
	};

	const handleDeleteProduct = idProduct => {
		dispatch(removeProduct({ idProduct }));
	};

	const priceMemo = useMemo(() => {
		const result = order?.orderItems.reduce((total, current) => {
			return total + current?.price * current?.amount;
		}, 0);
		return result;
	}, [order]);

	const priceTotalMemo = useMemo(() => {
		let result = 0;
		if (Number(discount) > priceMemo) {
			message.warning('Số tiền giảm giá không hợp lệ');
		}
		if (!checked) {
			result = priceMemo - Number(discount);
		} else {
			let dis = (priceMemo * Number(discount)) / 100;
			result = priceMemo - dis;
		}
		return result;
	}, [priceMemo, discount]);

	const getProductList = async () => {
		const res = await ProductService.getProductList(user?.storeType);
		console.log(res);
		setAllProduct(res.data);
	};

	useEffect(() => {
		getProductList();
	}, []);

	const handleAddOrder = data => {
		dispatch(
			addOrderProduct({
				orderItem: data
			})
		);
	};

	const handleCheck = () => {
		setChecked(!checked);
	};

	const handleOnChangeDiscountValue = e => {
		let priceText = e.target.value;
		const isNegative = priceText.indexOf('-') === 0;
		priceText = priceText.substr(Number(isNegative)).replace(/\D/g, '');
		setDiscount(`${isNegative ? '-' : ''}${priceText}`);
	};

	const items = [
		{
			key: '1',
			label: 'Phòng bàn',
			children: (
				<ul className='h-full flex flex-wrap gap-y-6'>
					{tableOrder.map((item, idx) => (
						<li
							onClick={() => handleTableClick(idx)}
							key={idx}
							className={`cursor-pointer text-center w-[12.5%] h-[25%] hover:bg-[#d5d5d5d5] rounded-2xl flex flex-col items-center gap-1 
							${selectedTable === idx ? 'bg-[#4b6580] ' : ''}`}
						>
							{idx === 0 ? (
								<>
									<Icon
										icon={item.icon}
										height={40}
										className='my-2'
									/>
									{item.title}
								</>
							) : (
								<>
									<img
										src={item.icon}
										alt='table-icon'
										className='pt-4'
									/>
									{item.title}
								</>
							)}
						</li>
					))}
				</ul>
			)
		},
		{
			key: '2',
			label: 'Thực đơn',
			children: (
				<ul className='flex flex-wrap gap-y-6 h-full'>
					{allProduct?.map(item => (
						<li
							key={item._id}
							onClick={() =>
								handleAddOrder({
									name: item.name,
									amount: 1,
									image: item.image,
									price: item.price,
									id: item._id
								})
							}
							className='cursor-pointer w-[20%] h-[25%] hover:bg-[#d5d5d5d5] rounded-2xl gap-1 flex flex-col items-center justify-center'
						>
							<div className='p-0 overflow-hidden text-center h-[100px]'>
								<img
									src={item?.image}
									alt='anh-cf'
									width={50}
									height={50}
									className='h-full max-w-full pt-2'
									loading='lazy'
								/>
							</div>
							<h2 className='overflow-hidden font-semibold'>
								{item?.name}
							</h2>
							<span className='text-primary font-semibold'>
								{convertPrice(item?.price)}
								<sup>đ</sup>
							</span>
						</li>
					))}
				</ul>
			)
		},
		{
			key: '3',
			label: 'Khác',
			children: 'Content of Tab Pane 3'
		}
	];

	const PrintOrder = React.forwardRef(({ allProduct, priceTotal }, ref) => {
		const columns = [
			{
				title: 'Tên sản phẩm',
				dataIndex: 'name'
			},

			{
				title: 'Số lượng',
				dataIndex: 'amount'
			},

			{
				title: 'Đơn giá',
				dataIndex: 'price'
			},
			{
				title: 'Thành tiền',
				dataIndex: 'total'
			}
		];

		const dataSource =
			allProduct?.length > 0 &&
			allProduct?.map(item => {
				return {
					...item,
					price: convertPrice(item.price),
					total: convertPrice(item.price * item.amount),
					key: item?._id
				};
			});
		return (
			<div
				className='flex-col gap-2 '
				ref={ref}
			>
				<div className='flex flex-col items-center justify-center gap-2 '>
					<h1 className='text-2xl font-bold'>Hệ thống ITViet</h1>
					<div className='flex items-center text-[14px] gap-1'>
						<span>Địa chỉ:</span>
						<span>
							254 Nguyễn Văn Linh, Quận Thanh Khê - Tp. Đà Nẵng
						</span>
					</div>
					<div className='flex items-center text-[14px] gap-1'>
						<span>Điện thoại:</span>
						<span>(+84) 236.3650403 - (+84) 236.3827111</span>
					</div>

					<h3 className='text-xl font-bold'>Hóa đơn thanh toán</h3>
				</div>
				<div>
					<Table
						columns={columns}
						dataSource={dataSource}
						pagination={false}
					/>
					<div className='flex items-center justify-between px-4 mt-2'>
						<span>Tổng cộng:</span>
						<span className='mr-24'>{priceTotal}</span>
					</div>
				</div>

				<span className='flex justify-center mt-5 text-sm'>
					Vui lòng quét mã QR code nếu bạn muốn chuyển khoản
				</span>

				<div className='mt-2 flex justify-center'>
					<img
						src='../src/assets/images/QRcode.jpg'
						alt='qrcode'
						width={260}
						height={260}
					/>
				</div>
				<span className='flex justify-center mt-2 text-sm'>
					Cảm ơn quý khách và hẹn gặp lại !!!
				</span>
			</div>
		);
	});

	const handlePrint = useReactToPrint({
		content: () => printref.current
	});

	//create order

	const createOrderApi = async data => {
		const { orderItems, itemPrice, discountPrice, totalPrice } = data;
		const res = await OrderService.createOrder({
			orderItems,
			itemPrice,
			discountPrice,
			totalPrice
		});
		setDataCreateOrder(res);
	};

	const handleCreateOrder = () => {
		const params = {
			orderItems: order?.orderItems,
			itemPrice: priceMemo,
			discountPrice: Number(discount),
			totalPrice: priceTotalMemo
		};

		createOrderApi(params);
	};

	useEffect(() => {
		if (dataCreateOrder.status === 'OK') {
			try {
				const arrayOrder = [];
				dispatch(resetOrder({ listChecked: arrayOrder }));
				setDiscount('');
				handlePrint();
			} catch (error) {
				console.error(error);
			}
		}
		if (dataCreateOrder.status === 'ERR') {
			message.error('Thất bại');
		}
	}, [dataCreateOrder.status]);

	return (
		<>
			<div className=' bg-[#2f3f50] pt-3 pr-8 w-full  text-white relative'>
				<div className='absolute top-1 right-10 my-2 group'>
					<span className='flex gap-1 items-center cursor-pointer text-base'>
						<Icon
							icon='ph:user-light'
							height={20}
						/>
						{user.name}
					</span>
					<ul className='dropdown-menu w-[210px] grid-cols-1 group-hover:top-5 right-20 z-20'>
						<li className='hover:text-primary text-base flex items-center gap-1'>
							<Icon
								icon='ph:user-light'
								height={20}
							/>
							Thông tin tài khoản
						</li>
						<li className='hover:text-primary text-base flex items-center gap-1'>
							<Icon
								icon='ant-design:setting-outlined'
								height={20}
							/>
							Cài đặt
						</li>
						<li
							className='hover:text-primary text-base flex items-center gap-1'
							onClick={() => navigate(config.routes.login)}
						>
							<Icon
								icon='ic:twotone-logout'
								height={20}
							/>
							Đăng xuất
						</li>
					</ul>
				</div>
			</div>
			<div className='pt-10 px-3 w-full h-full min-h-screen flex bg-[#2f3f50] gap-4'>
				<div className='w-[65%] bg-white rounded-2xl p-4 relative'>
					<div class="flex h-10 overflow-hidden absolute right-2 top-4 z-10 w-[50%] mr-10">
						<div class="grid place-items-center h-full w-12 text-gray-500">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>

						<input
							class="peer h-full w-full outline-none text-sm text-gray-800 pr-2 focus-within:border-b-2 focus-within:border-b-primary"
							type="text"
							id="search"
							placeholder="Tên sản phẩm" />
					</div>
					<Tabs
						items={items}
						activeKey={selectedTabKey}
						onChange={setSelectedTabKey}
					/>
				</div>

				<div className='w-[35%] flex flex-col bg-white rounded-2xl p-4'>
					<div className='h-full '>
						<div className='border-b-2 pb-2'>
							<h1>Label</h1>
						</div>
						{order?.orderItems.length === 0 && (
							<div className='flex items-center flex-col justify-center mt-10'>
								<i
									className='w-[96px] h-[96px] min-w-[96px]'
									style={{
										background:
											'url(https://static-kvfnb.kiotviet.vn/Content/WebPos/food-icon.svg) no-repeat'
									}}
								></i>
								<div className='text-center'>
									<p className='font-medium text-xl'>
										Chưa có món nào
									</p>
									<span>Vui lòng chọn thực đơn</span>
								</div>
							</div>
						)}
						{order?.orderItems.length > 0 &&
							order?.orderItems?.map(item => (
								<div
									key={item._id}
									className='my-[5px] pb-3 '
									ref={printref}
								>
									<div
										style={{
											backgroundColor: 'unset',
											boxShadow:
												'0px 4px 10px rgba(0, 0, 0, 0.1)',
											border: '1px solid transparent',
											borderRadius: '10px',
											padding: '14px 0'
										}}
									>
										<div className='flex w-full items-center'>
											<span
												className='px-2 hover:text-red-500 cursor-pointer'
												onClick={() =>
													handleDeleteProduct(
														item?.id
													)
												}
											>
												<Icon
													icon='ph:trash-light'
													height={20}
												/>
											</span>
											<div className='flex flex-1 gap-x-2 '>
												<div
													className=''
													style={{
														flex: '1 1 20%',
														wordBreak: 'break-word'
													}}
												>
													<span className='font-semibold'>
														{item.name}
													</span>
												</div>

												<div className='w-[100px]'>
													<div className='flex items-center'>
														<button
															className='w-7 h-7 min-w-7 rounded-full flex items-center justify-center'
															style={{
																border: '1px solid #4D5258'
															}}
															onClick={() =>
																handleOnChangeCount(
																	'decrease',
																	item.id,
																	item?.amount ===
																	1
																)
															}
														>
															-
														</button>

														<input
															min={1}
															value={item?.amount}
															className='w-8 h-5 border-none text-center'
															type='number'
														/>

														<button
															className='w-7 h-7 min-w-7 rounded-full flex items-center justify-center'
															style={{
																border: '1px solid #4D5258'
															}}
															onClick={() =>
																handleOnChangeCount(
																	'increase',
																	item.id
																)
															}
														>
															+
														</button>
													</div>
												</div>
												<div className='font-semibold w-[100px]'>
													{convertPrice(
														item?.price *
														item?.amount
													)}
													<sup>đ</sup>
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
					</div>

					<div className='flex flex-col gap-2'>
						<div className='flex w-full items-center justify-between border-t border-t-gray-600 pt-4 pb-3'>
							<div className='text-lg font-semibold flex flex-col items-center gap-2'>
								<span>Tạm tính:</span>
								<span>Giảm giá:</span>
								<span>Tổng tiền</span>
							</div>
							<span className='text-lg font-semibold flex flex-col items-center gap-2'>
								<span>
									{convertPrice(priceMemo)}
									<sup>đ</sup>
								</span>
								<div
									className=''
									onClick={showModal}
								>
									<span className='flex items-center hover:boxShadow hover:cursor-pointer px-2 rounded-md'>
										{discount
											? `${convertPrice(
												Number(discount)
											)} ${checked ? '%' : 'đ'}`
											: '0'}
									</span>
								</div>
								<span>
									{convertPrice(priceTotalMemo)}
									<sup>đ</sup>
								</span>
							</span>
						</div>

						<button
							onClick={handleCreateOrder}
							className='flex items-center py-4 px-6 w-full bg-[#28b44f] rounded-2xl justify-center font-semibold text-white'
						>
							<Icon icon='solar:dollar-linear' />
							Thanh toán (F9)
						</button>

						<div className='hidden'>
							<PrintOrder
								ref={printref}
								allProduct={order?.orderItems}
								priceTotal={convertPrice(priceTotalMemo)}
							/>
						</div>
					</div>
				</div>
			</div>
			<Modal
				forceRender
				title='Bảng giảm giá'
				open={isModalOpen}
				footer={() => (
					<div className='py-4 mb-3'>
						<button
							onClick={handleCancelModal}
							className='float-right px-2 py-2 w-[120px] bg-[#28b44f] rounded-2xl font-semibold text-white'
						>
							<div className='w-full flex items-center justify-center gap-2'>
								<Icon icon='solar:dollar-linear' />
								Xác nhận
							</div>
						</button>
					</div>
				)}
				onCancel={handleCancelModal}
			>
				<div className='flex flex-col gap-2'>
					<div className='flex w-full items-center justify-between'>
						<div className='font-semibold flex flex-col gap-2'>
							<span>Loại giảm giá:</span>
							<span>Số tiền / Phần trăm:</span>
						</div>
						<div className='font-semibold flex flex-col gap-2'>
							<ConfigProvider
								theme={{
									components: {
										Switch: {
											colorPrimary: '#28b44f',
											colorPrimaryHover: '#28b44f'
										}
									}
								}}
							>
								<Switch
									className='bg-primary'
									checkedChildren='%'
									unCheckedChildren='Tiền'
									checked={checked}
									onChange={handleCheck}
								/>
							</ConfigProvider>

							<div className=' flex items-center gap-2'>
								<input
									type='text'
									className='border border-[#ccc] rounded-lg focus:outline-none px-2 w-[120px] py-1'
									value={Number(discount).toLocaleString()}
									onChange={handleOnChangeDiscountValue}
								/>
								<span className=''>
									{checked ? '%' : 'VND'}
								</span>
							</div>
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default CashierPage;
