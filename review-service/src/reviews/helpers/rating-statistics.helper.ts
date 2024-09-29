import { Model, Types } from "mongoose"
import { Review } from "../schemas/review.schema";

// statistics for specific rating star
export const specificStarStatistics = (count: number, totalStar: number): number => {

    const ratingStarPercentage: number = (count / totalStar) * 100;

    return ratingStarPercentage;
}

// get star rating statistics
export const getRatingStarStatisticsHelper = async (productId: Types.ObjectId, reviewModel: Model<Review>) => {

    const statisticsResult: any[] = await reviewModel.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: "$ratingStar",
                count: { $sum: 1 }
            }
        },
        {
            $addFields: {
                star: "$_id"
            }
        },
        {
            $project: {
                star: 1,
                count: 1,
                _id: 0
            }
        },
        {
            $sort: {
                star: 1
            }
        }
    ])

    // total stars
    let totalStars = 0;

    statisticsResult.forEach(item => {
        totalStars += item.count;
    })

    if (!totalStars) {
        return { isValid: false, error: { message: 'No reviews found' } };
    }

    // statisticsResult object
    const servedStatisticsResult = [
        {
            star: 1,
            count: 0,
            statisticalPercentage: 0
        },
        {
            star: 2,
            count: 0,
            statisticalPercentage: 0
        },
        {
            star: 3,
            count: 0,
            statisticalPercentage: 0
        },
        {
            star: 4,
            count: 0,
            statisticalPercentage: 0
        },
        {
            star: 5,
            count: 0,
            statisticalPercentage: 0
        }
    ]

    statisticsResult.forEach(item => {

        for (const i of servedStatisticsResult) {
            
            if (i.star === item.star) {
                i.count = item.count;
                i.statisticalPercentage = specificStarStatistics(item.count, totalStars);
                break;
            }
        }
    })

    let totalWeightedRating = 0;

    servedStatisticsResult.forEach(item => {

        totalWeightedRating += item.star * item.count;
    })

    const averageRating = totalWeightedRating / totalStars

    const responedStatisticsResult: any = {
        stars: servedStatisticsResult,
        totalStars,
        averageRating
    }

    return { isValid: true, data: responedStatisticsResult };
}