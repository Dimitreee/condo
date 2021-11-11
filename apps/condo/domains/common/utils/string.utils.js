const SPACE_SYMBOLS = ' \t\n\r\v'
const NON_BREAKIN_SPACE = '\u00A0'
const SPACE_SYMBOL_LABLES = {
    ' ': ' ',
    '\t': '\\t',
    '\n': '\\n',
    '\r': '\\r',
    '\v': '\\v',
    [NON_BREAKIN_SPACE]: '\\u00A0 (&nbsp;)',
}
// eslint-disable-next-line no-useless-escape
const ESCAPABLE_SYMBOLS = `-[]{}()*+?.,\\/^$|#${SPACE_SYMBOLS}${NON_BREAKIN_SPACE}`
const ESCAPABLE_SYMBOLS_REGEX = /[-[\]{}()*+?.,\\/^$|#\s]/g
const ESCAPE_WITH = '\\$&'

// ESCAPES SPECIAL REGEX CHARACTERS OF STRING TO ENABLE ITS USAGE INSIDE REGEX
const getEscaped = (text) => text.replace(ESCAPABLE_SYMBOLS_REGEX, ESCAPE_WITH)

module.exports = {
    getEscaped,
    ESCAPABLE_SYMBOLS,
    ESCAPABLE_SYMBOLS_REGEX,
    SPACE_SYMBOL_LABLES,
    SPACE_SYMBOLS,
    NON_BREAKIN_SPACE,
}