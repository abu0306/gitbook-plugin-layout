const fs = require('fs')
const cheerio = require('cheerio')

const urls = []

module.exports = {
    // 钩子函数
    hooks: {
        'page': function (page) {
            if (this.output.name !== 'website') return page
            const outputUrl = this.output.toURL('_book/' + page.path)
            urls.push({
                url: outputUrl + (outputUrl.substr(-5, 5) !== '.html' ? 'index.html' : '')
            })
            return page
        },

        'finish': function () {

            const that = this

            urls.forEach(function (value) {


                if (!that.options.pluginsConfig) {
                    return
                }

                const html = fs.readFileSync(value.url, {encoding: 'utf-8'})
                const $ = cheerio.load(html)

                if (that.options.pluginsConfig.summaryLogo) {
                    /**
                     *  添加目录顶部logo
                     */
                    summaryLogo(that.options.pluginsConfig.summaryLogo, $, value)
                }
            })
        }
    },

    // 代码块
    blocks: {},

    // 过滤器
    filters: {}
};

/**
 * 添加目录顶部logo
 */
function summaryLogo(pluginsConfig, $, value) {

    const html_path = pluginsConfig.html_path || ''
    const css_path = pluginsConfig.css_path || ''
    const root_class = pluginsConfig.root_class || ''

    if (fs.existsSync(html_path)) {
        const target = fs.readFileSync(html_path, {encoding: 'utf-8'})
        const target_css = fs.readFileSync(css_path, {encoding: 'utf-8'})
        $('head').append('<style type="text/css">' + target_css + '</style>')
        $('.' + root_class).remove()
        $('body .book-summary').prepend(target)
        fs.writeFileSync(value.url, $.root().html(), {
            encoding: 'utf-8'
        })
    }
}
