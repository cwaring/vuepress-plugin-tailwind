import { merge } from 'lodash'

const defaultOptions = {
    purgecss: {
        enabled: true,
    },
}

const plugin = (options = {}, context) => {
    const { themeConfig, siteConfig, cwd, isProd } = context
    const { config, purgecss, subDir } = merge(defaultOptions, options)

    const plugins = [
        require("tailwindcss")(config),
        require("autoprefixer"),
    ]

    const workingDir = subDir ? `${cwd}/${subDir}` : cwd
    
    /**
     * Only run purge css in production.
     */
    if (isProd && purgecss.enabled) plugins.push(require("@fullhuman/postcss-purgecss")({
        content: [
            `${workingDir}/.vuepress/theme/**/*.*`,
            `${workingDir}/!(node_modules)/**/*.md`,
        ],

        extractors: [
            {
                /**
                 * A fix for purge css to pick up class names with escaped chars
                 * E.g. md:w-1/2.
                 *
                 * Solution from https://github.com/tailwindcss/tailwindcss/issues/391#issuecomment-366922730
                 */
                extractor: class TailwindExtractor {
                    static extract(content) {
                        return (
                            content.match(/[A-z0-9-:\/]+/g) || []
                        );
                    }
                },
                extensions: [
                    "css",
                    "html",
                    "js",
                    "vue",
                    "md",
                    "styl"
                ]
            }
        ],

        /**
         * Ensure default resets and normalised classes are not removed by PurgeCSS
         */
        whitelistPatterns: [
            /^(h\d|p$|ul|li$|div|ol|table|td$|th$|thead|tbody|main|input|button|form|md-|hljs)/
        ]
    }))

    /**
     * Merge in the site's purgecss config
     */
    siteConfig.postcss = merge(siteConfig.postcss || {}, { plugins })

    return {
        name: '@silvanite/vuepress-plugin-tailwind',
    }
}

export default plugin
