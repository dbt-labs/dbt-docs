
const compat = require("./compat");

const BACKTICK = '`';
const QUOTE = '"';


test("column quoting", () => {
    expect(compat.getQuoteChar({adapter_type: 'bigquery'})).toStrictEqual(BACKTICK);
    expect(compat.getQuoteChar({adapter_type: 'spark'})).toStrictEqual(BACKTICK);
    expect(compat.getQuoteChar({adapter_type: 'databricks'})).toStrictEqual(BACKTICK);
    expect(compat.getQuoteChar({adapter_type: 'postgres'})).toStrictEqual(QUOTE);
    expect(compat.getQuoteChar({adapter_type: 'snowflake'})).toStrictEqual(QUOTE);
    expect(compat.getQuoteChar({adapter_type: 'redshift'})).toStrictEqual(QUOTE);
    expect(compat.getQuoteChar({adapter_type: 'unknown_db'})).toStrictEqual(QUOTE);
});

test("column quoting with invalid adapter", () => {
    expect(compat.getQuoteChar({adapter_type: null})).toStrictEqual(QUOTE);
    expect(compat.getQuoteChar({})).toStrictEqual(QUOTE);
    expect(compat.getQuoteChar(null)).toStrictEqual(QUOTE);
});
