import {parse} from 'graphql/language/parser';
import {Source} from 'graphql/language/source';
import {isLeafType, GraphQLObjectType, GraphQLUnionType, GraphQLInterfaceType, GraphQLNonNull, GraphQLList} from 'graphql/type/definition';


const PLACEHOLDER_FIELD_NAME = '___relayflowtypesplaceholder';


export default function(contents, schema) {
    const flowtypes = {};

    // Remove comments
    contents = contents.replace(/\/\/.*/g, '').replace(/\/\*[.\s\S]*?\*\//g, '');
    const RelayQLRE = /Relay\.QL`([.\s\S]*?)`/g;
    var match;
    while (match = RelayQLRE.exec(contents)) {
        const originalQueryString = match[1];
        // Fix Relay's non-standard GraphQL
        let queryString = originalQueryString.replace('fragment on', 'fragment F1 on');
        // Removing fragments could make an object empty so put a placeholder in there - __typename is something we know
        // will always be available
        queryString = queryString.replace(/\$\{.*?\.getFragment\(.*?\)}/g, `${PLACEHOLDER_FIELD_NAME}: __typename`);
        queryString = queryString.replace(/\$\{[a-zA-Z0-9_]+}/g, `${PLACEHOLDER_FIELD_NAME}: __typename`);

        const parsed = parse(new Source(queryString));
        const definition = parsed.definitions[0];
        switch (definition.kind) {
            case 'OperationDefinition':
                if (definition.operation === 'query') {
                    // There will only be one selection in a query
                    const selection = definition.selectionSet.selections[0];
                    if (selection.selectionSet && selection.selectionSet.selections.length) {
                        try {
                            const type = schema.getQueryType().getFields()[selection.name.value].type;
                            const flowtype = getObjectFlowType(selection, type, schema);
                            const typeName = `${type.name}QueryType`;
                            flowtypes[typeName] = flowtypes[typeName] || {type: 'query', flowtypes: []};
                            flowtypes[typeName].flowtypes.push(flowtype);
                        } catch (err) {
                            console.error(`Could not handle Query\n\n${originalQueryString}`);
                            throw err;
                        }
                    }
                }
                break;
            case 'FragmentDefinition': {
                try {
                    const type = schema.getType(definition.typeCondition.name.value);
                    const flowtype = getObjectFlowType(definition, type, schema);
                    const typeName = `${type.name}FragmentType`;
                    flowtypes[typeName] = flowtypes[typeName] || {type: 'fragment', flowtypes: []};
                    flowtypes[typeName].flowtypes.push(flowtype);
                } catch (err) {
                    console.error(`Could not handle Fragment\n\n${originalQueryString}`);
                    throw err;
                }
                break;
            }
        }
    }

    return flowtypes;
}


function getObjectFlowType(obj, type, schema) {
    const flowObj = {};
    if (obj.selectionSet) {
        obj.selectionSet.selections.forEach(selection => {
            const {kind, alias} = selection;
            if (alias && alias.value === PLACEHOLDER_FIELD_NAME) {
                return;
            }

            switch (kind) {
                case 'Field': {
                    const fieldName = selection.name.value;
                    const fieldAlias = selection.alias && selection.alias.value || fieldName;

                    switch (fieldName) {
                        case '__typename':
                            flowObj.__typename = {type: 'string', nonNull: true};
                            break;
                        default: {
                            const fieldType = type.getFields()[fieldName];
                            flowObj[fieldAlias] = getFieldFlowType(selection, fieldType.type, schema);
                            break;
                        }
                    }
                    break;
                }
                case 'InlineFragment':
                    if (selection.typeCondition) {
                        const fragmentType = schema.getType(selection.typeCondition.name.value);
                        Object.assign(flowObj, getObjectFlowType(selection, fragmentType, schema));
                    }
                    break;
            }
        });
    }
    return flowObj;
}


function getFieldFlowType(field, type, schema) {
    if (type instanceof GraphQLNonNull) {
        return {
            ...getFieldFlowType(field, type.ofType, schema),
            nonNull: true
        };
    }

    if (type instanceof GraphQLList) {
        return {
            type: 'list',
            ofType: {
                ...getFieldFlowType(field, type.ofType, schema),
                nonNull: true
            }
        };
    }

    if (isLeafType(type)) {
        switch (type.name) {
            case 'Boolean':
                return {type: 'boolean'};
            case 'Int':
                return {type: 'number'};
            case 'Float':
                return {type: 'number'};
            default:
                // TODO: enums
                return {type: 'string'};
        }
    }

    if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType || type instanceof GraphQLUnionType) {
        return {
            type: 'object',
            object: getObjectFlowType(field, type, schema)
        };
    }

    throw Error(`Unsupported field type ${type.toString()}`);
}
