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
            }]],
            onExit: ['myExitFunction', 'asyncExit'],
            on: {
                UNRESPOND: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        const [state, setState] = useState();
                        log.push("UNRESPOND transition, " + event.resume.name);
                        setState('notResponded');
                        setContext({completed: true});
                    }
                }
            }
        },
        notResponded: {
            onEntry: 'onStateEntry',
            onExit: [() => {
                log.push('we are leaving notResponded state');
            }, 'myExitFunction', 'asyncExit'],
            on: {
                RESPOND: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        const [state, setState] = useState();
                        log.push("RESPOND transition, " + event.resume.name);
                        setState('responded');
                        setContext({completed: true});
                    }
                }
            }
        },
    },
    actions: {
        onStateEntry: (event) => {
            const [state] = useState();
            log.push('now state is ' + state + ', ' + event.resume.name);
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
        },
        asyncExit: (event) => {
            setTimeout(() => {
                log.push("asyncExit, " + event.resume.name);
            }, 500);
        }
    }
};

const vacancyMachine = machine(machineInfo);
vacancyMachine.transition('RESPOND', {resume: {name: 'Vasya', lastName: 'Pupkin'}});

setTimeout(() => {
    vacancyMachine.transition('UNRESPOND', {resume: {name: 'Ivan', lastName: 'Chelovekov'}});
}, 100);

setTimeout(check, 1000);

function check() {
    assert(log[0] === "RESPOND transition, Vasya");
    assert(log[1] === "we are leaving notResponded state");
    assert(log[2] === "my exit function, Vasya");
    assert(log[3] === "now state is responded, Vasya");
    assert(log[4] === "my custom action 1, Vasya");
    assert(log[5] === "my custom action 2, Vasya");
    assert(log[6] === "inArray1, Vasya");
    assert(log[7] === "inArray2, Vasya");
    assert(log[8] === "function in Array");
    assert(log[9] === "UNRESPOND transition, Ivan");
    assert(log[10] === "my exit function, Ivan");
    assert(log[11] === "now state is notResponded, Ivan");
    assert(log[12] === "asyncExit, Vasya");
    assert(log[13] === "asyncExit, Ivan");
    console.log("different events test ok");
}
