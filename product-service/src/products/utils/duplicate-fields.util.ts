export const generateDuplicateFields = (category: string): string[] => {
    
    if (category === 'Laptop') {
        return ['ram', 'hardDrive', 'color'];
    } else if (category === 'SmartPhone' || category === 'Tablet') {
        return ['ram', 'rom', 'color'];
    } else {
        return ['color'];
    }
}