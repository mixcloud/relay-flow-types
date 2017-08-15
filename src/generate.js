const INDENT = '    ';


export default function(types, filename) {
    const output = [];

    Object.keys(types).forEach(name => {
        const {flowtypes, type} = types[name];
        if (flowtypes.length > 1) {
            flowtypes.forEach((flowtype, index) => {
                output.push(`export type ${name}${index + 1} = ${type === 'query' ? 'null | ' : ''}${objectType(flowtype)};`)
            });
        } else {
            output.push(`export type ${name} = ${type === 'query' ? 'null | ' : ''}${objectType(flowtypes[0])};`)
        }
    });

    return `/* @flow
DO NOT UPDATE THIS FILE MANUALLY
Auto-generated flowtypes for Relay queries and fragments in ../${filename}
*/

${output.join('\n\n')}
`;
};


function objectType(flowtype, indent = '') {
    if (!Object.keys(flowtype).length) {
        return `{||}`;
    }
    return `{|
${Object.keys(flowtype).map(name => `${indent}${INDENT}${name}: ${fieldType(flowtype[name], indent)}`).join(',\n')}
${indent}|}`;
}

function fieldType(field, indent) {
    var flowType;

    switch (field.type) {
        case 'list':
            flowType = `Array<${fieldType(field.ofType, indent)}>`;
            break;
        case 'object':
            flowType = objectType(field.object, `${indent}${INDENT}`);
            break;
        default:
            flowType = field.type;
            break;
    }

    if (field.nonNull) {
        return flowType;
    }
    return `null | ${flowType}`;
}
