{
    // appDir: './',
    baseUrl: '../src',
    // optimize: 'none',
    name: 'kChart',
    packages: [
        {
            name: 'zrender',
            location: '.',
            main: 'zrender'
        }
    ],
    include:[
        'zrender/kChart/PriceLine',
        'zrender/kChart/CrossLine',
        'zrender/kChart/AssistLine',
        'zrender/kChart/FibonacciLine',
        'zrender/kChart/Quota',
        'zrender/kChart/Candle',
        'zrender/kChart/CandleQueue',
        'zrender/kChart/CandleDate',
        'zrender/kChart/KAxis',
        'zrender/kChart/CandlePainter'
    ],
    out: 'kChart.js'
}