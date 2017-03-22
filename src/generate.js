const INDENT = '    ';


export default function(flowtypes, filename) {
    const types = [];

    Object.keys(flowtypes).forEach(name => {
        if (flowtypes[name].length > 1) {
            flowtypes[name].forEach((flowtype, index) => {
                types.push(`export type ${name}${index + 1} = ${objectType(flowtype)};`)
            });
        } else {
            types.push(`export type ${name} = ${objectType(flowtypes[name][0])};`)
        }
    });

    return `/* @flow
DO NOT UPDATE THIS FILE MANUALLY
Auto-generated flowtypes for Relay queries and fragments in ../${filename}
*/

${types.join('\n\n')}
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
            if (field.ofType.type === 'object' && !Object.keys(field.ofType.object).length) {
                // If there are no selections we want an opaque object even if it is a list
                flowType = `{||}`;
            } else {
                flowType = `Array<${fieldType(field.ofType, indent)}>`;
            }
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
