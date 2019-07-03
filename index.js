const jsforce = require('jsforce');
const csv = require('fast-csv');
const fs = require('fs');

const username = 'asreerambhatla@deloitte.com.hrdevone';
const password = 'Zsxdc2024!pHlolDjvgLTr9CAKVNEhJrqj6';
const fileName = 'TestCoverageReport.csv';
const conn = new jsforce.Connection({
    // you can change loginUrl to connect to sandbox or prerelease env.
    loginUrl: 'https://test.salesforce.com'
});

console.log('Logging into Salesforce')
conn.login(username, password, function(err, userInfo) {
    if (err) {
        return console.error(err);
    }

    // logged in user property
    console.log('Successfully logged in.. Fetching Test Coverage results');
    conn.tooling.query('select ApexClassorTrigger.Name,Coverage from ApexCodeCoverageAggregate').execute(function(err, result) {
        if (err)
            console.error(err);
        if (result.done) {
            console.log('Writing Results...');
    
            const {
                records
            } = result;
            const writeStream = fs.createWriteStream(`${fileName}`);
            writeStream.on('finish',function(){
            	console.log(`Done writing file at ${fileName} in the same directory`);
            })
            let csvStream = csv.format({headers:true});
            csvStream.pipe(writeStream);
            if (records.length) {
                records.forEach(function(record, index) {
                    let {
                        ApexClassOrTrigger
                    } = record;

                    let entityName = ApexClassOrTrigger.Name;
                    //console.log(entityName);
                    let isClass = ApexClassOrTrigger.attributes.url.includes('ApexClass');
                    let apexType = isClass ? 'ApexClass' : 'ApexTrigger';
                    //console.log(apexType);
                    let {
                        Coverage
                    } = record;
                    //console.log(Coverage.coveredLines.length);
                    let coveredlines = Coverage.coveredLines.length?Coverage.coveredLines.join(','):'None';
                    let uncoveredLines = Coverage.uncoveredLines.length?Coverage.uncoveredLines.join(','):'None';
   
                    csvStream.write({entityName,apexType,coveredlines,uncoveredLines});
                })
                csvStream.end();
     
        
            }else{
            	console.log('No records returned');
            }


        } else {
            console.log(`Oops you have more records at ${result.queryLocator}`);
        }
    })
});