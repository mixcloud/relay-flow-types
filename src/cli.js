#!/usr/bin/env node

import glob from 'glob';
import yargs from 'yargs';
import generateFlowTypes from './index';
import fs from 'fs';
import path from 'path';

const argv = yargs
                .usage(`Usage: $0 [schema.json . --ignore-dirs=__tests__,__mocks__,node_modules --subdir=__relay__ --extension={jsx,js} --remove-old]`)
                .options({
                    'ignore-dirs': {
                        type: 'string',
                        default: '__tests__,__mocks__,node_modules',
                        describe: 'Any directories to ignore'
                    },
                    'subdir': {
                        type: 'string',
                        default: '__relay__',
                        describe: 'The subdirectory in which to place the generated flow types'
                    },
                    'remove-old': {
                        type: 'boolean',
                        default: false,
                        describe: 'Remove __relay__ directories before generating new types - BE CAREFUL IF USING IN CONJUNCTION WITH --subdir'
                    },
                    'extension': {
                        type: 'string',
                        default: '{jsx,js}',
                        describe: 'File extensions to check'
                    }
                })
                .strict()
                .help()
                .argv;

const [schemaPath = 'schema.json', cwd = '.'] = argv._;

if (argv.removeOld) {
    const dirs = glob.sync(`./**/${argv.subdir}`, {
        cwd,
        realpath: true,
        ignore: argv.ignoreDirs.split(',').map(dirname => `./**/${dirname}/**`)
    });
    dirs.forEach(dirpath => {
        fs.readdirSync(dirpath).forEach(filename => {
            if (!filename.match(/\.js$/) || !filename.indexOf(argv.subdir)) {
                throw Error('Unexpected file found');
            }
            fs.unlinkSync(path.join(dirpath, filename));
        });
        fs.rmdirSync(dirpath);
    });
}

const files = glob.sync(`./**/*.${argv.extension}`, {
    cwd,
    realpath: true,
    ignore: argv.ignoreDirs.split(',').map(dirname => `./**/${dirname}/**/*`)
});

generateFlowTypes(files, path.resolve(schemaPath), argv.subdir);
