function isTokenValid(token) {
    return new Promise((resolve) => {
        if (token == 'C4NQDvFIk8L#^@z!UKUnxXFcCZ5qlt')
            resolve({
                valid: true,
                clientInformations: {
                    creationDate: Date.now(),
                    username: 'Paul J.',
                    email: 'pauul.win@gmail.com',
                },
            });
        else
            resolve({
                valid: false,
                clientInformations: {},
            });
    });
}

module.exports.isTokenValid = isTokenValid;
