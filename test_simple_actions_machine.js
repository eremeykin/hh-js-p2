import {machine, useContext, useState, assert} from './machine.js'

let log = [];

let machineInfo = {
    id: 'vacancy',
    initialState: 'notResponded',
    context: {id: 123},
    states: {
        responded: {
            onEntry: 'onStateEntry',
            onExit: 'onStateExit',
            on: {
                UNRESPOND: {
                    service: (event) => {
                        const [state, setState] = useState();
                        log.push('UNRESPOND transaction from ' + state);
                        setState('notResponded');
                    }
                }
            }
        },
        notResponded: {
            onEntry: 'onStateEntry',
            onExit: 'onStateExit',
            on: {
                RESPOND: {
                    service: (event) => {
                        const [state, setState] = useState();
                        log.push('RESPOND transaction from ' + state);
                        setState('responded');
                    }
                }
            }
        },
    },
    actions: {
        onStateEntry: (event) => {
            const [state] = useState();
            log.push('entry to state ' + state);
        },
        onStateExit: (event) => {
            const [state] = useState();
            log.push('exit state ' + state);
        }
    }
};

const vacancyMachine = machine(machineInfo);
vacancyMachine.transition('RESPOND', {resume: {name: 'Vasya', lastName: 'Pupkin'}});

setTimeout(check1, 500);

function check1() {
    assert(log[0] === "RESPOND transaction from notResponded");
    assert(log[1] === "exit state notResponded");
    assert(log[2] === "entry to state responded");

    try {
        vacancyMachine.transition('RESPOND');
    } catch (e) {
        assert(e.toString() === "Error: Unknown transition: RESPOND");
    }

    vacancyMachine.transition('UNRESPOND', {});

    setTimeout(check2, 500);

    function check2() {
        assert(log[3] === "UNRESPOND transaction from responded");
        assert(log[4] === "exit state responded");
        assert(log[5] === "entry to state notResponded");
        console.log("simple action test ok");
    }
}
