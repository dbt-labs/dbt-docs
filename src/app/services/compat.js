
function getQuoteChar(project_metadata) {
    var backtickDatabases = ['bigquery', 'spark', 'databricks'];
    var adapter_type = (project_metadata || {}).adapter_type;

    if (backtickDatabases.indexOf(adapter_type) >= 0) {
        return '`';
    } else {
        return '"';
    }
}


module.exports = {
    getQuoteChar,
}
