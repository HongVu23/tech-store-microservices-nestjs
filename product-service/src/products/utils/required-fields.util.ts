// generate required fields for product variant
export const generateVariantRequiredFields = (category: string): string[] => {
    
    if (category === 'Laptop') {
        return ['ram', 'hardDrive'];
    } 

    if (category === 'SmartPhone' || category === 'Tablet') {
        return ['ram', 'rom'];
    }

    return [];
}

// generate required fields for product detail
export const generatDetailRequiredFields = (categorty: string): string[] => {

    switch (categorty) {
        case 'Laptop':
            return ['processor', 'ramMemoryAndHardDrive', 'screen', 'graphicsAndAudio', 'connectionPortAndExpansionFeature', 'sizeAndWeight', 'additionalInformation'];
        case 'SmartPhone':
            return ['screen', 'camera', 'selfie', 'operatingSystemAndCPU', 'ramRom', 'connection', 'batteryAndCharger', 'utility', 'generalInformation'];
        case 'Tablet':
            return ['screen', 'camera', 'selfie', 'operatingSystemAndCPU', 'ramRom', 'connection', 'batteryAndCharger', 'utility', 'generalInformation'];
        case 'SmartWatch':
            return ['screen', 'design', 'utility', 'battery', 'configurationAndConnection', 'additionalInformation'];
        default:
            return ['details'];
    }
}