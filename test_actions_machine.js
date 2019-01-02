import {machine, useContext, useState, assert} from './machine.js'

let log = [];

let machineInfo = {
    id: 'vacancy',
    initialState: 'notResponded',
    context: {id: 123},
    states: {
        responded: {
            onEntry: ['onStateEntry', 'myCustomAction1', 'myCustomAction2', ['inArray1', 'inArray2', () => {
                log.push('function in Array');
            }]]
        },
        notResponded: {
            onExit: [() => {
                log.push('we are leaving notResponded state');
            }, 'myExitFunction'],
            on: {
                RESPOND: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        const [state, setState] = useState();
                        setTimeout(() => {
                            setState('responded');
                            setContext({completed: true});
                        }, 500);
                    }
                }
            }
        },
    },
    actions: {
        onStateEntry: (event) => {
            const [state] = useState();
            log.push('now state is ' + state);
        },
        myCustomAction1: (event) => {
            log.push('my custom action 1, ' + event.resume.name);
        },
        myCustomAction2: (event) => {
            log.push('my custom action 2, ' + event.resume.name);
        },
        myExitFunction: (event) => {
            log.push('my exit function, ' + event.resume.name);
        },
        inArray1: (event) => {
            log.push('inArray1, ' + event.resume.name);
        },
        inArray2: (event) => {
            log.push('inArray2, ' + event.resume.name);
        }
    }
};

const vacancyMachine = machine(machineInfo);
vacancyMachine.transition('RESPOND', {resume: {name: 'Vasya', lastName: 'Pupkin'}});

setTimeout(check, 510);

function check() {
    assert(log[0] === "we are leaving notResponded state");
    assert(log[1] === "my exit function, Vasya");
    assert(log[2] === "now state is responded");
    assert(log[3] === "my custom action 1, Vasya");
    assert(log[4] === "my custom action 2, Vasya");
    assert(log[5] === "inArray1, Vasya");
    assert(log[6] === "inArray2, Vasya");
    assert(log[7] === "function in Array");
    console.log("action test ok");
}
