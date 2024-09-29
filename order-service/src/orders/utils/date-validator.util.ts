// check whether year is valid or not
export const isValidYear = (year: string): boolean => {

    const parsedYear = parseInt(year);

    if (isNaN(parsedYear) || parsedYear <= 0) {
        return false;
    }

    return true;
}

// check whether month is valid or not
export const isValidMonth = (month: string): boolean => {

    const parsedMonth = parseInt(month);

    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        return false;
    }

    return true;
}
