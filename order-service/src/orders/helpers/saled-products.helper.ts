// get saled products
export const getSaledProducts = (orders: any) => {
    const statistics: any = {
        laptop: { quantity: 0, revenue: 0 },
        smartPhone: { quantity: 0, revenue: 0 },
        tablet: { quantity: 0, revenue: 0 },
        smartWatch: { quantity: 0, revenue: 0 },
        cable: { quantity: 0, revenue: 0 },
        charger: { quantity: 0, revenue: 0 },
        headphone: { quantity: 0, revenue: 0 },
        keyboard: { quantity: 0, revenue: 0 },
        mouse: { quantity: 0, revenue: 0 }
    }

    for (const order of orders) {
        // loop through order items
        for (const orderItem of order.orderItems) {
            switch (orderItem.product.product.category) {
                case 'Laptop':
                    statistics.laptop.quantity += orderItem.quantity;
                    statistics.laptop.revenue += orderItem.total;
                    break;
                case 'SmartPhone':
                    statistics.smartPhone.quantity += orderItem.quantity;
                    statistics.smartPhone.revenue += orderItem.total;
                    break;
                case 'Tablet':
                    statistics.tablet.quantity += orderItem.quantity;
                    statistics.tablet.revenue += orderItem.total;
                    break;
                case 'SmartWatch':
                    statistics.smartWatch.quantity += orderItem.quantity;
                    statistics.smartWatch.revenue += orderItem.total;
                    break;
                case 'Cable':
                    statistics.cable.quantity += orderItem.quantity;
                    statistics.cable.revenue += orderItem.total;
                    break;
                case 'Charger':
                    statistics.charger.quantity += orderItem.quantity;
                    statistics.charger.revenue += orderItem.total;
                    break
                case 'Headphone':
                    statistics.headphone.quantity += orderItem.quantity;
                    statistics.headphone.revenue += orderItem.total;
                    break;
                case 'Keyboard':
                    statistics.keyboard.quantity += orderItem.quantity;
                    statistics.keyboard.revenue += orderItem.total;
                    break;
                case 'Mouse':
                    statistics.mouse.quantity += orderItem.quantity;
                    statistics.mouse.revenue += orderItem.total;
                    break;
                default:
                    break;
            }
        }
    }

    // get toal revenue of all products
    let quantity = 0;
    let revenue = 0;

    for (const key in statistics) {
        quantity += statistics[key].quantity;
        revenue += statistics[key].revenue;
    }

    // asign quantity and revenue to statistics object
    statistics.quantity = quantity;
    statistics.revenue = revenue;
    return statistics
}