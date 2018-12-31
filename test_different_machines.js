import {machine, useContext, useState} from "./machine.js";

let firstTmp = {};
let secondTmp = {};

let firstMachine = {
    id: 'first',
    initialState: 'notResponded',
    context: {id: 1},
    states: {
        responded: {},
        notResponded: {
            on: {
                RESPOND: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        const [state, setState] = useState();
                        setContext({name: '1st'});
                    }
                }
            }
        },
    },
};


let secondMachine = {
    id: 'second',
    initialState: 'notResponded',
    context: {id: 2},
    states: {
        responded: {},
        notResponded: {
            on: {
                RESPOND: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        const [state, setState] = useState();
                        setContext({name: '2nd'});
                    }
                }
            }
        },
    },
};

const first = machine(firstMachine);
const second = machine(secondMachine);

first.transition('RESPOND', {resume: {name: 'Vasya', lastName: 'Pupkin'}});
second.transition('RESPOND', {resume: {name: 'Kolya', lastName: 'Ivanov'}});

console.log("firstTmp" + firstTmp);
console.log("secondTmp" + secondTmp);