// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
    // The Webpack config to use when compiling your react app for development or production.
    webpack: function(config, env) {
        // ...add your webpack config
        if (env === 'development') {
            // config.plugins.push(new BundleAnalyzerPlugin())
        }
        return config
    },
}
