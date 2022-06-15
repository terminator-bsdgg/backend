function isTokenValid(token) {
    // NOTE: TODO! This function must connect to activedirectory and get userobject by token
    // Create function
    return new Promise((resolve) => {
        // Create a new Promise for async usage
        if (token == 'C4NQDvFIk8L#^@z!UKUnxXFcCZ5qlt')
            // Check if token equals example token
            resolve({
                valid: true,
                clientInformations: {
                    id: 1,
                    creationDate: Date.now(),
                    username: 'testusername',
                    email: 'example@email.de',
                },
            });
        // Resolve user object
        else
            resolve({
                valid: false,
                clientInformations: {},
            }); // Not valid, return empty user object
    });
}

module.exports.isTokenValid = isTokenValid; // Export function
