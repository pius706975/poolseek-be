const generateOTP = (length: number) => {
    const characters = '0123456789';

    let otp = '';
    for (let o = 0; o < length; o++) {
        const getRandomIndex = Math.floor(Math.random() * characters.length);
        otp += characters[getRandomIndex];
    }

    return otp;
};

export default generateOTP;
