// node execute shell command
const exec = require('child_process').exec;
const fs = require('fs');
// current directory
const currentDir = process.cwd();
// console.log(currentDir);
let file = currentDir + '/hdc.sql.gz';
let sqlfile = currentDir + '/hdc.sql';

let command1 = "gzip -d " + file;
let command2 = "mysql -uroot -p123456 hdc < " + sqlfile;


async function executeShellCommand(command1, command2) {
    await uncompress(command1);
    await mysqldump(command2);
    await deleteFile(sqlfile);

}

function uncompress(command1) {
    exec(command1, (error, stdout, stderr) => {
        if (error) {
            console.log(`1error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`1stderr: ${stderr}`);
            return;
        }
        console.log(`1stdout: ${stdout}`);
    });
}

function mysqldump(command2) {
    exec(command2, (error, stdout, stderr) => {
        if (error) {
            console.log(`2error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`2stderr: ${stderr}`);
            return;
        }
        console.log(`2stdout: ${stdout}` + 'mysqldump completed');
    });
}

function deleteFile(sqlfile) {
    //    delete sql file

    exec('rm -rf ' + sqlfile, (error, stdout, stderr) => {
        if (error) {
            console.log(`3error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`3stderr: ${stderr}`);
            return;
        }
        console.log(`3stdout: ${stdout}` + 'delete file completed');
    });
}

executeShellCommand(command1, command2).then(r => {
});

