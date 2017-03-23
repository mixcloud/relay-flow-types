import parse from './parse';
import generate from './generate';
import {buildClientSchema} from 'graphql/utilities/buildClientSchema';
import path from 'path';
import fs from 'fs';


export default function(files, schemaPath, subdir = '__relay__') {
    const schema = buildClientSchema(require(schemaPath));

    files.forEach(filename => {
        const outputDir = path.join(path.dirname(filename), subdir);
        const outputFilename = path.join(outputDir, path.basename(filename));

        fs.readFile(filename, {encoding: 'utf8'}, (err, contents) => {
            if (err) {
                console.error(err);
            } else {
                const flowtypes = parse(contents, schema);
                if (Object.keys(flowtypes).length) {
                    // Sync to avoid race conditions
                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir);
                    }

                    const outputFileContents = generate(flowtypes, path.basename(filename));
                    fs.writeFile(outputFilename, outputFileContents, {encoding: 'utf8'}, (err) => {
                        if (err) {
                            process.stderr.write(JSON.stringify(err));
                        }
                    });
                }
            }
        });
    });
};
