/**
 * Converting plots (time series) to Excel sheets
 */

const Excel = require('exceljs/modern.nodejs');

const MAX_SHEET_NAME_LENGTH = 31;

// Characters Excel doesn't allow in a worksheet name, mapped to a
// visually-similar "fullwidth" Unicode lookalike instead of being dropped,
// so the character still reads as itself instead of disappearing.
const INVALID_SHEET_NAME_CHAR_REPLACEMENTS = {
    '\\': '＼',
    '/': '／',
    '?': '？',
    '*': '＊',
    '[': '［',
    ']': '］',
    ':': '：',
};
const INVALID_SHEET_NAME_CHARS = /[\\\/\?\*\[\]:]/g;

/**
 * Replaces characters Excel doesn't allow in a worksheet name with
 * lookalikes it does allow, and collapses the result down to something
 * non-empty.
 */
const sanitizeSheetName = (name) => {
    let sanitized = String(name || '')
        .replace(INVALID_SHEET_NAME_CHARS, (char) => INVALID_SHEET_NAME_CHAR_REPLACEMENTS[char])
        .trim();
    // Sheet names can't start or end with an apostrophe
    sanitized = sanitized.replace(/^'+|'+$/g, '');
    if (sanitized.length === 0) {
        sanitized = 'Sheet';
    }
    return sanitized;
};

/**
 * Truncates a string to maxLen while keeping both its start and its end,
 * collapsing the middle behind a single ellipsis character. Names here are
 * "<location> <parameter>", so this keeps the location prefix (which side
 * identifies the location) and the parameter suffix (which side identifies
 * what is being measured) instead of losing the parameter entirely.
 */
const truncateMiddle = (str, maxLen) => {
    if (str.length <= maxLen) {
        return str;
    }
    if (maxLen <= 1) {
        return str.substring(0, maxLen);
    }

    const ellipsis = '…';
    const available = maxLen - ellipsis.length;
    const frontLen = Math.ceil(available / 2);
    const backLen = available - frontLen;

    return str.substring(0, frontLen) + ellipsis + (backLen > 0 ? str.substring(str.length - backLen) : '');
};

/**
 * Produces a sheet name that is <=31 chars and unique among usedNames
 * (Excel treats sheet names as case-insensitive). Truncation keeps both the
 * start and end of the name (see truncateMiddle) so the parameter suffix
 * isn't lost for long location names, and only shortens further than
 * necessary when a collision actually occurs.
 */
const makeUniqueSheetName = (rawName, usedNames) => {
    const base = sanitizeSheetName(rawName);

    let candidate = truncateMiddle(base, MAX_SHEET_NAME_LENGTH);
    if (!usedNames.has(candidate.toLowerCase())) {
        usedNames.add(candidate.toLowerCase());
        return candidate;
    }

    let counter = 2;
    while (true) {
        const suffix = ` (${counter})`;
        const truncatedBase = truncateMiddle(base, MAX_SHEET_NAME_LENGTH - suffix.length);
        candidate = `${truncatedBase}${suffix}`;
        if (!usedNames.has(candidate.toLowerCase())) {
            usedNames.add(candidate.toLowerCase());
            return candidate;
        }
        counter++;
    }
};

const plotToExcelHandler = (req, res) => {
    if (req.body && req.body.title && req.body.data && Array.isArray(req.body.data)) {
        let usedSheetNames = new Set();
        var workbook = new Excel.Workbook();
        req.body.data.map((item) => {
            let worksheetName = makeUniqueSheetName(item.name, usedSheetNames);
            var sheet = workbook.addWorksheet(worksheetName);
            item.x.map((xItem, index) => {
                let yItem = item.y[index];
                if (index === 0) {
                    var row = sheet.getRow(1);
                    row.getCell(1).value = ('x');
                    row.getCell(2).value = ('y');
                }

                var row = sheet.getRow(index + 2);
                row.getCell(1).value = (xItem + '');
                row.getCell(2).value = (yItem + '');
            });
        });

        workbook.xlsx.write(res).then(function() {
            res.end()
        });
    } else {
        res.status(400);
        res.send({
            status: `error`,
            message: `Title and at least one data set has to be provided`
        });
    }
};

module.exports = plotToExcelHandler;