import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Order, OrderItem } from "./schemas/order.schema";
import { Document, FlattenMaps, Model, Types } from "mongoose";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { User } from "./interfaces/user.interface";
import { getOrderItemsInfo } from "./helpers/order-items-info.helper";
import { getSaledProducts } from "./helpers/saled-products.helper";
import { isValidMonth, isValidYear } from "./utils/date-validator.util";
import { getMonthStatistics } from "./helpers/month-statistics.helper";
import { getYearStatistics } from "./helpers/year-statistics.helper";

@Injectable()
export class OrdersService {

    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @Inject('USER_SERVICE') private userServiceClient: ClientProxy,
        @Inject('PRODUCT_SERVICE') private productServiceClient: ClientProxy,
        @Inject('STOCK_SERVICE') private stockServiceClient: ClientProxy
    ) { }

    async getOrders(user: User, queryUserId?: string): Promise<Order[]> {

        let orders: Order[] = [];
        if (user.role === 'Admin') {
            if (queryUserId) {
                if (!Types.ObjectId.isValid(queryUserId)) {
                    throw new RpcException({ message: 'Orders not found', statusCode: HttpStatus.NOT_FOUND });
                }
                // get user info
                let userInfo: any;
                try {
                    userInfo = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-user' }, queryUserId));
                } catch (err) { throw new RpcException(err); }
                // get orders by query user id
                orders = await this.orderModel.find({ user: new Types.ObjectId(queryUserId) }).sort({ createdAt: -1 }).lean().exec();
                // asign user info to orders
                for (const order of orders) {
                    order.user = userInfo;
                }
            } else {
                orders = await this.orderModel.find().sort({ createdAt: -1 }).lean().exec();
                // get and asign user info to orders
                for (const order of orders) {
                    let userInfo: any;
                    try {
                        userInfo = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-user' }, order.user));
                        order.user = userInfo;
                    } catch (err) { throw new RpcException(err); }
                }
            }

        } else {
            // get user info
            let userInfo: any;
            try {
                userInfo = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-user' }, user.id));
            } catch (err) { throw new RpcException(err); }
            orders = await this.orderModel.find({ user: new Types.ObjectId(user.id) }).sort({ createdAt: -1 }).lean().exec();
            // asign user infor
            for (const order of orders) {
                order.user = userInfo;
            }
        }

        // if (!orders.length) throw new RpcException({ message: 'Orders not found', statusCode: HttpStatus.NOT_FOUND });
        if (!orders.length) return [];
        // get full info for orderItem
        orders = await getOrderItemsInfo(orders, this.productServiceClient);
        return orders;
    }

    async createOrder(createOrderDto: CreateOrderDto): Promise<{ message: string }> {

        const user: User = createOrderDto.user;
        // get user info
        const userInfo: any = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-user' }, user.id));

        if (!createOrderDto.phoneNumber) {

            if (userInfo.phoneNumber) {
                createOrderDto.phoneNumber = userInfo.phoneNumber;
            } else {
                throw new RpcException({ message: 'Phone number is required. You do not have phone number in your account yet.', statusCode: HttpStatus.BAD_REQUEST });
            }
        }

        if (!createOrderDto.address) {
            let orderAddress: string;

            if (userInfo.address.length) {
                for (const address of userInfo.address) {
                    if (address.defaultAddress) {
                        orderAddress = address.address;
                        break;
                    }
                }
            } else {
                throw new RpcException({ message: 'An address is required. You do not have an address in your account yet.', statusCode: HttpStatus.BAD_REQUEST });
            }
            createOrderDto.address = orderAddress;
        }

        const currentDate: Date = new Date();

        const preparedOrderItems: OrderItem[] = [];
        let totalOfOrder: number = 0;

        for (const orderItem of createOrderDto.orderItems) {

            // get order item info
            let orderItemInfo: any;

            try {
                orderItemInfo = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product-variant-without-productid' }, orderItem.product));
            } catch (err) {
                throw new RpcException(err);
            }

            let price: number = orderItemInfo.price;
            if (orderItemInfo.discount.discountPercentage) {

                if (currentDate < orderItemInfo.discount.discountEndDate) {
                    // if there is still a discount
                    const discountAmount: number = price * (orderItemInfo.discount.discountPercentage / 100);
                    price = price - discountAmount;
                }
            }

            // caculate total price
            const tolalPrice = orderItem.quantity * price;
            totalOfOrder += tolalPrice;

            preparedOrderItems.push({
                product: new Types.ObjectId(orderItem.product),
                quantity: orderItem.quantity,
                total: tolalPrice
            });

            // reduce quantity in inventory
            try {
                await firstValueFrom(this.stockServiceClient.send({ cmd: 'reduce-product-quantity-in-inventory' }, {
                    productId: orderItem.product,
                    quantity: orderItem.quantity
                }))
            } catch (err) { throw new RpcException(err); }
        }

        // create new order
        const savedOrdred: Document<Types.ObjectId, any, Order> = await this.orderModel.create({
            user: new Types.ObjectId(user.id),
            orderItems: preparedOrderItems,
            paymentMethod: createOrderDto.paymentMethod,
            phoneNumber: createOrderDto.phoneNumber,
            address: createOrderDto.address,
            total: totalOfOrder
        });

        return { message: savedOrdred._id.toString() };
    }

    async getStatistics(admin: User): Promise<Record<string, any>> {

        const orders: Order[] = await this.getOrders(admin);

        if (!orders.length) throw new RpcException({ message: 'Orders not found', statusCode: HttpStatus.NOT_FOUND });

        // get saled products
        const saledProducts: any = getSaledProducts(orders);

        // get total products in inventory
        let totalProductsQuantityInInventory: number;
        try {
            totalProductsQuantityInInventory = await firstValueFrom(this.stockServiceClient.send({ cmd: 'get-total-products-quantity' }, {}));
        } catch (err) { throw new RpcException(err); }

        // get customers quantity statistics
        let user: any;
        try {
            user = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-user-quantity-statistics' }, {}));
        } catch (err) { throw new RpcException(err); }

        // find number of products
        let products: any[];
        try {
            products = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-products' }, ''));
        } catch (err) { throw new RpcException(err); }

        return {
            numberOfOrder: orders.length,
            products: saledProducts,
            quantityInInventory: totalProductsQuantityInInventory,
            user,
            numberOfProduct: products.length
        };
    }

    async getStatisticChart(year: string = new Date().getFullYear().toString(), month?: string) {

        let result: any[];
        if (year) {
            // check whether year is valid or not
            const isValidYearResult: boolean = isValidYear(year);
            if (!isValidYearResult) throw new RpcException({ message: 'Year is invalid', statusCode: HttpStatus.BAD_REQUEST });

            if (month) {
                // check whether month is invalid or not
                const isValidMonthResult: boolean = isValidMonth(month);
                if (!isValidMonthResult) throw new RpcException({ message: 'Month is invalid', statusCode: HttpStatus.BAD_REQUEST });

                // get data
                const recievedData: any[] = await getMonthStatistics(year, month, this.orderModel);
                result = recievedData;
            } else {
                // get data
                const recievedData: any[] = await getYearStatistics(year, this.orderModel);
                result = recievedData;
            }
        }

        return result;
    }

    async getOrder(user: User, order: Document<Types.ObjectId, any, Order>): Promise<Document<Types.ObjectId, any, Order>> {

        // check whether this is user or admin
        if (user.role === 'User') {
            // find all order of this users
            const orders: (FlattenMaps<Order> & { _id: Types.ObjectId })[] = await this.orderModel.find({ user: new Types.ObjectId(user.id) }).lean().exec();

            if (!orders.length || !orders.some(o => o._id.toString() === order._id.toString())) {
                throw new RpcException({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
            }
        }

        // find and attach variant
        const orderItems: OrderItem[] = order.get('orderItems');
        for (const orderItem of orderItems) {

            let productVariant: any;
            try {
                productVariant = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-populated-product-variant-without-productid' }, orderItem.product));
            } catch (err) { throw new RpcException(err); }

            // re-asign to product of orderItem
            orderItem.product = productVariant;
        }

        // find and attach user info
        let userInfo: any;
        try {
            userInfo = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-user' }, order.get('user')));
        } catch (err) { throw new RpcException(err); }

        // re-asign to user and orderItems
        order.set('orderItems', orderItems);
        order.set('user', userInfo);

        return order;
    }
}