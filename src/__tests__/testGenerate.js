import generate from '../generate';


describe('generate', () => {
    it('should generate appropriate flowtypes', () => {
        const flowtypes = {
            Single: {
                type: 'fragment',
                flowtypes: [
                    {
                        nullableStringField: {type: 'string'},
                        stringField: {type: 'string', nonNull: true},
                        nullableNumberField: {type: 'number'},
                        numberField: {type: 'number', nonNull: true},
                        nullableBooleanField: {type: 'boolean'},
                        booleanField: {type: 'boolean', nonNull: true},

                        nullableStringListField: {type: 'list', ofType: {type: 'string', nonNull: true}},
                        stringListField: {type: 'list', ofType: {type: 'string', nonNull: true}, nonNull: true},
                        nullableNumberListField: {type: 'list', ofType: {type: 'number', nonNull: true}},
                        numberListField: {type: 'list', ofType: {type: 'number', nonNull: true}, nonNull: true},
                        nullableBooleanListField: {type: 'list', ofType: {type: 'boolean', nonNull: true}},
                        booleanListField: {type: 'list', ofType: {type: 'boolean', nonNull: true}, nonNull: true},

                        nullableObjectField: {type: 'object', object: {
                            stringField: {type: 'string', nonNull: true},
                            nullableNumberField: {type: 'number'}
                        }},
                        objectField: {type: 'object', object: {
                            numberField: {type: 'number', nonNull: true},
                            nullableBooleanField: {type: 'boolean'},
                            anotherObjectField: {
                                type: 'object',
                                object: {
                                    stringField: {type: 'string', nonNull: true}
                                },
                                nonNull: true
                            }
                        }, nonNull: true},

                        nullableObjectListField: {type: 'list', ofType: {type: 'object', nonNull: true, object: {
                            stringField: {type: 'string', nonNull: true}
                        }}},
                        objectListField: {type: 'list', ofType: {type: 'object', nonNull: true, object: {
                            stringField: {type: 'string', nonNull: true}
                        }}, nonNull: true},
                        nullableEmptyObjectListField: {type: 'list', ofType: {type: 'object', nonNull: true, object: {}}},
                        emptyObjectListField: {type: 'list', ofType: {type: 'object', nonNull: true, object: {}}, nonNull: true}
                    }
                ]
            },
            Duplicate: {
                type: 'fragment',
                flowtypes: [
                    {
                        stringField: {type: 'string', nonNull: true}
                    },
                    {
                        numberField: {type: 'number', nonNull: true}
                    }
                ]
            },
            QueryType: {
                type: 'query',
                flowtypes: [
                    {
                        id: {type: 'string', nonNull: true}
                    }
                ]
            }
        };

        expect(generate(flowtypes, 'filename.js')).toEqual(`/* @flow
DO NOT UPDATE THIS FILE MANUALLY
Auto-generated flowtypes for Relay queries and fragments in ../filename.js
*/

export type Single = {|
    nullableStringField: null | string,
    stringField: string,
    nullableNumberField: null | number,
    numberField: number,
    nullableBooleanField: null | boolean,
    booleanField: boolean,
    nullableStringListField: null | Array<string>,
    stringListField: Array<string>,
    nullableNumberListField: null | Array<number>,
    numberListField: Array<number>,
    nullableBooleanListField: null | Array<boolean>,
    booleanListField: Array<boolean>,
    nullableObjectField: null | {|
        stringField: string,
        nullableNumberField: null | number
    |},
    objectField: {|
        numberField: number,
        nullableBooleanField: null | boolean,
        anotherObjectField: {|
            stringField: string
        |}
    |},
    nullableObjectListField: null | Array<{|
        stringField: string
    |}>,
    objectListField: Array<{|
        stringField: string
    |}>,
    nullableEmptyObjectListField: null | Array<{||}>,
    emptyObjectListField: Array<{||}>
|};

export type Duplicate1 = {|
    stringField: string
|};

export type Duplicate2 = {|
    numberField: number
|};

export type QueryType = null | {|
    id: string
|};
`);
    });
});
