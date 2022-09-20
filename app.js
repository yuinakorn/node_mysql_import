const exec = require('child_process').exec;
const moment = require('moment');
const fs = require('fs')
const cron = require('node-cron');


// mysql
const mysql = require('mysql');

// dotenv
const dotenv = require('dotenv');
dotenv.config();

// server 73
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const CRON_TIME = process.env.CRON_TIME;
const currentDir = process.cwd();
const zipfile = currentDir + '/hdc.sql.gz';
const sqlfile = currentDir + '/hdc.sql';
const server_name = '73';
const function_list = currentDir + '/function_list.txt';


function executeShellCommand(cmd, msg) {
    return new Promise(resolve => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            }
            //    if resolve write log
            if (resolve) {
                resolve(msg);
            }
        });
        let datetime = moment().format('YYYY-MM-DD HH:mm:ss');
        let sql = "INSERT INTO `hdc_log_cm` (`server_name`, `process_name`, `process_date`) VALUES (?, ?, ?);";
        let values = [server_name, msg, datetime];
        connection.query(sql, values, (err, result) => {
            if (err) throw err;
            console.log(`record ${msg}`);
        });

    });
}


function check_file() {
    return new Promise(resolve => {
        fs.access(zipfile, fs.F_OK, (err) => {
            if (err) {
                // console.error(err)
                resolve(false);
            }
            //file exists
            resolve(true);
        })
    });
}

function check_status() {
    return new Promise(resolve => {
        let sql = "select left(process_name,1) as p_name  from hdc_log_cm order by process_date desc limit 1";
        connection.query(sql, (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                resolve(result[0].p_name);
                return result[0].p_name;
            } else {
                resolve('0');
                return '0';
            }
        });
    });
}

function callFunction(msg) {
    return new Promise(resolve => {
        fs.readFile(function_list, 'utf8', async function (error, data) {
            if (error) throw error;
            let func = '';
            for (let i in data.split('\n')) {
                let func = data.split('\n')[i];
                if (func !== '') {
                    let cmd = 'mysql -u ' + process.env.DB_USER + ' -p' + process.env.DB_PASSWORD + ' -e \"call ' + func + ';\" ';
                    console.log(cmd);
                    exec(cmd, (error, stdout, stderr) => {
                        if (error) {
                            console.warn(error);
                        }
                        if (resolve) {
                            resolve(msg);
                        }
                    });
                }
            }
        });
    });
}

async function main() {
    let chkfile = await check_file();
    let status = await check_status();
    if (chkfile && status === '4') { // 4 is end_process of server 150
        let result1 = await executeShellCommand('gzip -d --force ' + zipfile, '5_unzip_complete');
        let result2 = await executeShellCommand('mysql -u ' + process.env.DB_USER + ' -f -p' + process.env.DB_PASSWORD +
            ' ' + process.env.DB_NAME + ' < ' + sqlfile, '6_import_complete');
        let result3 = await callFunction('6.1_call_function');
    } else if (chkfile && status !== '4') {
        console.log('status not 4');
    } else {
        console.log('file not found');
        console.log('file not found');
        // let result3 = await executeShellCommand('ls', '0_error_zipfile_not_found');
    }

    // connection.end();

}

cron.schedule(CRON_TIME, () => {
    main();
});
