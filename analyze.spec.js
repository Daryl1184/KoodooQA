const {
    standardDeviation,
    sanitizeAmounts,
    roundToTwoDp,
    analysePayments
} = require('./analyze.js')
const test = require('ava')
const exampleJSON = require('./example.json');

test('Standard Deviation is correct for Basic Data', t => {
    //First Argument for t.is is actual, second is expected
    t.deepEqual(standardDeviation([1, 2, 2, 2, 1, 1]), 0.5)
})

test('Standard Deviation is correct for values that hold more than 2 deciaml place', t => {
    t.deepEqual(standardDeviation([0,0,0.099,0.009]), 0.04)
})

test('Standard Deviation is correct for Varied Data', t => {
    t.deepEqual(standardDeviation([-1, 0, 1.01, 1.001, 1.899, '2', "23"]), 7.82)
})

/*NOTE - Test fails as the return value is 4.33 but test expected value is 0,
this is due to payment one, two and three are being handled by sanitizedAmounts and 
returned as 0 for each - sanitized amounts doesnt seem to handle string empty/null 
key values unless the expectation is that it should be 0?*/
test('Standard Deviation is correct for empty null key values', t => {
    t.deepEqual(standardDeviation(sanitizeAmounts(
        [{
            "Amount": '',
            "TransactionInformation": "Payment One"
        },
        {
            "Amount": null,
            "TransactionInformation": "Payment Two"
        },
        {
            "Amount": "",
            "TransactionInformation": "Payment Three"
        },
        {
            "Amount": 10
        },
        {
            "TransactionInformation": "Payment Five"
        }
        ])), 0)
})

/*NOTE - Empty string key value and null key values are being sanitized to 0 
- test will fail as mean, median, and standard deviation for this reason.
is this expected handling of these formats? output created on them not being valid*/
test('Payments are analysed correctly', t => {
    t.deepEqual(analysePayments([{
        "Amount": '1',
        "TransactionInformation": "Payment One"
    },
    {
        "Amount": "2",
        "TransactionInformation": "Payment Two"
    },
    {
        "Amount": 3.91,
        "TransactionInformation": "Payment Three"
    },
    {
        "Amount": 400,
        "TransactionInformation": "Payment Four"
    },
    {
        "Amount": -400,
        "TransactionInformation": "Payment Five"
    },
    {
        "Amount": null,
        "TransactionInformation": "Payment Six"
    },
    {
        "TransactionInformation": "Payment Seven"
    },
    {

    }
    ]), {
        max: 400,
        mean: 1.38,
        median: 1.15,
        min: -400,
        standardDeviation: 252.99
    })
})

//NOTE - Empty string key value and null key values are being sanitized to 0 - test will fail
test('Amounts formats are santized correctly', t => {
    const sanitized = sanitizeAmounts([{
        "Amount": '1',
        "TransactionInformation": "Payment One"
    },
    {
        "Amount": "2",
        "TransactionInformation": "Payment Two"
    },
    {
        "Amount": 3.9123,
        "TransactionInformation": "Payment Three"
    },
    {
        "Amount": 400,
        "TransactionInformation": "Payment Four"
    },
    {
        "Amount": -400,
        "TransactionInformation": "Payment Five"
    },
    {
        "Amount": null,
        "TransactionInformation": "Payment Six"
    },
    {
        "Amount": ""
    },
    {
        "TransactionInformation": "Payment Eight"
    },
    {

    }
    ])

    t.deepEqual(sanitized, [1, 2, 3.9123, 400, -400]);
})

//NOTE - lowercase keys are not being handled - test will fail
test('Amounts are santized correctly with lowercase keys', t => {
    const sanitized = sanitizeAmounts([{
        "amount": 1,
        "transactionInformation": "Payment One"
    },
    {
        "Amount": 2,
        "transactionInformation": "Payment Two"
    },
    {
        "amount": 3,
        "transactionInformation": "Payment Three"
    }
    ])

    t.deepEqual(sanitized, [1, 2, 3]);
})

//NOTE - Empty string key values are being treated as 0 - test will fail
test('Amounts are santized correctly with missing key/value pairs', t => {
    const sanitized = sanitizeAmounts([{
        "Amount": 1,
        "TransactionInformation": "Payment One"
    },
    {

    },
    {
        "Amount": ""
    },
    {
        "Amount": 3,
        "TransactionInformation": "Payment Four"
    }
    ])

    t.deepEqual(sanitized, [1, 3]);
})

//NOTE - Test fails for different formats in the 'Amount' key values
test('Different format amounts are santized correctly', t => {
    const sanitized = sanitizeAmounts([{
        "Amount": "£1.00",
        "TransactionInformation": "Payment One"
    },
    {
        "Amount": "$2",
        "TransactionInformation": "Payment Two"
    },
    {
        "Amount": "500,00",
        "TransactionInformation": "Payment Three"
    },
    {
        "Amount": "500,150.00",
        "TransactionInformation": "Payment Four"
    },
    {
        "Amount": '1',
        "TransactionInformation": "Payment Five"
    },
    {
        "Amount": null,
        "TransactionInformation": "Payment Six"
    },
    {
        "Amount": ""
    },
    {
        "TransactionInformation": "Payment Eight"
    },
    {

    }
    ])

    t.deepEqual(sanitized, [1, 2, 500, 500150, 1]);
})

test('B Amounts rounds to two decimal place correctly', t => {
    let sanitized = sanitizeAmounts([{
        "Amount": -0.999,
        "TransactionInformation": "Payment One"
    },
    {
        "Amount": 0.000,
        "TransactionInformation": "Payment Two"
    },
    {
        "Amount": 0.011,
        "TransactionInformation": "Payment Three"
    },
    {
        "Amount": 0.999,
        "TransactionInformation": "Payment Four"
    }
    ])

    sanitized.forEach((itm, index) => sanitized[index] = roundToTwoDp(itm))
    t.deepEqual(sanitized, [-1, 0, 0.01, 1]);
})

test('JSON file has data', t => {
    t.true(exampleJSON.length > 0);
})



