const _ = require('lodash');


function assignSearchRelevance(results, q) {
        if(q === "") {
            return results;
        }
       let criteriaArr = {
            "name": 10,
            "tags": 5,
            "description": 3,
            "raw_code": 2,
            "columns": 1
        };

        _.each(results, function(result){
            result.overallWeight = 0;
            result.overallNameWeight = 0;
            _.each(Object.keys(criteriaArr), function(criteria){
                if(result.model[criteria] !== undefined){
                    let count = 0;
                    let body = result.model[criteria];
                    let query = (q).toLowerCase();
                    if(criteria === "columns"){
                        _.each(body, function(column){
                            // there a spark bug where columns are missign from the catalog.  That
                            // needs to be fixed outside of docs but this if != null check will
                            // allow docs to continue to function now and also when the bug is
                            // fixed.
                            // relevant issue: https://github.com/dbt-labs/dbt-spark/issues/295
                            if (column.name) {
                                let columnName = column.name.toLowerCase();
                                let index = 0;
                                while(index !== -1){
                                    index = columnName.indexOf(query, index);
                                    if (index !== -1) {
                                        count++; index++;
                                    }
                                }
                            }
                        });
                    }
                    else if(criteria === "name"){
                        const calculateNameMatchWeight = (body, query) => {
                            if (body === query) return 10;
                            const lowerBody = body.toLowerCase();
                            if (lowerBody.startsWith(query)) return 5;
                            if (lowerBody.endsWith(query)) return 3;
                            if (lowerBody.includes(query)) return 1;
                            return 0;
                        };

                        count += calculateNameMatchWeight(body, (q).toLowerCase());
                        result.overallNameWeight += (count * criteriaArr[criteria]);

                    }
                    else if(criteria === "tags"){
                        _.each(body, function(tag){
                            let tagName = tag.toLowerCase();
                            let index = 0;
                            while(index != -1){
                                index = tagName.indexOf(query, index);
                                if (index != -1) {
                                    count++; index++;
                                }
                            }
                        });
                    }
                    else{
                        body = body.toLowerCase();
                        let index = 0;
                        while(index != -1){
                            index = body.indexOf(query, index);
                            if(index != -1){
                                count++; index++;
                            }
                        }
                    }
                    result.overallWeight += (count * criteriaArr[criteria]);
                }
            });
        });
        results.sort((a, b) => b.overallNameWeight - a.overallNameWeight || b.overallWeight - a.overallWeight);
        return results
    }

module.exports = {
    assignSearchRelevance,
}
