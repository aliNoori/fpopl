export default defineNuxtPlugin(() => {
    return {
        provide: {
            formatPrice: (price) => {
                return Math.floor(price).toLocaleString('fa-IR');
            },
            toPersian: (number) => {
                const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                return number.toString().replace(/[0-9]/g, (digit) => persianNumbers[digit]);
            },
            toEnglishDigits: (str) => {
                const persianNums = '۰۱۲۳۴۵۶۷۸۹';
                return str.replace(/[۰-۹]/g, (d) => persianNums.indexOf(d));
            }


        }
    }
});
