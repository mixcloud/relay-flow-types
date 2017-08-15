import {buildClientSchema} from 'graphql/utilities/buildClientSchema';
import parse from '../parse';


const schema = buildClientSchema(require('../../test-schema.json'));


describe('parse', () => {
    it('should handle empty files', () => {
        expect(parse(``, schema)).toEqual({});
    });

    it('should ignore comments', () => {
        expect(parse(`
// Relay.QL\`query { node(id: $id) { id } }\`
/*
Relay.QL\`query {
    node(id: $id) {
        id
    }
}\`
*/
`, schema)).toEqual({});
    });

    it('should parse multiple Relay.QLs in the same file', () => {
        const parsed = parse(`
            Relay.QL\`query { node(id: $id) { id } }\`
            
            Relay.QL\`query {
                node(id: $id) {
                    id
                }
            }\`
            
            Relay.QL\`
                fragment on User {
                    id
                }
            \`
        `, schema);
        expect(parsed.NodeQueryType.flowtypes.length).toEqual(2);
        expect(parsed.UserFragmentType.flowtypes.length).toEqual(1);
    });

    it('should mark query types as nonNull: false', () => {
        expect(parse(`
            Relay.QL\`query {
                node(id: $id) {
                    id
                }
            }\`
        `, schema)).toEqual({
            NodeQueryType: {
                type: 'query',
                flowtypes: [
                    {id: {nonNull: true, type: 'string'}}
                ]
            }
        });
    });

    it('should handle complex fragments', () => {
        expect(parse(`
            Relay.QL\`
                fragment on User {
                    ... on User {
                        username
                    }
                    todos(first: 5) {
                        title
                    }
                }
            \`
        `, schema)).toEqual({
            UserFragmentType: {
                type: 'fragment',
                flowtypes: [
                    {
                        username: {type: 'string', nonNull: true},
                        todos: {type: 'list', ofType: {type: 'object', object: {
                            title: {type: 'string', nonNull: true}
                        }, nonNull: true}, nonNull: true}
                    }
                ]
            }
        });
    });

    it('should handle empty items', () => {
        expect(parse(`
            Relay.QL\`
                fragment on User {
                    \${Something.getFragment('whatever')}
                }
            \`
        `, schema)).toEqual({
            UserFragmentType: {type: 'fragment', flowtypes: [{}]}
        });
    });

    it('should handle empty lists of items', () => {
        expect(parse(`
            Relay.QL\`
                fragment on User {
                    todos {
                        \${SomeComponent.getFragment('todos')}
                    }
                }
            \`
        `, schema)).toEqual({
            UserFragmentType: {
                type: 'fragment',
                flowtypes: [
                    {
                        todos: {type: 'list', ofType: {type: 'object', object: {}, nonNull: true}, nonNull: true}
                    }
                ]
            }
        });
    });

    it('should handle variables included as fragments', () => {
        expect(parse(`
            Relay.QL\`
                fragment on User {
                    username
                    \${some_VariableName1}
                }
            \`
        `, schema)).toEqual({
            UserFragmentType: {
                type: 'fragment',
                flowtypes: [
                    {username: {type: 'string', nonNull: true}}
                ]
            }
        });
    });
});
