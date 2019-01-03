import {machine, useContext, useState, assert} from './machine.js'

let log = [];

let machineInfo = {
    id: 'vacancy',
    initialState: 'state1',
    context: {id: 123},
    states: {
        state1: {
            onEntry: 'logEntryAction',
            onExit: 'logExitAction',
            on: {
                ST2: {target: 'state2'},
                ST3: {target: 'state3'}
            }
        },
        state2: {
            onEntry: 'logEntryAction',
            onExit: 'logExitAction',
            on: {
                ST1: {target: 'state1'},
                ST3: {target: 'state3'}
            }
        },
        state3: {
            onEntry: 'logEntryAction',
            onExit: 'logExitAction',
            on: {
                ST1: {target: 'state1'},
                ST2: {target: 'state2'}
            }
        }
    },
    actions: {
        logEntryAction: (event) => {
            const [state] = useState();
            log.push('entry: ' + state);
        },
        logExitAction: (event) => {
            const [state] = useState();
            log.push('exit: ' + state);
        }
    }
};

const vacancyMachine = machine(machineInfo);

try {
    vacancyMachine.transition('RESPOND', {resume: {name: 'Vasya', lastName: 'Pupkin'}});
} catch (e) {
    assert(e.toString() === 'Error: Unknown transition: \'RESPOND\' in the machine with id: vacancy');
}

assert(vacancyMachine.currentState.name === 'state1');// initial state
vacancyMachine.transition('ST3', {resume: {name: 'Vasya', lastName: 'Pupkin'}});
assert(vacancyMachine.currentState.name === 'state3');

try {
    vacancyMachine.transition('ST3', {resume: {name: 'Vasya', lastName: 'Pupkin'}});
} catch (e) {
    assert(e.toString() === 'Error: Unknown transition: \'ST3\' in the machine with id: vacancy');
}

try {
    vacancyMachine.transition('state2', {resume: {name: 'Vasya', lastName: 'Pupkin'}});
} catch (e) {
    assert(e.toString() === 'Error: Unknown transition: \'state2\' in the machine with id: vacancy');
}

vacancyMachine.transition('ST2', {resume: {name: 'Vasya', lastName: 'Pupkin'}});
assert(vacancyMachine.currentState.name === 'state2');
assert(log[0] === "exit: state1");
assert(log[1] === "entry: state3");
assert(log[2] === "exit: state3");
assert(log[3] === "entry: state2");

console.log("multistate machine test ok");
