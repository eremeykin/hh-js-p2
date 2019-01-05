import {machine, useContext, useState, assert} from './machine.js'
let log = [];

const myMachine = machine({
    initialState: 1,
    context: { b: 'myData' },
    states: {
        '2': {},
        '1': {
            on: {
                go: {
                    service: () => {
                        myMachine2.transition('go');
                        // Здесь будет выведено { b: 'Machine2 data' } и работа будет с myMachine2, хотя функция внутри myMachine
                        log.push(useContext()[0]);
                    },
                },
            },
        },
    },
});

const myMachine2 = machine({
    initialState: 1,
    context: { b: 'Machine2 data' },
    states: {
        '2': {},
        '1': {
            on: {
                go: {
                    service: () => {
                        log.push(useContext()[0]);
                    },
                },
            },
        },
    },
});

myMachine.transition('go');
assert(log[0].b === 'Machine2 data');
assert(log[0].b === 'myData');