const _ = require('lodash');
const vdLib = require('./vd.json')
const vdExd = require('./vd_exd.json');
const {humanizeDelta, storeDate, hypheniphyDate, DURATION_MAPPING, getFullDateName, getDate} = require('./helpers');

const BOLD_CHAR = '\u0002'


const vdCheckUp = (event, action) => {
    const param = event.message && event.message.replace(/^!vd\s?/, '');

    const datePattern = /(\d{1,2})[/-](\d{1,2})/

    if (!param) {
        let date = getDate()
        const names = vdLib[date.short]
        const extendedNames = vdExd[date.short]

        event[action](
            `Vārda dienu šodien, ${date.full}, `
            + `svin ${BOLD_CHAR + names.join(', ') + BOLD_CHAR}, `
            + `kā arī ${extendedNames.join(', ')}.`
        )
    } else if (datePattern.test(param)) {
        let [input, month, day] = param.match(datePattern)
        month = _.padStart(month, 2, '0')
        day = _.padStart(day, 2, '0')

        const key = `${month}-${day}`

        const names = vdLib[key]
        const extendedNames = vdExd[key]
        if (!names || !extendedNames) {
            return
        }

        event[action](
            `Vārda dienu ${getFullDateName(month, day)} `
            + `svin ${BOLD_CHAR + names.join(', ') + BOLD_CHAR}, `
            + `kā arī ${extendedNames.join(', ')}.`
        )
    } else {
        const key = _.findKey(vdLib, s => s.indexOf(param) !== -1)
        const extendedKey = key ? null : _.findKey(vdExd, s => s.indexOf(param) !== -1)

        if (!key && !extendedKey) {
            event[action](`${param} nesvin.`)
            return
        }

        let [month, day] = (key || extendedKey).split('-')
        month = +month
        day = +day

        event[action](`${param} vārda dienu svin ${getFullDateName(month, day)}.`);
    }
}


module.exports = {
    vdCheckUp
}
