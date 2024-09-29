// standardize folder names:
export const standardizeFolderNames = (str: string): string => {

    if (!str) {
        return '';
    }
    return str.trim().toLowerCase().replace(/\s+/g, '-');
}


// Pluralize name:
export const pluralizeProductName = (category: string): string => {

    if (!category) {
        return '';
    }
    
    if (category === 'SmartWatch') {
        category += 'es';
    } else if (category === 'Mouse') {
        category = 'Mice';
    } else {
        category += 's';
    }

    return category;
}