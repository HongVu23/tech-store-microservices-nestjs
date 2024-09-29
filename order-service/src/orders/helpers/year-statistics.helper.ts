import { Order } from "../schemas/order.schema";
import { monthNames } from "../utils/month-names.util";
import { Model } from "mongoose";

// get statistic of year
export const getYearStatistics = async (year: string, orderModel: Model<Order>): Promise<any[]> => {

    const statisticYear: number = new Date(year).getFullYear();
    const startDate: Date = new Date(statisticYear, 0, 1);
    const endDate: Date = new Date(statisticYear, 11, 31);

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
                _id: { $month: '$createdAt' },
                count: { $sum: { $sum: '$orderItems.quantity' } },
                revenue: { $sum: '$total' }
            }
        }
    ]

    const stats: any = await orderModel.aggregate(pipeline);

    // prepared result array
    const result: any[] = [];
    for (let i = 1; i < monthNames.length; i++) {
        result.push({ month: monthNames[i], quantity: 0, revenue: 0 })
    }

    // asign stats data to prepared result array
    stats.forEach((stat: any) => {
        const month = stat._id
        const quantity = stat.count
        const revenue = stat.revenue

        for (const i of result) {
            if (i.month === monthNames[month]) {
                i.quantity = quantity
                i.revenue = revenue
                break
            }
        }
    })

    return result;
}