import { Model } from "mongoose";
import { Order } from "../schemas/order.schema";

// get statistics of month
export const getMonthStatistics = async (year: string, month: string, orderModel: Model<Order>): Promise<any[]> => {

    const statisticYear: number = new Date(year).getFullYear();
    const startDate: Date = new Date(statisticYear, parseInt(month) - 1, 1);
    const endDate: Date = new Date(statisticYear, parseInt(month), 0);

    const pipeline: any[] = [
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            }
        },
        {
            $group: {
                _id: { $dayOfMonth: '$createdAt' },
                count: { $sum: { $sum: '$orderItems.quantity' } },
                revenue: { $sum: '$total' }
            }
        },
    ]

    const stats: any[] = await orderModel.aggregate(pipeline);

    // prepared result array
    const result: any[] = [];
    for (let i = startDate.getDate(); i <= endDate.getDate(); i++) {
        result.push({ day: i, quantity: 0, revenue: 0 })
    }

    stats.forEach((stat: any) => {
        const day = stat._id;
        const quantity = stat.count;
        const revenue = stat.revenue;

        for (const i of result) {
            if (i.day === day) {
                i.quantity = quantity;
                i.revenue = revenue;
                break;
            }
        }
    })

    return result;
}
