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
                        console.log("going to use machine1 context");
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
assert(log[1].b === 'myData');
console.log('nested machines 2 test ok');